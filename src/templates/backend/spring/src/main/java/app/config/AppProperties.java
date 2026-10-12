package app.config;

import java.util.List;
import org.springframework.boot.context.properties.ConfigurationProperties;

/** The {@code app.*} settings in application.yml. */
@ConfigurationProperties("app")
public record AppProperties(
        String secretKey,
        List<String> corsOrigins,
        long accessTokenMinutes,
        long refreshTokenDays) {}
