import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log("M-Pesa callback received:", JSON.stringify(body));

    const stkCallback = body?.Body?.stkCallback;
    if (!stkCallback) {
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { MerchantRequestID, CheckoutRequestID, ResultCode, ResultDesc, CallbackMetadata } = stkCallback;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Find order by CheckoutRequestID stored in notes
    const { data: orders } = await supabase
      .from("orders")
      .select("id, notes, customer_email")
      .like("notes", `%${CheckoutRequestID}%`)
      .limit(1);

    const order = orders?.[0];
    if (!order) {
      console.error("No order found for CheckoutRequestID:", CheckoutRequestID);
      return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (ResultCode === 0) {
      // Payment successful - extract metadata
      let mpesaReceiptNumber = "";
      let transactionDate = "";
      let phoneNumber = "";
      let amount = 0;

      if (CallbackMetadata?.Item) {
        for (const item of CallbackMetadata.Item) {
          switch (item.Name) {
            case "MpesaReceiptNumber":
              mpesaReceiptNumber = item.Value;
              break;
            case "TransactionDate":
              transactionDate = String(item.Value);
              break;
            case "PhoneNumber":
              phoneNumber = String(item.Value);
              break;
            case "Amount":
              amount = item.Value;
              break;
          }
        }
      }

      await supabase
        .from("orders")
        .update({
          status: "paid",
          payment_status: "paid",
          paypal_transaction_id: mpesaReceiptNumber, // reusing field for M-Pesa receipt
          notes: `M-Pesa Payment Confirmed | Receipt: ${mpesaReceiptNumber} | Phone: ${phoneNumber} | Amount: ${amount} | Date: ${transactionDate}`,
        })
        .eq("id", order.id);

      // Send confirmation email if available
      if (order.customer_email) {
        supabase.functions.invoke("send-order-confirmation", {
          body: { orderId: order.id },
        }).catch((err: Error) => console.error("Email send error:", err));
      }

      console.log(`Order ${order.id} paid via M-Pesa. Receipt: ${mpesaReceiptNumber}`);
    } else {
      // Payment failed
      await supabase
        .from("orders")
        .update({
          status: "pending",
          payment_status: "failed",
          notes: `M-Pesa payment failed: ${ResultDesc} (Code: ${ResultCode})`,
        })
        .eq("id", order.id);

      console.log(`Order ${order.id} M-Pesa payment failed: ${ResultDesc}`);
    }

    // Respond to Safaricom
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("M-Pesa callback error:", error);
    return new Response(JSON.stringify({ ResultCode: 0, ResultDesc: "Accepted" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
