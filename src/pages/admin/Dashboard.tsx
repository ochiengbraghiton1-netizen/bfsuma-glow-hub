import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { 
  Package, 
  Calendar, 
  Users, 
  ShoppingCart, 
  TrendingUp, 
  TrendingDown,
  AlertCircle,
  Loader2,
  ArrowUpRight,
  Clock,
  DollarSign,
  Activity,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Stats {
  products: number;
  consultations: number;
  teamMembers: number;
  pendingConsultations: number;
  totalOrders: number;
  pendingOrders: number;
  lowStockProducts: number;
  totalRevenue: number;
}

interface RecentOrder {
  id: string;
  customer_name: string;
  total_amount: number;
  status: string;
  created_at: string;
}

interface RecentConsultation {
  id: string;
  client_name: string;
  client_phone: string;
  status: string;
  preferred_date: string | null;
}

const Dashboard = () => {
  const [stats, setStats] = useState<Stats>({
    products: 0,
    consultations: 0,
    teamMembers: 0,
    pendingConsultations: 0,
    totalOrders: 0,
    pendingOrders: 0,
    lowStockProducts: 0,
    totalRevenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [
          productsRes,
          consultationsRes,
          teamRes,
          pendingConsultRes,
          ordersRes,
          pendingOrdersRes,
          lowStockRes,
          revenueRes,
          recentOrdersRes,
          recentConsultRes,
        ] = await Promise.all([
          supabase.from('products').select('id', { count: 'exact', head: true }),
          supabase.from('consultations').select('id', { count: 'exact', head: true }),
          supabase.from('team_members').select('id', { count: 'exact', head: true }),
          supabase.from('consultations').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('orders').select('id', { count: 'exact', head: true }),
          supabase.from('orders').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
          supabase.from('products').select('id', { count: 'exact', head: true }).eq('track_inventory', true).lt('stock_quantity', 10),
          supabase.from('orders').select('total_amount').eq('status', 'delivered'),
          supabase.from('orders').select('id, customer_name, total_amount, status, created_at').order('created_at', { ascending: false }).limit(5),
          supabase.from('consultations').select('id, client_name, client_phone, status, preferred_date').order('created_at', { ascending: false }).limit(5),
        ]);

        const totalRevenue = revenueRes.data?.reduce((sum, order) => sum + Number(order.total_amount), 0) || 0;

        setStats({
          products: productsRes.count || 0,
          consultations: consultationsRes.count || 0,
          teamMembers: teamRes.count || 0,
          pendingConsultations: pendingConsultRes.count || 0,
          totalOrders: ordersRes.count || 0,
          pendingOrders: pendingOrdersRes.count || 0,
          lowStockProducts: lowStockRes.count || 0,
          totalRevenue,
        });

        setRecentOrders(recentOrdersRes.data || []);
        setRecentConsultations(recentConsultRes.data || []);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statCards = [
    {
      title: 'Total Revenue',
      value: `KES ${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      trend: '+12%',
      trendUp: true,
      color: 'from-emerald-500 to-emerald-600',
    },
    {
      title: 'Total Orders',
      value: stats.totalOrders,
      icon: ShoppingCart,
      subtitle: `${stats.pendingOrders} pending`,
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Products',
      value: stats.products,
      icon: Package,
      subtitle: stats.lowStockProducts > 0 ? `${stats.lowStockProducts} low stock` : 'All stocked',
      alert: stats.lowStockProducts > 0,
      color: 'from-violet-500 to-violet-600',
    },
    {
      title: 'Consultations',
      value: stats.consultations,
      icon: Calendar,
      subtitle: `${stats.pendingConsultations} pending`,
      color: 'from-amber-500 to-amber-600',
    },
    {
      title: 'Team Members',
      value: stats.teamMembers,
      icon: Users,
      color: 'from-rose-500 to-rose-600',
    },
    {
      title: 'Activity',
      value: 'Active',
      icon: Activity,
      subtitle: 'System healthy',
      color: 'from-cyan-500 to-cyan-600',
    },
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-amber-500/20 text-amber-400',
    confirmed: 'bg-blue-500/20 text-blue-400',
    processing: 'bg-violet-500/20 text-violet-400',
    shipped: 'bg-cyan-500/20 text-cyan-400',
    delivered: 'bg-emerald-500/20 text-emerald-400',
    cancelled: 'bg-red-500/20 text-red-400',
    completed: 'bg-emerald-500/20 text-emerald-400',
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--admin-text))]">Dashboard</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Overview of your business metrics</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-[hsl(var(--admin-text-muted))]">
          <Clock className="h-4 w-4" />
          Last updated: {format(new Date(), 'MMM d, h:mm a')}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {statCards.map((stat, index) => (
          <div
            key={stat.title}
            className="group relative bg-[hsl(var(--admin-card))] rounded-2xl p-5 border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-accent)_/_0.5)] transition-all duration-300 overflow-hidden"
          >
            {/* Gradient Glow Effect */}
            <div className={cn(
              "absolute inset-0 opacity-0 group-hover:opacity-10 transition-opacity duration-300 bg-gradient-to-br",
              stat.color
            )} />
            
            <div className="relative">
              <div className="flex items-start justify-between mb-3">
                <div className={cn(
                  "p-2.5 rounded-xl bg-gradient-to-br shadow-lg",
                  stat.color
                )}>
                  <stat.icon className="h-5 w-5 text-white" />
                </div>
                {stat.trend && (
                  <div className={cn(
                    "flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full",
                    stat.trendUp ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
                  )}>
                    {stat.trendUp ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                    {stat.trend}
                  </div>
                )}
                {stat.alert && (
                  <div className="p-1.5 rounded-full bg-amber-500/20">
                    <AlertCircle className="h-4 w-4 text-amber-400" />
                  </div>
                )}
              </div>
              
              <div className="text-2xl font-bold text-[hsl(var(--admin-text))] mb-1">
                {stat.value}
              </div>
              <div className="text-sm text-[hsl(var(--admin-text-muted))]">
                {stat.title}
              </div>
              {stat.subtitle && (
                <div className="text-xs text-[hsl(var(--admin-text-muted))] mt-1">
                  {stat.subtitle}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Orders */}
        <div className="bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] overflow-hidden">
          <div className="p-5 border-b border-[hsl(var(--admin-border))] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--admin-text))]">Recent Orders</h2>
              <p className="text-sm text-[hsl(var(--admin-text-muted))]">Latest customer orders</p>
            </div>
            <button className="flex items-center gap-1 text-sm text-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-glow))] transition-colors">
              View All <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            {recentOrders.length === 0 ? (
              <div className="p-8 text-center text-[hsl(var(--admin-text-muted))]">
                No orders yet
              </div>
            ) : (
              recentOrders.map((order) => (
                <div key={order.id} className="p-4 hover:bg-[hsl(var(--admin-card-hover))] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[hsl(var(--admin-text))]">{order.customer_name}</p>
                      <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                        {format(new Date(order.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-[hsl(var(--admin-text))]">
                        KES {Number(order.total_amount).toLocaleString()}
                      </p>
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        statusColors[order.status] || statusColors.pending
                      )}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Recent Consultations */}
        <div className="bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] overflow-hidden">
          <div className="p-5 border-b border-[hsl(var(--admin-border))] flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[hsl(var(--admin-text))]">Recent Consultations</h2>
              <p className="text-sm text-[hsl(var(--admin-text-muted))]">Latest consultation requests</p>
            </div>
            <button className="flex items-center gap-1 text-sm text-[hsl(var(--admin-accent))] hover:text-[hsl(var(--admin-accent-glow))] transition-colors">
              View All <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
          <div className="divide-y divide-[hsl(var(--admin-border))]">
            {recentConsultations.length === 0 ? (
              <div className="p-8 text-center text-[hsl(var(--admin-text-muted))]">
                No consultations yet
              </div>
            ) : (
              recentConsultations.map((consult) => (
                <div key={consult.id} className="p-4 hover:bg-[hsl(var(--admin-card-hover))] transition-colors">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-[hsl(var(--admin-text))]">{consult.client_name}</p>
                      <p className="text-sm text-[hsl(var(--admin-text-muted))]">{consult.client_phone}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                        {consult.preferred_date ? format(new Date(consult.preferred_date), 'MMM d') : 'No date'}
                      </p>
                      <span className={cn(
                        'inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize',
                        statusColors[consult.status] || statusColors.pending
                      )}>
                        {consult.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] p-6">
        <h2 className="text-lg font-semibold text-[hsl(var(--admin-text))] mb-4">Quick Actions</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { label: 'Add Product', icon: Package, href: '/admin/products' },
            { label: 'View Orders', icon: ShoppingCart, href: '/admin/orders' },
            { label: 'Manage Team', icon: Users, href: '/admin/team' },
            { label: 'Edit Content', icon: Calendar, href: '/admin/content' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex items-center gap-3 p-4 rounded-xl bg-[hsl(var(--admin-bg))] border border-[hsl(var(--admin-border))] hover:border-[hsl(var(--admin-accent)_/_0.5)] hover:bg-[hsl(var(--admin-card-hover))] transition-all duration-200 group"
            >
              <div className="p-2 rounded-lg bg-[hsl(var(--admin-accent)_/_0.2)] text-[hsl(var(--admin-accent))] group-hover:bg-[hsl(var(--admin-accent))] group-hover:text-white transition-colors">
                <action.icon className="h-5 w-5" />
              </div>
              <span className="font-medium text-[hsl(var(--admin-text))]">{action.label}</span>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
