package app.errors;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.ArrayList;
import org.springframework.validation.BindingResult;
import org.springframework.validation.FieldError;

/**
 * Bean Validation failures in Django REST Framework's shape: each JSON field
 * mapped to its messages, {@code {"title": ["This field may not be blank."]}}.
 */
public final class FieldErrors {

    private FieldErrors() {}

    public static Map<String, List<String>> from(BindingResult result) {
        Map<String, List<String>> errors = new LinkedHashMap<>();
        for (FieldError error : result.getFieldErrors()) {
            String field = jsonName(error.getField());
            List<String> messages = errors.computeIfAbsent(field, key -> new ArrayList<>());
            String message = message(error);
            // A missing value fails both @NotNull and @NotBlank; say it once
            if (!messages.contains(message)) {
                messages.add(message);
            }
        }
        if (errors.isEmpty() && result.hasGlobalErrors()) {
            errors.put("non_field_errors", result.getGlobalErrors().stream()
                    .map(error -> error.getDefaultMessage()).toList());
        }
        return errors;
    }

    /** DRF's wording for the errors every form hits; Bean Validation's for the rest. */
    static String message(FieldError error) {
        if (error.getRejectedValue() == null) {
            return Messages.REQUIRED;
        }
        return switch (String.valueOf(error.getCode())) {
            case "NotBlank", "NotEmpty" -> Messages.BLANK;
            case "Email" -> Messages.INVALID_EMAIL;
            default -> error.getDefaultMessage();
        };
    }

    /** {@code firstName} → {@code first_name}: JSON uses snake_case (application.yml). */
    static String jsonName(String field) {
        return field.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toLowerCase();
    }
}
