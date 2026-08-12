// Server-only helpers for appointment notification emails.
// Emails are delivered through the Resend connector gateway.
// Pastor email addresses are read server-side only and never exposed publicly.

const GATEWAY_URL = "https://connector-gateway.lovable.dev/resend";

export type AppointmentRow = {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  pastor_id: string;
  pastor_name: string | null;
  appointment_date: string;
  appointment_time: string;
  reason: string | null;
  notes: string | null;
  status: string;
  created_at: string;
  proposed_date?: string | null;
  proposed_time?: string | null;
  reschedule_message?: string | null;
};

function fromAddress() {
  return process.env["RESEND_FROM"] || "RCCG Praise Palace <onboarding@resend.dev>";
}

export function fmtDate(value?: string | null) {
  if (!value) return "—";
  const d = new Date(`${value}T00:00:00`);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

export function fmtTime(value?: string | null) {
  if (!value) return "—";
  return String(value).slice(0, 5);
}

function esc(value: unknown) {
  return String(value ?? "—")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function shell(title: string, bodyHtml: string) {
  return `<div style="font-family:Arial,Helvetica,sans-serif;background:#f6f6f8;padding:24px">
  <div style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;padding:28px">
    <p style="margin:0 0 4px;font-size:12px;letter-spacing:2px;text-transform:uppercase;color:#996DB5">RCCG Praise Palace Northampton</p>
    <h1 style="margin:0 0 18px;font-size:20px;color:#1c1c22">${esc(title)}</h1>
    ${bodyHtml}
    <p style="margin:24px 0 0;font-size:12px;color:#8a8a94">Briar Hill Community Centre, NN4 8SX</p>
  </div>
</div>`;
}

function rows(pairs: Array<[string, unknown]>) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;color:#1c1c22">${pairs
    .map(
      ([k, v]) =>
        `<tr><td style="padding:6px 0;color:#6b6b76;width:45%">${esc(k)}</td><td style="padding:6px 0;font-weight:600">${esc(v)}</td></tr>`,
    )
    .join("")}</table>`;
}

function button(href: string, label: string) {
  return `<p style="margin:22px 0 0"><a href="${esc(href)}" style="display:inline-block;background:#E13495;color:#ffffff;text-decoration:none;padding:12px 22px;border-radius:999px;font-size:14px;font-weight:700">${esc(label)}</a></p>`;
}

export function pastorNotificationEmail(a: AppointmentRow, adminUrl: string) {
  const html = shell("New appointment request", [
    `<p style="font-size:14px;color:#1c1c22;margin:0 0 14px">A visitor has requested an appointment with you. The request is saved in the church admin area with the status <strong>Pending</strong>.</p>`,
    rows([
      ["Visitor name", a.name],
      ["Visitor email", a.email],
      ["Visitor phone", a.phone || "Not provided"],
      ["Requested pastor", a.pastor_name],
      ["Requested date", fmtDate(a.appointment_date)],
      ["Requested time", fmtTime(a.appointment_time)],
      ["Reason", a.reason],
      ["Message", a.notes || "—"],
      ["Submitted", new Date(a.created_at).toLocaleString("en-GB")],
      ["Current status", "Pending"],
    ]),
    button(adminUrl, "View appointment"),
    `<p style="margin:12px 0 0;font-size:12px;color:#8a8a94">You will need to sign in to the admin area to view or respond to this request.</p>`,
  ].join(""));

  return { subject: `New appointment request from ${a.name}`, html };
}

export function visitorStatusEmail(a: AppointmentRow, status: string, messageToVisitor?: string | null) {
  const base: Array<[string, unknown]> = [
    ["Pastor", a.pastor_name],
    ["Date", fmtDate(a.appointment_date)],
    ["Time", fmtTime(a.appointment_time)],
    ["Reason", a.reason],
  ];

  if (status === "approved" || status === "confirmed") {
    return {
      subject: "Your appointment has been approved",
      html: shell("Your appointment is confirmed", [
        `<p style="font-size:14px;margin:0 0 14px">Dear ${esc(a.name)}, we're glad to let you know that your appointment request has been <strong>approved</strong>.</p>`,
        rows(base),
        messageToVisitor ? `<p style="font-size:14px;margin:16px 0 0">${esc(messageToVisitor)}</p>` : "",
        `<p style="font-size:14px;margin:16px 0 0">If anything changes, simply reply to this email and we'll help.</p>`,
      ].join("")),
    };
  }

  if (status === "declined") {
    return {
      subject: "About your appointment request",
      html: shell("Your appointment request", [
        `<p style="font-size:14px;margin:0 0 14px">Dear ${esc(a.name)}, thank you for reaching out. Unfortunately we're unable to accept this appointment request at the requested time.</p>`,
        rows(base),
        messageToVisitor ? `<p style="font-size:14px;margin:16px 0 0">${esc(messageToVisitor)}</p>` : "",
        `<p style="font-size:14px;margin:16px 0 0">Please feel free to submit another request for a different date, or reply to this email and our team will help you find a suitable time.</p>`,
      ].join("")),
    };
  }

  if (status === "reschedule_requested") {
    return {
      subject: "A new time has been proposed for your appointment",
      html: shell("Could we meet at a different time?", [
        `<p style="font-size:14px;margin:0 0 14px">Dear ${esc(a.name)}, we're unable to meet at your original time, but we'd love to see you. Here is a proposed alternative.</p>`,
        rows([
          ["Pastor", a.pastor_name],
          ["Originally requested", `${fmtDate(a.appointment_date)} at ${fmtTime(a.appointment_time)}`],
          ["Proposed new date", fmtDate(a.proposed_date)],
          ["Proposed new time", fmtTime(a.proposed_time)],
        ]),
        messageToVisitor ? `<p style="font-size:14px;margin:16px 0 0">${esc(messageToVisitor)}</p>` : "",
        `<p style="font-size:14px;margin:16px 0 0">Please reply to this email to confirm whether the new time works for you.</p>`,
      ].join("")),
    };
  }

  if (status === "cancelled") {
    return {
      subject: "Your appointment has been cancelled",
      html: shell("Appointment cancelled", [
        `<p style="font-size:14px;margin:0 0 14px">Dear ${esc(a.name)}, your appointment has been cancelled.</p>`,
        rows(base),
        messageToVisitor ? `<p style="font-size:14px;margin:16px 0 0">${esc(messageToVisitor)}</p>` : "",
      ].join("")),
    };
  }

  if (status === "completed") {
    return {
      subject: "Thank you for meeting with us",
      html: shell("Thank you", [
        `<p style="font-size:14px;margin:0 0 14px">Dear ${esc(a.name)}, thank you for meeting with us. We're praying for you and you're always welcome here.</p>`,
        rows(base),
        messageToVisitor ? `<p style="font-size:14px;margin:16px 0 0">${esc(messageToVisitor)}</p>` : "",
      ].join("")),
    };
  }

  return null;
}

export async function sendEmail(to: string, subject: string, html: string) {
  const LOVABLE_API_KEY = process.env["LOVABLE_API_KEY"];
  const RESEND_API_KEY = process.env["RESEND_API_KEY"];
  if (!LOVABLE_API_KEY || !RESEND_API_KEY) {
    return { ok: false, error: "Email service is not configured (missing LOVABLE_API_KEY or RESEND_API_KEY)." };
  }

  const response = await fetch(`${GATEWAY_URL}/emails`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${LOVABLE_API_KEY}`,
      "X-Connection-Api-Key": RESEND_API_KEY,
    },
    body: JSON.stringify({ from: fromAddress(), to: [to], subject, html }),
  });

  if (!response.ok) {
    const body = await response.text();
    console.error(`[appointments] email send failed [${response.status}]: ${body}`);
    return { ok: false, error: `Email provider error [${response.status}]: ${body}` };
  }
  return { ok: true as const, error: null };
}
