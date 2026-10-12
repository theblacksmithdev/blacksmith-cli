package app.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.media.Schema;
import java.util.ArrayList;
import java.util.HashSet;
import java.util.Map;
import java.util.Set;
import org.springdoc.core.customizers.OpenApiCustomizer;
import org.springframework.stereotype.Component;

/**
 * Marks every property of a response schema required, as drf-spectacular does.
 * The server always sends every field, so the generated TypeScript types read
 * {@code post.title: string}, not {@code string | undefined}. springdoc on its
 * own marks a property required only when it carries a validation constraint,
 * which is the right rule for request bodies, so those are left alone.
 */
@Component
public class RequiredResponseFields implements OpenApiCustomizer {

    @Override
    public void customise(OpenAPI openApi) {
        if (openApi.getPaths() == null || openApi.getComponents() == null) {
            return;
        }
        Map<String, Schema> components = openApi.getComponents().getSchemas();
        Set<String> visited = new HashSet<>();
        openApi.getPaths().values().stream()
                .flatMap(path -> path.readOperations().stream())
                .flatMap(operation -> operation.getResponses().values().stream())
                .filter(response -> response.getContent() != null)
                .flatMap(response -> response.getContent().values().stream())
                .forEach(media -> require(media.getSchema(), components, visited));
    }

    /** Marks {@code schema}'s properties required, and those of every schema it contains. */
    private void require(Schema<?> schema, Map<String, Schema> components, Set<String> visited) {
        if (schema == null) {
            return;
        }
        if (schema.get$ref() != null) {
            String name = schema.get$ref().substring(schema.get$ref().lastIndexOf('/') + 1);
            if (visited.add(name)) {
                require(components.get(name), components, visited);
            }
            return;
        }
        require(schema.getItems(), components, visited);
        if (schema.getProperties() != null) {
            schema.setRequired(new ArrayList<>(schema.getProperties().keySet()));
            schema.getProperties().values().forEach(property -> require(property, components, visited));
        }
    }
}
