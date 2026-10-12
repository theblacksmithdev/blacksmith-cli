package app.docs;

import io.swagger.v3.oas.annotations.Hidden;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/** ReDoc at /api/redoc/, reading the same document as Swagger UI at /api/docs/. */
@Hidden
@RestController
public class RedocController {

    private static final String PAGE = """
            <!DOCTYPE html>
            <html>
              <head>
                <title>API Reference</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
              </head>
              <body>
                <redoc spec-url="/api/schema/"></redoc>
                <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
              </body>
            </html>
            """;

    @GetMapping(value = "/api/redoc/", produces = MediaType.TEXT_HTML_VALUE)
    String redoc() {
        return PAGE;
    }
}
