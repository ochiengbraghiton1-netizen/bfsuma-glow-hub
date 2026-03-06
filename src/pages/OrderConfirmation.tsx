import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { CheckCircle, MessageCircle, Copy, ArrowLeft, Loader2, Phone, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

const WHATSAPP_NUMBER = "254795454053";
const WHATSAPP_DISPLAY = "+254 795 454 053";

const CURRENCY_SYMBOLS: Record<string, string> = {
  KES: 'KSh',
  USD: '$',
  EUR: '€',
  GBP: '£',
};

interface OrderItem {
  id: string;
  product_name: string;
  product_price: number;
  quantity: number;
  subtotal: number;
}

interface Order {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  shipping_address: string | null;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  promotion_code: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  currency: string;
}

const formatOrderId = (id: string) => `BF-${id.slice(0, 4).toUpperCase()}`;

const isMobileDevice = (): boolean => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
};

const OrderConfirmation = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!orderId) {
      navigate('/');
      return;
    }
    fetchOrder();
  }, [orderId]);

  const fetchOrder = async () => {
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId!)
      .maybeSingle();

    if (orderError || !orderData) {
      toast({ title: 'Order not found', variant: 'destructive' });
      navigate('/');
      return;
    }

    setOrder(orderData as Order);

    const { data: items } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId!);

    setOrderItems(items || []);
    setLoading(false);
  };

  const formatAmount = (amount: number) => {
    const cur = order?.currency || 'KES';
    const symbol = CURRENCY_SYMBOLS[cur] || cur;
    return `${symbol} ${amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const generateWhatsAppMessage = () => {
    if (!order) return '';
    const shortId = formatOrderId(order.id);
    const productNames = orderItems.map(i => `${i.product_name} x${i.quantity}`).join(', ');
    return encodeURIComponent(
      `Hello BF Suma, I am confirming Order #${shortId} for ${productNames}. My name is ${order.customer_name}. Phone: ${order.customer_phone}. Total: ${formatAmount(order.total_amount)}.`
    );
  };

  const handleWhatsAppConfirm = async () => {
    if (!order) return;

    await supabase
      .from('orders')
      .update({ status: 'whatsapp_initiated' })
      .eq('id', order.id);

    setOrder(prev => prev ? { ...prev, status: 'whatsapp_initiated' } : null);

    const message = generateWhatsAppMessage();
    const url = isMobileDevice()
      ? `https://wa.me/${WHATSAPP_NUMBER}?text=${message}`
      : `https://web.whatsapp.com/send?phone=${WHATSAPP_NUMBER}&text=${message}`;

    window.open(url, '_blank');
  };

  const copyPhoneNumber = () => {
    navigator.clipboard.writeText(`+${WHATSAPP_NUMBER}`);
    setCopied(true);
    toast({ title: 'Phone number copied!' });
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!order) return null;

  const shortId = formatOrderId(order.id);

  const statusLabel: Record<string, string> = {
    pending_whatsapp: 'Awaiting WhatsApp Confirmation',
    pending_payment: 'Pending Payment',
    whatsapp_initiated: 'WhatsApp Opened',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
    pending: 'Awaiting WhatsApp Confirmation',
    paid: 'Paid via PayPal',
  };

  const statusColor: Record<string, string> = {
    pending_whatsapp: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    pending_payment: 'bg-orange-500/10 text-orange-600 border-orange-500/20',
    whatsapp_initiated: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
    confirmed: 'bg-green-500/10 text-green-600 border-green-500/20',
    completed: 'bg-green-500/10 text-green-600 border-green-500/20',
    cancelled: 'bg-red-500/10 text-red-600 border-red-500/20',
    pending: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
    paid: 'bg-green-500/10 text-green-600 border-green-500/20',
  };

  const isPaid = order.status === 'paid';

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto space-y-6">
          <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Home
          </Link>

          <div className="text-center space-y-4">
            <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
            <h1 className="text-2xl font-bold">
              {isPaid ? 'Payment Successful!' : 'Order Created Successfully!'}
            </h1>
            <p className="text-muted-foreground max-w-md mx-auto">
              {isPaid
                ? 'Your payment has been received. We will process your order and arrange delivery shortly.'
                : 'Your order has been created successfully. To complete your order, please confirm via WhatsApp.'}
            </p>
          </div>

          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Order ID</p>
                  <p className="text-xl font-bold font-mono">{shortId}</p>
                </div>
                <Badge variant="outline" className={statusColor[order.status] || statusColor.pending}>
                  {statusLabel[order.status] || order.status}
                </Badge>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{order.customer_name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Date</span>
                  <span>{format(new Date(order.created_at), 'MMM d, yyyy h:mm a')}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Currency</span>
                  <span className="font-medium">{order.currency}</span>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <p className="font-semibold text-sm">Items</p>
                {orderItems.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.product_name} × {item.quantity}</span>
                    <span>{formatAmount(item.subtotal)}</span>
                  </div>
                ))}
              </div>

              <Separator />

              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span>{formatAmount(order.subtotal)}</span>
                </div>
                {order.discount_amount > 0 && (
                  <div className="flex justify-between text-sm text-green-600">
                    <span>Discount {order.promotion_code && `(${order.promotion_code})`}</span>
                    <span>-{formatAmount(order.discount_amount)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-1">
                  <span>Total</span>
                  <span>{formatAmount(order.total_amount)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {!isPaid && (
            <Card className="border-green-200 dark:border-green-800 bg-green-50/50 dark:bg-green-950/20">
              <CardContent className="p-6 space-y-4">
                <div className="text-center space-y-2">
                  <MessageCircle className="h-8 w-8 mx-auto text-green-600" />
                  <h2 className="text-lg font-semibold">Confirm Your Order on WhatsApp</h2>
                  <p className="text-sm text-muted-foreground">
                    Click the button below to send your order details via WhatsApp.
                  </p>
                </div>

                <Button
                  onClick={handleWhatsAppConfirm}
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                  size="lg"
                >
                  <MessageCircle className="h-5 w-5 mr-2" />
                  Confirm on WhatsApp
                  <ExternalLink className="h-4 w-4 ml-2" />
                </Button>

                <Separator />

                <div className="text-center space-y-3">
                  <p className="text-sm text-muted-foreground">
                    If WhatsApp does not open, please message us manually:
                  </p>
                  <div className="flex items-center justify-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    <span className="font-mono font-medium">{WHATSAPP_DISPLAY}</span>
                    <Button variant="outline" size="sm" onClick={copyPhoneNumber}>
                      <Copy className="h-3 w-3 mr-1" />
                      {copied ? 'Copied!' : 'Copy'}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="flex-1" onClick={() => navigate('/')}>
              Continue Shopping
            </Button>
            <Button variant="outline" className="flex-1" onClick={() => navigate('/order-tracking')}>
              Track Order
            </Button>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default OrderConfirmation;
