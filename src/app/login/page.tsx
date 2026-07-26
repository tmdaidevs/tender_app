import { Database, LockKeyhole, ShieldCheck } from "lucide-react";
import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/auth";
import { login } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  if (await getSessionUser()) redirect("/marketplace");
  const { error } = await searchParams;

  return (
    <main className="login-shell">
      <section className="login-story">
        <div className="brand"><span className="brandmark">P</span><span>Procurelio</span></div>
        <div>
          <p className="eyebrow">EVIDENCE-LED PROCUREMENT</p>
          <h1>Real opportunities.<br />Qualified decisions.</h1>
          <p>Access the live DACH tender marketplace backed by Neon PostgreSQL and official TED data.</p>
        </div>
        <ul>
          <li><Database size={17} /> Live database records—no tender fixtures</li>
          <li><ShieldCheck size={17} /> Official-source attribution</li>
          <li><LockKeyhole size={17} /> Server-side sessions and authorization</li>
        </ul>
      </section>
      <section className="login-panel">
        <div className="login-card">
          <p className="eyebrow">WELCOME BACK</p>
          <h2>Sign in to Procurelio</h2>
          <p>Use your organization account to continue.</p>
          {error && <div className="login-error" role="alert">Email or password is incorrect.</div>}
          <form action={login}>
            <label>Email address<input name="email" type="email" autoComplete="email" required /></label>
            <label>Password<input name="password" type="password" autoComplete="current-password" required /></label>
            <button className="primary" type="submit">Sign in</button>
          </form>
          <small>Authentication is stored in the connected Neon database.</small>
        </div>
      </section>
    </main>
  );
}
