package app.errors;

import java.util.List;
import java.util.Map;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

/**
 * Every error body in Django REST Framework's shape, which is what the generated
 * frontend reads. Spring's default, an RFC 7807 problem document, is never sent.
 *
 * <p>These handlers are left out of the OpenAPI document
 * ({@code springdoc.override-with-generic-response: false}): documented on every
 * operation, they would change the error type of every generated React hook.
 */
@RestControllerAdvice
public class ApiExceptionHandler {

    @ExceptionHandler(ApiException.class)
    ResponseEntity<Detail> api(ApiException exception) {
        return ResponseEntity.status(exception.getStatus()).body(new Detail(exception.getMessage()));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    ResponseEntity<Map<String, List<String>>> invalid(MethodArgumentNotValidException exception) {
        return ResponseEntity.badRequest().body(FieldErrors.from(exception.getBindingResult()));
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    ResponseEntity<Detail> unreadable(HttpMessageNotReadableException exception) {
        return ResponseEntity.badRequest().body(new Detail("JSON parse error."));
    }

    /** A path id that is not a number cannot name a row: DRF answers 404, not 400. */
    @ExceptionHandler({MethodArgumentTypeMismatchException.class, NoResourceFoundException.class})
    ResponseEntity<Detail> notFound(Exception exception) {
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body(new Detail(Messages.NOT_FOUND));
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    ResponseEntity<Detail> methodNotAllowed(HttpRequestMethodNotSupportedException exception) {
        String detail = "Method \"" + exception.getMethod() + "\" not allowed.";
        return ResponseEntity.status(HttpStatus.METHOD_NOT_ALLOWED).body(new Detail(detail));
    }
}
