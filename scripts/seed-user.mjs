import { randomBytes, scrypt as scryptCallback } from "node:crypto";
import { promisify } from "node:util";
import { neon } from "@neondatabase/serverless";

const scrypt = promisify(scryptCallback);
const { DATABASE_URL: databaseUrl, TEST_USER_EMAIL: email, TEST_USER_PASSWORD: password } = process.env;

if (!databaseUrl || !email || !password) {
  throw new Error("DATABASE_URL, TEST_USER_EMAIL and TEST_USER_PASSWORD are required");
}
if (password.length < 14) throw new Error("TEST_USER_PASSWORD must contain at least 14 characters");

const salt = randomBytes(16).toString("hex");
const derived = await scrypt(password, salt, 64);
const passwordHash = `scrypt:${salt}:${Buffer.from(derived).toString("hex")}`;
const sql = neon(databaseUrl);

const users = await sql`
  insert into users (email, display_name, password_hash, platform_role, email_verified_at)
  values (${email.toLowerCase()}, 'TenderLoop Test Admin', ${passwordHash}, 'platform_admin', now())
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

console.log("Test administrator created.");
