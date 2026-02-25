import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Link as LinkIcon,
  MousePointer,
  ShoppingCart,
  Copy,
  LogOut,
  Home,
  Loader2,
  TrendingUp,
  Calendar,
  ExternalLink,
  Zap,
  Plus,
} from 'lucide-react';

interface PVLog {
  id: string;
  product_id: string | null;
  pv_value: number;
  order_id: string | null;
  referral_type: string;
  created_at: string;
  product_name?: string;
}

interface ProductOption {
  id: string;
  name: string;
  pv_value: number;
}

interface AffiliateLink {
  id: string;
  slug: string;
  product_id: string;
  click_count: number;
  is_active: boolean;
  product_name?: string;
}

const DistributorDashboard = () => {
  const { user, signOut, isDistributor, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [totalPV, setTotalPV] = useState(0);
  const [totalConversions, setTotalConversions] = useState(0);
  const [totalClicks, setTotalClicks] = useState(0);
  const [pvLogs, setPVLogs] = useState<PVLog[]>([]);
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [selectedProduct, setSelectedProduct] = useState('');
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (!authLoading && user && !isDistributor) {
      navigate('/account');
    } else if (user && isDistributor) {
      fetchDashboardData();
    }
  }, [user, authLoading, isDistributor]);

  const fetchDashboardData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      // Fetch PV summary
      const { data: pvSummary } = await supabase
        .rpc('get_distributor_pv_summary', { p_distributor_id: user.id });

      if (pvSummary && pvSummary.length > 0) {
        setTotalPV(Number(pvSummary[0].total_pv) || 0);
        setTotalConversions(Number(pvSummary[0].total_conversions) || 0);
      }

      // Fetch PV logs
      const { data: logs } = await supabase
        .from('distributor_pv_logs')
        .select('*')
        .eq('distributor_id', user.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (logs) {
        // Enrich with product names
        const productIds = [...new Set(logs.filter(l => l.product_id).map(l => l.product_id!))];
        let productMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: prods } = await supabase
            .from('products')
            .select('id, name')
            .in('id', productIds);
          prods?.forEach(p => { productMap[p.id] = p.name; });
        }
        setPVLogs(logs.map(l => ({
          ...l,
          product_name: l.product_id ? productMap[l.product_id] || 'Unknown' : 'N/A',
        })));
      }

      // Fetch affiliate links for this distributor
      const { data: affData } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (affData) {
        const { data: links } = await supabase
          .from('product_affiliate_links')
          .select('*')
          .eq('affiliate_id', affData.id)
          .eq('is_active', true);

        if (links) {
          const linkProductIds = [...new Set(links.map(l => l.product_id))];
          let linkProductMap: Record<string, string> = {};
          if (linkProductIds.length > 0) {
            const { data: prods } = await supabase
              .from('products')
              .select('id, name')
              .in('id', linkProductIds);
            prods?.forEach(p => { linkProductMap[p.id] = p.name; });
          }
          setAffiliateLinks(links.map(l => ({
            ...l,
            product_name: linkProductMap[l.product_id] || 'Unknown',
          })));
          setTotalClicks(links.reduce((sum, l) => sum + (l.click_count || 0), 0));
        }
      }

      // Fetch products for link generation
      const { data: allProducts } = await supabase
        .from('products')
        .select('id, name, pv_value')
        .eq('is_active', true)
        .order('name');
      
      if (allProducts) {
        setProducts(allProducts.map(p => ({ ...p, pv_value: Number(p.pv_value) || 0 })));
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const generateLink = async () => {
    if (!user || !selectedProduct) return;
    setGenerating(true);
    try {
      // Check if affiliate record exists, create if not
      let { data: affData } = await supabase
        .from('affiliates')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (!affData) {
        // Create affiliate record for this distributor
        const { data: newAff, error: affErr } = await supabase
          .from('affiliates')
          .insert({
            user_id: user.id,
            referral_code: user.id.substring(0, 8).toUpperCase(),
            name: user.user_metadata?.full_name || user.email,
            email: user.email,
            status: 'active',
          })
          .select('id')
          .single();
        if (affErr) throw affErr;
        affData = newAff;
      }

      // Get product details
      const product = products.find(p => p.id === selectedProduct);
      if (!product) return;

      // Generate slug
      const productSlug = product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      const agentCode = user.id.substring(0, 6).toUpperCase();
      const slug = `${productSlug}-${agentCode}`;

      // Check if link already exists
      const { data: existing } = await supabase
        .from('product_affiliate_links')
        .select('id, slug')
        .eq('affiliate_id', affData!.id)
        .eq('product_id', selectedProduct)
        .maybeSingle();

      if (existing) {
        const linkUrl = `https://bfsumaroyal.com/p/${existing.slug}`;
        navigator.clipboard.writeText(linkUrl);
        toast({
          title: 'Link already exists!',
          description: 'Link copied to clipboard.',
        });
        return;
      }

      const { error: linkErr } = await supabase
        .from('product_affiliate_links')
        .insert({
          product_id: selectedProduct,
          affiliate_id: affData!.id,
          slug,
          agent_code: agentCode,
          assigned_to: user.user_metadata?.full_name || user.email,
        });

      if (linkErr) throw linkErr;

      const linkUrl = `https://bfsumaroyal.com/p/${slug}`;
      navigator.clipboard.writeText(linkUrl);
      toast({
        title: 'Link Generated!',
        description: 'Your product link has been copied to clipboard.',
      });

      setSelectedProduct('');
      fetchDashboardData();
    } catch (error) {
      console.error('Error generating link:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate link',
        variant: 'destructive',
      });
    } finally {
      setGenerating(false);
    }
  };

  const copyLink = (slug: string) => {
    navigator.clipboard.writeText(`https://bfsumaroyal.com/p/${slug}`);
    toast({ title: 'Copied!', description: 'Link copied to clipboard' });
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Checking access...</span>
      </div>
    );
  }

  if (!user) {
    return null; // useEffect will redirect to /auth
  }

  if (!isDistributor) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 p-8">
          <h2 className="text-xl font-bold">Access Denied</h2>
          <p className="text-muted-foreground">You need a distributor role to access this dashboard.</p>
          <Button onClick={() => navigate('/account')}>Go to Account</Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="ml-3 text-muted-foreground">Loading dashboard...</span>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card sticky top-0 z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
              <TrendingUp className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <span className="font-bold text-lg">BF SUMA</span>
              <p className="text-xs text-muted-foreground">Distributor Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="ghost" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" /> Home
            </Button>
            <Button variant="ghost" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Welcome */}
        <div>
          <h1 className="text-3xl font-bold">Welcome, Distributor!</h1>
          <p className="text-muted-foreground">Track your PV (Point Value) and manage your product links</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <Zap className="h-4 w-4" />
                <span className="text-sm">Total PV</span>
              </div>
              <p className="text-3xl font-bold text-primary">{totalPV.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MousePointer className="h-4 w-4" />
                <span className="text-sm">Total Clicks</span>
              </div>
              <p className="text-3xl font-bold">{totalClicks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Total Conversions</span>
              </div>
              <p className="text-3xl font-bold">{totalConversions}</p>
            </CardContent>
          </Card>
        </div>

        {/* Generate Link */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5 text-primary" />
              Generate Product Link
            </CardTitle>
            <CardDescription>Select a product to generate your unique tracking link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Select a product..." />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} ({product.pv_value} PV)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Button onClick={generateLink} disabled={!selectedProduct || generating} className="gap-2">
                {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
                Generate Link
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Active Links */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5" />
              Your Product Links
            </CardTitle>
          </CardHeader>
          <CardContent>
            {affiliateLinks.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No links yet. Generate one above!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>Clicks</TableHead>
                    <TableHead>Link</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {affiliateLinks.map((link) => (
                    <TableRow key={link.id}>
                      <TableCell className="font-medium">{link.product_name}</TableCell>
                      <TableCell>{link.click_count}</TableCell>
                      <TableCell className="text-sm text-muted-foreground truncate max-w-[200px]">
                        bfsumaroyal.com/p/{link.slug}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="sm" onClick={() => copyLink(link.slug)}>
                          <Copy className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* PV History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              PV History
            </CardTitle>
            <CardDescription>Your point value accumulation from confirmed conversions</CardDescription>
          </CardHeader>
          <CardContent>
            {pvLogs.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Zap className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No PV recorded yet. Share your links to start earning PV!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>PV</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pvLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-medium">{log.product_name}</TableCell>
                      <TableCell>
                        <Badge className="bg-primary/20 text-primary border-primary/30">
                          +{log.pv_value} PV
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{log.referral_type}</Badge>
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(log.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tips */}
        <Card>
          <CardHeader>
            <CardTitle>Tips to Maximize Your PV</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Share your product links on social media</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Each product purchase through your link earns you PV</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Recommend products to friends and family for health benefits</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default DistributorDashboard;
