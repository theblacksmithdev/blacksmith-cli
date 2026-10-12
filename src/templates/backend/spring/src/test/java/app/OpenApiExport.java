package app;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

import java.nio.file.Files;
import java.nio.file.Path;
import org.junit.jupiter.api.Tag;
import org.junit.jupiter.api.Test;

/**
 * Not a test: the body of {@code ./gradlew exportOpenApi}, which writes the
 * OpenAPI document to a file without a server listening. {@code blacksmith sync}
 * generates the frontend client from that file. Plain {@code ./gradlew test}
 * skips it.
 */
@Tag("openapi-export")
class OpenApiExport extends ApiTest {

    @Test
    void export() throws Exception {
        String document = api.perform(get("/api/schema/"))
                .andExpect(status().isOk())
                .andReturn().getResponse().getContentAsString();
        Path out = Path.of(System.getProperty("openapi.out")).toAbsolutePath();
        // createDirectories refuses a directory reached through a symlink (/tmp on macOS)
        if (!Files.isDirectory(out.getParent())) {
            Files.createDirectories(out.getParent());
        }
        Files.writeString(out, document);
    }
}
