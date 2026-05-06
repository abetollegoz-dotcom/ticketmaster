import QRCode from "qrcode";
import { createHmac, randomBytes } from "crypto";

const SIGNING_SECRET = process.env.TICKET_SIGNING_SECRET || "dev-secret";

/** Generate a signed QR payload for a ticket */
export function generateTicketPayload(ticketId: string, ticketNumber: string): string {
  const timestamp = Date.now();
  const nonce = randomBytes(8).toString("hex");
  const data = `${ticketId}:${ticketNumber}:${timestamp}:${nonce}`;
  const sig = createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");
  return `${data}:${sig}`;
}

/** Verify a ticket QR payload */
export function verifyTicketPayload(payload: string): {
  valid: boolean;
  ticketId?: string;
  ticketNumber?: string;
} {
  const parts = payload.split(":");
  if (parts.length !== 5) return { valid: false };

  const [ticketId, ticketNumber, timestamp, nonce, sig] = parts;
  const data = `${ticketId}:${ticketNumber}:${timestamp}:${nonce}`;
  const expected = createHmac("sha256", SIGNING_SECRET).update(data).digest("hex");

  if (sig !== expected) return { valid: false };

  return { valid: true, ticketId, ticketNumber };
}

/** Generate QR code as a data URL */
export async function generateQRDataUrl(payload: string): Promise<string> {
  return QRCode.toDataURL(payload, {
    errorCorrectionLevel: "H",
    margin: 2,
    width: 300,
    color: {
      dark: "#000000",
      light: "#ffffff",
    },
  });
}

/** Generate QR code as SVG string */
export async function generateQRSvg(payload: string): Promise<string> {
  return QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 2,
    color: {
      dark: "#1a1a2e",
      light: "#ffffff",
    },
  });
}
