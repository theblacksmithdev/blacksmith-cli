package app.auth;

import static org.hamcrest.Matchers.contains;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.patch;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import app.ApiTest;
import com.jayway.jsonpath.JsonPath;
import org.junit.jupiter.api.Test;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.ResultActions;

class AuthApiTest extends ApiTest {

    private ResultActions postJson(String path, String json) throws Exception {
        return api.perform(post(path).contentType(MediaType.APPLICATION_JSON).content(json));
    }

    @Test
    void registerLoginAndMe() throws Exception {
        String email = uniqueEmail();
        String tokens = postJson("/api/auth/register/", """
                {"email": "%s", "password": "secret123", "first_name": "Ada", "last_name": "Lovelace"}
                """.formatted(email))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.access").isString())
                .andExpect(jsonPath("$.refresh").isString())
                .andReturn().getResponse().getContentAsString();

        postJson("/api/auth/login/", """
                {"email": "%s", "password": "secret123"}
                """.formatted(email))
                .andExpect(status().isOk());

        api.perform(get("/api/auth/me/").header(HttpHeaders.AUTHORIZATION, "Bearer " + JsonPath.read(tokens, "$.access")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.email").value(email))
                .andExpect(jsonPath("$.first_name").value("Ada"))
                .andExpect(jsonPath("$.last_name").value("Lovelace"));
    }

    @Test
    void loginRejectsAWrongPassword() throws Exception {
        String email = uniqueEmail();
        postJson("/api/auth/register/", """
                {"email": "%s", "password": "secret123"}
                """.formatted(email)).andExpect(status().isCreated());

        postJson("/api/auth/login/", """
                {"email": "%s", "password": "wrong"}
                """.formatted(email))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password."));
    }

    @Test
    void registerRejectsADuplicateEmail() throws Exception {
        String body = """
                {"email": "%s", "password": "secret123"}
                """.formatted(uniqueEmail());
        postJson("/api/auth/register/", body).andExpect(status().isCreated());

        postJson("/api/auth/register/", body)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.detail").value("A user with this email already exists."));
    }

    @Test
    void validationErrorsUseTheDrfShape() throws Exception {
        postJson("/api/auth/register/", """
                {"password": ""}
                """)
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.email", contains("This field is required.")))
                .andExpect(jsonPath("$.password", contains("This field may not be blank.")));
    }

    @Test
    void meNeedsAToken() throws Exception {
        api.perform(get("/api/auth/me/"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid or expired token."));
    }

    @Test
    void aBadTokenDoesNotBlockPublicEndpoints() throws Exception {
        api.perform(post("/api/auth/login/")
                        .header(HttpHeaders.AUTHORIZATION, "Bearer expired")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"nobody@example.com\", \"password\": \"x\"}"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.detail").value("Invalid email or password."));
    }

    @Test
    void refreshIssuesANewPairAndRejectsAnAccessToken() throws Exception {
        String tokens = postJson("/api/auth/register/", """
                {"email": "%s", "password": "secret123"}
                """.formatted(uniqueEmail())).andReturn().getResponse().getContentAsString();

        postJson("/api/auth/refresh/", """
                {"refresh": "%s"}
                """.formatted((String) JsonPath.read(tokens, "$.refresh")))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.access").isString());

        postJson("/api/auth/refresh/", """
                {"refresh": "%s"}
                """.formatted((String) JsonPath.read(tokens, "$.access")))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void patchMeUpdatesOnlyTheFieldsSent() throws Exception {
        String authorization = signUp();

        api.perform(patch("/api/auth/me/")
                        .header(HttpHeaders.AUTHORIZATION, authorization)
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"first_name\": \"Grace\"}"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.first_name").value("Grace"))
                .andExpect(jsonPath("$.last_name").value(""));
    }

    @Test
    void unknownRoutesAndNonNumericIdsAreNotFound() throws Exception {
        api.perform(get("/api/nothing-here/").header(HttpHeaders.AUTHORIZATION, signUp()))
                .andExpect(status().isNotFound())
                .andExpect(jsonPath("$.detail").value("Not found."));
    }
}
