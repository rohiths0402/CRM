package com.productionhouse.crm;

import static org.hamcrest.Matchers.contains;
import static org.hamcrest.Matchers.hasSize;
import static org.hamcrest.Matchers.is;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.delete;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.put;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDate;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;
import org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder;

/** The three access levels sharing one workspace, and the vendor CRM's own rules. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class VendorCrmTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    private String admin;
    private String production;
    private String vendor;
    private long vendorUserId;

    @BeforeEach
    void createWorkspace() throws Exception {
        String suffix = String.valueOf(System.nanoTime());
        send(null, post("/auth/register"), """
                {"fullName":"Admin","company":"Raman Films","email":"admin%s@test.com","password":"Secret@123"}
                """.formatted(suffix)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.access", is("ALL")))
                .andExpect(jsonPath("$.user.admin", is(true)));
        admin = login("admin" + suffix + "@test.com");

        send(admin, post("/users"), """
                {"fullName":"Prod User","email":"prod%s@test.com","access":"PRODUCTION","password":"Secret@123"}
                """.formatted(suffix)).andExpect(status().isCreated())
                .andExpect(jsonPath("$.company", is("Raman Films")))
                .andExpect(jsonPath("$.admin", is(false)));
        vendorUserId = id(send(admin, post("/users"), """
                {"fullName":"Vendor User","email":"vend%s@test.com","mobile":"","access":"VENDOR","password":"Secret@123"}
                """.formatted(suffix)).andExpect(status().isCreated()));
        production = login("prod" + suffix + "@test.com");
        vendor = login("vend" + suffix + "@test.com");
    }

    @Test
    void accessLevelsAndSharedWorkspace() throws Exception {
        send(admin, post("/ott-projects"), """
                {"projectName":"The Last Kingdom","platform":"Netflix","projectType":"Web Series","genre":"Thriller",
                 "language":"Tamil","startDate":"2026-01-01","endDate":"2027-03-30","budget":50000000,
                 "projectManager":"Arun","status":"In Progress"}
                """).andExpect(status().isCreated());

        // Production login: production pages only, and it sees the admin's project.
        authed(production, get("/ott-projects")).andExpect(status().isOk()).andExpect(jsonPath("$", hasSize(1)));
        authed(production, get("/dashboard")).andExpect(status().isOk());
        authed(production, get("/vendor/vendors")).andExpect(status().isForbidden())
                .andExpect(jsonPath("$.message").isString());
        authed(production, get("/users")).andExpect(status().isForbidden());

        // Vendor login: vendor pages only, plus the project names for its dropdowns.
        authed(vendor, get("/vendor/vendors")).andExpect(status().isOk());
        authed(vendor, get("/vendor/projects")).andExpect(jsonPath("$", contains("The Last Kingdom")));
        authed(vendor, get("/ott-projects")).andExpect(status().isForbidden());
        authed(vendor, get("/dashboard")).andExpect(status().isForbidden());
        authed(vendor, get("/auth/me")).andExpect(jsonPath("$.access", is("VENDOR")));

        // A vendor added by the vendor login is visible to the admin.
        create(vendor, "/vendor/vendors", vendorJson("Lights Co", "Camera & Lighting", "Active"));
        authed(admin, get("/vendor/vendors")).andExpect(jsonPath("$", hasSize(1)));
        authed(admin, get("/users")).andExpect(jsonPath("$", hasSize(3)))
                .andExpect(jsonPath("$[0].admin", is(true)));

        // Access changes apply on the next request; deleting a login signs it out.
        send(admin, put("/users/" + vendorUserId), """
                {"fullName":"Vendor User","mobile":"","access":"PRODUCTION"}
                """).andExpect(status().isOk());
        authed(vendor, get("/vendor/vendors")).andExpect(status().isForbidden());
        authed(admin, delete("/users/" + vendorUserId)).andExpect(status().isOk());
        authed(vendor, get("/auth/me")).andExpect(status().isUnauthorized());
        authed(admin, get("/vendor/vendors")).andExpect(jsonPath("$", hasSize(1)));
    }

    @Test
    void purchaseToPaymentFlow() throws Exception {
        long vendorId = create(vendor, "/vendor/vendors", """
                {"name":"Lights Co","category":"Camera & Lighting","contactPerson":"Ravi","email":"ravi@lights.in",
                 "phone":"9876543210","gstNumber":"33abcde1234f1z5","panNumber":"abcde1234f","ifscCode":"hdfc0001234",
                 "accountNumber":"123456789012","rating":4}
                """);
        authed(vendor, get("/vendor/vendors/" + vendorId)).andExpect(jsonPath("$.gstNumber", is("33ABCDE1234F1Z5")));

        long quoteId = create(vendor, "/vendor/quotations", """
                {"vendorId":%d,"project":"The Last Kingdom","title":"Lighting package","requestDate":"2026-11-01",
                 "status":"Received","amount":100000,"taxPercent":18}
                """.formatted(vendorId));
        authed(vendor, get("/vendor/quotations/" + quoteId))
                .andExpect(jsonPath("$.quoteCode", is("QT-%03d".formatted(quoteId))))
                .andExpect(jsonPath("$.totalAmount", is(118000.0)));
        send(vendor, post("/vendor/quotations"), """
                {"vendorId":%d,"project":"X","title":"No price","requestDate":"2026-11-01","status":"Received"}
                """.formatted(vendorId)).andExpect(status().isBadRequest());

        long orderId = create(vendor, "/vendor/purchase-orders", """
                {"vendorId":%d,"quotationId":%d,"project":"The Last Kingdom","title":"Lighting package",
                 "orderDate":"2026-11-02","amount":100000,"taxPercent":18,"status":"Issued"}
                """.formatted(vendorId, quoteId));
        authed(vendor, get("/vendor/quotations/" + quoteId)).andExpect(jsonPath("$.status", is("Accepted")));

        long invoiceId = create(vendor, "/vendor/invoices", """
                {"vendorId":%d,"purchaseOrderId":%d,"invoiceNumber":"LC/2026/101","invoiceDate":"2026-11-03",
                 "dueDate":"%s","amount":100000,"taxAmount":18000,"status":"Approved"}
                """.formatted(vendorId, orderId, LocalDate.now().minusDays(1)));

        long paymentId = create(vendor, "/vendor/payments", """
                {"vendorId":%d,"invoiceId":%d,"amount":50000,"paymentDate":"%s","status":"Completed"}
                """.formatted(vendorId, invoiceId, LocalDate.now()));
        authed(vendor, get("/vendor/invoices/" + invoiceId))
                .andExpect(jsonPath("$.paidAmount", is(50000.0)))
                .andExpect(jsonPath("$.balance", is(68000.0)))
                .andExpect(jsonPath("$.status", is("Partially Paid")))
                .andExpect(jsonPath("$.overdue", is(true)));

        // Editing the invoice keeps the server's paid amount.
        send(vendor, put("/vendor/invoices/" + invoiceId), """
                {"vendorId":%d,"purchaseOrderId":%d,"invoiceNumber":"LC/2026/101","invoiceDate":"2026-11-03",
                 "dueDate":"%s","amount":100000,"taxAmount":18000,"status":"Approved","paidAmount":0}
                """.formatted(vendorId, orderId, LocalDate.now().minusDays(1)))
                .andExpect(jsonPath("$.paidAmount", is(50000.0)));

        send(vendor, post("/vendor/payments"), """
                {"vendorId":%d,"invoiceId":%d,"amount":70000,"paymentDate":"%s","status":"Completed"}
                """.formatted(vendorId, invoiceId, LocalDate.now())).andExpect(status().isBadRequest());

        authed(vendor, get("/vendor/dashboard")).andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.activeVendors", is(1)))
                .andExpect(jsonPath("$.stats.openPurchaseOrders", is(1)))
                .andExpect(jsonPath("$.stats.outstanding", is(68000.0)))
                .andExpect(jsonPath("$.stats.overdue", is(68000.0)))
                .andExpect(jsonPath("$.stats.paidThisMonth", is(50000.0)))
                .andExpect(jsonPath("$.quotations.accepted", is(1)))
                .andExpect(jsonPath("$.spendByCategory[0].category", is("Camera & Lighting")))
                .andExpect(jsonPath("$.topVendors[0].orderValue", is(118000.0)))
                .andExpect(jsonPath("$.duePayments[0].overdue", is(true)))
                .andExpect(jsonPath("$.recentOrders[0].poNumber", is("PO-%03d".formatted(orderId))));

        create(vendor, "/vendor/payments", """
                {"vendorId":%d,"invoiceId":%d,"amount":68000,"paymentDate":"%s","status":"Completed"}
                """.formatted(vendorId, invoiceId, LocalDate.now()));
        authed(vendor, get("/vendor/invoices/" + invoiceId)).andExpect(jsonPath("$.status", is("Paid")));

        // Deleting a payment reopens the invoice.
        authed(vendor, delete("/vendor/payments/" + paymentId)).andExpect(status().isOk());
        authed(vendor, get("/vendor/invoices/" + invoiceId))
                .andExpect(jsonPath("$.status", is("Partially Paid")))
                .andExpect(jsonPath("$.paidAmount", is(68000.0)));

        // Records that others point at can't be deleted.
        authed(vendor, delete("/vendor/invoices/" + invoiceId)).andExpect(status().isConflict());
        authed(vendor, delete("/vendor/purchase-orders/" + orderId)).andExpect(status().isConflict());
        authed(vendor, delete("/vendor/quotations/" + quoteId)).andExpect(status().isConflict());
        authed(vendor, delete("/vendor/vendors/" + vendorId)).andExpect(status().isConflict());
    }

    @Test
    void vendorRules() throws Exception {
        long blacklisted = create(vendor, "/vendor/vendors", vendorJson("Bad Co", "Catering", "Blacklisted"));
        long other = create(vendor, "/vendor/vendors", vendorJson("Good Co", "Catering", "Active"));

        send(vendor, post("/vendor/purchase-orders"), """
                {"vendorId":%d,"project":"P","title":"Lunch","orderDate":"2026-11-02","amount":5000}
                """.formatted(blacklisted)).andExpect(status().isBadRequest());
        send(vendor, post("/vendor/purchase-orders"), """
                {"vendorId":999999,"project":"P","title":"Lunch","orderDate":"2026-11-02","amount":5000}
                """).andExpect(status().isBadRequest());
        long quote = create(vendor, "/vendor/quotations", """
                {"vendorId":%d,"project":"P","title":"Lunch","requestDate":"2026-11-01"}
                """.formatted(other));
        send(vendor, post("/vendor/purchase-orders"), """
                {"vendorId":%d,"quotationId":%d,"project":"P","title":"Lunch","orderDate":"2026-11-02","amount":5000}
                """.formatted(blacklisted, quote)).andExpect(status().isBadRequest());
        send(vendor, post("/vendor/vendors"), """
                {"name":"X","contactPerson":"Y","email":"x@y.in","phone":"9876543210","gstNumber":"BAD"}
                """).andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.gstNumber").isString());

        long doc = create(vendor, "/vendor/documents", """
                {"vendorId":%d,"type":"Insurance","title":"Liability cover","expiryDate":"%s"}
                """.formatted(other, LocalDate.now().plusDays(10)));
        authed(vendor, get("/vendor/documents/" + doc)).andExpect(jsonPath("$.expiryStatus", is("Expiring Soon")));
        authed(vendor, get("/vendor/dashboard")).andExpect(jsonPath("$.documentAlerts[0].vendorName", is("Good Co")));
    }

    private static String vendorJson(String name, String category, String status) {
        return """
                {"name":"%s","category":"%s","contactPerson":"Owner","email":"owner@example.in","phone":"9876543210",
                 "status":"%s"}
                """.formatted(name, category, status);
    }

    private String login(String email) throws Exception {
        return body(send(null, post("/auth/login"), """
                {"email":"%s","password":"Secret@123","rememberMe":false}
                """.formatted(email)).andExpect(status().isOk())).get("token").asText();
    }

    private long create(String token, String path, String body) throws Exception {
        return id(send(token, post(path), body).andExpect(status().isCreated()));
    }

    private long id(ResultActions result) throws Exception {
        JsonNode node = body(result);
        return (node.has("id") ? node : node.get("user")).get("id").asLong();
    }

    private ResultActions send(String token, MockHttpServletRequestBuilder request, String body) throws Exception {
        if (token != null) request.header("Authorization", "Bearer " + token);
        return mvc.perform(request.contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions authed(String token, MockHttpServletRequestBuilder request) throws Exception {
        return mvc.perform(request.header("Authorization", "Bearer " + token));
    }

    private JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
