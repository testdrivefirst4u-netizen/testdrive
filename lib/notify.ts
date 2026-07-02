import nodemailer from "nodemailer";

interface LeadNotifyParams {
  dealerEmail: string;
  dealerName: string;
  leadName: string;
  leadMobile: string;
  vehicleName?: string;
  source: string;
}

function getTransporter() {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
  });
}

export async function notifyDealerNewLead(params: LeadNotifyParams) {
  const transporter = getTransporter();
  if (!transporter) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://testdrivefirst.com";
  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:20px}
  .card{max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .head{background:linear-gradient(135deg,#312e81,#4f46e5);padding:24px 28px}
  .head h1{color:#fff;margin:0;font-size:18px;font-weight:700}
  .head p{color:#c7d2fe;margin:4px 0 0;font-size:12px}
  .body{padding:24px 28px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;min-width:110px;padding-top:2px}
  .val{font-size:14px;color:#0f172a;font-weight:600}
  .divider{border:none;border-top:1px solid #f1f5f9;margin:16px 0}
  .btn{display:inline-block;background:#4f46e5;color:#fff;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;margin-top:8px}
  .foot{background:#f8fafc;padding:14px 28px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8}
</style></head><body>
<div class="card">
  <div class="head"><h1>New Lead Assigned</h1><p>${params.dealerName} — ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</p></div>
  <div class="body">
    <div class="row"><span class="label">Customer</span><span class="val">${params.leadName}</span></div>
    <div class="row"><span class="label">Mobile</span><span class="val"><a href="tel:+91${params.leadMobile}" style="color:#4f46e5">+91 ${params.leadMobile}</a></span></div>
    <div class="row"><span class="label">Vehicle</span><span class="val">${params.vehicleName || "—"}</span></div>
    <div class="row"><span class="label">Source</span><span class="val">${params.source}</span></div>
    <hr class="divider"/>
    <p style="font-size:13px;color:#475569;margin:0 0 12px">Log in to your dealer portal to view and respond to this lead.</p>
    <a href="${siteUrl}/dealer/leads" class="btn">View Lead →</a>
  </div>
  <div class="foot">You received this because a lead was assigned to you on Walley.</div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Walley Leads" <${process.env.EMAIL_USER}>`,
    to:   params.dealerEmail,
    subject: `New Lead: ${params.leadName}${params.vehicleName ? ` — ${params.vehicleName}` : ""}`,
    html,
  }).catch((e) => console.error("[NOTIFY EMAIL]", e));
}

interface TestDriveBookedParams {
  dealerEmail: string;
  dealerName: string;
  leadName: string;
  leadMobile: string;
  vehicleName?: string;
  scheduledDate?: string | null;
  scheduledTime?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
}

export async function notifyDealerTestDriveBooked(params: TestDriveBookedParams) {
  const transporter = getTransporter();
  if (!transporter) return;

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://testdrivefirst.com";
  const mapsUrl =
    params.latitude != null && params.longitude != null
      ? `https://maps.google.com/?q=${params.latitude},${params.longitude}`
      : null;

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:20px}
  .card{max-width:520px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .head{background:linear-gradient(135deg,#065f46,#10b981);padding:24px 28px}
  .head h1{color:#fff;margin:0;font-size:18px;font-weight:700}
  .head p{color:#d1fae5;margin:4px 0 0;font-size:12px}
  .body{padding:24px 28px}
  .row{display:flex;gap:8px;margin-bottom:10px}
  .label{font-size:11px;font-weight:700;color:#94a3b8;text-transform:uppercase;letter-spacing:.05em;min-width:110px;padding-top:2px}
  .val{font-size:14px;color:#0f172a;font-weight:600}
  .divider{border:none;border-top:1px solid #f1f5f9;margin:16px 0}
  .btn{display:inline-block;background:#10b981;color:#fff;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;margin-top:8px;margin-right:8px}
  .btn2{display:inline-block;background:#fff;color:#10b981;border:1.5px solid #10b981;font-weight:700;font-size:13px;padding:9px 20px;border-radius:10px;text-decoration:none;margin-top:8px}
  .foot{background:#f8fafc;padding:14px 28px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8}
</style></head><body>
<div class="card">
  <div class="head"><h1>Test Drive Booked</h1><p>${params.dealerName} — ${new Date().toLocaleString("en-IN",{timeZone:"Asia/Kolkata"})}</p></div>
  <div class="body">
    <div class="row"><span class="label">Customer</span><span class="val">${params.leadName}</span></div>
    <div class="row"><span class="label">Mobile</span><span class="val"><a href="tel:+91${params.leadMobile}" style="color:#10b981">+91 ${params.leadMobile}</a></span></div>
    <div class="row"><span class="label">Vehicle</span><span class="val">${params.vehicleName || "—"}</span></div>
    <div class="row"><span class="label">Date</span><span class="val">${params.scheduledDate || "Not specified"}</span></div>
    <div class="row"><span class="label">Time</span><span class="val">${params.scheduledTime || "Not specified"}</span></div>
    <div class="row"><span class="label">Location</span><span class="val">${params.address || "Not shared"}</span></div>
    <hr class="divider"/>
    <p style="font-size:13px;color:#475569;margin:0 0 12px">Log in to your dealer portal to manage this test drive — update status and upload arrival photos.</p>
    <a href="${siteUrl}/dealer/test-drives" class="btn">View Test Drive →</a>
    ${mapsUrl ? `<a href="${mapsUrl}" class="btn2">Open in Maps →</a>` : ""}
  </div>
  <div class="foot">You received this because a test drive was booked with you on Walley.</div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Walley Test Drives" <${process.env.EMAIL_USER}>`,
    to:   params.dealerEmail,
    subject: `Test Drive Booked: ${params.vehicleName || "Vehicle"} — ${params.leadName}`,
    html,
  }).catch((e) => console.error("[TEST DRIVE EMAIL]", e));
}

interface CustomerTripUpdateParams {
  customerEmail: string;
  customerName: string;
  vehicleName?: string | null;
  dealerName: string;
  event: "started" | "completed";
}

export async function notifyCustomerTripUpdate(params: CustomerTripUpdateParams) {
  const transporter = getTransporter();
  if (!transporter) return;

  const isStarted = params.event === "started";
  const heading = isStarted ? "Your driver is on the way!" : "Thanks for the test drive!";
  const body = isStarted
    ? `${params.dealerName} has started heading over with your ${params.vehicleName || "vehicle"}. They'll reach you shortly.`
    : `We hope you enjoyed test driving the ${params.vehicleName || "vehicle"}. ${params.dealerName} will follow up with you soon.`;

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:20px}
  .card{max-width:480px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .head{background:linear-gradient(135deg,#1e3a8a,#2563eb);padding:24px 28px}
  .head h1{color:#fff;margin:0;font-size:18px;font-weight:700}
  .body{padding:24px 28px}
  .body p{font-size:14px;color:#475569;line-height:1.6;margin:0}
  .foot{background:#f8fafc;padding:14px 28px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8}
</style></head><body>
<div class="card">
  <div class="head"><h1>${heading}</h1></div>
  <div class="body"><p>Hi ${params.customerName},</p><p style="margin-top:10px">${body}</p></div>
  <div class="foot">Sent by TestDriveFirst on behalf of ${params.dealerName}.</div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Walley" <${process.env.EMAIL_USER}>`,
    to:   params.customerEmail,
    subject: heading,
    html,
  }).catch((e) => console.error("[CUSTOMER TRIP EMAIL]", e));
}

interface FollowUpParams {
  dealerEmail: string;
  dealerName: string;
  leads: { name: string; mobile: string; vehicleName?: string | null; hoursAgo: number }[];
}

export async function notifyDealerFollowUp(params: FollowUpParams) {
  const transporter = getTransporter();
  if (!transporter) {
    console.log("[FOLLOWUP] No SMTP config — skipping. Leads:", params.leads.map(l => l.name));
    return;
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://testdrivefirst.com";
  const rows = params.leads.map(l => `
    <tr>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#0f172a;font-weight:600">${l.name}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569">${l.mobile}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:13px;color:#475569">${l.vehicleName || "—"}</td>
      <td style="padding:8px 0;border-bottom:1px solid #f1f5f9;font-size:12px;color:#f59e0b;font-weight:700">${l.hoursAgo}h ago</td>
    </tr>`).join("");

  const html = `
<!DOCTYPE html><html><head><meta charset="utf-8"/>
<style>
  body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;background:#f8fafc;margin:0;padding:20px}
  .card{max-width:580px;margin:0 auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .head{background:linear-gradient(135deg,#92400e,#f59e0b);padding:24px 28px}
  .head h1{color:#fff;margin:0;font-size:18px;font-weight:700}
  .head p{color:#fef3c7;margin:4px 0 0;font-size:12px}
  .body{padding:24px 28px}
  .btn{display:inline-block;background:#f59e0b;color:#fff;font-weight:700;font-size:13px;padding:10px 20px;border-radius:10px;text-decoration:none;margin-top:16px}
  .foot{background:#f8fafc;padding:14px 28px;border-top:1px solid #f1f5f9;font-size:11px;color:#94a3b8}
</style></head><body>
<div class="card">
  <div class="head"><h1>Follow-Up Reminder</h1><p>${params.dealerName} — ${params.leads.length} lead${params.leads.length > 1 ? "s" : ""} waiting</p></div>
  <div class="body">
    <p style="font-size:14px;color:#475569;margin:0 0 16px">The following leads have been waiting for more than 24 hours with no update. Please follow up soon.</p>
    <table style="width:100%;border-collapse:collapse">
      <thead>
        <tr>
          <th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f1f5f9">Customer</th>
          <th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f1f5f9">Mobile</th>
          <th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f1f5f9">Vehicle</th>
          <th style="text-align:left;font-size:10px;font-weight:700;color:#94a3b8;text-transform:uppercase;padding-bottom:8px;border-bottom:2px solid #f1f5f9">Age</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
    <a href="${siteUrl}/dealer/leads" class="btn">Open Dealer Portal →</a>
  </div>
  <div class="foot">Automated reminder from Walley. Log in to your dealer portal to update lead status.</div>
</div>
</body></html>`;

  await transporter.sendMail({
    from: `"Walley" <${process.env.EMAIL_USER}>`,
    to:   params.dealerEmail,
    subject: `Reminder: ${params.leads.length} lead${params.leads.length > 1 ? "s" : ""} need${params.leads.length === 1 ? "s" : ""} follow-up`,
    html,
  }).catch((e) => console.error("[FOLLOWUP EMAIL]", e));
}
