import type { Skill, SkillContext } from './types.js'

export const expressPrismaSkill: Skill = {
  id: 'express-prisma',
  name: 'Prisma Data Layer',
  description: 'Schema conventions, migrations, relations, and query patterns for the Prisma data layer.',

  render(_ctx: SkillContext): string {
    return `## Prisma Data Layer

The schema lives in \`backend/prisma/schema.prisma\`. It is the single source of
truth for the database — never write SQL migrations by hand.

### Field Naming

Use **snake_case** field names, not Prisma's usual camelCase:

\`\`\`prisma
model Post {
  id            Int      @id @default(autoincrement())
  title         String
  description   String   @default("")
  created_by    User     @relation(fields: [created_by_id], references: [id], onDelete: Cascade)
  created_by_id Int
  created_at    DateTime @default(now())
  updated_at    DateTime @updatedAt

  @@index([created_by_id])
  @@map("posts")
}
\`\`\`

These names are serialized straight to JSON, and the frontend's TypeScript
types are generated from that JSON. camelCase here would change the API
contract and break the generated React components.

\`@@map\` keeps the table name plural and snake_case.

### Every Model Gets

- \`id Int @id @default(autoincrement())\`
- \`created_at DateTime @default(now())\` and \`updated_at DateTime @updatedAt\`
- \`onDelete: Cascade\` on the owner relation, so deleting a user cleans up
- \`@@index\` on every foreign key — SQLite and Postgres both need it for
  list queries that filter by owner

### Relations Need Both Sides

Prisma rejects a relation declared on only one model. Adding \`Post\` above also
requires a back-relation on \`User\`:

\`\`\`prisma
model User {
  // ...
  posts Post[]
  // blacksmith:user-relations
}
\`\`\`

\`blacksmith make:resource\` adds both sides at the marker comments. Keep those
markers in place.

### Migrations

\`\`\`bash
blacksmith backend exec prisma migrate dev --name add_posts   # create + apply
blacksmith backend exec prisma migrate deploy                 # apply in CI/production
blacksmith backend exec prisma studio                         # browse the data
\`\`\`

\`migrate dev\` regenerates the Prisma client too, so types update immediately.
Commit the generated folder under \`prisma/migrations/\` — it is the migration
history, and \`migrate deploy\` replays it.

Never use \`migrate reset\` or \`db push --force-reset\` against a database that
holds anything you care about; both drop everything.

### Querying

Import the shared client — never construct \`new PrismaClient()\` in a module:

\`\`\`ts
import { prisma } from '../../db/client.js'
\`\`\`

- Use \`include\` or \`select\` to fetch relations in one query rather than
  looping — an N+1 here shows up directly in API latency
- Run independent queries concurrently with \`Promise.all\`, as the generated
  list endpoints do for the page and the count
- Use \`findFirst\` with an owner filter for scoped lookups, not \`findUnique\`
  by id followed by an ownership check
- Wrap multi-step writes in \`prisma.$transaction\` so a failure cannot leave
  half a change behind

### Development vs Production

The generated project uses SQLite for development and tests. To move to
Postgres, change the datasource provider and \`DATABASE_URL\`, then re-run the
migrations:

\`\`\`prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
\`\`\`

Note that SQLite's \`contains\` filter is case-insensitive for ASCII while
Postgres's is not — search endpoints need \`mode: 'insensitive'\` after the
switch.
`
  },
}
