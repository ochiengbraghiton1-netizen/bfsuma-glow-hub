import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import { Loader2 } from 'lucide-react';

interface DailyRevenue {
  date: string;
  revenue: number;
  orders: number;
}

interface OrderStatus {
  name: string;
  value: number;
  color: string;
}

const COLORS = {
  pending: '#f59e0b',
  confirmed: '#3b82f6',
  processing: '#8b5cf6',
  shipped: '#06b6d4',
  delivered: '#10b981',
  cancelled: '#ef4444',
};

const DashboardCharts = () => {
  const [revenueData, setRevenueData] = useState<DailyRevenue[]>([]);
  const [orderStatusData, setOrderStatusData] = useState<OrderStatus[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        // Fetch orders for the last 30 days
        const thirtyDaysAgo = subDays(new Date(), 30);
        
        const { data: orders } = await supabase
          .from('orders')
          .select('total_amount, status, created_at')
          .gte('created_at', thirtyDaysAgo.toISOString());

        // Process daily revenue data
        const dailyData: Record<string, { revenue: number; orders: number }> = {};
        
        // Initialize all days
        for (let i = 29; i >= 0; i--) {
          const date = format(subDays(new Date(), i), 'MMM dd');
          dailyData[date] = { revenue: 0, orders: 0 };
        }

        // Aggregate order data
        const statusCounts: Record<string, number> = {};
        
        orders?.forEach((order) => {
          const date = format(new Date(order.created_at), 'MMM dd');
          if (dailyData[date]) {
            dailyData[date].revenue += Number(order.total_amount);
            dailyData[date].orders += 1;
          }
          
          statusCounts[order.status] = (statusCounts[order.status] || 0) + 1;
        });

        setRevenueData(
          Object.entries(dailyData).map(([date, data]) => ({
            date,
            revenue: data.revenue,
            orders: data.orders,
          }))
        );

        setOrderStatusData(
          Object.entries(statusCounts).map(([status, count]) => ({
            name: status.charAt(0).toUpperCase() + status.slice(1),
            value: count,
            color: COLORS[status as keyof typeof COLORS] || '#6b7280',
          }))
        );
      } catch (error) {
        console.error('Error fetching chart data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchChartData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
      </div>
    );
  }

  const totalRevenue = revenueData.reduce((sum, d) => sum + d.revenue, 0);
  const totalOrders = revenueData.reduce((sum, d) => sum + d.orders, 0);

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Revenue Chart - Takes 2 columns */}
      <div className="lg:col-span-2 bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--admin-text))]">Revenue Overview</h3>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">Last 30 days performance</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[hsl(var(--admin-accent))]">
              KES {totalRevenue.toLocaleString()}
            </span>
            <span className="text-sm text-[hsl(var(--admin-text-muted))]">total revenue</span>
          </div>
        </div>
        <div className="h-[280px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revenueGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(142, 76%, 36%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--admin-border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--admin-text-muted))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--admin-text-muted))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--admin-card))',
                  border: '1px solid hsl(var(--admin-border))',
                  borderRadius: '12px',
                  color: 'hsl(var(--admin-text))',
                }}
                formatter={(value: number) => [`KES ${value.toLocaleString()}`, 'Revenue']}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="hsl(142, 76%, 36%)"
                strokeWidth={2}
                fill="url(#revenueGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Order Status Pie Chart */}
      <div className="bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--admin-text))]">Order Status</h3>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">Distribution by status</p>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-[hsl(var(--admin-text))]">{totalOrders}</span>
            <span className="text-sm text-[hsl(var(--admin-text-muted))]">total orders</span>
          </div>
        </div>
        <div className="h-[200px]">
          {orderStatusData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={orderStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {orderStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--admin-card))',
                    border: '1px solid hsl(var(--admin-border))',
                    borderRadius: '12px',
                    color: 'hsl(var(--admin-text))',
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-[hsl(var(--admin-text-muted))]">
              No order data
            </div>
          )}
        </div>
        {/* Legend */}
        <div className="mt-4 space-y-2">
          {orderStatusData.map((status) => (
            <div key={status.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: status.color }}
                />
                <span className="text-[hsl(var(--admin-text-muted))]">{status.name}</span>
              </div>
              <span className="font-medium text-[hsl(var(--admin-text))]">{status.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Orders Bar Chart */}
      <div className="lg:col-span-3 bg-[hsl(var(--admin-card))] rounded-2xl border border-[hsl(var(--admin-border))] p-6">
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-[hsl(var(--admin-text))]">Daily Orders</h3>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">Number of orders per day</p>
        </div>
        <div className="h-[200px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={revenueData}>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="hsl(var(--admin-border))" 
                vertical={false}
              />
              <XAxis 
                dataKey="date" 
                stroke="hsl(var(--admin-text-muted))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                interval="preserveStartEnd"
              />
              <YAxis 
                stroke="hsl(var(--admin-text-muted))"
                fontSize={12}
                tickLine={false}
                axisLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--admin-card))',
                  border: '1px solid hsl(var(--admin-border))',
                  borderRadius: '12px',
                  color: 'hsl(var(--admin-text))',
                }}
                formatter={(value: number) => [value, 'Orders']}
              />
              <Bar 
                dataKey="orders" 
                fill="hsl(217, 91%, 60%)" 
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardCharts;
