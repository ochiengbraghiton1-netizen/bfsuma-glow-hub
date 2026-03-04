import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Loader2, Package, ShoppingBag, Truck, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import OrderTimeline from '@/components/OrderTimeline';
import { format } from 'date-fns';
import { Helmet } from 'react-helmet-async';

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
  status: string;
  subtotal: number;
  discount_amount: number;
  total_amount: number;
  promotion_code: string | null;
  notes: string | null;
  created_at: string;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending' },
  pending_whatsapp: { icon: Clock, color: 'bg-orange-500/10 text-orange-500 border-orange-500/20', label: 'Pending (WhatsApp)' },
  whatsapp_initiated: { icon: Package, color: 'bg-amber-500/10 text-amber-500 border-amber-500/20', label: 'WhatsApp Sent' },
  paid: { icon: CheckCircle, color: 'bg-purple-500/10 text-purple-600 border-purple-500/20', label: 'Paid (PayPal)' },
  confirmed: { icon: Package, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Confirmed' },
  processing: { icon: Package, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Processing' },
  shipped: { icon: Truck, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Delivered' },
  completed: { icon: CheckCircle, color: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20', label: 'Completed' },
  cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

const MyOrders = () => {
  const { user, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchOrders();
    }
  }, [user, authLoading]);

  const fetchOrders = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders(ordersData || []);

      if (ordersData && ordersData.length > 0) {
        const itemsMap: Record<string, OrderItem[]> = {};
        for (const order of ordersData) {
          const { data: items } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', order.id);
          if (items) itemsMap[order.id] = items;
        }
        setOrderItems(itemsMap);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      toast({ title: 'Error', description: 'Failed to load orders', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <Helmet>
        <title>My Orders - BF SUMA ROYAL</title>
        <meta name="robots" content="noindex" />
      </Helmet>
      <main className="flex-1 pt-24 pb-16 px-4 md:px-8">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="space-y-2">
            <Link to="/account" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Account
            </Link>
            <h1 className="text-3xl font-bold">My Orders</h1>
          </div>

          {orders.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Orders Yet</h3>
                <p className="text-muted-foreground mb-6">You haven't placed any orders yet.</p>
                <Button asChild>
                  <Link to="/#products">Browse Products</Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => {
                const StatusIcon = statusConfig[order.status]?.icon || Package;
                const statusColor = statusConfig[order.status]?.color || '';

                return (
                  <Card key={order.id}>
                    <CardHeader>
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                          <CardTitle className="flex items-center gap-2 text-base">
                            <StatusIcon className="h-5 w-5" />
                            Order #{order.id.slice(0, 8).toUpperCase()}
                          </CardTitle>
                          <CardDescription>
                            {format(new Date(order.created_at), 'MMMM d, yyyy')}
                          </CardDescription>
                        </div>
                        <Badge variant="outline" className={statusColor}>
                          {statusConfig[order.status]?.label || order.status}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {/* Order Progress Timeline */}
                      <OrderTimeline status={order.status} />
                      <div className="space-y-2">
                        {(orderItems[order.id] || []).map((item) => (
                          <div key={item.id} className="flex justify-between items-center py-2 border-b last:border-0">
                            <div>
                              <p className="font-medium">{item.product_name}</p>
                              <p className="text-sm text-muted-foreground">
                                Qty: {item.quantity} × KSh {item.product_price.toLocaleString()}
                              </p>
                            </div>
                            <p className="font-medium">KSh {item.subtotal.toLocaleString()}</p>
                          </div>
                        ))}
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold">
                        <span>Total</span>
                        <span>KSh {order.total_amount.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyOrders;
