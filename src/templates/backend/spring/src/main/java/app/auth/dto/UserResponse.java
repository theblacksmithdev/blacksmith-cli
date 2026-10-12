package app.auth.dto;

import app.users.User;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "User")
public record UserResponse(long id, String email, String firstName, String lastName) {

    public static UserResponse from(User user) {
        return new UserResponse(user.getId(), user.getEmail(), user.getFirstName(), user.getLastName());
    }
}
