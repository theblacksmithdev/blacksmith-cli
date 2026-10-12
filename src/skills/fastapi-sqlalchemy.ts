import type { Skill, SkillContext } from './types.js'

export const fastapiSqlalchemySkill: Skill = {
  id: 'fastapi-sqlalchemy',
  name: 'SQLAlchemy Models and Alembic Migrations',
  description: 'Model conventions, migrations, relationships, and query patterns for the FastAPI data layer.',

  render(_ctx: SkillContext): string {
    return `## SQLAlchemy Models and Alembic Migrations

Models are SQLAlchemy 2.0 declarative classes on \`Base\` from \`app/db.py\`.
Tables are created and changed **only** by Alembic migrations in
\`backend/migrations/\`, never at startup.

### Every Model Gets

\`\`\`python
from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base, User, utcnow


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(255))
    description: Mapped[str] = mapped_column(Text, default="")
    created_by_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), index=True
    )
    created_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow)
    updated_at: Mapped[datetime] = mapped_column(DateTime, default=utcnow, onupdate=utcnow)

    created_by: Mapped[User] = relationship(lazy="joined")
\`\`\`

- \`Mapped[...]\` annotations, not the legacy \`Column(...)\` style
- snake_case plural table names; snake_case columns, because they become the
  JSON field names the frontend types are generated from
- \`ondelete="CASCADE"\` and \`index=True\` on every owner foreign key
- \`utcnow\` from \`app.db\` for timestamps; store UTC, always

Alembic only sees a model whose module is imported. Import it from the
package's router, which \`app/main.py\` imports; \`migrations/env.py\` imports
\`app.main\` for this reason.

### Migrations

After changing a model:

\`\`\`bash
blacksmith backend alembic revision --autogenerate -m "add post status"
blacksmith backend alembic upgrade head
\`\`\`

- **Read the generated file** in \`migrations/versions/\` before applying it.
  Autogenerate cannot tell a renamed column from a dropped one plus a new one,
  and it does not see server-side defaults you did not declare.
- Adding a non-nullable column to a table with rows needs a
  \`server_default\` (e.g. \`server_default="0"\`), or the upgrade fails on
  existing data.
- Migrations run in batch mode (\`render_as_batch\`), so the same file works
  on SQLite, which cannot alter columns in place, and on PostgreSQL.
- Commit every file under \`migrations/versions/\`. It is the schema history;
  production applies it with \`alembic upgrade head\`.
- \`blacksmith backend alembic downgrade -1\` undoes the last migration.

\`tests/test_migrations.py\` fails when a model has changes no migration
covers, so a forgotten migration is caught by \`blacksmith test\`.

### Querying

Use SQLAlchemy 2.0 \`select()\` with the session from \`Depends(get_db)\`:

\`\`\`python
post = db.scalar(select(Post).where(Post.id == post_id, Post.created_by_id == user.id))
rows = db.scalars(select(Post).order_by(Post.created_at.desc()).limit(20))
count = db.scalar(select(func.count()).select_from(query.subquery()))
\`\`\`

- Put the owner filter in the query, never check ownership after loading
- Load relationships in the same query (\`lazy="joined"\` on the
  relationship, or \`.options(joinedload(...))\`) rather than touching them in a
  loop. An N+1 here shows up directly in API latency
- Use \`ilike\` for search so it is case-insensitive on PostgreSQL too
- Commit once per request, in the service, after every write it makes;
  \`db.refresh(obj)\` before serializing a row you just wrote

### Development vs Production

Development and tests use SQLite. For PostgreSQL, set \`DATABASE_URL\` (for
example \`postgresql+psycopg://user:pass@host/db\`), add the driver to
\`requirements.txt\`, and run \`alembic upgrade head\` against it.
`
  },
}
