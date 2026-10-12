package app;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

/**
 * Fails when an entity has changes no migration covers. The test database is
 * built by Flyway alone, and Hibernate validates every entity against it at
 * startup ({@code ddl-auto: validate}), so a missing migration stops the
 * application context from loading.
 */
@SpringBootTest
class MigrationsTest {

    @Test
    void migrationsMatchTheEntities() {
        // Loading the context is the assertion
    }
}
