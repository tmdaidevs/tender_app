"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createSession, verifyPassword } from "@/lib/auth";
import { getDb } from "@/lib/db";

const loginSchema = z.object({
  email: z.string().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(1).max(200),
});

export async function login(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });
  if (!parsed.success) redirect("/login?error=invalid");

  const users = await getDb()`
    select id, password_hash from users where email = ${parsed.data.email} limit 1
  `;
  const user = users[0];
  const valid = user
    ? await verifyPassword(parsed.data.password, String(user.password_hash))
    : false;

  if (!user || !valid) redirect("/login?error=invalid");
  await createSession(String(user.id));
  redirect("/marketplace");
}
