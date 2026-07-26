import {
  createHash,
  randomBytes,
  scrypt as scryptCallback,
  timingSafeEqual,
} from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getDb } from "./db";

const SESSION_COOKIE = "tenderloop_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export type SessionUser = {
  id: string;
  email: string;
  displayName: string;
  platformRole: string | null;
  organizationId: string | null;
  organizationName: string | null;
  organizationRole: string | null;
};

function hashSessionToken(token: string) {
  return createHash("sha256").update(token).digest("hex");
}

function deriveKey(password: string, salt: string) {
  return new Promise<Buffer>((resolve, reject) => {
    scryptCallback(password, salt, 64, (error, derivedKey) => {
      if (error) reject(error);
      else resolve(derivedKey);
    });
  });
}

export async function verifyPassword(password: string, encoded: string) {
  const [algorithm, salt, expectedHex] = encoded.split(":");
  if (algorithm !== "scrypt" || !salt || !expectedHex) return false;
  const actual = await deriveKey(password, salt);
  const expected = Buffer.from(expectedHex, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}

export async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await deriveKey(password, salt);
  return `scrypt:${salt}:${derived.toString("hex")}`;
}

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const tokenHash = hashSessionToken(token);
  const expiresAt = new Date(Date.now() + SESSION_TTL_SECONDS * 1000);
  const sql = getDb();

  await sql`
    insert into sessions (user_id, token_hash, expires_at)
    values (${userId}, ${tokenHash}, ${expiresAt.toISOString()})
  `;

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (token) {
    await getDb()`delete from sessions where token_hash = ${hashSessionToken(token)}`;
  }
  cookieStore.delete(SESSION_COOKIE);
}

export async function getSessionUser(): Promise<SessionUser | null> {
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const rows = await getDb()`
    select
      u.id,
      u.email,
      u.display_name,
      u.platform_role,
      o.id as organization_id,
      o.name as organization_name,
      om.role as organization_role
    from sessions s
    join users u on u.id = s.user_id
    left join organization_members om on om.user_id = u.id
    left join organizations o on o.id = om.organization_id
    where s.token_hash = ${hashSessionToken(token)}
      and s.expires_at > now()
    order by om.created_at asc
    limit 1
  `;
  const row = rows[0];
  if (!row) return null;

  return {
    id: String(row.id),
    email: String(row.email),
    displayName: String(row.display_name),
    platformRole: row.platform_role ? String(row.platform_role) : null,
    organizationId: row.organization_id ? String(row.organization_id) : null,
    organizationName: row.organization_name ? String(row.organization_name) : null,
    organizationRole: row.organization_role ? String(row.organization_role) : null,
  };
}

export async function requireUser() {
  const user = await getSessionUser();
  if (!user) redirect("/login");
  return user;
}
