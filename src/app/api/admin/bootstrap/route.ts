import { readFile } from "node:fs/promises";
import path from "node:path";
import { z } from "zod";
import { syncTedTenders } from "@/connectors/ted";
import { hashPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

const inputSchema = z.object({
  email: z.string().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(14).max(200),
});

export async function POST(request: Request) {
  const configuredSecret = process.env.BOOTSTRAP_SECRET;
  const suppliedSecret = request.headers.get("x-bootstrap-secret");
  if (!configuredSecret || suppliedSecret !== configuredSecret) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const parsed = inputSchema.safeParse(await request.json());
  if (!parsed.success) {
    return Response.json({ error: "Invalid bootstrap input" }, { status: 400 });
  }

  const migration = await readFile(
    path.join(process.cwd(), "database", "migrations", "0001_neon_foundation.sql"),
    "utf8",
  );
  const sql = getDb();
  await sql.query(migration);

  const passwordHash = await hashPassword(parsed.data.password);
  const users = await sql`
    insert into users (email, display_name, password_hash, platform_role, email_verified_at)
    values (${parsed.data.email}, 'TenderLoop Test Admin', ${passwordHash}, 'platform_admin', now())
    on conflict (email) do update set
      password_hash = excluded.password_hash,
      platform_role = 'platform_admin',
      email_verified_at = now(),
      updated_at = now()
    returning id
  `;
  const organizations = await sql`
    insert into organizations (name, slug, kind, registration_country)
    values ('TenderLoop Test Organization', 'tenderloop-test', 'both', 'DE')
    on conflict (slug) do update set updated_at = now()
    returning id
  `;
  await sql`
    insert into organization_members (organization_id, user_id, role)
    values (${organizations[0].id}, ${users[0].id}, 'organization_owner')
    on conflict (organization_id, user_id) do update set role = 'organization_owner'
  `;

  const synchronization = await syncTedTenders(100);
  return Response.json({
    data: {
      migrated: true,
      userCreated: true,
      synchronized: synchronization,
    },
  });
}
