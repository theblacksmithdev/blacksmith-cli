import type { Skill, SkillContext } from './types.js'

export const springSkill: Skill = {
  id: 'spring',
  name: 'Spring Boot Backend Conventions',
  description: 'Package layout, controllers, services, records, errors, auth, pagination, and testing patterns for the Spring Boot backend.',

  render(_ctx: SkillContext): string {
    return `## Spring Boot Backend Conventions

The backend is Java 17 + Spring Boot 4 (Web MVC) + Spring Data JPA, with Flyway
for migrations and Spring Security for JWT auth, built with the Gradle wrapper.
Every feature is a **package** under \`backend/src/main/java/app/<resource>/\`,
and every package has the same layers.

### Package Layout

\`\`\`
src/main/java/app/
├── Application.java          # the entry point
├── auth/                     # auth endpoints, TokenService, BearerTokenFilter
├── config/                   # SecurityConfig, OpenApiConfig, AppProperties
├── errors/                   # ApiException, DRF-shaped error bodies
├── pagination/               # Pagination (DRF page envelope), Ordering
├── users/                    # User entity and repository
└── blogposts/
    ├── BlogPost.java             # JPA entity
    ├── BlogPostRepository.java   # Spring Data repository
    ├── BlogPostService.java      # business logic and transactions
    ├── BlogPostController.java   # endpoints: HTTP in, service call, HTTP out
    └── dto/
        ├── BlogPostResponse.java       # @Schema(name = "BlogPost")
        ├── BlogPostRequest.java        # create and PUT body
        ├── PatchedBlogPostRequest.java # PATCH body
        └── PaginatedBlogPostList.java  # one page of results
src/main/resources/db/migration/  # Flyway: V1__create_users.sql, V2__create_blog_posts.sql, ...
src/test/java/app/blogposts/BlogPostApiTest.java
\`\`\`

\`blacksmith make:resource BlogPost\` creates all of this, plus the next Flyway
migration. Spring finds the controller by component scanning, so nothing needs
registering. The package name is the plural with the words run together
(\`app.blogposts\`); the table and URL are snake_case plural (\`blog_posts\`,
\`/api/blog_posts/\`).

### The Layers, and What Belongs in Each

- **Records in \`dto/\`** — one per response, one per request body, and a
  \`Patched<Name>Request\` for PATCH. They carry the validation and the OpenAPI
  contract. One record per file.
- **Service** — every query and write, and the \`@Transactional\` boundary.
  Takes the signed-in \`User\` and records, returns records, throws
  \`ApiException\`. The only class that uses the repository. Entities never
  leave it: map them with \`<Name>Response.from(entity)\` before returning.
- **Controller** — declares the endpoint, binds and validates the request
  (\`@Valid @RequestBody\`), calls the service. One line per handler.
- **Entity** — columns and relationships only; no business logic.

Take dependencies through the constructor into \`final\` fields. Never use
field \`@Autowired\`.

### OpenAPI Is the Frontend's Contract

\`blacksmith sync\` runs \`./gradlew exportOpenApi\` and generates the frontend
client from the document, so the annotations *are* the frontend API:

- Set \`@Operation(operationId = ...)\` on every endpoint to what drf-spectacular
  emits for a ModelViewSet: \`blog_posts_list\`, \`blog_posts_create\`,
  \`blog_posts_retrieve\`, \`blog_posts_update\`, \`blog_posts_partial_update\`,
  \`blog_posts_destroy\`. The generated hooks are named from these.
- Name schemas as the other backends do: the response record carries
  \`@Schema(name = "BlogPost")\`; request records are \`BlogPostRequest\` and
  \`PatchedBlogPostRequest\`; the list is \`PaginatedBlogPostList\`.
- Document path ids as strings, \`@PathVariable @Parameter(schema = @Schema(type
  = "string")) long id\`. The frontend passes route params straight from
  the URL; a non-numeric id answers 404.
- Keep trailing slashes on every path (\`"/"\`, \`"/{id}/"\`), as Django does.
- Every property of a response schema is marked required automatically
  (\`config/RequiredResponseFields\`), so response fields are never
  \`undefined\` in TypeScript. A field that can be null needs
  \`@Schema(nullable = true)\`. Request records stay as validation makes them:
  only constrained fields are required.

JSON field names are snake_case (\`spring.jackson.property-naming-strategy\`), and
\`OpenApiConfig\` documents the same names. Java stays camelCase.

### Errors Are a Contract

The frontend client parses Django REST Framework's error shapes, and
\`errors/ApiExceptionHandler\` produces them for every failure. Throw
\`ApiException\` for expected failures:

\`\`\`java
throw ApiException.notFound();                                              // 404 {"detail": "Not found."}
throw new ApiException(HttpStatus.BAD_REQUEST, "Old password is incorrect."); // {"detail": "..."}
\`\`\`

Validation failures become \`{"title": ["This field may not be blank."]}\`, with
DRF's wording from \`errors/Messages\`. Never return a custom error body, and
never let Spring's RFC 7807 problem document through: the frontend's
\`parseApiError\` understands neither.

### Validation

- \`@NotBlank\` on a required string (\`"This field is required."\` when missing,
  \`"This field may not be blank."\` when empty)
- \`@Size(min = 1, max = 255)\` alongside it, so the document carries the limits
- \`@NotNull\` on a required non-string field
- A field left out of a create body is null in the record: default it in the
  service (\`Objects.requireNonNullElse(request.description(), "")\`)

### PATCH: Absent Versus Null

A PATCH record wraps each field in \`JsonNullable\`, which tells a field left
out (undefined: keep the current value) from one sent as \`null\`:

\`\`\`java
public record PatchedBlogPostRequest(
        JsonNullable<@NotBlank @Size(min = 1, max = 255) String> title,
        JsonNullable<@NotNull String> description) {}

request.title().ifPresent(blogPost::setTitle);   // in the service
\`\`\`

The constraints go *inside* the type argument, so they apply only when the
field was sent. \`@NotNull\` there rejects an explicit null with DRF's "This
field may not be null."; leave it off a column that is nullable, and the
client can clear it.

### Authentication

Everything under \`/api\` needs an access token except \`SecurityConfig.PUBLIC\`.
Take the signed-in user as a parameter:

\`\`\`java
public BlogPostResponse create(@AuthenticationPrincipal User user, @Valid @RequestBody BlogPostRequest request)
\`\`\`

### Scoping to the Current User

Filter by owner in the **query**, never after loading. The generated
repository has \`search(owner, ...)\` and \`findByIdAndCreatedBy(id, owner)\`, and
the service's \`owned(user, id)\` throws 404 for a row that does not exist *or*
belongs to someone else. Return **404, not 403**, so existence does not leak.

### Pagination and Ordering

List endpoints return DRF's envelope through the resource's own
\`Paginated<Name>List\` record, which gives the schema its per-resource name:

\`\`\`java
Sort sort = Ordering.sort(ordering, ORDERING_FIELDS, DEFAULT_ORDERING);
Page<BlogPostResponse> results = blogPosts.search(user, search.strip(), Pagination.request(page, sort))
        .map(BlogPostResponse::from);
return PaginatedBlogPostList.of(results);
\`\`\`

\`Pagination\` uses DRF's page size (20), 1-based \`?page=\`, and absolute
\`next\` / \`previous\` links. \`Ordering\` reads DRF's \`?ordering=-created_at\`;
\`ORDERING_FIELDS\` maps the JSON names a client may sort by to entity
properties. Never return a bare list or Spring's \`Page\` JSON: the generated
frontend queries read \`results\` and \`count\`.

### Testing

Tests run with JUnit 5 through MockMvc (\`blacksmith test\`, or
\`blacksmith backend test\`), against an in-memory H2 database built by the
Flyway migrations. Extend \`ApiTest\`:

- \`api\` — MockMvc with Spring Security applied
- \`signUp()\` — registers a new user and returns its \`Authorization\` header,
  so each test signs up the users it needs (one for ownership, two for "another
  user's row")

The database lasts the whole run, so create the rows a test needs through the
API and never assume a table is empty. Assert on **status codes and body
shapes** with \`jsonPath\`; the DRF error contract is what the frontend depends
on. \`MigrationsTest\` fails when an entity and the migrations disagree.
\`blacksmith test --coverage\` adds a JaCoCo report.

### Sync After Backend Changes (Fullstack Projects)

Changing a record, an annotation or a controller changes the API contract. Run
\`blacksmith sync\` to regenerate the frontend's types and TanStack Query hooks.
\`blacksmith dev\` does this automatically after the application restarts on a
\`.java\` change.
`
  },
}
