package app.config;

import app.auth.BearerTokenFilter;
import app.auth.TokenService;
import app.errors.DetailWriter;
import app.errors.Messages;
import app.users.UserRepository;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

/**
 * Stateless JWT security. Everything under /api needs a valid access token except
 * the endpoints listed in {@link #PUBLIC}.
 */
@Configuration
public class SecurityConfig {

    static final String[] PUBLIC = {
        "/api/auth/register/",
        "/api/auth/login/",
        "/api/auth/refresh/",
        "/api/auth/forgot-password/",
        "/api/auth/reset-password/",
        "/api/schema/**",
        "/api/docs/**",
        "/api/redoc/",
        "/error",
        // Browsers ask for it on every docs page; answer 404, not 401
        "/favicon.ico",
    };

    @Bean
    SecurityFilterChain securityFilterChain(HttpSecurity http, TokenService tokens, UserRepository users)
            throws Exception {
        return http
                .csrf(AbstractHttpConfigurer::disable)
                .httpBasic(AbstractHttpConfigurer::disable)
                .formLogin(AbstractHttpConfigurer::disable)
                .logout(AbstractHttpConfigurer::disable)
                .cors(Customizer.withDefaults())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(requests -> requests
                        .requestMatchers(PUBLIC).permitAll()
                        .anyRequest().authenticated())
                .exceptionHandling(errors -> errors
                        .authenticationEntryPoint((request, response, exception) ->
                                DetailWriter.write(response, HttpStatus.UNAUTHORIZED, Messages.NOT_AUTHENTICATED))
                        .accessDeniedHandler((request, response, exception) ->
                                DetailWriter.write(response, HttpStatus.FORBIDDEN, Messages.PERMISSION_DENIED)))
                .addFilterBefore(new BearerTokenFilter(tokens, users), UsernamePasswordAuthenticationFilter.class)
                .build();
    }

    @Bean
    PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    /** Accounts are signed in by token only; this stops Spring creating a default user. */
    @Bean
    UserDetailsService userDetailsService() {
        return username -> {
            throw new UnsupportedOperationException("Sign in with a bearer token.");
        };
    }

    @Bean
    CorsConfigurationSource corsConfigurationSource(AppProperties properties) {
        CorsConfiguration cors = new CorsConfiguration();
        cors.setAllowedOrigins(properties.corsOrigins());
        cors.addAllowedMethod(CorsConfiguration.ALL);
        cors.addAllowedHeader(CorsConfiguration.ALL);
        cors.setAllowCredentials(true);
        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", cors);
        return source;
    }
}
