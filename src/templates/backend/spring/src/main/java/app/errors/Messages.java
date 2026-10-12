package app.errors;

/**
 * Django REST Framework's wording, so every backend says the same thing and the
 * frontend can show it as it is.
 */
public final class Messages {

    public static final String REQUIRED = "This field is required.";
    public static final String BLANK = "This field may not be blank.";
    public static final String NOT_NULL = "This field may not be null.";
    public static final String INVALID_EMAIL = "Enter a valid email address.";
    public static final String NOT_FOUND = "Not found.";
    public static final String NOT_AUTHENTICATED = "Invalid or expired token.";
    public static final String PERMISSION_DENIED = "You do not have permission to perform this action.";

    private Messages() {}

    public static String maxLength(int max) {
        return "Ensure this field has no more than " + max + " characters.";
    }

    public static String minLength(int min) {
        return "Ensure this field has at least " + min + " characters.";
    }
}
