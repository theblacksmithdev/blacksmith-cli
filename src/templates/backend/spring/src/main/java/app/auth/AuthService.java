package app.auth;

import app.auth.dto.ChangePasswordRequest;
import app.auth.dto.LoginRequest;
import app.auth.dto.PatchedUserRequest;
import app.auth.dto.RegisterRequest;
import app.auth.dto.TokenPair;
import app.errors.ApiException;
import app.users.User;
import app.users.UserRepository;
import java.util.Locale;
import java.util.Objects;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/** Accounts and tokens. The only class in the auth package that touches the database. */
@Service
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder passwords;
    private final TokenService tokens;

    public AuthService(UserRepository users, PasswordEncoder passwords, TokenService tokens) {
        this.users = users;
        this.passwords = passwords;
        this.tokens = tokens;
    }

    @Transactional
    public TokenPair register(RegisterRequest request) {
        String email = request.email().toLowerCase(Locale.ROOT);
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A user with this email already exists.");
        }
        User user = users.save(new User(
                email,
                passwords.encode(request.password()),
                Objects.requireNonNullElse(request.firstName(), ""),
                Objects.requireNonNullElse(request.lastName(), "")));
        return tokens.issue(user.getId());
    }

    public TokenPair login(LoginRequest request) {
        return users.findByEmail(request.email().toLowerCase(Locale.ROOT))
                .filter(user -> passwords.matches(request.password(), user.getPasswordHash()))
                .map(user -> tokens.issue(user.getId()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password."));
    }

    public TokenPair refresh(String refreshToken) {
        return tokens.userId(refreshToken, TokenService.REFRESH)
                .filter(users::existsById)
                .map(tokens::issue)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid or expired refresh token."));
    }

    @Transactional
    public User updateProfile(User user, PatchedUserRequest request) {
        if (request.firstName() != null) {
            user.setFirstName(request.firstName());
        }
        if (request.lastName() != null) {
            user.setLastName(request.lastName());
        }
        return users.save(user);
    }

    @Transactional
    public void changePassword(User user, ChangePasswordRequest request) {
        if (!passwords.matches(request.oldPassword(), user.getPasswordHash())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Old password is incorrect.");
        }
        user.setPasswordHash(passwords.encode(request.newPassword()));
        users.save(user);
    }
}
