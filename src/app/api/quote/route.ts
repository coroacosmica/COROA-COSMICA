import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Resend } from "resend";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const customerCompanyCombined = `Location: ${body.customer?.location || "N/A"} | Company: ${body.customer?.company || "N/A"} | Region: ${body.currencyInfo?.region || "unknown"}`;
    const contactMethodStr = body.contactMethod ? `\n\nPreferred Contact Method: ${body.contactMethod}` : "";
    let itemsPayload = body.items || [];
    if (body.branding?.fileUrl || body.logoBase64) {
      itemsPayload = [...itemsPayload, { 
        name: "Uploaded Logo", 
        code: "LOGO", 
        quantity: 1, 
        logoData: body.branding?.fileUrl || body.logoBase64 
      }];
    }

    let brandingMessage = "";
    if (body.branding) {
      brandingMessage += "\n\n--- Branding Info ---";
      if (body.branding.notes) brandingMessage += `\nNotes: ${body.branding.notes}`;
      if (body.branding.color) brandingMessage += `\nColor: ${body.branding.color}`;
      if (body.branding.requestSample) brandingMessage += `\nRequested Virtual Sample: Yes`;
      if (body.branding.fileUrl) brandingMessage += `\nFile: ${body.branding.fileUrl}`;
    }

    const finalMessage = (body.message || "") + contactMethodStr + brandingMessage;

    // 1. Save to Supabase (Primary)
    const { error } = await supabase.from("quote_requests").insert([{
      customer_name: body.customer?.name || user?.user_metadata?.full_name,
      customer_email: body.customer?.email || user?.email,
      customer_phone: body.customer?.phone,
      customer_company: customerCompanyCombined,
      items: itemsPayload,
      message: finalMessage,
      locale: body.locale || "en",
      user_id: user?.id,
    }]);

    if (error) {
      console.error("Supabase insert error:", error);
    }

    // 1.5 Auto-Sync to Google Sheets Admin Tracker
    if (body.currencyInfo?.region) {
      try {
        const { addOrder } = await import("@/lib/googleSheets");
        const itemsString = itemsPayload.map((item: any) => `${item.quantity}x ${item.name || item.code}`).join(", ");
        await addOrder(body.currencyInfo.region, {
          orderNumber: `ORD-${Date.now().toString().slice(-6)}`,
          poNumber: body.customer?.company ? `PO-${body.customer.company.substring(0, 3).toUpperCase()}` : "",
          expectedDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split("T")[0], // 14 days from now
          amount: body.currencyInfo.totalAmount,
          currency: body.currencyInfo.currency,
          customerName: body.customer?.name || "",
          phone: body.customer?.phone || "",
          email: body.customer?.email || "",
          locationAndCompany: customerCompanyCombined,
          contactMethod: body.contactMethod || "",
          itemsString: itemsString,
          brandingMessage: brandingMessage.trim(),
        });
      } catch (sheetsError) {
        console.error("Failed to auto-sync to Google Sheets:", sheetsError);
      }
    }

    // 2. Save to file system as backup (for local development fallback)
    try {
      const dataDir =
        process.env.VERCEL === "1"
          ? path.join("/tmp", "coroacosmica-requests")
          : path.join(process.cwd(), "data", "requests");
      await mkdir(dataDir, { recursive: true });

      const filename = `request-${Date.now()}.json`;
      await writeFile(
        path.join(dataDir, filename),
        JSON.stringify({ ...body, createdAt: new Date().toISOString() }, null, 2),
        "utf-8"
      );
    } catch (fsError) {
      // ignore fs errors on vercel
    }

    // 3. Send Confirmation Email
    if (process.env.RESEND_API_KEY && body.customer?.email) {
      try {
        const resend = new Resend(process.env.RESEND_API_KEY);
        await resend.emails.send({
          from: "Coroa Cosmica <onboarding@resend.dev>", // We use onboarding since domain might not be verified yet
          to: [body.customer.email],
          bcc: ["coroa.cosmica@gmail.com"],
          subject: "Order Confirmation - Coroa Cosmica",
          html: `
            <h2>Thank you for your order, ${body.customer.name}!</h2>
            <p>We have received your request and will contact you shortly via <strong>${body.contactMethod === "whatsapp" ? "WhatsApp" : "Email"}</strong> to confirm availability and shipping fees to ${body.customer.location}.</p>
            <h3>Order Summary:</h3>
            <ul>
              ${body.items?.map((item: any) => `<li>
                ${item.quantity}x ${item.name || item.code}
                ${item.customDesign?.pngDataUrl ? `<br><a href="${item.customDesign.pngDataUrl}" target="_blank">View Custom Design</a>` : ''}
              </li>`).join('')}
            </ul>
            ${body.branding ? `
            <h3>Branding Details:</h3>
            <ul>
              ${body.branding.notes ? `<li><strong>Notes:</strong> ${body.branding.notes}</li>` : ''}
              ${body.branding.color ? `<li><strong>Color:</strong> ${body.branding.color}</li>` : ''}
              ${body.branding.requestSample ? `<li><strong>Requested Virtual Sample:</strong> Yes</li>` : ''}
              ${body.branding.fileUrl ? `<li><strong>File attached:</strong> <a href="${body.branding.fileUrl}">View Logo</a></li>` : ''}
            </ul>
            ` : ''}
          `
        });
      } catch (emailErr) {
        console.error("Failed to send email:", emailErr);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("API error:", err);
    // Return ok:true anyway to not break the UI if something fails
    return NextResponse.json({ ok: true });
  }
}
