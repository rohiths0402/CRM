package com.productionhouse.crm;

import static org.hamcrest.Matchers.containsString;
import static org.mockito.ArgumentMatchers.anyLong;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.times;
import static org.mockito.Mockito.verify;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.productionhouse.crm.service.EmailService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.ResultActions;

/** Sign up, log in, and the forgot-password flow, with the OTP captured instead of emailed. */
@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
class AuthFlowTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper json;

    @MockitoBean
    private EmailService emailService;

    private String email;

    @BeforeEach
    void signUp() throws Exception {
        email = "user" + System.nanoTime() + "@test.com";
        post("/auth/register", """
                {"fullName":"Test User","company":"Test Films","email":"%s","mobile":"9876543210","password":"Secret@123"}
                """.formatted(email))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.user.company").value("Test Films"));
    }

    @Test
    void signupRules() throws Exception {
        post("/auth/register", """
                {"fullName":"Again","company":"X","email":"%s","password":"Secret@123"}
                """.formatted(email.toUpperCase())).andExpect(status().isConflict());
        post("/auth/register", """
                {"fullName":"Weak","company":"X","email":"weak@test.com","password":"password"}
                """).andExpect(status().isBadRequest()).andExpect(jsonPath("$.errors.password").isString());
    }

    @Test
    void loginAndMe() throws Exception {
        post("/auth/login", login("wrong@Pass1")).andExpect(status().isUnauthorized());
        String token = json.readTree(post("/auth/login", login("Secret@123")).andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString()).get("token").asText();
        mvc.perform(get("/auth/me").header("Authorization", "Bearer " + token))
                .andExpect(status().isOk()).andExpect(jsonPath("$.email").value(email));
    }

    @Test
    void forgotAndResetPassword() throws Exception {
        // Unknown emails get the same answer and no email is sent.
        post("/auth/forgot-password", "{\"email\":\"nobody@test.com\"}").andExpect(status().isOk());
        verify(emailService, never()).sendPasswordResetOtp(eq("nobody@test.com"), anyString(), anyString(), anyLong());

        post("/auth/forgot-password", "{\"email\":\"%s\"}".formatted(email)).andExpect(status().isOk());
        ArgumentCaptor<String> otp = ArgumentCaptor.forClass(String.class);
        verify(emailService).sendPasswordResetOtp(eq(email), eq("Test User"), otp.capture(), anyLong());
        String code = otp.getValue();

        // A second request inside the cooldown sends nothing new.
        post("/auth/forgot-password", "{\"email\":\"%s\"}".formatted(email)).andExpect(status().isOk());
        verify(emailService, times(1)).sendPasswordResetOtp(eq(email), anyString(), anyString(), anyLong());

        String wrong = code.equals("000000") ? "111111" : "000000";
        post("/auth/verify-otp", otpBody(wrong)).andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.message", containsString("4 attempt(s) left")));
        post("/auth/verify-otp", otpBody(code)).andExpect(status().isOk());

        post("/auth/reset-password", """
                {"email":"%s","otp":"%s","password":"NewSecret@456"}
                """.formatted(email, code)).andExpect(status().isOk());

        post("/auth/login", login("Secret@123")).andExpect(status().isUnauthorized());
        post("/auth/login", login("NewSecret@456")).andExpect(status().isOk());

        // The code is single use.
        post("/auth/reset-password", """
                {"email":"%s","otp":"%s","password":"Another@789"}
                """.formatted(email, code)).andExpect(status().isBadRequest());
    }

    private String login(String password) {
        return """
                {"email":"%s","password":"%s","rememberMe":false}
                """.formatted(email, password);
    }

    private String otpBody(String code) {
        return "{\"email\":\"%s\",\"otp\":\"%s\"}".formatted(email, code);
    }

    private ResultActions post(String path, String body) throws Exception {
        return mvc.perform(org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post(path)
                .contentType(MediaType.APPLICATION_JSON).content(body));
    }
}
