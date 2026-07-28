import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, Field, SaveButton, TextArea } from "@/components/admin/cms-ui";
import { SETTINGS_FALLBACK, type SiteSettings } from "@/lib/cms";

export const Route = createFileRoute("/admin/settings")({ ssr: false, component: AdminSettingsPage });

function AdminSettingsPage() {
  const { roles } = useAdminSession();
  const editable = canManage(roles);
  const [form, setForm] = useState<SiteSettings>(SETTINGS_FALLBACK);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("site_settings").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setForm(data as any);
      setLoading(false);
    });
  }, []);

  function set<K extends keyof SiteSettings>(key: K, value: SiteSettings[K]) {
    setForm((f) => ({ ...f, [key]: value }));
    setSaved(false);
  }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const { id, ...values } = form;
    const { error } = await supabase.from("site_settings").update(values as any).eq("id", id);
    setSaving(false);
    if (error) { setError("Could not save: " + error.message); return; }
    setSaved(true);
  }

  if (loading) return <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>;

  return (
    <div>
      <AdminHeading title="Site Settings" description="Church details, service times and social links used across the whole website." />
      {!editable && <p className="mt-3 text-xs text-muted-foreground">You have read-only access to site settings.</p>}
      <Alert error={error} />

      <form onSubmit={save} className="mt-6 space-y-6">
        <div className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 grid gap-4 sm:grid-cols-2">
          <Field label="Church name" value={form.church_name ?? ""} onChange={(v) => set("church_name", v)} disabled={!editable} required />
          <Field label="Telephone" value={form.phone ?? ""} onChange={(v) => set("phone", v)} disabled={!editable} />
          <Field label="Email" type="email" value={form.email ?? ""} onChange={(v) => set("email", v)} disabled={!editable} />
          <Field label="Worship address" value={form.address ?? ""} onChange={(v) => set("address", v)} disabled={!editable} />
          <Field label="Google Maps / location link" value={form.map_url ?? ""} onChange={(v) => set("map_url", v)} disabled={!editable} />
          <Field label="Service times" value={form.service_times ?? ""} onChange={(v) => set("service_times", v)} disabled={!editable} />
          <div className="sm:col-span-2">
            <TextArea label="Short church description" rows={2} value={form.short_description ?? ""} onChange={(v) => set("short_description", v)} disabled={!editable} />
          </div>
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 grid gap-4 sm:grid-cols-2">
          <Field label="Instagram URL" value={form.instagram_url ?? ""} onChange={(v) => set("instagram_url", v)} disabled={!editable} />
          <Field label="YouTube channel URL" value={form.youtube_url ?? ""} onChange={(v) => set("youtube_url", v)} disabled={!editable} />
          <Field label="Facebook URL" value={form.facebook_url ?? ""} onChange={(v) => set("facebook_url", v)} disabled={!editable} />
        </div>

        <div className="rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5 space-y-4">
          <TextArea label="Footer text" rows={2} value={form.footer_text ?? ""} onChange={(v) => set("footer_text", v)} disabled={!editable} />
          <Field label="Copyright text ({year} is replaced automatically)" value={form.copyright_text ?? ""} onChange={(v) => set("copyright_text", v)} disabled={!editable} />
        </div>

        {editable && <SaveButton type="submit" saving={saving} saved={saved} />}
      </form>
    </div>
  );
}
