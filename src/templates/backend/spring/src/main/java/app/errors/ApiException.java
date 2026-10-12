package app.errors;

import org.springframework.http.HttpStatus;

/** An expected failure, answered with {@code status} and a {@code {"detail": "..."}} body. */
public class ApiException extends RuntimeException {

    private final HttpStatus status;

    public ApiException(HttpStatus status, String detail) {
        super(detail);
        this.status = status;
    }

    public HttpStatus getStatus() {
        return status;
    }

    public static ApiException notFound() {
        return new ApiException(HttpStatus.NOT_FOUND, Messages.NOT_FOUND);
    }
}
