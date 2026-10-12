package app.errors;

import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;

/**
 * Writes a {@code {"detail": "..."}} body straight to the response, for the
 * security layer, which answers before any controller or advice runs.
 */
public final class DetailWriter {

    private DetailWriter() {}

    public static void write(HttpServletResponse response, HttpStatus status, String detail) throws IOException {
        response.setStatus(status.value());
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);
        response.getWriter().write("{\"detail\":\"" + detail.replace("\"", "\\\"") + "\"}");
    }
}
