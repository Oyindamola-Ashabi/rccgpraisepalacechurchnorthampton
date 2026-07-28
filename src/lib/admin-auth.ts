import { useEffect, useState } from "react";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "admin" | "editor";

export type AdminSession = {
  loading: boolean;
  user: User | null;
  roles: AppRole[];
};

export function isStaff(roles: AppRole[]) {
  return roles.length > 0;
}

export function canManage(roles: AppRole[]) {
  return roles.includes("super_admin") || roles.includes("admin");
}

export function isSuperAdmin(roles: AppRole[]) {
  return roles.includes("super_admin");
}

export function roleLabel(roles: AppRole[]) {
  if (roles.includes("super_admin")) return "Super Admin";
  if (roles.includes("admin")) return "Admin";
  if (roles.includes("editor")) return "Editor";
  return "No access";
}

export function useAdminSession(): AdminSession {
  const [state, setState] = useState<AdminSession>({ loading: true, user: null, roles: [] });

  useEffect(() => {
    let active = true;

    async function loadRoles(user: User | null) {
      if (!user) {
        if (active) setState({ loading: false, user: null, roles: [] });
        return;
      }
      const { data } = await supabase.from("user_roles").select("role").eq("user_id", user.id);
      if (!active) return;
      setState({
        loading: false,
        user,
        roles: (data ?? []).map((r) => r.role as AppRole),
      });
    }

    supabase.auth.getUser().then(({ data }) => loadRoles(data.user ?? null));

    const { data: sub } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_IN" || event === "SIGNED_OUT" || event === "USER_UPDATED") {
        setState((s) => ({ ...s, loading: true }));
        loadRoles(session?.user ?? null);
      }
    });

    return () => {
      active = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  return state;
}

export async function adminSignOut() {
  await supabase.auth.signOut();
}
