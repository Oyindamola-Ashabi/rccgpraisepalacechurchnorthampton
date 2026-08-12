import { createServerFn } from "@tanstack/react-start";
import { getRequest } from "@tanstack/react-start/server";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const VISITOR_NOTIFY_STATUSES = new Set([
  "approved",
  "confirmed",
  "declined",
  "reschedule_requested",
  "cancelled",
  "completed",
]);

const ALLOWED_STATUSES = new Set([
  "pending",
  "approved",
  "confirmed",
  "declined",
  "reschedule_requested",
  "completed",
  "cancelled",
  "archived",
]);

function originFromRequest() {
  try {
    const req = getRequest();
    if (req?.url) return new URL(req.url).origin;
  } catch {
    /* no request context */
  }
  return "";
}

/**
 * Public: called right after a visitor's appointment request is stored.
 * Looks up the selected pastor's private email server-side and notifies them.
 * Never returns the pastor's email to the browser.
 */
export const notifyPastorOfAppointment = createServerFn({ method: "POST" })
  .inputValidator((data: { appointmentId: string }) => {
    const id = String(data?.appointmentId ?? "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new Error("Invalid appointment id");
    return { appointmentId: id };
  })
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { pastorNotificationEmail, sendEmail } = await import("./appointment-email.server");

    const { data: appointment, error } = await supabaseAdmin
      .from("appointment_requests")
      .select("*")
      .eq("id", data.appointmentId)
      .maybeSingle();

    if (error || !appointment) return { ok: false };

    const row = appointment as unknown as Record<string, unknown>;
    // Only ever notify once, and only for freshly created pending requests.
    if (row["pastor_notified_at"]) return { ok: true };
    if (row["status"] !== "pending") return { ok: false };
    const createdAt = new Date(String(row["created_at"] ?? "")).getTime();
    if (!Number.isFinite(createdAt) || Date.now() - createdAt > 15 * 60 * 1000) return { ok: false };

    const { data: pastor } = await supabaseAdmin
      .from("pastors")
      .select("email, full_name")
      .eq("id", String(row["pastor_id"]))
      .maybeSingle();

    const to = (pastor?.email ?? "").trim();
    if (!to) {
      await supabaseAdmin.from("appointment_notifications").insert({
        appointment_id: data.appointmentId,
        recipient_kind: "pastor",
        recipient_email: "(none on file)",
        notification_type: "new_request",
        status_at_send: "pending",
        success: false,
        error_message: "Selected pastor has no email address in Admin → Pastors.",
      } as never);
      return { ok: false };
    }

    const origin = originFromRequest();
    const adminUrl = `${origin}/admin/appointments`;
    const mail = pastorNotificationEmail(appointment as never, adminUrl);
    const result = await sendEmail(to, mail.subject, mail.html);

    await supabaseAdmin.from("appointment_notifications").insert({
      appointment_id: data.appointmentId,
      recipient_kind: "pastor",
      recipient_email: to,
      notification_type: "new_request",
      status_at_send: "pending",
      success: result.ok,
      error_message: result.error,
    } as never);

    if (result.ok) {
      await supabaseAdmin
        .from("appointment_requests")
        .update({ pastor_notified_at: new Date().toISOString() } as never)
        .eq("id", data.appointmentId);
    }

    return { ok: result.ok };
  });

/**
 * Admin only: change an appointment's status (and reschedule details) and
 * email the visitor at the address they entered when booking.
 */
export const updateAppointmentStatus = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator(
    (data: {
      appointmentId: string;
      status: string;
      proposedDate?: string | null;
      proposedTime?: string | null;
      messageToVisitor?: string | null;
      notifyVisitor?: boolean;
    }) => {
      const id = String(data?.appointmentId ?? "").trim();
      if (!/^[0-9a-fA-F-]{36}$/.test(id)) throw new Error("Invalid appointment id");
      const status = String(data?.status ?? "").trim();
      if (!ALLOWED_STATUSES.has(status)) throw new Error("Invalid status");
      const proposedDate = data.proposedDate ? String(data.proposedDate).slice(0, 10) : null;
      const proposedTime = data.proposedTime ? String(data.proposedTime).slice(0, 5) : null;
      if (status === "reschedule_requested" && (!proposedDate || !proposedTime)) {
        throw new Error("A proposed date and time are required for a reschedule request.");
      }
      return {
        appointmentId: id,
        status,
        proposedDate,
        proposedTime,
        messageToVisitor: data.messageToVisitor ? String(data.messageToVisitor).slice(0, 2000) : null,
        notifyVisitor: data.notifyVisitor !== false,
      };
    },
  )
  .handler(async ({ data, context }) => {
    const { data: roleRows, error: roleError } = await context.supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", context.userId);
    if (roleError) throw new Error("Could not verify your permissions.");
    const roles = (roleRows ?? []).map((r) => r.role as string);
    if (!roles.includes("super_admin") && !roles.includes("admin")) {
      throw new Error("You do not have permission to update appointments.");
    }

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { visitorStatusEmail, sendEmail } = await import("./appointment-email.server");

    const patch: Record<string, unknown> = {
      status: data.status,
      status_changed_at: new Date().toISOString(),
      status_changed_by: context.userId,
      is_read: true,
    };
    if (data.status === "reschedule_requested") {
      patch["proposed_date"] = data.proposedDate;
      patch["proposed_time"] = data.proposedTime;
      patch["reschedule_message"] = data.messageToVisitor;
    }

    const { data: updated, error: updateError } = await supabaseAdmin
      .from("appointment_requests")
      .update(patch as never)
      .eq("id", data.appointmentId)
      .select("*")
      .maybeSingle();

    if (updateError || !updated) throw new Error(updateError?.message ?? "Appointment not found.");

    let emailed = false;
    let emailError: string | null = null;

    if (data.notifyVisitor && VISITOR_NOTIFY_STATUSES.has(data.status)) {
      const mail = visitorStatusEmail(updated as never, data.status, data.messageToVisitor);
      const to = String((updated as unknown as Record<string, unknown>)["email"] ?? "").trim();
      if (mail && to) {
        const result = await sendEmail(to, mail.subject, mail.html);
        emailed = result.ok;
        emailError = result.error;
        await supabaseAdmin.from("appointment_notifications").insert({
          appointment_id: data.appointmentId,
          recipient_kind: "visitor",
          recipient_email: to,
          notification_type: data.status,
          status_at_send: data.status,
          success: result.ok,
          error_message: result.error,
          triggered_by: context.userId,
        } as never);
        if (result.ok) {
          await supabaseAdmin
            .from("appointment_requests")
            .update({
              visitor_notified_at: new Date().toISOString(),
              visitor_notified_status: data.status,
            } as never)
            .eq("id", data.appointmentId);
        }
      }
    }

    return { ok: true, emailed, emailError };
  });
