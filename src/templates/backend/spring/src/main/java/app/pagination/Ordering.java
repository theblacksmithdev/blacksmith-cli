package app.pagination;

import java.util.Map;
import org.springframework.data.domain.Sort;

/** DRF's {@code ordering} query parameter ({@code title}, {@code -created_at}) as a {@link Sort}. */
public final class Ordering {

    private Ordering() {}

    /**
     * {@code fields} maps each name a client may order by to the entity property.
     * An unknown name falls back to {@code fallback} rather than erroring, which
     * is how DRF's {@code OrderingFilter} behaves. Ties break on id, so pages are
     * stable.
     */
    public static Sort sort(String ordering, Map<String, String> fields, String fallback) {
        String requested = ordering.strip();
        String property = fields.get(requested.replaceFirst("^-", ""));
        if (property == null) {
            return sort(fallback, fields, fallback);
        }
        Sort.Direction direction = requested.startsWith("-") ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, property, "id");
    }
}
