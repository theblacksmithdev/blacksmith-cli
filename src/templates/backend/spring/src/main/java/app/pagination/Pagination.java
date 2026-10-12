package app.pagination;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

/**
 * Page-number pagination matching DRF's {@code PageNumberPagination}. The
 * generated React hooks read {@code count} / {@code next} / {@code previous} /
 * {@code results} straight off a list response, so the page size and the
 * absolute page links both match what a Django backend returns.
 */
public final class Pagination {

    public static final int PAGE_SIZE = 20;

    private Pagination() {}

    /** The rows of {@code page} (1-based) in {@code sort} order. */
    public static Pageable request(int page, Sort sort) {
        return PageRequest.of(Math.max(page, 1) - 1, PAGE_SIZE, sort);
    }

    /** The link to the page after {@code page}, or null on the last page. */
    public static String next(Page<?> page) {
        return page.hasNext() ? link(page.getNumber() + 2) : null;
    }

    /** The link to the page before {@code page}, or null on the first page. */
    public static String previous(Page<?> page) {
        return page.getNumber() > 0 ? link(page.getNumber()) : null;
    }

    /** The current URL with {@code page} set. DRF omits {@code page=1}: page one is the bare URL. */
    private static String link(int page) {
        ServletUriComponentsBuilder url = ServletUriComponentsBuilder.fromCurrentRequest();
        return (page == 1 ? url.replaceQueryParam("page") : url.replaceQueryParam("page", page)).toUriString();
    }
}
