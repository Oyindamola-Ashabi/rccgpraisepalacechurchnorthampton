import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2, Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAdminSession } from "@/lib/admin-auth";

export const Route = createFileRoute("/admin/login")({
  ssr: false,
  head: () => ({ meta: [{ title: "Admin Login — RCCG Praise Palace Northampton" }, { name: "robots", content: "noindex, nofollow" }] }),
  component: AdminLoginPage,
});

function AdminLoginPage() {
  const navigate = useNavigate();
  const { user, loading: sessionLoading } = useAdminSession();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionLoading && user) navigate({ to: "/admin", replace: true });
  }, [sessionLoading, user, navigate]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email: email.trim(), password });
    setLoading(false);
    if (error) { setError(error.message); return; }
    navigate({ to: "/admin", replace: true });
  }

  return (
    <div className="grid min-h-[75vh] place-items-center px-4 py-16">
      <div className="w-full max-w-md rounded-3xl bg-card p-8 shadow-elegant ring-1 ring-black/5">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full gradient-brand text-white">
          <Lock className="h-6 w-6" />
        </div>
        <h1 className="mt-5 text-center font-display text-2xl font-bold">Admin Sign In</h1>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          Staff access only — RCCG Praise Palace Northampton.
        </p>

        <form onSubmit={handleSubmit} className="mt-7 space-y-4">
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
            />
          </div>
          <div>
            <label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              className="mt-1 w-full rounded-xl border bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#E13495]"
            />
          </div>

          {error && <p className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full gradient-brand px-6 py-3 text-sm font-semibold text-white shadow-elegant hover:opacity-95 disabled:opacity-60"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />} Sign in
          </button>
        </form>
      </div>
    </div>
  );
}
