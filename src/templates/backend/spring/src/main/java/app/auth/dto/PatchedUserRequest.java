package app.auth.dto;

/** A partial profile update: a field left out stays as it is. */
public record PatchedUserRequest(String firstName, String lastName) {}
