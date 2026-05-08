export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
import { generateTicketPayload, generateQRDataUrl } from "@/lib/qrcode";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;

  const ticket = await prisma.ticket.findUnique({
    where: { id, ownerId: session.user.id },
    include: {
      ticketType: { select: { name: true, category: true, price: true } },
      order: {
        select: {
          orderNumber: true,
          total: true,
          currency: true,
          createdAt: true,
          user: { select: { name: true, email: true } },
          items: {
            take: 1,
            include: {
              event: {
                select: {
                  title: true,
                  slug: true,
                  venue: { select: { name: true, address: true, city: true, country: true } },
                },
              },
              eventDate: { select: { startDate: true, endDate: true } },
            },
          },
        },
      },
    },
  });

  if (!ticket) return apiError("Ticket not found", 404);

  // Generate a fresh QR code data URL
  const payload = generateTicketPayload(ticket.id, ticket.ticketNumber);
  const qrDataUrl = await generateQRDataUrl(payload);
  // qrDataUrl is "data:image/png;base64,..."
  const qrBase64 = qrDataUrl.replace(/^data:image\/png;base64,/, "");
  const qrBuffer = Buffer.from(qrBase64, "base64");

  const item = ticket.order.items[0];
  const event = item?.event;
  const eventDate = item?.eventDate;
  const venue = event?.venue;
  const customer = ticket.order.user;

  const startDate = eventDate?.startDate
    ? new Date(eventDate.startDate).toLocaleString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "TBD";

  // Build PDF in memory
  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 0, info: { Title: `Ticket — ${ticket.ticketNumber}` } });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    const W = 595.28; // A4 width in pts
    const H = 841.89;

    // ── Header bar ──────────────────────────────────────────────
    doc.rect(0, 0, W, 90).fill("#4f46e5");

    // Brand name
    doc
      .fillColor("#ffffff")
      .fontSize(22)
      .font("Helvetica-Bold")
      .text("EventHub Pro", 40, 28);

    doc
      .fillColor("rgba(255,255,255,0.7)")
      .fontSize(10)
      .font("Helvetica")
      .text("Official Event Ticket", 40, 56);

    // Status badge (top-right)
    const statusColor = ticket.status === "VALID" ? "#10b981" : "#f59e0b";
    doc.roundedRect(W - 130, 30, 90, 28, 6).fill(statusColor);
    doc
      .fillColor("#ffffff")
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(ticket.status, W - 130, 39, { width: 90, align: "center" });

    // ── Event title section ──────────────────────────────────────
    doc.fillColor("#111827").fontSize(24).font("Helvetica-Bold").text(event?.title ?? "Event", 40, 114, { width: W - 80 });

    doc.moveDown(0.3);
    doc.fillColor("#6366f1").fontSize(13).font("Helvetica-Bold").text(ticket.ticketType.name, 40, doc.y);

    // ── Info grid ────────────────────────────────────────────────
    const infoY = doc.y + 18;
    const col1 = 40;
    const col2 = W / 2 + 10;

    // Date
    doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text("DATE & TIME", col1, infoY);
    doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text(startDate, col1, infoY + 14, { width: W / 2 - 50 });

    // Venue
    doc.fillColor("#6b7280").fontSize(9).font("Helvetica").text("VENUE", col2, infoY);
    const venueLine = venue ? `${venue.name}\n${venue.address}, ${venue.city}, ${venue.country}` : "Online / TBD";
    doc.fillColor("#111827").fontSize(11).font("Helvetica-Bold").text(venueLine, col2, infoY + 14, { width: W / 2 - 50 });

    // Divider
    const divY = infoY + 72;
    doc.moveTo(40, divY).lineTo(W - 40, divY).strokeColor("#e5e7eb").lineWidth(1).stroke();

    // ── QR Code ──────────────────────────────────────────────────
    const qrSize = 180;
    const qrX = (W - qrSize) / 2;
    const qrY = divY + 24;

    // White card behind QR
    doc.roundedRect(qrX - 16, qrY - 16, qrSize + 32, qrSize + 32, 12).fill("#ffffff").stroke("#e5e7eb");
    doc.image(qrBuffer, qrX, qrY, { width: qrSize, height: qrSize });

    doc
      .fillColor("#6b7280")
      .fontSize(9)
      .font("Helvetica")
      .text("Scan this QR code at entry", 0, qrY + qrSize + 20, { align: "center", width: W });

    // ── Ticket details bar ────────────────────────────────────────
    const detailsY = qrY + qrSize + 48;
    doc.rect(0, detailsY, W, 80).fill("#f9fafb");

    const fields = [
      { label: "TICKET NUMBER", value: ticket.ticketNumber },
      { label: "ORDER REF", value: ticket.order.orderNumber },
      { label: "HOLDER", value: customer?.name ?? "—" },
      { label: "EMAIL", value: customer?.email ?? "—" },
    ];

    const colWidth = W / fields.length;
    fields.forEach((f, i) => {
      const fx = i * colWidth + 20;
      doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text(f.label, fx, detailsY + 14, { width: colWidth - 30 });
      doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text(f.value, fx, detailsY + 28, { width: colWidth - 30, ellipsis: true });
    });

    // ── Perforated divider ────────────────────────────────────────
    const perfY = detailsY + 80 + 16;
    for (let x = 40; x < W - 40; x += 12) {
      doc.circle(x, perfY, 2).fill("#d1d5db");
    }

    // ── Barcode strip ─────────────────────────────────────────────
    const barcodeY = perfY + 16;
    doc
      .fillColor("#111827")
      .fontSize(36)
      .font("Helvetica")
      .text(`*${ticket.ticketNumber}*`, 0, barcodeY, { align: "center", width: W, characterSpacing: 4 });

    doc
      .fillColor("#9ca3af")
      .fontSize(9)
      .font("Helvetica")
      .text(ticket.ticketNumber, 0, barcodeY + 44, { align: "center", width: W });

    // ── Footer ────────────────────────────────────────────────────
    const footerY = H - 70;
    doc.rect(0, footerY, W, 70).fill("#1e1b4b");
    doc
      .fillColor("rgba(255,255,255,0.5)")
      .fontSize(8)
      .font("Helvetica")
      .text(
        `This ticket is your proof of purchase. It is non-refundable and non-transferable unless stated otherwise. Ticket issued by EventHub Pro on ${new Date().toLocaleDateString()}.`,
        40,
        footerY + 14,
        { width: W - 80, align: "center" }
      );
    doc
      .fillColor("rgba(255,255,255,0.3)")
      .fontSize(7)
      .text("© EventHub Pro — eventhubpro.com", 0, footerY + 46, { width: W, align: "center" });

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="ticket-${ticket.ticketNumber}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "no-store",
    },
  });
}
