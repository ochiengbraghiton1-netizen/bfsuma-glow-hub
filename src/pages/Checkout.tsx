import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, ShoppingBag, Loader2, CreditCard, Phone, CheckCircle } from 'lucide-react';
import { z } from 'zod';
import productGeneric from '@/assets/product-generic.jpg';

const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, 'Name must be at least 2 characters').max(100),
  customerEmail: z.string().trim().email('Invalid email address').max(255).optional().or(z.literal('')),
  customerPhone: z.string().trim().min(10, 'Phone number must be at least 10 digits').max(15),
  shippingAddress: z.string().trim().min(10, 'Please enter a complete address').max(500),
  notes: z.string().trim().max(500).optional(),
  promoCode: z.string().trim().max(50).optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

const Checkout = () => {
  const { items, totalPrice, clearCart } = useCart();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<CheckoutFormData>({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    shippingAddress: '',
    notes: '',
    promoCode: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof CheckoutFormData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoApplied, setPromoApplied] = useState<{ discount: number; code: string } | null>(null);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderId, setOrderId] = useState<string | null>(null);

  const subtotal = totalPrice;
  const discount = promoApplied?.discount || 0;
  const finalTotal = subtotal - discount;

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

      // Check usage limit
      if (promo.usage_limit && promo.usage_count >= promo.usage_limit) {
        toast({
          title: 'Code Expired',
          description: 'This promo code has reached its usage limit.',
          variant: 'destructive',
        });
        return;
      }

      // Check minimum order amount
      if (promo.min_order_amount && subtotal < Number(promo.min_order_amount)) {
        toast({
          title: 'Minimum Not Met',
          description: `Minimum order amount of KES ${Number(promo.min_order_amount).toLocaleString()} required.`,
          variant: 'destructive',
        });
        return;
      }

      // Calculate discount
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
        description: `You saved KES ${discountAmount.toLocaleString()}`,
      });
    } catch (error) {
      console.error('Error applying promo:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
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
      toast({
        title: 'Cart Empty',
        description: 'Please add items to your cart before checkout.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create order
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
          customer_name: formData.customerName,
          customer_email: formData.customerEmail || null,
          customer_phone: formData.customerPhone,
          shipping_address: formData.shippingAddress,
          notes: formData.notes || null,
          promotion_code: promoApplied?.code || null,
          subtotal: subtotal,
          discount_amount: discount,
          total_amount: finalTotal,
          status: 'pending',
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = items.map(item => ({
        order_id: order.id,
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

      // Update product stock quantities atomically using database function
      for (const item of items) {
        const { data: stockResult, error: stockError } = await supabase
          .rpc('decrement_stock', { p_product_id: item.id, p_quantity: item.quantity });
        
        if (stockError) {
          console.error('Stock decrement error:', stockError);
        }
        // Note: stockResult will be false if insufficient stock, but we continue
        // since the order is already placed - this prevents race condition overselling
      }

      setOrderId(order.id);
      setOrderComplete(true);
      clearCart();

      toast({
        title: 'Order Placed!',
        description: 'Your order has been received. We will contact you shortly.',
      });
    } catch (error) {
      console.error('Order error:', error);
      toast({
        title: 'Order Failed',
        description: 'There was an error placing your order. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="max-w-md w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
            <CheckCircle className="h-10 w-10 text-primary" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your order. We've received it and will contact you shortly to arrange delivery and payment via M-Pesa.
          </p>
          {orderId && (
            <p className="text-sm text-muted-foreground">
              Order ID: <span className="font-mono text-foreground">{orderId.slice(0, 8).toUpperCase()}</span>
            </p>
          )}
          <div className="pt-4">
            <Button onClick={() => navigate('/')} className="w-full">
              Continue Shopping
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
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
      {/* Header */}
      <header className="border-b border-border bg-background/80 backdrop-blur-md sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center">
          <Button variant="ghost" onClick={() => navigate('/')} className="gap-2">
            <ArrowLeft className="h-4 w-4" /> Back to Shop
          </Button>
          <span className="ml-auto text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            BF SUMA
          </span>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Checkout</h1>
        
        <div className="grid lg:grid-cols-2 gap-8">
          {/* Customer Form */}
          <div className="space-y-6">
            <div className="bg-card rounded-2xl border border-border p-6">
              <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
                <Phone className="h-5 w-5 text-primary" />
                Contact Information
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
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
                    <Input
                      id="customerPhone"
                      value={formData.customerPhone}
                      onChange={(e) => handleInputChange('customerPhone', e.target.value)}
                      placeholder="0712345678"
                      className={errors.customerPhone ? 'border-destructive' : ''}
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

                {/* Payment Method */}
                <div className="pt-4 border-t border-border">
                  <h3 className="font-semibold mb-3 flex items-center gap-2">
                    <CreditCard className="h-5 w-5 text-primary" />
                    Payment Method
                  </h3>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center">
                        <span className="text-white font-bold text-xs">M-PESA</span>
                      </div>
                      <div>
                        <p className="font-medium">M-Pesa Payment</p>
                        <p className="text-sm text-muted-foreground">
                          Pay on delivery or via M-Pesa prompt
                        </p>
                      </div>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    You will receive an M-Pesa payment request after order confirmation.
                  </p>
                </div>

                <Button 
                  type="submit" 
                  variant="premium" 
                  size="lg" 
                  className="w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Placing Order...
                    </>
                  ) : (
                    `Place Order - KES ${finalTotal.toLocaleString()}`
                  )}
                </Button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
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
                        KES {(item.price * item.quantity).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Promo Code */}
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
                    ✓ Code "{promoApplied.code}" applied
                  </p>
                )}
              </div>

              {/* Totals */}
              <div className="border-t border-border pt-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>KES {subtotal.toLocaleString()}</span>
                </div>
                {promoApplied && (
                  <div className="flex justify-between text-sm text-primary">
                    <span>Discount</span>
                    <span>-KES {discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Delivery</span>
                  <span className="text-muted-foreground">Calculated at confirmation</span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-border">
                  <span>Total</span>
                  <span className="text-primary">KES {finalTotal.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Checkout;
