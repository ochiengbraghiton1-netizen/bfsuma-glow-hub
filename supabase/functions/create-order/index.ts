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
    if (!body.items || body.items.length === 0) {
      return new Response(JSON.stringify({ error: "No items in order" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
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
    const productIds = body.items.map((i) => i.product_id);
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

          // Increment usage count
          await supabase
            .from("promotions")
            .update({ usage_count: (promo.usage_count || 0) + 1 })
            .eq("id", promo.id);
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
      // Attempt cleanup
      await supabase.from("orders").delete().eq("id", orderId);
      return new Response(JSON.stringify({ error: "Failed to create order items" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // --- Decrement stock ---
    for (const item of body.items) {
      await supabase.rpc("decrement_stock", {
        p_product_id: item.product_id,
        p_quantity: item.quantity,
      });
    }

    // --- Track affiliate conversion ---
    // Client sends referral_code if available; we handle it server-side
    // (This is optional - tracked via localStorage on client, but we accept it here too)

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
