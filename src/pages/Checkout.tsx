import { useState, useRef, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingBag, Loader2, MessageCircle, CheckCircle, CreditCard, Phone } from 'lucide-react';
import { z } from 'zod';
import productGeneric from '@/assets/product-generic.jpg';
import { HoneypotField } from '@/components/ui/honeypot-field';
import { isBot } from '@/lib/honeypot';
import { PhoneInput, formatForWhatsApp } from '@/components/ui/phone-input';
import PayPalButton from '@/components/checkout/PayPalButton';
import CurrencySelector from '@/components/checkout/CurrencySelector';
import SecureCheckoutBadges from '@/components/checkout/SecureCheckoutBadges';
import MpesaPayment from '@/components/checkout/MpesaPayment';
import { useCurrency } from '@/hooks/use-currency';

const WHATSAPP_NUMBER = "254795454053";
const CHECKOUT_STORAGE_KEY = "bf_checkout_form";

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  customerEmail: z.string().trim().email('Invalid email address').max(255).optional().or(z.literal('')),
  customerPhone: z.string().trim().min(7, 'Phone number is too short').max(20).transform(v => v.replace(/[\s\-]/g, '')).pipe(z.string().regex(/^\+\d{7,15}$/, 'Please enter a valid phone number')),
  shippingAddress: z.string().trim().min(10, 'Please enter a complete address').max(500),
  notes: z.string().trim().max(500).optional(),
  promoCode: z.string().trim().max(50).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const loadCheckoutForm = (): CheckoutFormData => {
  try {
    const stored = sessionStorage.getItem(CHECKOUT_STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      return {
        customerName: parsed.customerName || '',
        customerEmail: parsed.customerEmail || '',
        customerPhone: parsed.customerPhone || '+254',
        shippingAddress: parsed.shippingAddress || '',
        notes: parsed.notes || '',
        promoCode: parsed.promoCode || '',
      };
    }
  } catch { /* ignore */ }
  return {
    customerName: '',
    customerEmail: '',
    customerPhone: '+254',
    shippingAddress: '',
    notes: '',
    promoCode: '',
  };
};

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { currency, setCurrency, convert, format: formatCurrency } = useCurrency('KES');
  
  const [formData, setFormData] = useState<CheckoutFormData>(loadCheckoutForm);
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);
  const [honeypot, setHoneypot] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'whatsapp' | 'mpesa' | 'paypal'>('mpesa');

  // Persist form data to sessionStorage on every change
  useEffect(() => {
    sessionStorage.setItem(CHECKOUT_STORAGE_KEY, JSON.stringify(formData));
  }, [formData]);

  const subtotal = totalPrice;
  const discount = promoApplied?.discount || 0;
  const finalTotal = subtotal - discount;

  // PayPal always uses USD - convert KES to USD using the rate
  const kesToUsdRate = 0.0077;
  const paypalUsdAmount = Math.round(finalTotal * kesToUsdRate * 100) / 100;

  const handleInputChange = (field: keyof CheckoutFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const applyPromoCode = async () => {
    if (!formData.promoCode) return;
    
    try {
      const { data: promo, error } = await supabase
        .from('promotions')
        .select('*')
        .eq('code', formData.promoCode.toUpperCase())
        .eq('is_active', true)
        .maybeSingle();

      if (error || !promo) {
        toast({
          title: 'Invalid Code',
          description: 'This promo code is not valid or has expired.',
          variant: 'destructive',
        });
        return;
      }

      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        toast({
          title: 'Code Expired',
          description: 'This promo code has reached its usage limit.',
          variant: 'destructive',
        });
        return;
      }

      if (promo.min_order_amount && subtotal < Number(promo.min_order_amount)) {
        toast({
          title: 'Minimum Not Met',
          description: `Minimum order amount of KSh ${Number(promo.min_order_amount).toLocaleString()} required.`,
          variant: 'destructive',
        });
        return;
      }

      let discountAmount = 0;
      if (promo.discount_type === 'percentage') {
        discountAmount = (subtotal * Number(promo.discount_value)) / 100;
        if (promo.max_discount_amount) {
          discountAmount = Math.min(discountAmount, Number(promo.max_discount_amount));
        }
      } else {
        discountAmount = Number(promo.discount_value);
      }

      setPromoApplied({ discount: discountAmount, code: promo.code });
      toast({
        title: 'Promo Applied!',
        description: `You saved ${formatCurrency(discountAmount)}`,
      });
    } catch (error) {
      console.error('Error applying promo:', error);
    }
  };

  const generateWhatsAppMessage = (orderId: string) => {
    const itemsList = items.map(item => 
      `• ${item.name} x${item.quantity} - ${formatCurrency(item.price * item.quantity)}`
    ).join('\n');

    const message = `🛒 *NEW ORDER - BF SUMA ROYAL*

📋 *Order ID:* ${orderId.slice(0, 8).toUpperCase()}

👤 *Customer Details:*
Name: ${formData.customerName}
Phone: ${formData.customerPhone}
${formData.customerEmail ? `Email: ${formData.customerEmail}` : ''}

📦 *Products:*
${itemsList}

💰 *Order Summary (${currency}):*
Subtotal: ${formatCurrency(subtotal)}
${discount > 0 ? `Discount (${promoApplied?.code}): -${formatCurrency(discount)}` : ''}
*Total: ${formatCurrency(finalTotal)}*

📍 *Delivery Address:*
${formData.shippingAddress}

${formData.notes ? `📝 *Notes:* ${formData.notes}` : ''}

---
Sent from BF SUMA ROYAL Website`;

    return encodeURIComponent(message);
  };

  const saveOrderToDb = async (status: string, currentFormData?: CheckoutFormData) => {
    const fd = currentFormData || formData;
    const newOrderId = crypto.randomUUID();

    // Get current user if logged in
    const { data: { user } } = await supabase.auth.getUser();

    const { error: orderError } = await supabase
      .from('orders')
      .insert({
        id: newOrderId,
        customer_name: fd.customerName,
        customer_email: fd.customerEmail || null,
        customer_phone: fd.customerPhone,
        shipping_address: fd.shippingAddress,
        notes: fd.notes || null,
        promotion_code: promoApplied?.code || null,
        subtotal: subtotal,
        discount_amount: discount,
        total_amount: finalTotal,
        status,
        currency,
        payment_method: paymentMethod,
        payment_status: status === 'paid' ? 'paid' : 'pending',
        user_id: user?.id || null,
      } as any);

    if (orderError) throw orderError;

    const orderItems = items.map(item => ({
      order_id: newOrderId,
      product_id: item.id,
      product_name: item.name,
      product_price: item.price,
      quantity: item.quantity,
      subtotal: item.price * item.quantity,
    }));

    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);

    if (itemsError) throw itemsError;

    // Update promo usage count
    if (promoApplied) {
      const { data: promo } = await supabase
        .from('promotions')
        .select('usage_count')
        .eq('code', promoApplied.code)
        .maybeSingle();
      
      if (promo) {
        await supabase
          .from('promotions')
          .update({ usage_count: (promo.usage_count || 0) + 1 })
          .eq('code', promoApplied.code);
      }
    }

    // Update product stock quantities
    for (const item of items) {
      await supabase.rpc('decrement_stock', { p_product_id: item.id, p_quantity: item.quantity });
    }

    // Track affiliate conversion
    const storedRef = localStorage.getItem('bf_referral_code');
    const refExpiry = localStorage.getItem('bf_referral_expiry');
    if (storedRef && (!refExpiry || new Date(refExpiry) > new Date())) {
      try {
        await supabase.rpc('record_affiliate_conversion', {
          p_referral_code: storedRef,
          p_order_id: newOrderId,
          p_order_total: finalTotal,
        });
      } catch (err) {
        console.error('Affiliate conversion tracking error:', err);
      }
    }

    return newOrderId;
  };

  const [pendingPaypalOrderId, setPendingPaypalOrderId] = useState<string | null>(null);

  // Keep a ref to formData so PayPal callbacks always read the latest values
  const formDataRef = useRef(formData);
  formDataRef.current = formData;

  const handlePayPalCreateOrder = useCallback(async () => {
    const currentFormData = formDataRef.current;
    const result = checkoutSchema.safeParse(currentFormData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CheckoutFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      console.error('PayPal validation failed:', result.error.errors);
      throw new Error('Please fill in required fields');
    }

    setErrors({});

    if (isBot(honeypot)) throw new Error('Validation failed');

    // Save order as pending_payment BEFORE PayPal redirect
    if (!pendingPaypalOrderId) {
      const newOrderId = await saveOrderToDb('pending_payment', currentFormData);
      setPendingPaypalOrderId(newOrderId);
    }
  }, [pendingPaypalOrderId, honeypot, subtotal, discount, finalTotal, currency, paymentMethod, promoApplied, items]);

  const handlePayPalApprove = async (paypalOrderId: string, details: any) => {
    setIsSubmitting(true);
    try {
      const dbOrderId = pendingPaypalOrderId;
      if (!dbOrderId) {
        throw new Error('No pending order found');
      }

      await supabase
        .from('orders')
        .update({ 
          status: 'paid',
          payment_status: 'paid',
          payment_method: 'paypal',
          paypal_transaction_id: details.id || paypalOrderId,
          notes: `${formData.notes || ''}\n[PayPal Transaction: ${details.id || paypalOrderId}]`.trim(),
        } as any)
        .eq('id', dbOrderId);

      // GA4 purchase event
      if (typeof window !== 'undefined' && (window as any).dataLayer) {
        (window as any).dataLayer.push({
          event: 'purchase',
          ecommerce: {
            transaction_id: dbOrderId,
            value: convert(finalTotal),
            currency: currency,
            items: items.map(item => ({
              item_id: item.id,
              item_name: item.name,
              price: convert(item.price),
              quantity: item.quantity,
            })),
          },
        });
      }

      // Send confirmation email if customer provided email
      if (formData.customerEmail) {
        supabase.functions.invoke('send-order-confirmation', {
          body: { orderId: dbOrderId },
        }).catch(err => console.error('Email send error:', err));
      }

      clearCart();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      setPendingPaypalOrderId(null);
      
      // Pass order data via navigation state so confirmation page works without DB fetch
      navigate(`/order-success/${dbOrderId}`, { 
        replace: true,
        state: {
          order: {
            id: dbOrderId,
            customer_name: formData.customerName,
            customer_email: formData.customerEmail || null,
            customer_phone: formData.customerPhone,
            shipping_address: formData.shippingAddress,
            subtotal,
            discount_amount: discount,
            total_amount: finalTotal,
            promotion_code: promoApplied?.code || null,
            status: 'paid',
            currency,
            notes: formData.notes || null,
            created_at: new Date().toISOString(),
          },
          orderItems: items.map(item => ({
            id: item.id,
            product_name: item.name,
            product_price: item.price,
            quantity: item.quantity,
            subtotal: item.price * item.quantity,
          })),
        },
      });
    } catch (error) {
      console.error('PayPal order update error:', error);
      toast({
        title: 'Order Failed',
        description: 'Payment was received but order update failed. Please contact support.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayPalError = (error: any) => {
    console.error('PayPal error details:', {
      message: error?.message,
      name: error?.name,
      stack: error?.stack,
      full: error,
    });
    toast({
      title: 'Payment Failed',
      description: error?.message || 'There was an error with PayPal. Please try again or use WhatsApp checkout.',
      variant: 'destructive',
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isBot(honeypot)) {
      toast({ title: 'Order Failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      return;
    }

    const result = checkoutSchema.safeParse(formData);
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof CheckoutFormData] = err.message;
        }
      });
      setErrors(fieldErrors);
      return;
    }

    if (items.length === 0) {
      toast({ title: 'Cart Empty', description: 'Please add items to your cart before checkout.', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);
    try {
      const newOrderId = await saveOrderToDb('pending_whatsapp');
      
      // Pass order data via navigation state so confirmation page works without DB fetch
      const orderState = {
        order: {
          id: newOrderId,
          customer_name: formData.customerName,
          customer_email: formData.customerEmail || null,
          customer_phone: formData.customerPhone,
          shipping_address: formData.shippingAddress,
          subtotal,
          discount_amount: discount,
          total_amount: finalTotal,
          promotion_code: promoApplied?.code || null,
          status: 'pending_whatsapp',
          currency,
          notes: formData.notes || null,
          created_at: new Date().toISOString(),
        },
        orderItems: items.map(item => ({
          id: item.id,
          product_name: item.name,
          product_price: item.price,
          quantity: item.quantity,
          subtotal: item.price * item.quantity,
        })),
      };

      clearCart();
      sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
      navigate(`/order-confirmation/${newOrderId}`, { state: orderState });
    } catch (error) {
      console.error('Order error:', error);
      toast({ title: 'Order Failed', description: 'There was an error placing your order. Please try again.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Sent!</h1>
          <p className="text-muted-foreground">
            Your order has been sent to our WhatsApp. We will contact you shortly to confirm your order and arrange delivery.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Order ID: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
          <div className="pt-4 space-y-3">
            <Button onClick={() => navigate('/')} className="w-full">
              Continue Shopping
            </Button>
            <Button 
              variant="outline"
              onClick={() => window.open(`https://wa.me/${WHATSAPP_NUMBER}`, '_blank')}
              className="w-full"
            >
              <MessageCircle className="h-4 w-4 mr-2" />
              Contact Us on WhatsApp
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="max-w-md w-full text-center space-y-6">
          <ShoppingBag className="h-16 w-16 mx-auto text-muted-foreground/50" />
          <h1 className="text-2xl font-bold text-foreground">Your Cart is Empty</h1>
          <p className="text-muted-foreground">Add some products to your cart before checkout.</p>
          <Button onClick={() => navigate('/')} variant="outline">
            <ArrowLeft className="h-4 w-4 mr-2" /> Back to Shop
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Button>
          <div className="ml-auto flex items-center gap-4">
            <CurrencySelector value={currency} onChange={setCurrency} />
            <span className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              BF SUMA ROYAL
            </span>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                Contact Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <HoneypotField value={honeypot} onChange={setHoneypot} />
                
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="customerName">Full Name *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => handleInputChange('customerName', e.target.value)}
                      placeholder="John Doe"
                      className={errors.customerName ? 'border-destructive' : ''}
                    />
                    {errors.customerName && (
                      <p className="text-sm text-destructive mt-1">{errors.customerName}</p>
                    )}
                  </div>
                  <div>
                    <Label htmlFor="customerPhone">Phone Number *</Label>
                    <PhoneInput
                      value={formData.customerPhone}
                      onChange={(val) => handleInputChange('customerPhone', val)}
                      placeholder="712 345 678"
                      error={!!errors.customerPhone}
                    />
                    {errors.customerPhone && (
                      <p className="text-sm text-destructive mt-1">{errors.customerPhone}</p>
                    )}
                  </div>
                </div>

                <div>
                  <Label htmlFor="customerEmail">Email (Optional)</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => handleInputChange('customerEmail', e.target.value)}
                    placeholder="john@example.com"
                    className={errors.customerEmail ? 'border-destructive' : ''}
                  />
                  {errors.customerEmail && (
                    <p className="text-sm text-destructive mt-1">{errors.customerEmail}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="shippingAddress">Delivery Address *</Label>
                  <Textarea
                    id="shippingAddress"
                    value={formData.shippingAddress}
                    onChange={(e) => handleInputChange('shippingAddress', e.target.value)}
                    placeholder="Enter your full delivery address including county and town"
                    rows={3}
                    className={errors.shippingAddress ? 'border-destructive' : ''}
                  />
                  {errors.shippingAddress && (
                    <p className="text-sm text-destructive mt-1">{errors.shippingAddress}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="notes">Order Notes (Optional)</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => handleInputChange('notes', e.target.value)}
                    placeholder="Any special instructions for your order"
                    rows={2}
                  />
                </div>

                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-3">Payment Method</h3>
                  <div className="grid grid-cols-3 gap-3 mb-4">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('mpesa')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        paymentMethod === 'mpesa'
                          ? 'border-[#4CAF50] bg-[#4CAF50]/5 text-[#4CAF50]'
                          : 'border-border text-muted-foreground hover:border-[#4CAF50]/50'
                      }`}
                    >
                      <Phone className="h-5 w-5" />
                      M-Pesa
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('whatsapp')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        paymentMethod === 'whatsapp'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <MessageCircle className="h-5 w-5" />
                      WhatsApp
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('paypal')}
                      className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all text-sm font-medium ${
                        paymentMethod === 'paypal'
                          ? 'border-primary bg-primary/5 text-primary'
                          : 'border-border text-muted-foreground hover:border-primary/50'
                      }`}
                    >
                      <CreditCard className="h-5 w-5" />
                      PayPal
                    </button>
                  </div>

                  {paymentMethod === 'mpesa' && (
                    <MpesaPayment
                      amount={finalTotal}
                      orderId={pendingPaypalOrderId}
                      onCreateOrder={async () => {
                        const currentFormData = formDataRef.current;
                        const result = checkoutSchema.safeParse(currentFormData);
                        if (!result.success) {
                          const fieldErrors: Partial<Record<keyof CheckoutFormData, string>> = {};
                          result.error.errors.forEach(err => {
                            if (err.path[0]) {
                              fieldErrors[err.path[0] as keyof CheckoutFormData] = err.message;
                            }
                          });
                          setErrors(fieldErrors);
                          throw new Error('Please fill in required fields');
                        }
                        setErrors({});
                        if (isBot(honeypot)) throw new Error('Validation failed');
                        const newOrderId = await saveOrderToDb('pending_payment', currentFormData);
                        setPendingPaypalOrderId(newOrderId);
                        return newOrderId;
                      }}
                      onPaymentSuccess={(oid, receipt) => {
                        clearCart();
                        sessionStorage.removeItem(CHECKOUT_STORAGE_KEY);
                        navigate(`/order-success/${oid}`, {
                          replace: true,
                          state: {
                            order: {
                              id: oid,
                              customer_name: formData.customerName,
                              customer_email: formData.customerEmail || null,
                              customer_phone: formData.customerPhone,
                              shipping_address: formData.shippingAddress,
                              subtotal,
                              discount_amount: discount,
                              total_amount: finalTotal,
                              promotion_code: promoApplied?.code || null,
                              status: 'paid',
                              currency,
                              notes: `M-Pesa Receipt: ${receipt}`,
                              created_at: new Date().toISOString(),
                            },
                            orderItems: items.map(item => ({
                              id: item.id,
                              product_name: item.name,
                              product_price: item.price,
                              quantity: item.quantity,
                              subtotal: item.price * item.quantity,
                            })),
                          },
                        });
                      }}
                      onPaymentFailed={(error) => {
                        toast({
                          title: 'Payment Failed',
                          description: error,
                          variant: 'destructive',
                        });
                      }}
                      disabled={isSubmitting || items.length === 0}
                      defaultPhone={formData.customerPhone}
                    />
                  )}

                  {paymentMethod === 'whatsapp' && (
                      <div className="bg-muted/50 rounded-xl p-4 border border-border mb-4">
                        <p className="text-sm text-muted-foreground">
                          After submitting, your order details will be sent via WhatsApp. We'll confirm your order and arrange delivery and payment.
                        </p>
                      </div>
                      <Button 
                        type="submit" 
                        variant="premium" 
                        size="lg" 
                        className="w-full"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          <>
                            <MessageCircle className="h-4 w-4 mr-2" />
                            Order via WhatsApp - {formatCurrency(finalTotal)}
                          </>
                        )}
                      </Button>
                    </>
                  )}

                  {paymentMethod === 'paypal' && (
                    <>
                      <div className="bg-muted/50 rounded-xl p-4 border border-border mb-4">
                        <p className="text-sm text-muted-foreground">
                          Pay securely with PayPal in <strong>USD</strong>. Supports credit/debit cards and PayPal balance.
                          {currency !== 'USD' && (
                            <span className="block mt-1 text-xs">
                              Your total of {formatCurrency(finalTotal)} will be charged as ${paypalUsdAmount.toFixed(2)} USD.
                            </span>
                          )}
                        </p>
                      </div>
                      <PayPalButton
                        amount={paypalUsdAmount}
                        currency="USD"
                        onCreateOrder={handlePayPalCreateOrder}
                        onApprove={handlePayPalApprove}
                        onError={handlePayPalError}
                        disabled={isSubmitting || items.length === 0}
                      />
                    </>
                  )}

                  <SecureCheckoutBadges />
                </div>
              </form>
            </div>
          </div>

          <div className="lg:sticky lg:top-24 h-fit">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <ShoppingBag className="h-5 w-5 text-primary" />
                Order Summary ({items.length} items)
              </h2>

              <div className="space-y-4 max-h-80 overflow-y-auto mb-6">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-4">
                    <img
                      src={item.image || productGeneric}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-lg"
                    />
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium truncate">{item.name}</h4>
                      <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold">
                        {formatCurrency(item.price * item.quantity)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 mb-4">
                <Label htmlFor="promoCode">Promo Code</Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="promoCode"
                    value={formData.promoCode}
                    onChange={(e) => handleInputChange('promoCode', e.target.value.toUpperCase())}
                    placeholder="Enter code"
                    disabled={!!promoApplied}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={applyPromoCode}
                    disabled={!!promoApplied || !formData.promoCode}
                  >
                    Apply
                  </Button>
                </div>
                {promoApplied && (
                  <p className="text-sm text-primary mt-2">
                    ✓ Code "{promoApplied.code}" applied - {formatCurrency(promoApplied.discount)} off
                  </p>
                )}
              </div>

              <div className="space-y-2 border-t border-border pt-4">
                <div className="flex justify-between text-muted-foreground">
                  <span>Subtotal</span>
                  <span>{formatCurrency(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-primary">
                    <span>Discount</span>
                    <span>-{formatCurrency(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold pt-2">
                  <span>Total</span>
                  <span className="text-primary">{formatCurrency(finalTotal)}</span>
                </div>
                <p className="text-xs text-muted-foreground text-center pt-2">
                  All prices are in Kenyan Shillings (KSh)
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
