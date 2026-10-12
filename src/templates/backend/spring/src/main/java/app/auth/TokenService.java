package app.auth;

import app.auth.dto.TokenPair;
import app.config.AppProperties;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.util.Optional;
import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import com.nimbusds.jose.jwk.source.ImmutableSecret;
import org.springframework.security.oauth2.jose.jws.MacAlgorithm;
import org.springframework.security.oauth2.jwt.JwsHeader;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtClaimsSet;
import org.springframework.security.oauth2.jwt.JwtDecoder;
import org.springframework.security.oauth2.jwt.JwtEncoder;
import org.springframework.security.oauth2.jwt.JwtEncoderParameters;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.security.oauth2.jwt.NimbusJwtEncoder;
import org.springframework.stereotype.Service;

/**
 * Issues and reads the JWT access and refresh tokens, HS256-signed with
 * {@code SECRET_KEY}. Tokens are stateless: one stays valid until it expires.
 */
@Service
public class TokenService {

    static final String ACCESS = "access";
    static final String REFRESH = "refresh";

    private final JwtEncoder encoder;
    private final JwtDecoder decoder;
    private final Duration accessLifetime;
    private final Duration refreshLifetime;

    public TokenService(AppProperties properties) {
        byte[] secret = properties.secretKey().getBytes(StandardCharsets.UTF_8);
        if (secret.length < 32) {
            throw new IllegalStateException("SECRET_KEY must be at least 32 bytes to sign HS256 tokens.");
        }
        SecretKey key = new SecretKeySpec(secret, "HmacSHA256");
        this.encoder = new NimbusJwtEncoder(new ImmutableSecret<>(key));
        this.decoder = NimbusJwtDecoder.withSecretKey(key).macAlgorithm(MacAlgorithm.HS256).build();
        this.accessLifetime = Duration.ofMinutes(properties.accessTokenMinutes());
        this.refreshLifetime = Duration.ofDays(properties.refreshTokenDays());
    }

    public TokenPair issue(long userId) {
        return new TokenPair(token(userId, ACCESS, accessLifetime), token(userId, REFRESH, refreshLifetime));
    }

    /** The user a token of {@code type} was issued to; empty when it is invalid, expired or of another type. */
    public Optional<Long> userId(String token, String type) {
        try {
            Jwt jwt = decoder.decode(token);
            if (!type.equals(jwt.getClaimAsString("type"))) {
                return Optional.empty();
            }
            return Optional.of(Long.valueOf(jwt.getSubject()));
        } catch (JwtException | NumberFormatException invalid) {
            return Optional.empty();
        }
    }

    private String token(long userId, String type, Duration lifetime) {
        Instant now = Instant.now();
        JwtClaimsSet claims = JwtClaimsSet.builder()
                .subject(Long.toString(userId))
                .claim("type", type)
                .issuedAt(now)
                .expiresAt(now.plus(lifetime))
                .build();
        JwsHeader header = JwsHeader.with(MacAlgorithm.HS256).build();
        return encoder.encode(JwtEncoderParameters.from(header, claims)).getTokenValue();
    }
}
