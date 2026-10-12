package app.auth;

import app.users.UserRepository;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.util.List;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.filter.OncePerRequestFilter;

/**
 * Signs the request in as the user its {@code Authorization: Bearer} access token
 * names. A missing or bad token leaves the request anonymous rather than failing
 * it, so public endpoints such as login and refresh still answer; protected ones
 * then get a 401 from {@link app.config.SecurityConfig}.
 *
 * <p>The principal is the {@link app.users.User}: controllers take it with
 * {@code @AuthenticationPrincipal User user}.
 */
public class BearerTokenFilter extends OncePerRequestFilter {

    private static final String PREFIX = "Bearer ";

    private final TokenService tokens;
    private final UserRepository users;

    public BearerTokenFilter(TokenService tokens, UserRepository users) {
        this.tokens = tokens;
        this.users = users;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {
        String header = request.getHeader(HttpHeaders.AUTHORIZATION);
        if (header != null && header.startsWith(PREFIX)) {
            tokens.userId(header.substring(PREFIX.length()), TokenService.ACCESS)
                    .flatMap(users::findById)
                    .filter(user -> user.isActive())
                    .ifPresent(user -> SecurityContextHolder.getContext().setAuthentication(
                            new UsernamePasswordAuthenticationToken(user, null, List.of())));
        }
        chain.doFilter(request, response);
    }
}
