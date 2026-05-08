export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { apiError } from "@/lib/utils";
// eslint-disable-next-line @typescript-eslint/no-require-imports
const PDFDocument = require("pdfkit") as typeof import("pdfkit");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user) return apiError("Unauthorized", 401);

  const { id } = await params;

  const order = await prisma.order.findUnique({
    where: { id, userId: session.user.id },
    include: {
      user: { select: { name: true, email: true } },
      items: {
        include: {
          event: { select: { title: true } },
          eventDate: { select: { startDate: true } },
          ticketType: { select: { name: true, category: true } },
        },
      },
      payment: { select: { provider: true, status: true, createdAt: true } },
    },
  });

  if (!order) return apiError("Order not found", 404);

  const chunks: Buffer[] = [];

  await new Promise<void>((resolve, reject) => {
    const doc = new PDFDocument({
      size: "A4",
      margin: 0,
      info: { Title: `Statement — ${order.orderNumber}` },
    });

    doc.on("data", (chunk: Buffer) => chunks.push(chunk));
    doc.on("end", resolve);
    doc.on("error", reject);

    const W = 595.28;
    const margin = 48;
    const contentW = W - margin * 2;

    // ── Header ───────────────────────────────────────────────────
    doc.rect(0, 0, W, 100).fill("#4f46e5");

    doc.fillColor("#ffffff").fontSize(24).font("Helvetica-Bold").text("EventHub Pro", margin, 26);
    doc.fillColor("rgba(255,255,255,0.7)").fontSize(10).font("Helvetica").text("Order Statement / Receipt", margin, 56);

    // Issue date (top-right)
    doc
      .fillColor("rgba(255,255,255,0.8)")
      .fontSize(10)
      .font("Helvetica")
      .text(`Issued: ${new Date().toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}`, margin, 72, {
        width: contentW,
        align: "right",
      });

    // ── Order number badge ────────────────────────────────────────
    doc.rect(0, 100, W, 44).fill("#eef2ff");
    doc
      .fillColor("#4f46e5")
      .fontSize(12)
      .font("Helvetica-Bold")
      .text(`Order #${order.orderNumber}`, margin, 116, { width: contentW });

    const orderDate = new Date(order.createdAt).toLocaleString("en-US", {
      year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit",
    });
    doc
      .fillColor("#6366f1")
      .fontSize(9)
      .font("Helvetica")
      .text(orderDate, margin, 116, { width: contentW, align: "right" });

    // ── Bill To ───────────────────────────────────────────────────
    let y = 168;
    doc.fillColor("#9ca3af").fontSize(8).font("Helvetica").text("BILL TO", margin, y);
    y += 14;
    doc.fillColor("#111827").fontSize(12).font("Helvetica-Bold").text(order.user.name ?? "Customer", margin, y);
    y += 16;
    doc.fillColor("#374151").fontSize(10).font("Helvetica").text(order.user.email, margin, y);
    y += 28;

    // Thin divider
    doc.moveTo(margin, y).lineTo(W - margin, y).strokeColor("#e5e7eb").lineWidth(0.5).stroke();
    y += 20;

    // ── Items table header ────────────────────────────────────────
    doc.rect(margin, y, contentW, 26).fill("#f3f4f6");

    const cols = { item: margin + 8, qty: margin + contentW * 0.58, unit: margin + contentW * 0.72, total: margin + contentW * 0.86 };

    doc.fillColor("#6b7280").fontSize(8).font("Helvetica-Bold");
    doc.text("ITEM", cols.item, y + 8);
    doc.text("QTY", cols.qty, y + 8, { width: 50, align: "right" });
    doc.text("UNIT PRICE", cols.unit, y + 8, { width: 70, align: "right" });
    doc.text("TOTAL", cols.total, y + 8, { width: 50, align: "right" });

    y += 32;

    // ── Line items ────────────────────────────────────────────────
    for (const item of order.items) {
      const eventTitle = item.event.title;
      const ticketName = item.ticketType.name;
      const eventDateStr = item.eventDate?.startDate
        ? new Date(item.eventDate.startDate).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
        : "TBD";

      const rowH = 46;
      // Alternate row shading
      if (order.items.indexOf(item) % 2 === 0) {
        doc.rect(margin, y, contentW, rowH).fill("#fafafa");
      }

      doc.fillColor("#111827").fontSize(10).font("Helvetica-Bold").text(eventTitle, cols.item, y + 8, { width: contentW * 0.55, ellipsis: true });
      doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text(`${ticketName} · ${eventDateStr}`, cols.item, y + 24, { width: contentW * 0.55 });

      doc.fillColor("#111827").fontSize(10).font("Helvetica").text(String(item.quantity), cols.qty, y + 16, { width: 50, align: "right" });
      doc.text(`$${Number(item.unitPrice).toFixed(2)}`, cols.unit, y + 16, { width: 70, align: "right" });
      doc.font("Helvetica-Bold").text(`$${Number(item.totalPrice).toFixed(2)}`, cols.total, y + 16, { width: 50, align: "right" });

      // Row bottom border
      doc.moveTo(margin, y + rowH).lineTo(W - margin, y + rowH).strokeColor("#e5e7eb").lineWidth(0.5).stroke();

      y += rowH;
    }

    y += 20;

    // ── Totals section ────────────────────────────────────────────
    const labelX = margin + contentW * 0.55;
    const valueX = margin + contentW * 0.78;
    const totalsW = contentW * 0.22;

    const subtotal = Number(order.subtotal);
    const serviceFee = Number(order.serviceFee);
    const tax = Number(order.taxAmount);
    const discount = Number(order.discount) + Number(order.promoDiscount);
    const total = Number(order.total);

    const rows: { label: string; value: string; bold?: boolean; color?: string }[] = [
      { label: "Subtotal", value: `$${subtotal.toFixed(2)}` },
      { label: "Service Fee", value: `$${serviceFee.toFixed(2)}` },
      { label: "Tax (8%)", value: `$${tax.toFixed(2)}` },
    ];
    if (discount > 0) rows.push({ label: "Discount", value: `-$${discount.toFixed(2)}`, color: "#10b981" });

    for (const row of rows) {
      doc.fillColor(row.color ?? "#374151").fontSize(10).font(row.bold ? "Helvetica-Bold" : "Helvetica");
      doc.text(row.label, labelX, y, { width: contentW * 0.22 });
      doc.text(row.value, valueX, y, { width: totalsW, align: "right" });
      y += 18;
    }

    // Grand total
    doc.moveTo(labelX, y + 4).lineTo(W - margin, y + 4).strokeColor("#4f46e5").lineWidth(1).stroke();
    y += 14;
    doc.rect(labelX - 8, y, W - margin - labelX + 8, 36).fill("#4f46e5");
    doc
      .fillColor("#ffffff")
      .fontSize(13)
      .font("Helvetica-Bold")
      .text("TOTAL", labelX, y + 10, { width: contentW * 0.22 });
    doc.text(
      `${order.currency} $${total.toFixed(2)}`,
      valueX,
      y + 10,
      { width: totalsW, align: "right" }
    );
    y += 50;

    // ── Payment info ──────────────────────────────────────────────
    doc.rect(margin, y, contentW, 56).fill("#f9fafb").stroke("#e5e7eb");
    doc.fillColor("#6b7280").fontSize(8).font("Helvetica").text("PAYMENT INFORMATION", margin + 16, y + 10);
    doc
      .fillColor("#111827")
      .fontSize(10)
      .font("Helvetica-Bold")
      .text(
        `Provider: ${order.payment?.provider ?? "—"}   |   Status: ${order.payment?.status ?? "—"}   |   Order: ${order.orderNumber}`,
        margin + 16,
        y + 24,
        { width: contentW - 32 }
      );
    y += 72;

    // ── Status badge ──────────────────────────────────────────────
    const statusColors: Record<string, string> = {
      CONFIRMED: "#10b981", PENDING: "#f59e0b", CANCELLED: "#ef4444", REFUNDED: "#6366f1",
    };
    const badgeColor = statusColors[order.status] ?? "#6b7280";
    doc.circle(margin, y + 8, 6).fill(badgeColor);
    doc
      .fillColor(badgeColor)
      .fontSize(11)
      .font("Helvetica-Bold")
      .text(`Order Status: ${order.status}`, margin + 14, y + 2);

    // ── Footer ────────────────────────────────────────────────────
    const footerY = 841.89 - 56;
    doc.rect(0, footerY, W, 56).fill("#1e1b4b");
    doc
      .fillColor("rgba(255,255,255,0.5)")
      .fontSize(8)
      .font("Helvetica")
      .text(
        "This is an official purchase statement from EventHub Pro. For support, visit eventhubpro.com/support.",
        margin,
        footerY + 12,
        { width: contentW, align: "center" }
      );
    doc
      .fillColor("rgba(255,255,255,0.3)")
      .fontSize(7)
      .text("© EventHub Pro — All rights reserved", 0, footerY + 34, { width: W, align: "center" });

    doc.end();
  });

  const pdfBuffer = Buffer.concat(chunks);

  return new NextResponse(pdfBuffer, {
    status: 200,
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="statement-${order.orderNumber}.pdf"`,
      "Content-Length": String(pdfBuffer.length),
      "Cache-Control": "no-store",
    },
  });
}
