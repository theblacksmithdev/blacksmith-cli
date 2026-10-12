package app.errors;

import jakarta.validation.ConstraintViolation;
import java.lang.reflect.Field;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.openapitools.jackson.nullable.JsonNullable;
import org.springframework.util.ReflectionUtils;
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
        Map<String, List<FieldError>> byField = result.getFieldErrors().stream()
                .collect(Collectors.groupingBy(FieldError::getField, LinkedHashMap::new, Collectors.toList()));
        byField.forEach((field, fieldErrors) -> errors.put(jsonName(field), messages(fieldErrors)));
        if (errors.isEmpty() && result.hasGlobalErrors()) {
            errors.put("non_field_errors", result.getGlobalErrors().stream()
                    .map(error -> error.getDefaultMessage()).toList());
        }
        return errors;
    }

    /**
     * One field's messages. A missing, null or blank value fails several
     * constraints at once ({@code @NotBlank} and {@code @Size(min = 1)}), but DRF
     * reports only the first problem, so those answer with a single message.
     */
    static List<String> messages(List<FieldError> errors) {
        if (errors.stream().anyMatch(error -> error.getRejectedValue() == null)) {
            return List.of(errors.stream().anyMatch(FieldErrors::isSentNull) ? Messages.NOT_NULL : Messages.REQUIRED);
        }
        if (errors.stream().anyMatch(error -> isBlankCode(error.getCode()))) {
            return List.of(Messages.BLANK);
        }
        return errors.stream().map(FieldErrors::message).distinct().toList();
    }

    /** DRF's wording for the errors every form hits; Bean Validation's for the rest. */
    static String message(FieldError error) {
        return switch (String.valueOf(error.getCode())) {
            case "Email" -> Messages.INVALID_EMAIL;
            case "Size" -> sizeMessage(error);
            default -> error.getDefaultMessage();
        };
    }

    /**
     * {@code @Size}'s arguments are the field, then the annotation's attributes
     * in name order: {@code max}, {@code min}.
     */
    static String sizeMessage(FieldError error) {
        Object[] arguments = error.getArguments();
        String value = String.valueOf(error.getRejectedValue());
        if (arguments != null && arguments.length > 2) {
            int max = (Integer) arguments[1];
            int min = (Integer) arguments[2];
            if (value.length() > max) {
                return Messages.maxLength(max);
            }
            if (value.length() < min) {
                return Messages.minLength(min);
            }
        }
        return error.getDefaultMessage();
    }

    /**
     * A null that the client sent rather than left out. Only a {@code JsonNullable}
     * field can tell the two apart: it is present, holding null, when the client
     * sent {@code null}. Everywhere else a null means the field was missing.
     */
    static boolean isSentNull(FieldError error) {
        if (!error.contains(ConstraintViolation.class)) {
            return false;
        }
        Object request = error.unwrap(ConstraintViolation.class).getLeafBean();
        Field field = request == null ? null : ReflectionUtils.findField(request.getClass(), error.getField());
        if (field == null) {
            return false;
        }
        ReflectionUtils.makeAccessible(field);
        return ReflectionUtils.getField(field, request) instanceof JsonNullable<?> value && value.isPresent();
    }

    static boolean isBlankCode(String code) {
        return "NotBlank".equals(code) || "NotEmpty".equals(code);
    }

    /** {@code firstName} → {@code first_name}: JSON uses snake_case (application.yml). */
    static String jsonName(String field) {
        return field.replaceAll("([a-z0-9])([A-Z])", "$1_$2").toLowerCase();
    }
}
