import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    
    const customerCompanyCombined = `Location: ${body.customer?.location || "N/A"} | Company: ${body.customer?.company || "N/A"}`;
    const contactMethodStr = body.contactMethod ? `\n\nPreferred Contact Method: ${body.contactMethod}` : "";
    const finalMessage = (body.message || "") + contactMethodStr;

    let itemsPayload = body.items || [];
    if (body.logoBase64) {
      itemsPayload = [...itemsPayload, { name: "Uploaded Logo", code: "LOGO", quantity: 1, logoData: body.logoBase64 }];
    }

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
        await resend.emails.send({
          from: "Coroa Cosmica <onboarding@resend.dev>", // We use onboarding since domain might not be verified yet
          to: [body.customer.email],
          subject: "Order Confirmation - Coroa Cosmica",
          html: `
            <h2>Thank you for your order, ${body.customer.name}!</h2>
            <p>We have received your request and will contact you shortly via <strong>${body.contactMethod === "whatsapp" ? "WhatsApp" : "Email"}</strong> to confirm availability and shipping fees to ${body.customer.location}.</p>
            <h3>Order Summary:</h3>
            <ul>
              ${body.items?.map((item: any) => `<li>${item.quantity}x ${item.name || item.code}</li>`).join('')}
            </ul>
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
