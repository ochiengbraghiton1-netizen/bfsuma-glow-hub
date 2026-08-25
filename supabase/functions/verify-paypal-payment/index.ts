import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";
import { corsHeaders } from "npm:@supabase/supabase-js@2/cors";

const PAYPAL_API_BASE = Deno.env.get("PAYPAL_API_BASE") || "https://api-m.paypal.com";
const KES_TO_USD_RATE = 0.0077;
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const json = (body: Record<string, unknown>, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const asString = (value: unknown) => (typeof value === "string" ? value.trim() : "");

async function getPayPalAccessToken(clientId: string, clientSecret: string) {
  const response = await fetch(`${PAYPAL_API_BASE}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      Authorization: `Basic ${btoa(`${clientId}:${clientSecret}`)}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("PayPal token error:", response.status, text.slice(0, 300));
    throw new Error("Unable to verify PayPal payment");
  }

  const payload = await response.json();
  if (!payload?.access_token || typeof payload.access_token !== "string") {
    throw new Error("PayPal token response was invalid");
  }
  return payload.access_token;
}

async function fetchPayPalOrder(paypalOrderId: string, accessToken: string) {
  const response = await fetch(`${PAYPAL_API_BASE}/v2/checkout/orders/${encodeURIComponent(paypalOrderId)}`, {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.error("PayPal order lookup error:", response.status, text.slice(0, 300));
    throw new Error("Unable to verify PayPal payment");
  }

  return await response.json();
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "Method not allowed" }, 405);
  }

  try {
    let body: Record<string, unknown>;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body" }, 400);
    }

    const orderId = asString(body.orderId);
    const paypalOrderId = asString(body.paypalOrderId);
    if (!UUID_RE.test(orderId)) {
      return json({ error: "Invalid orderId" }, 400);
    }
    if (!paypalOrderId || paypalOrderId.length > 128) {
      return json({ error: "Invalid PayPal order identifier" }, 400);
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
    const paypalClientId = Deno.env.get("PAYPAL_CLIENT_ID");
    const paypalClientSecret = Deno.env.get("PAYPAL_CLIENT_SECRET");
    if (!supabaseUrl || !serviceRoleKey || !paypalClientId || !paypalClientSecret) {
      console.error("Missing required PayPal verification environment variables");
      return json({ error: "Payment verification is not configured" }, 500);
    }

    const supabase = createClient(supabaseUrl, serviceRoleKey);
    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select("id, notes, payment_method, payment_status, paypal_transaction_id, total_amount, customer_email")
      .eq("id", orderId)
      .maybeSingle();

    if (orderError) {
      console.error("Order lookup error:", orderError);
      return json({ error: "Unable to verify order" }, 500);
    }
    if (!order) {
      return json({ error: "Order not found" }, 404);
    }
    if (order.payment_method !== "paypal") {
      return json({ error: "Order is not a PayPal order" }, 409);
    }

    const accessToken = await getPayPalAccessToken(paypalClientId, paypalClientSecret);
    const paypalOrder = await fetchPayPalOrder(paypalOrderId, accessToken);

    if (paypalOrder?.status !== "COMPLETED") {
      return json({ error: "PayPal payment is not completed" }, 409);
    }

    const purchaseUnit = Array.isArray(paypalOrder.purchase_units) ? paypalOrder.purchase_units[0] : null;
    if (purchaseUnit?.custom_id !== orderId) {
      console.error("PayPal custom_id mismatch", { orderId, customId: purchaseUnit?.custom_id });
      return json({ error: "PayPal order does not match this checkout" }, 409);
    }

    const capture = Array.isArray(purchaseUnit?.payments?.captures)
      ? purchaseUnit.payments.captures.find((item: any) => item?.status === "COMPLETED") || purchaseUnit.payments.captures[0]
      : null;
    const captureId = asString(capture?.id) || paypalOrderId;
    const capturedCurrency = asString(capture?.amount?.currency_code);
    const capturedAmount = Number(capture?.amount?.value);
    const expectedAmount = Math.round(Number(order.total_amount) * KES_TO_USD_RATE * 100) / 100;

    if (capturedCurrency !== "USD" || !Number.isFinite(capturedAmount)) {
      return json({ error: "Invalid PayPal capture amount" }, 409);
    }
    if (Math.abs(capturedAmount - expectedAmount) > 0.02) {
      console.error("PayPal amount mismatch", { orderId, capturedAmount, expectedAmount });
      return json({ error: "PayPal amount does not match the order total" }, 409);
    }

    const { data: duplicate } = await supabase
      .from("orders")
      .select("id")
      .eq("paypal_transaction_id", captureId)
      .neq("id", orderId)
      .limit(1);
    if (duplicate && duplicate.length > 0) {
      return json({ error: "PayPal transaction has already been used" }, 409);
    }

    if (order.payment_status === "paid" && order.paypal_transaction_id === captureId) {
      return json({ success: true, alreadyPaid: true, orderId, payment_status: "paid" });
    }

    const existingNotes = asString(order.notes);
    const transactionNote = `[PayPal Transaction: ${captureId}]`;
    const notes = existingNotes.includes(transactionNote)
      ? existingNotes
      : [existingNotes, transactionNote].filter(Boolean).join("\n");

    const { data: updatedOrder, error: updateError } = await supabase
      .from("orders")
      .update({
        status: "paid",
        payment_status: "paid",
        payment_method: "paypal",
        paypal_transaction_id: captureId,
        notes,
      })
      .eq("id", orderId)
      .eq("payment_method", "paypal")
      .select("id, payment_status, paypal_transaction_id")
      .maybeSingle();

    if (updateError || !updatedOrder) {
      console.error("PayPal order update error:", updateError);
      return json({ error: "Payment verified but order update failed" }, 500);
    }

    if (order.customer_email) {
      const { error: emailError } = await supabase.functions.invoke("send-order-confirmation", {
        body: { orderId },
      });
      if (emailError) {
        console.error("PayPal confirmation email error:", emailError);
      }
    }

    return json({
      success: true,
      orderId,
      payment_status: updatedOrder.payment_status,
      paypal_transaction_id: updatedOrder.paypal_transaction_id,
    });
  } catch (error) {
    console.error("verify-paypal-payment error:", error);
    return json({ error: "Unable to verify PayPal payment" }, 500);
  }
});