package com.productionhouse.crm;

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
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Exercises every module's API with the same JSON the frontend forms send. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class ModuleApiTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    private String token;

    @BeforeEach
    void signUpAndLogIn() throws Exception {
        String email = "user" + System.nanoTime() + "@test.com";
        send(post("/auth/register"), """
                {"fullName":"Test User","company":"Test Films","email":"%s","password":"Secret@123"}
                """.formatted(email)).andExpect(status().isCreated());
        token = body(send(post("/auth/login"), """
                {"email":"%s","password":"Secret@123","rememberMe":false}
                """.formatted(email)).andExpect(status().isOk())).get("token").asText();
    }

    @Test
    void requiresLogin() throws Exception {
        mvc.perform(get("/production-houses")).andExpect(status().isUnauthorized());
    }

    @Test
    void productionHouseCrud() throws Exception {
        long id = create("/production-houses", """
                {"id":"PH001","companyName":"Sun Pictures","contactPerson":"Manager","email":"a@sun.in",
                 "phone":"9876543210","location":"Chennai, Tamil Nadu","website":"","status":"Active","description":""}
                """);
        authed(get("/production-houses")).andExpect(jsonPath("$", hasSize(1)));
        send(put("/production-houses/" + id), """
                {"companyName":"Sun Pictures","contactPerson":"Manager","email":"a@sun.in",
                 "phone":"9876543210","location":"Chennai","status":"Inactive"}
                """).andExpect(status().isOk()).andExpect(jsonPath("$.status", is("Inactive")))
                .andExpect(jsonPath("$.id", is((int) id)));
        authed(delete("/production-houses/" + id)).andExpect(status().isOk());
        authed(get("/production-houses/" + id)).andExpect(status().isNotFound());
    }

    @Test
    void validationErrorsUseMessageShape() throws Exception {
        send(post("/production-houses"), """
                {"companyName":"","status":"Unknown"}
                """).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message").isString())
                .andExpect(jsonPath("$.errors.status").isString());
    }

    @Test
    void everyModuleAcceptsItsFormPayload() throws Exception {
        long projectId = create("/ott-projects", """
                {"projectName":"The Last Kingdom","platform":"Netflix","projectType":"Web Series","genre":"Thriller",
                 "language":"Tamil","startDate":"2026-01-01","endDate":"2027-03-30","budget":"50000000",
                 "projectManager":"Arun Kumar","status":"In Progress","description":"x"}
                """);
        create("/cast-crew", """
                {"name":"Arjun Kumar","role":"Actor","email":"arjun@example.com","phone":"+91 9876543210",
                 "experience":"8 Years","location":"Chennai","status":"Available","project":"None"}
                """);
        create("/schedules", """
                {"title":"Night shoot","project":"Project Alpha","date":"2099-11-02","startTime":"22:00",
                 "endTime":"02:00","endsNextDay":true,"location":"Chennai Film City","crew":"A, B",
                 "status":"Planned","description":""}
                """);
        create("/locations", """
                {"name":"Film City","type":"Studio","address":"Taramani","city":"Chennai","state":"Tamil Nadu",
                 "mapUrl":"","rentalCost":25000,"project":"Not Assigned","contactPerson":"Ramesh",
                 "contactPhone":"9876543210","status":"Approved","description":""}
                """);
        create("/expenses", """
                {"projectId":%d,"title":"Location advance","vendor":"Green Valley","category":"Location",
                 "date":"2026-10-24","amount":85000,"status":"Pending"}
                """.formatted(projectId));
        long contractId = create("/contracts", """
                {"title":"Lead Actor Agreement","type":"Artist","party":"Arjun Kumar","project":"The Last Kingdom",
                 "startDate":"2026-10-01","endDate":"2027-03-30","value":1500000,"paymentTerms":"50/50",
                 "status":"Draft","document":"actor-agreement.pdf"}
                """);
        authed(get("/contracts/" + contractId)).andExpect(jsonPath("$.contractCode", is("CON-%03d".formatted(contractId))))
                .andExpect(jsonPath("$.value", is(1500000.0)));
        long memberId = create("/team-members", """
                {"name":"Rahul Sharma","role":"Director","department":"Direction","email":"rahul@example.com","phone":""}
                """);
        create("/tasks", """
                {"title":"Finalize schedule","description":"","project":"City Lights","assignee":"Rahul Sharma",
                 "department":"Direction","priority":"High","status":"In Progress",
                 "startDate":"2026-10-25","dueDate":"2026-11-02"}
                """);
        create("/payments", """
                {"title":"Lead Actor Advance","party":"Arjun Kumar","project":"The Last Kingdom","direction":"Outgoing",
                 "type":"Artist Payment","amount":500000,"paymentDate":"","dueDate":"2026-10-15",
                 "method":"Bank Transfer","reference":"","status":"Pending","notes":""}
                """);

        // Cross-record rules
        authed(delete("/team-members/" + memberId)).andExpect(status().isConflict());
        authed(delete("/ott-projects/" + projectId)).andExpect(status().isConflict());
        send(post("/expenses"), """
                {"projectId":999999,"title":"x","vendor":"y","date":"2026-10-24","amount":1}
                """).andExpect(status().isBadRequest());
        send(post("/payments"), """
                {"title":"t","party":"p","project":"x","amount":5,"dueDate":"2026-10-15","status":"Completed"}
                """).andExpect(status().isBadRequest());

        authed(get("/budgets")).andExpect(status().isOk())
                .andExpect(jsonPath("$.projects[0].spent", is(85000.0)))
                .andExpect(jsonPath("$.totals.unpaid", is(85000.0)));

        authed(get("/dashboard")).andExpect(status().isOk())
                .andExpect(jsonPath("$.stats.activeProjects", is(1)))
                .andExpect(jsonPath("$.stats.castCrew", is(1)))
                .andExpect(jsonPath("$.upcomingSchedules", hasSize(1)))
                .andExpect(jsonPath("$.upcomingSchedules[0].time", is("22:00")))
                .andExpect(jsonPath("$.pendingActions.draftContracts", is(1)))
                .andExpect(jsonPath("$.pendingActions.pendingPaymentsAmount", is(500000.0)))
                .andExpect(jsonPath("$.recentActivities", hasSize(5)));
    }

    @Test
    void usersOnlySeeTheirOwnRecords() throws Exception {
        long id = create("/production-houses", """
                {"companyName":"Mine","contactPerson":"Me","email":"m@x.in","phone":"1","location":"Chennai"}
                """);
        signUpAndLogIn(); // switch to a second account
        authed(get("/production-houses")).andExpect(jsonPath("$", hasSize(0)));
        authed(get("/production-houses/" + id)).andExpect(status().isNotFound());
    }

    private long create(String path, String body) throws Exception {
        return body(send(post(path), body).andExpect(status().isCreated())).get("id").asLong();
    }

    private ResultActions send(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request,
                               String body) throws Exception {
        if (token != null) request.header("Authorization", "Bearer " + token);
        return mvc.perform(request.contentType(MediaType.APPLICATION_JSON).content(body));
    }

    private ResultActions authed(org.springframework.test.web.servlet.request.MockHttpServletRequestBuilder request)
            throws Exception {
        return mvc.perform(request.header("Authorization", "Bearer " + token));
    }

    private JsonNode body(ResultActions result) throws Exception {
        return json.readTree(result.andReturn().getResponse().getContentAsString());
    }
}
