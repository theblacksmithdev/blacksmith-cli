package app;

import static org.springframework.security.test.web.servlet.setup.SecurityMockMvcConfigurers.springSecurity;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import com.jayway.jsonpath.JsonPath;
import java.util.UUID;
import org.junit.jupiter.api.BeforeEach;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.setup.MockMvcBuilders;
import org.springframework.web.context.WebApplicationContext;
import org.springframework.web.filter.UrlHandlerFilter;

/**
 * Base for API tests: the whole application, driven through MockMvc without a
 * server listening. The in-memory database lasts the whole run, so each test
 * signs up its own user and never assumes a table is empty.
 */
@SpringBootTest
public abstract class ApiTest {

    @Autowired
    private WebApplicationContext context;

    @Autowired
    private FilterRegistrationBean<UrlHandlerFilter> schemaTrailingSlash;

    protected MockMvc api;

    @BeforeEach
    void setUpApi() {
        // The servlet filters MockMvc does not pick up on its own, in the server's order
        api = MockMvcBuilders.webAppContextSetup(context)
                .addFilters(schemaTrailingSlash.getFilter())
                .apply(springSecurity())
                .build();
    }

    /** A fresh email, so no two tests share a user. */
    protected static String uniqueEmail() {
        return "user-" + UUID.randomUUID() + "@example.com";
    }

    /** Registers a new user and returns its {@code Authorization} header value. */
    protected String signUp() throws Exception {
        String body = api.perform(post("/api/auth/register/")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content("{\"email\": \"" + uniqueEmail() + "\", \"password\": \"secret123\"}"))
                .andExpect(status().isCreated())
                .andReturn().getResponse().getContentAsString();
        return "Bearer " + JsonPath.read(body, "$.access");
    }
}
