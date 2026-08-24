import { createClient } from "https://esm.sh/@supabase/supabase-js@2.89.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Server-side shipping fee schedule — single source of truth
const SHIPPING_FEES: Record<string, number> = {
  Nairobi: 200,
  "Outside Nairobi": 350,
};

interface OrderItem {
  product_id: string;
  quantity: number;
}

interface CreateOrderBody {
  customer_name: string;
  customer_phone: string;
  customer_email?: string;
  shipping_address: string;
  notes?: string;
  promotion_code?: string;
  delivery_location: string;
  payment_method: string;
  currency: string;
  items: OrderItem[];
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get user from auth header (optional — guest checkout allowed)
    let userId: string | null = null;
    const authHeader = req.headers.get("authorization");
    if (authHeader) {
      const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
      const userClient = createClient(supabaseUrl, anonKey, {
        global: { headers: { Authorization: authHeader } },
      });
      const { data: { user } } = await userClient.auth.getUser();
      userId = user?.id ?? null;
    }

    const body: CreateOrderBody = await req.json();

    // --- Validate required fields ---
    if (!body.customer_name || body.customer_name.trim().length < 2) {
      return new Response(JSON.stringify({ error: "Invalid customer name" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.customer_phone || body.customer_phone.trim().length < 7) {
      return new Response(JSON.stringify({ error: "Invalid phone number" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!body.shipping_address || body.shipping_address.trim().length < 10) {
      return new Response(JSON.stringify({ error: "Invalid shipping address" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }
    if (!Array.isArray(body.items) || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "No items in order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Validate item shape BEFORE touching the database ---
    const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    for (const item of body.items) {
      if (!item || typeof item.product_id !== "string" || !UUID_RE.test(item.product_id.trim())) {
        return new Response(
          JSON.stringify({ error: `Invalid product identifier: ${String(item?.product_id)}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: `Invalid quantity for product ${item.product_id}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- Validate delivery location & calculate shipping fee server-side ---
    const deliveryLocation = body.delivery_location;
    if (!deliveryLocation || !(deliveryLocation in SHIPPING_FEES)) {
      return new Response(
        JSON.stringify({ error: "Invalid delivery location. Must be 'Nairobi' or 'Outside Nairobi'" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    const shippingFee = SHIPPING_FEES[deliveryLocation];

    // --- Fetch product prices from DB (never trust frontend prices) ---
    const productIds = body.items.map((i) => i.product_id.trim());
    const { data: products, error: productsError } = await supabase
      .from("products")
      .select("id, price, name, is_active, track_inventory, stock_quantity")
      .in("id", productIds);

    if (productsError || !products) {
      return new Response(JSON.stringify({ error: "Failed to fetch products" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const productMap = new Map(products.map((p: any) => [p.id, p]));

    // Validate all products exist and are active
    for (const item of body.items) {
      const product = productMap.get(item.product_id);
      if (!product) {
        return new Response(
          JSON.stringify({ error: `Product not found: ${item.product_id}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (!product.is_active) {
        return new Response(
          JSON.stringify({ error: `Product is no longer available: ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (item.quantity < 1 || item.quantity > 100) {
        return new Response(
          JSON.stringify({ error: `Invalid quantity for ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (product.track_inventory && product.stock_quantity < item.quantity) {
        return new Response(
          JSON.stringify({ error: `Insufficient stock for ${product.name}` }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

    // --- Calculate subtotal from DB prices ---
    let subtotal = 0;
    const orderItemsData: any[] = [];
    for (const item of body.items) {
      const product = productMap.get(item.product_id)!;
      const itemSubtotal = Number(product.price) * item.quantity;
      subtotal += itemSubtotal;
      orderItemsData.push({
        product_id: item.product_id,
        product_name: product.name,
        product_price: Number(product.price),
        quantity: item.quantity,
        subtotal: itemSubtotal,
      });
    }

    // --- Apply promotion code server-side ---
    let discountAmount = 0;
    let promotionCode: string | null = null;
    if (body.promotion_code) {
      const { data: promo } = await supabase
        .from("promotions")
        .select("*")
        .eq("code", body.promotion_code.toUpperCase())
        .eq("is_active", true)
        .maybeSingle();

      if (promo) {
        const withinDateRange =
          (!promo.start_date || new Date(promo.start_date) <= new Date()) &&
          (!promo.end_date || new Date(promo.end_date) >= new Date());
        const withinUsageLimit = !promo.usage_limit || promo.usage_count < promo.usage_limit;
        const meetsMinimum = !promo.min_order_amount || subtotal >= Number(promo.min_order_amount);

        if (withinDateRange && withinUsageLimit && meetsMinimum) {
          if (promo.discount_type === "percentage") {
            discountAmount = (subtotal * Number(promo.discount_value)) / 100;
            if (promo.max_discount_amount) {
              discountAmount = Math.min(discountAmount, Number(promo.max_discount_amount));
            }
          } else {
            discountAmount = Number(promo.discount_value);
          }
          promotionCode = promo.code;
          promoToConsume = { id: promo.id, usage_count: promo.usage_count || 0 };
        }
      }
    }

    // --- Calculate final total ---
    const totalAmount = subtotal - discountAmount + shippingFee;

    // --- Determine order status ---
    const paymentMethod = body.payment_method || "whatsapp";
    let status = "pending_whatsapp";
    let paymentStatus = "pending";
    if (paymentMethod === "paypal") {
      status = "pending_payment";
    } else if (paymentMethod === "mpesa") {
      status = "pending_payment";
    }

    // --- Reserve stock atomically BEFORE writing the order.
    // decrement_stock locks the row (FOR UPDATE) and returns false when stock is
    // insufficient, which prevents concurrent oversell. Any failure rolls back the
    // reservations already made in this request.
    const reserved: OrderItem[] = [];
    const releaseReserved = async () => {
      for (const r of reserved) {
        await supabase.rpc("decrement_stock", {
          p_product_id: r.product_id,
          p_quantity: -r.quantity, // negative quantity restores stock
        });
      }
    };

    for (const item of body.items) {
      const { data: ok, error: stockError } = await supabase.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
      if (stockError) {
        console.error("decrement_stock error:", stockError);
        await releaseReserved();
        return new Response(JSON.stringify({ error: "Failed to reserve stock" }), {
          status: 500,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      if (ok !== true) {
        await releaseReserved();
        const name = productMap.get(item.product_id)?.name ?? item.product_id;
        return new Response(JSON.stringify({ error: `Insufficient stock for ${name}` }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      reserved.push({ product_id: item.product_id, quantity: item.quantity });
    }

    // --- Insert order ---
    const orderId = crypto.randomUUID();
    const { error: orderError } = await supabase.from("orders").insert({
      id: orderId,
      customer_name: body.customer_name.trim(),
      customer_email: body.customer_email?.trim() || null,
      customer_phone: body.customer_phone.trim(),
      shipping_address: body.shipping_address.trim(),
      notes: body.notes?.trim() || null,
      promotion_code: promotionCode,
      subtotal,
      discount_amount: discountAmount,
      shipping_fee: shippingFee,
      total_amount: totalAmount,
      delivery_location: deliveryLocation,
      status,
      currency: body.currency || "KES",
      payment_method: paymentMethod,
      payment_status: paymentStatus,
      user_id: userId,
    });

    if (orderError) {
      console.error("Order insert error:", orderError);
      await releaseReserved();
      return new Response(JSON.stringify({ error: "Failed to create order" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Insert order items ---
    const itemsWithOrderId = orderItemsData.map((item) => ({
      ...item,
      order_id: orderId,
    }));
    const { error: itemsError } = await supabase.from("order_items").insert(itemsWithOrderId);

    if (itemsError) {
      console.error("Order items insert error:", itemsError);
      // Roll back: remove the partially created order and release reserved stock
      await supabase.from("order_items").delete().eq("order_id", orderId);
      await supabase.from("orders").delete().eq("id", orderId);
      await releaseReserved();
      return new Response(JSON.stringify({ error: "Failed to create order items" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Consume promotion usage only after the order is fully persisted.
    // Optimistic lock on usage_count so concurrent orders cannot exceed usage_limit.
    if (promoToConsume) {
      const { error: promoError } = await supabase
        .from("promotions")
        .update({ usage_count: promoToConsume.usage_count + 1 })
        .eq("id", promoToConsume.id)
        .eq("usage_count", promoToConsume.usage_count);
      if (promoError) console.error("Promotion usage increment failed:", promoError);
    }


    // --- Track affiliate conversion ---
    // Client sends referral_code if available; we handle it server-side
    // (This is optional - tracked via localStorage on client, but we accept it here too)

    // --- Fire admin email notification (fire-and-forget) ---
    try {
      const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
      if (lovableApiKey) {
        const shortId = `BF-${orderId.slice(0, 8).toUpperCase()}`;
        const fmt = (n: number) => `KSh ${n.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        const productLines = orderItemsData
          .map((i) => `  • ${i.product_name} x${i.quantity} — ${fmt(i.subtotal)}`)
          .join("<br/>");
        const html = `
<div style="font-family:Arial,Helvetica,sans-serif;font-size:14px;color:#111;max-width:640px;">
  <h2 style="margin:0 0 12px;">🛒 New Order ${shortId}</h2>
  <p style="margin:0 0 16px;color:#555;">A new order has just been placed on BF SUMA ROYAL.</p>
  <table style="border-collapse:collapse;width:100%;">
    <tr><td style="padding:4px 0;"><b>Order ID</b></td><td>${shortId}</td></tr>
    <tr><td style="padding:4px 0;"><b>Customer</b></td><td>${body.customer_name.trim()}</td></tr>
    <tr><td style="padding:4px 0;"><b>Phone</b></td><td>${body.customer_phone.trim()}</td></tr>
    ${body.customer_email ? `<tr><td style="padding:4px 0;"><b>Email</b></td><td>${body.customer_email.trim()}</td></tr>` : ""}
    <tr><td style="padding:4px 0;vertical-align:top;"><b>Products</b></td><td>${productLines}</td></tr>
    <tr><td style="padding:4px 0;"><b>Subtotal</b></td><td>${fmt(subtotal)}</td></tr>
    ${discountAmount > 0 ? `<tr><td style="padding:4px 0;"><b>Discount</b></td><td>-${fmt(discountAmount)} (${promotionCode})</td></tr>` : ""}
    <tr><td style="padding:4px 0;"><b>Shipping</b></td><td>${fmt(shippingFee)}</td></tr>
    <tr><td style="padding:4px 0;"><b>Total</b></td><td><b>${fmt(totalAmount)}</b></td></tr>
    <tr><td style="padding:4px 0;"><b>Delivery Location</b></td><td>${deliveryLocation}</td></tr>
    <tr><td style="padding:4px 0;vertical-align:top;"><b>Delivery Address</b></td><td>${body.shipping_address.trim().replace(/\n/g, "<br/>")}</td></tr>
    ${body.notes ? `<tr><td style="padding:4px 0;vertical-align:top;"><b>Notes</b></td><td>${body.notes.trim().replace(/\n/g, "<br/>")}</td></tr>` : ""}
    <tr><td style="padding:4px 0;"><b>Payment Method</b></td><td>${paymentMethod}</td></tr>
    <tr><td style="padding:4px 0;"><b>Status</b></td><td>${status}</td></tr>
  </table>
  <p style="margin:20px 0 0;">
    <a href="https://bfsumaroyal.com/admin/orders" style="background:#047857;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none;">View in Admin</a>
  </p>
</div>`;
        // Fire-and-forget — do not await; do not block order response
        fetch("https://api.lovable.dev/api/v1/send-email", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${lovableApiKey}`,
          },
          body: JSON.stringify({
            to: ["bfsumaroyal@gmail.com"],
            cc: ["braghiton.ochieng.125@gmail.com"],
            subject: `🛒 New Order ${shortId} — BF SUMA ROYAL`,
            html,
            purpose: "transactional",
          }),

        }).catch((e) => console.error("Admin email send error:", e));
      } else {
        console.error("LOVABLE_API_KEY not set — admin email skipped");
      }
    } catch (e) {
      console.error("Admin email dispatch error:", e);
    }


    return new Response(
      JSON.stringify({
        order_id: orderId,
        subtotal,
        discount_amount: discountAmount,
        shipping_fee: shippingFee,
        total_amount: totalAmount,
        delivery_location: deliveryLocation,
        status,
        payment_status: paymentStatus,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
