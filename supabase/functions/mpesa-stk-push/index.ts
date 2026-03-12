import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

const MPESA_BASE_URL = "https://sandbox.safaricom.co.ke";
const BUSINESS_SHORT_CODE = "174379";
const PASSKEY = "bfb279f9aa9bdbcf158e97dd71a467cd2e0c893059b10f78e6b72ada1ed2c919";

async function getAccessToken(): Promise<string> {
  const consumerKey = Deno.env.get("MPESA_CONSUMER_KEY");
  const consumerSecret = Deno.env.get("MPESA_CONSUMER_SECRET");

  if (!consumerKey || !consumerSecret) {
    throw new Error("M-Pesa credentials not configured");
  }

  console.log("Generating M-Pesa access token...");
  console.log("Consumer Key length:", consumerKey.length);
  console.log("Consumer Key starts with:", consumerKey.substring(0, 6) + "...");

  const auth = btoa(`${consumerKey}:${consumerSecret}`);
  
  const res = await fetch(
    `${MPESA_BASE_URL}/oauth/v1/generate?grant_type=client_credentials`,
    {
      method: "GET",
      headers: {
        Authorization: `Basic ${auth}`,
      },
    }
  );

  const responseText = await res.text();
  console.log("Token response status:", res.status);
  console.log("Token response body:", responseText);

  if (!res.ok) {
    throw new Error(`Failed to get access token (HTTP ${res.status}): ${responseText}`);
  }

  let data;
  try {
    data = JSON.parse(responseText);
  } catch {
    throw new Error(`Invalid JSON from token endpoint: ${responseText}`);
  }

  if (!data.access_token) {
    throw new Error(`No access_token in response: ${responseText}`);
  }

  console.log("Access token obtained successfully, length:", data.access_token.length);
  return data.access_token;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { phone, amount, orderId, accountReference } = await req.json();

    if (!phone || !amount || !orderId) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: phone, amount, orderId" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Format phone: ensure 254XXXXXXXXX format
    let formattedPhone = phone.replace(/[^0-9]/g, "");
    if (formattedPhone.startsWith("0")) {
      formattedPhone = "254" + formattedPhone.slice(1);
    }
    if (!formattedPhone.startsWith("254")) {
      formattedPhone = "254" + formattedPhone;
    }

    console.log("Formatted phone:", formattedPhone);
    console.log("Amount:", amount, "Order:", orderId);

    const accessToken = await getAccessToken();

    const timestamp = new Date()
      .toISOString()
      .replace(/[-T:.Z]/g, "")
      .slice(0, 14);
    const password = btoa(`${BUSINESS_SHORT_CODE}${PASSKEY}${timestamp}`);

    // Callback URL - our edge function
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const callbackUrl = `${supabaseUrl}/functions/v1/mpesa-callback`;

    const stkPayload = {
      BusinessShortCode: BUSINESS_SHORT_CODE,
      Password: password,
      Timestamp: timestamp,
      TransactionType: "CustomerPayBillOnline",
      Amount: Math.ceil(amount),
      PartyA: formattedPhone,
      PartyB: BUSINESS_SHORT_CODE,
      PhoneNumber: formattedPhone,
      CallBackURL: callbackUrl,
      AccountReference: accountReference || `BF-${orderId.slice(0, 4).toUpperCase()}`,
      TransactionDesc: `Payment for order ${orderId.slice(0, 8)}`,
    };

    console.log("STK Push payload:", JSON.stringify(stkPayload));

    const stkRes = await fetch(
      `${MPESA_BASE_URL}/mpesa/stkpush/v1/processrequest`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(stkPayload),
      }
    );

    const stkText = await stkRes.text();
    console.log("STK Push response status:", stkRes.status);
    console.log("STK Push response:", stkText);

    let stkData;
    try {
      stkData = JSON.parse(stkText);
    } catch {
      return new Response(
        JSON.stringify({ error: "Invalid response from M-Pesa", details: stkText }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (stkData.ResponseCode !== "0") {
      return new Response(
        JSON.stringify({
          error: stkData.errorMessage || stkData.ResponseDescription || "STK Push failed",
          details: stkData,
        }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Store the CheckoutRequestID on the order for later verification
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase
      .from("orders")
      .update({
        status: "pending_payment",
        payment_method: "mpesa",
        notes: `MPesa CheckoutRequestID: ${stkData.CheckoutRequestID}`,
      })
      .eq("id", orderId);

    return new Response(
      JSON.stringify({
        success: true,
        checkoutRequestId: stkData.CheckoutRequestID,
        merchantRequestId: stkData.MerchantRequestID,
        responseDescription: stkData.ResponseDescription,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("M-Pesa STK Push error:", error);
    return new Response(
      JSON.stringify({ error: error.message || "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
