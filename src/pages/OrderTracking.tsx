import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Loader2, Search, Package, Truck, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

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
  updated_at: string;
}

const statusConfig: Record<string, { icon: typeof Package; color: string; label: string }> = {
  pending: { icon: Clock, color: 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20', label: 'Pending' },
  confirmed: { icon: Package, color: 'bg-blue-500/10 text-blue-500 border-blue-500/20', label: 'Confirmed' },
  processing: { icon: Package, color: 'bg-purple-500/10 text-purple-500 border-purple-500/20', label: 'Processing' },
  shipped: { icon: Truck, color: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20', label: 'Shipped' },
  delivered: { icon: CheckCircle, color: 'bg-green-500/10 text-green-500 border-green-500/20', label: 'Delivered' },
  cancelled: { icon: XCircle, color: 'bg-red-500/10 text-red-500 border-red-500/20', label: 'Cancelled' },
};

const OrderTracking = () => {
  const [searchValue, setSearchValue] = useState('');
  const [searchType, setSearchType] = useState<'phone' | 'order_id'>('phone');
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<Record<string, OrderItem[]>>({});
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const { toast } = useToast();

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast({ title: 'Error', description: 'Please enter a search value', variant: 'destructive' });
      return;
    }

    setLoading(true);
    setSearched(true);

    let query = supabase.from('orders').select('*');

    if (searchType === 'phone') {
      query = query.eq('customer_phone', searchValue.trim());
    } else {
      query = query.eq('id', searchValue.trim());
    }

    const { data: ordersData, error } = await query.order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to search orders', variant: 'destructive' });
      setOrders([]);
      setLoading(false);
      return;
    }

    setOrders(ordersData || []);

    // Fetch order items for each order
    if (ordersData && ordersData.length > 0) {
      const itemsMap: Record<string, OrderItem[]> = {};
      
      for (const order of ordersData) {
        const { data: items } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', order.id);
        
        if (items) {
          itemsMap[order.id] = items;
        }
      }
      
      setOrderItems(itemsMap);
    }

    setLoading(false);
  };

  const getStatusProgress = (status: string): number => {
    const progressMap: Record<string, number> = {
      pending: 0,
      confirmed: 25,
      processing: 50,
      shipped: 75,
      delivered: 100,
      cancelled: 0,
    };
    return progressMap[status] || 0;
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />
      
      <main className="flex-1 container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto space-y-8">
          {/* Header */}
          <div className="space-y-2">
            <Link to="/" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Home
            </Link>
            <h1 className="text-3xl font-bold">Track Your Order</h1>
            <p className="text-muted-foreground">
              Enter your phone number or order ID to check your order status
            </p>
          </div>

          {/* Search Card */}
          <Card>
            <CardHeader>
              <CardTitle>Order Search</CardTitle>
              <CardDescription>Find your order by phone number or order ID</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-4">
                <Button
                  variant={searchType === 'phone' ? 'default' : 'outline'}
                  onClick={() => setSearchType('phone')}
                  className="flex-1"
                >
                  By Phone Number
                </Button>
                <Button
                  variant={searchType === 'order_id' ? 'default' : 'outline'}
                  onClick={() => setSearchType('order_id')}
                  className="flex-1"
                >
                  By Order ID
                </Button>
              </div>
              
              <div className="space-y-2">
                <Label>{searchType === 'phone' ? 'Phone Number' : 'Order ID'}</Label>
                <div className="flex gap-2">
                  <Input
                    placeholder={searchType === 'phone' ? 'e.g., 0712345678' : 'Enter your order ID'}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  />
                  <Button onClick={handleSearch} disabled={loading}>
                    {loading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Search className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {searched && (
            <>
              {orders.length === 0 ? (
                <Card>
                  <CardContent className="py-12 text-center">
                    <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <h3 className="text-lg font-semibold mb-2">No Orders Found</h3>
                    <p className="text-muted-foreground">
                      We couldn't find any orders matching your search. Please check your {searchType === 'phone' ? 'phone number' : 'order ID'} and try again.
                    </p>
                  </CardContent>
                </Card>
              ) : (
                <div className="space-y-6">
                  <h2 className="text-xl font-semibold">Found {orders.length} Order{orders.length > 1 ? 's' : ''}</h2>
                  
                  {orders.map((order) => {
                    const StatusIcon = statusConfig[order.status]?.icon || Package;
                    const statusColor = statusConfig[order.status]?.color || '';
                    const progress = getStatusProgress(order.status);
                    
                    return (
                      <Card key={order.id}>
                        <CardHeader>
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                              <CardTitle className="flex items-center gap-2">
                                <StatusIcon className="h-5 w-5" />
                                Order #{order.id.slice(0, 8).toUpperCase()}
                              </CardTitle>
                              <CardDescription>
                                Placed on {format(new Date(order.created_at), 'MMMM d, yyyy \'at\' h:mm a')}
                              </CardDescription>
                            </div>
                            <Badge variant="outline" className={statusColor}>
                              {statusConfig[order.status]?.label || order.status}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                          {/* Progress Bar */}
                          {order.status !== 'cancelled' && (
                            <div className="space-y-2">
                              <div className="flex justify-between text-sm">
                                <span>Order Progress</span>
                                <span>{progress}%</span>
                              </div>
                              <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-primary transition-all duration-500"
                                  style={{ width: `${progress}%` }}
                                />
                              </div>
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Pending</span>
                                <span>Confirmed</span>
                                <span>Processing</span>
                                <span>Shipped</span>
                                <span>Delivered</span>
                              </div>
                            </div>
                          )}

                          <Separator />

                          {/* Order Items */}
                          <div>
                            <h4 className="font-semibold mb-3">Order Items</h4>
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
                          </div>

                          <Separator />

                          {/* Order Summary */}
                          <div className="space-y-2">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Subtotal</span>
                              <span>KSh {order.subtotal.toLocaleString()}</span>
                            </div>
                            {order.discount_amount > 0 && (
                              <div className="flex justify-between text-green-600">
                                <span>Discount {order.promotion_code && `(${order.promotion_code})`}</span>
                                <span>-KSh {order.discount_amount.toLocaleString()}</span>
                              </div>
                            )}
                            <div className="flex justify-between font-semibold text-lg">
                              <span>Total</span>
                              <span>KSh {order.total_amount.toLocaleString()}</span>
                            </div>
                          </div>

                          <Separator />

                          {/* Delivery Info */}
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            <div>
                              <p className="text-muted-foreground">Customer</p>
                              <p className="font-medium">{order.customer_name}</p>
                              <p>{order.customer_phone}</p>
                              {order.customer_email && <p>{order.customer_email}</p>}
                            </div>
                            {order.shipping_address && (
                              <div>
                                <p className="text-muted-foreground">Shipping Address</p>
                                <p className="font-medium">{order.shipping_address}</p>
                              </div>
                            )}
                          </div>

                          {order.notes && (
                            <>
                              <Separator />
                              <div>
                                <p className="text-muted-foreground text-sm">Order Notes</p>
                                <p className="text-sm">{order.notes}</p>
                              </div>
                            </>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default OrderTracking;
