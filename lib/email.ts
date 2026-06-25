import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export interface LeadEmailData {
  name: string;
  mobile: string;
  city?: string;
  vehicleName?: string;
  vehicleType?: string;
  buyTime?: string;
  sellCar?: string;
  source?: string;
}

function vehicleTypeLabel(t?: string) {
  if (!t) return "Car";
  const map: Record<string, string> = {
    CAR: "Car", BIKE: "Bike", SCOOTER: "Scooter", EV: "Electric Vehicle", COMMERCIAL: "Commercial Vehicle",
  };
  return map[t.toUpperCase()] || t;
}

export async function sendLeadEmail(lead: LeadEmailData) {
  const to = process.env.EMAIL_TO || process.env.EMAIL_USER;
  if (!to || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) return;

  const typeLabel = vehicleTypeLabel(lead.vehicleType);
  const subject   = `New Lead: ${lead.name} — ${lead.vehicleName || typeLabel}`;

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #f8fafc; margin: 0; padding: 20px; }
    .card  { max-width: 560px; margin: 0 auto; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,.08); }
    .head  { background: linear-gradient(135deg, #1e3a8a, #1d4ed8); padding: 28px 32px; }
    .head h1 { color: #fff; margin: 0; font-size: 20px; font-weight: 700; }
    .head p  { color: #bfdbfe; margin: 4px 0 0; font-size: 13px; }
    .body  { padding: 28px 32px; }
    .badge { display: inline-flex; align-items: center; gap: 6px; background: #eff6ff; color: #1d4ed8; font-size: 12px; font-weight: 700; padding: 4px 12px; border-radius: 99px; border: 1px solid #bfdbfe; margin-bottom: 20px; }
    .row   { display: flex; gap: 8px; margin-bottom: 10px; }
    .label { font-size: 11px; font-weight: 700; color: #94a3b8; text-transform: uppercase; letter-spacing: .05em; min-width: 110px; padding-top: 2px; }
    .val   { font-size: 14px; color: #0f172a; font-weight: 600; }
    .divider { border: none; border-top: 1px solid #f1f5f9; margin: 20px 0; }
    .foot  { background: #f8fafc; padding: 16px 32px; border-top: 1px solid #f1f5f9; }
    .foot p { margin: 0; font-size: 11px; color: #94a3b8; }
  </style>
</head>
<body>
  <div class="card">
    <div class="head">
      <h1>New Lead Received 🚗</h1>
      <p>Walley — India's Automotive Marketplace</p>
    </div>
    <div class="body">
      <div class="badge">&#128197; ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}</div>

      <div class="row"><span class="label">Full Name</span><span class="val">${lead.name}</span></div>
      <div class="row"><span class="label">Mobile</span><span class="val"><a href="tel:+91${lead.mobile}" style="color:#1d4ed8;text-decoration:none;">+91 ${lead.mobile}</a></span></div>
      <div class="row"><span class="label">City</span><span class="val">${lead.city || "—"}</span></div>

      <hr class="divider" />

      <div class="row"><span class="label">Vehicle</span><span class="val">${lead.vehicleName || "—"}</span></div>
      <div class="row"><span class="label">Type</span><span class="val">${typeLabel}</span></div>
      <div class="row"><span class="label">Buy Timeline</span><span class="val">${lead.buyTime || "—"}</span></div>
      <div class="row"><span class="label">Sell Existing</span><span class="val">${lead.sellCar || "—"}</span></div>
      <div class="row"><span class="label">Source</span><span class="val">${lead.source || "Offer Popup"}</span></div>
    </div>
    <div class="foot">
      <p>This lead was captured via <strong>Walley</strong>. Log in to <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin/leads" style="color:#1d4ed8;">admin dashboard</a> to manage leads.</p>
    </div>
  </div>
</body>
</html>`;

  await transporter.sendMail({
    from: `"Walley Leads" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
}
