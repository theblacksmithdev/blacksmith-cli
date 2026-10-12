package app.errors;

/** Django REST Framework's body for a message that belongs to no field: {@code {"detail": "..."}}. */
public record Detail(String detail) {}
