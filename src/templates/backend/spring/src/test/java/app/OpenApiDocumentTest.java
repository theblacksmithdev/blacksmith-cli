package app;

import static org.hamcrest.Matchers.containsInAnyOrder;
import static org.hamcrest.Matchers.hasKey;
import static org.hamcrest.Matchers.not;
import static org.hamcrest.Matchers.startsWith;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import org.junit.jupiter.api.Test;

/**
 * The document the frontend client is generated from. These are the properties
 * that keep the generated client identical across every Blacksmith backend.
 */
class OpenApiDocumentTest extends ApiTest {

    @Test
    void isOpenApi30WithSnakeCasePropertiesAndDrfOperationIds() throws Exception {
        api.perform(get("/api/schema/"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.openapi", startsWith("3.0")))
                .andExpect(jsonPath("$.info.description", startsWith("API documentation for ")))
                .andExpect(jsonPath("$.components.schemas.RegisterRequest.properties", hasKey("first_name")))
                .andExpect(jsonPath("$.paths['/api/auth/me/'].get.operationId").value("auth_me_retrieve"));
    }

    @Test
    void marksEveryResponseFieldRequiredButNotRequestFields() throws Exception {
        api.perform(get("/api/schema/"))
                .andExpect(jsonPath("$.components.schemas.User.required",
                        containsInAnyOrder("id", "email", "first_name", "last_name")))
                .andExpect(jsonPath("$.components.schemas.PatchedUserRequest", not(hasKey("required"))));
    }

    @Test
    void servesTheDocumentAndSwaggerUiConfigWithAndWithoutTheSlash() throws Exception {
        api.perform(get("/api/schema")).andExpect(status().isOk());
        // Swagger UI loads its configuration from here; a double slash is rejected
        api.perform(get("/api/schema/swagger-config"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.url").value("/api/schema"));
    }

    @Test
    void documentsNoErrorResponses() throws Exception {
        api.perform(get("/api/schema/"))
                .andExpect(jsonPath("$.paths['/api/auth/login/'].post.responses", not(hasKey("400"))))
                .andExpect(jsonPath("$.paths['/api/auth/login/'].post.responses", not(hasKey("401"))));
    }
}
