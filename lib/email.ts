import { Resend } from "resend";

let resendInstance: Resend | null = null;

function getResend() {
  if (!resendInstance) {
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      throw new Error("RESEND_API_KEY is missing. Please add it to your .env.local file.");
    }
    resendInstance = new Resend(resendApiKey);
  }
  return resendInstance;
}

const FROM = process.env.EMAIL_FROM || "EventHub Pro <noreply@eventhubpro.com>";

interface SendEmailOptions {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}

export async function sendEmail({ to, subject, html, replyTo }: SendEmailOptions) {
  try {
    const result = await getResend().emails.send({
      from: FROM,
      to: Array.isArray(to) ? to : [to],
      subject,
      html,
      replyTo,
    });
    return { success: true, id: result.data?.id };
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return { success: false, error };
  }
}

// ─── Email Templates ─────────────────────────────────────────

export async function sendOrderConfirmation({
  to,
  name,
  orderNumber,
  eventTitle,
  eventDate,
  total,
  ticketCount,
  ticketsUrl,
}: {
  to: string;
  name: string;
  orderNumber: string;
  eventTitle: string;
  eventDate: string;
  total: string;
  ticketCount: number;
  ticketsUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
    .header h1 { margin: 0; font-size: 28px; color: white; }
    .body { padding: 40px; }
    .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #2a2a4a; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; margin: 24px 0; }
    .footer { text-align: center; padding: 24px; color: #666; font-size: 13px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎟️ EventHub Pro</h1>
      <p style="color: rgba(255,255,255,0.8); margin: 8px 0 0">Order Confirmed!</p>
    </div>
    <div class="body">
      <h2 style="color: #a78bfa; margin-top: 0">Hey ${name}! 🎉</h2>
      <p>Your tickets are confirmed and ready. Here's your order summary:</p>
      <div class="detail-row"><span style="color:#999">Order</span><strong>#${orderNumber}</strong></div>
      <div class="detail-row"><span style="color:#999">Event</span><strong>${eventTitle}</strong></div>
      <div class="detail-row"><span style="color:#999">Date</span><strong>${eventDate}</strong></div>
      <div class="detail-row"><span style="color:#999">Tickets</span><strong>${ticketCount} ticket${ticketCount > 1 ? "s" : ""}</strong></div>
      <div class="detail-row"><span style="color:#999">Total Paid</span><strong style="color: #34d399">${total}</strong></div>
      <div style="text-align: center;">
        <a href="${ticketsUrl}" class="btn">View My Tickets →</a>
      </div>
      <p style="color: #666; font-size: 14px;">Your QR code tickets are attached. Show them at the door for entry.</p>
    </div>
    <div class="footer">
      <p>EventHub Pro · Support: support@eventhubpro.com</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `✅ Order Confirmed — ${eventTitle}`,
    html,
  });
}

export async function sendTicketTransferEmail({
  to,
  senderName,
  eventTitle,
  eventDate,
  acceptUrl,
}: {
  to: string;
  senderName: string;
  eventTitle: string;
  eventDate: string;
  acceptUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, sans-serif; background: #0f0f0f; color: #fff; margin: 0; padding: 0; }
    .container { max-width: 600px; margin: 0 auto; background: #1a1a2e; border-radius: 16px; overflow: hidden; }
    .header { background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 40px; text-align: center; }
    .body { padding: 40px; }
    .btn { display: inline-block; background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 14px 32px; border-radius: 8px; text-decoration: none; font-weight: 600; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎟️ You've Got a Ticket!</h1>
    </div>
    <div class="body">
      <p><strong>${senderName}</strong> has transferred a ticket to you!</p>
      <p><strong>Event:</strong> ${eventTitle}</p>
      <p><strong>Date:</strong> ${eventDate}</p>
      <div style="text-align: center; margin-top: 32px;">
        <a href="${acceptUrl}" class="btn">Accept Ticket →</a>
      </div>
      <p style="color: #666; font-size: 13px; margin-top: 24px;">This transfer link expires in 72 hours.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({
    to,
    subject: `🎟️ ${senderName} sent you a ticket to ${eventTitle}`,
    html,
  });
}

export async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8">
<style>body{font-family:-apple-system,sans-serif;background:#0f0f0f;color:#fff;margin:0}.container{max-width:600px;margin:0 auto;background:#1a1a2e;border-radius:16px;overflow:hidden}.header{background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center}.body{padding:40px}.btn{display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600}</style>
</head>
<body>
  <div class="container">
    <div class="header"><h1>🔐 Password Reset</h1></div>
    <div class="body">
      <p>Hi ${name}, you requested a password reset.</p>
      <div style="text-align:center;margin:32px 0"><a href="${resetUrl}" class="btn">Reset Password →</a></div>
      <p style="color:#666;font-size:13px">This link expires in 1 hour. If you didn't request this, ignore this email.</p>
    </div>
  </div>
</body>
</html>`;

  return sendEmail({ to, subject: "Reset your EventHub Pro password", html });
}
