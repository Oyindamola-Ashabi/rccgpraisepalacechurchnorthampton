import { createFileRoute } from "@tanstack/react-router";
import { AdminInbox } from "@/components/admin/inbox";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/admin/testimonies")({ ssr: false, component: () => (
  <AdminInbox
    config={{
      table: "testimony_submissions",
      title: "Testimonies",
      description: "Review, approve and publish testimonies. Only approved testimonies with the author's consent appear on the website.",
      titleField: (r) => r.title,
      subtitleField: (r) => `${r.full_name} · ${r.is_published ? "Published" : "Not published"}`,
      bodyField: "testimony",
      statusField: "review_status",
      statusOptions: ["pending", "approved", "rejected", "archived"],
      searchFields: ["full_name", "email", "title", "testimony"],
      fields: [
        { key: "full_name", label: "Author" },
        { key: "email", label: "Email" },
        { key: "allow_publish", label: "Consent to publish", format: (v) => (v ? "Given" : "Not given") },
        { key: "is_published", label: "Live on site", format: (v) => (v ? "Yes" : "No") },
        { key: "created_at", label: "Received", format: (v) => new Date(v).toLocaleString() },
      ],
      extraControls: (row, refresh) => {
        const canPublish = row.allow_publish && row.review_status === "approved";
        return (
          <button
            disabled={!canPublish && !row.is_published}
            onClick={async () => {
              await supabase
                .from("testimony_submissions")
                .update({ is_published: !row.is_published })
                .eq("id", row.id);
              refresh();
            }}
            className="rounded-full border px-3 py-1.5 text-xs font-semibold hover:bg-secondary/50 disabled:opacity-40 disabled:cursor-not-allowed"
            title={canPublish || row.is_published ? "" : "Requires author consent and approved status"}
          >
            {row.is_published ? "Unpublish" : "Publish to website"}
          </button>
        );
      },
    }}
  />
) });
