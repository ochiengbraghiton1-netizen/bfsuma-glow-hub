import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CURRENCY_SYMBOLS: Record<string, string> = {
  KES: "KSh",
  USD: "$",
  EUR: "€",
  GBP: "£",
};

const formatOrderId = (id: string) => `BF-${id.slice(0, 4).toUpperCase()}`;

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { orderId } = await req.json();
    if (!orderId) {
      return new Response(JSON.stringify({ error: "orderId required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Fetch order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .select("*")
      .eq("id", orderId)
      .single();

    if (orderErr || !order) {
      return new Response(JSON.stringify({ error: "Order not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!order.customer_email) {
      return new Response(JSON.stringify({ error: "No customer email" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch order items
    const { data: items } = await supabase
      .from("order_items")
      .select("*")
      .eq("order_id", orderId);

    const orderItems = items || [];
    const shortId = formatOrderId(order.id);
    const symbol = CURRENCY_SYMBOLS[order.currency] || order.currency;
    const formatAmount = (amt: number) =>
      `${symbol} ${amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    const itemRows = orderItems
      .map(
        (item: any) =>
          `<tr>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;">${item.product_name}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:center;">${item.quantity}</td>
            <td style="padding:8px 12px;border-bottom:1px solid #e5e7eb;text-align:right;">${formatAmount(item.subtotal)}</td>
          </tr>`
      )
      .join("");

    const html = `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background-color:#ffffff;font-family:Arial,Helvetica,sans-serif;">
  <div style="max-width:600px;margin:0 auto;padding:20px;">
    <div style="text-align:center;padding:24px 0;background:linear-gradient(135deg,#047857,#10b981);border-radius:12px 12px 0 0;">
      <h1 style="color:#ffffff;margin:0;font-size:24px;">✅ Order Confirmed!</h1>
      <p style="color:#d1fae5;margin:8px 0 0;font-size:14px;">Thank you for your purchase</p>
    </div>
    
    <div style="background:#f9fafb;padding:24px;border:1px solid #e5e7eb;border-top:none;">
      <p style="margin:0 0 16px;font-size:16px;color:#111827;">
        Hi <strong>${order.customer_name}</strong>,
      </p>
      <p style="margin:0 0 20px;font-size:14px;color:#4b5563;">
        Your payment has been received and your order <strong>${shortId}</strong> is now being processed.
      </p>

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;margin-bottom:20px;">
        <div style="padding:12px 16px;background:#f3f4f6;border-bottom:1px solid #e5e7eb;">
          <strong style="font-size:14px;color:#111827;">Order Summary</strong>
        </div>
        <table style="width:100%;border-collapse:collapse;font-size:14px;color:#374151;">
          <thead>
            <tr style="background:#f9fafb;">
              <th style="padding:8px 12px;text-align:left;font-weight:600;">Product</th>
              <th style="padding:8px 12px;text-align:center;font-weight:600;">Qty</th>
              <th style="padding:8px 12px;text-align:right;font-weight:600;">Amount</th>
            </tr>
          </thead>
          <tbody>${itemRows}</tbody>
        </table>
        <div style="padding:12px 16px;border-top:2px solid #e5e7eb;">
          ${order.discount_amount > 0 ? `<div style="display:flex;justify-content:space-between;font-size:14px;color:#16a34a;margin-bottom:4px;"><span>Discount</span><span>-${formatAmount(order.discount_amount)}</span></div>` : ""}
          <div style="display:flex;justify-content:space-between;font-size:18px;font-weight:bold;color:#111827;">
            <span>Total</span><span>${formatAmount(order.total_amount)}</span>
          </div>
        </div>
      </div>

      ${order.shipping_address ? `
      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
        <strong style="font-size:14px;color:#111827;">📦 Delivery Address</strong>
        <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">${order.shipping_address}</p>
      </div>` : ""}

      <div style="background:#ffffff;border:1px solid #e5e7eb;border-radius:8px;padding:16px;margin-bottom:20px;">
        <strong style="font-size:14px;color:#111827;">Payment Details</strong>
        <p style="margin:8px 0 0;font-size:14px;color:#4b5563;">
          Method: PayPal<br/>
          Status: <span style="color:#16a34a;font-weight:600;">Paid</span><br/>
          ${order.paypal_transaction_id ? `Transaction ID: ${order.paypal_transaction_id}` : ""}
        </p>
      </div>

      <div style="text-align:center;padding:20px 0;border-top:1px solid #e5e7eb;">
        <p style="margin:0 0 8px;font-size:14px;color:#4b5563;">Need help? Contact us:</p>
        <p style="margin:0;font-size:14px;color:#111827;">
          📱 WhatsApp: <a href="https://wa.me/254795454053" style="color:#047857;">+254 795 454 053</a>
        </p>
        <p style="margin:16px 0 0;font-size:12px;color:#9ca3af;">
          © ${new Date().getFullYear()} BF SUMA ROYAL. All rights reserved.
        </p>
      </div>
    </div>
  </div>
</body>
</html>`;

    // Send email using Lovable's transactional email
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not set");
      return new Response(JSON.stringify({ error: "Email service not configured" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const emailResponse = await fetch("https://api.lovable.dev/api/v1/send-email", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${lovableApiKey}`,
      },
      body: JSON.stringify({
        to: [order.customer_email],
        subject: `Order ${shortId} Confirmed - BF SUMA ROYAL`,
        html,
        purpose: "transactional",
      }),
    });

    if (!emailResponse.ok) {
      const errText = await emailResponse.text();
      console.error("Email API error:", errText);
      return new Response(JSON.stringify({ error: "Failed to send email" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error:", err);
    return new Response(JSON.stringify({ error: "Internal error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
