import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { canManage, useAdminSession } from "@/lib/admin-auth";
import { AdminHeading, Alert, Field, ImageField, SaveButton, TextArea } from "@/components/admin/cms-ui";
import type { GivingContent } from "@/lib/cms";

export const Route = createFileRoute("/admin/giving")({ ssr: false, component: AdminGivingPage });

const EMPTY: GivingContent = {
  id: "", intro_text: "", instructions: "", payment_details: "", external_link: "", cta_label: "", cta_href: "", image_url: "",
};

function AdminGivingPage() {
  const { roles } = useAdminSession();
  const editable = canManage(roles);
  const [form, setForm] = useState<GivingContent>(EMPTY);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase.from("giving_content").select("*").limit(1).maybeSingle().then(({ data, error }) => {
      if (error) setError(error.message);
      else if (data) setForm({ ...EMPTY, ...(data as any) });
      setLoading(false);
    });
  }, []);

  function set<K extends keyof GivingContent>(k: K, v: GivingContent[K]) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  async function save(e: React.FormEvent) {
    e.preventDefault();
    if (saving) return;
    setSaving(true);
    setError(null);
    const { id, ...values } = form;
    const { error } = await supabase.from("giving_content").update(values as any).eq("id", id);
    setSaving(false);
    if (error) { setError("Could not save: " + error.message); return; }
    setSaved(true);
  }

  if (loading) return <div className="mt-10 flex justify-center"><Loader2 className="h-6 w-6 animate-spin text-[#E13495]" /></div>;

  return (
    <div>
      <AdminHeading
        title="Giving Page"
        description="Anything left blank keeps the wording currently on the Giving page. Only admins and super admins can edit payment information."
      />
      {!editable && <p className="mt-3 text-xs text-muted-foreground">You have read-only access to giving information.</p>}
      <Alert error={error} />

      <form onSubmit={save} className="mt-6 space-y-4 rounded-2xl bg-card p-6 shadow-card ring-1 ring-black/5">
        <TextArea label="Introductory text" rows={3} value={form.intro_text ?? ""} onChange={(v) => set("intro_text", v)} disabled={!editable} />
        <TextArea label="Giving instructions" rows={3} value={form.instructions ?? ""} onChange={(v) => set("instructions", v)} disabled={!editable} />
        <TextArea label="Bank / payment information" rows={4} value={form.payment_details ?? ""} onChange={(v) => set("payment_details", v)} disabled={!editable} />
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="External giving link" value={form.external_link ?? ""} onChange={(v) => set("external_link", v)} disabled={!editable} />
          <Field label="Button label" value={form.cta_label ?? ""} onChange={(v) => set("cta_label", v)} disabled={!editable} />
          <Field label="Button destination" value={form.cta_href ?? ""} onChange={(v) => set("cta_href", v)} disabled={!editable} placeholder="/contact" />
        </div>
        <ImageField label="Supporting image" value={form.image_url ?? ""} onChange={(v) => set("image_url", v)} disabled={!editable} />
        {editable && <SaveButton type="submit" saving={saving} saved={saved} />}
      </form>
    </div>
  );
}
