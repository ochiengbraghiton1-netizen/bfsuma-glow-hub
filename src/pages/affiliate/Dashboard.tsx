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
  Link as LinkIcon,
  MousePointer,
  UserPlus,
  ShoppingCart,
  DollarSign,
  Copy,
  LogOut,
  Home,
  Loader2,
  TrendingUp,
  Calendar,
  ExternalLink,
} from 'lucide-react';

interface AffiliateData {
  id: string;
  referral_code: string;
  referral_url: string;
  status: string;
  commission_rate: number;
  total_clicks: number;
  total_signups: number;
  total_conversions: number;
  total_sales: number;
  total_commission: number;
  created_at: string;
}

interface Referral {
  id: string;
  referral_type: string;
  status: string;
  commission_amount: number;
  created_at: string;
  referred_user_id: string;
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const AffiliateDashboard = () => {
  const { user, signOut, isTeamMember, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const [affiliate, setAffiliate] = useState<AffiliateData | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    } else if (user) {
      fetchAffiliateData();
    }
  }, [user, authLoading]);

  const fetchAffiliateData = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data: affData, error: affError } = await supabase
        .from('affiliates' as any)
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (affError) throw affError;

      const rawAff = affData as unknown as AffiliateData | null;
      if (!rawAff) {
        toast({
          title: 'No Affiliate Account',
          description: 'Your affiliate account has not been set up yet',
          variant: 'destructive',
        });
        setLoading(false);
        return;
      }

      setAffiliate(rawAff);

      const { data: refData, error: refError } = await supabase
        .from('referrals' as any)
        .select('*')
        .eq('affiliate_id', rawAff.id)
        .order('created_at', { ascending: false })
        .limit(20);

      if (refError) throw refError;

      const rawRefs = refData as unknown as any[];
      const referralsWithProfiles: Referral[] = [];
      for (const ref of (rawRefs || [])) {
        if (ref.referred_user_id) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, email')
            .eq('user_id', ref.referred_user_id)
            .maybeSingle();
          
          referralsWithProfiles.push({ ...ref, profiles: profile || undefined } as Referral);
        } else {
          referralsWithProfiles.push(ref as Referral);
        }
      }

      setReferrals(referralsWithProfiles);
    } catch (error) {
      console.error('Error fetching affiliate data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load affiliate data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const copyLink = () => {
    if (affiliate) {
      navigator.clipboard.writeText(affiliate.referral_url);
      toast({
        title: 'Copied!',
        description: 'Referral link copied to clipboard',
      });
    }
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      case 'completed':
        return <Badge className="bg-green-500/20 text-green-600 border-green-500/30">Completed</Badge>;
      case 'cancelled':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'signup':
        return <Badge className="bg-blue-500/20 text-blue-600 border-blue-500/30">Sign-up</Badge>;
      case 'lead':
        return <Badge className="bg-purple-500/20 text-purple-600 border-purple-500/30">Lead</Badge>;
      case 'purchase':
        return <Badge className="bg-emerald-500/20 text-emerald-600 border-emerald-500/30">Purchase</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!affiliate) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader className="text-center">
            <CardTitle>No Affiliate Account</CardTitle>
            <CardDescription>
              Your affiliate account has not been set up yet. Please contact support.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex gap-2 justify-center">
            <Button variant="outline" onClick={() => navigate('/')}>
              <Home className="h-4 w-4 mr-2" /> Go Home
            </Button>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" /> Sign Out
            </Button>
          </CardContent>
        </Card>
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
              <TrendingUp className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="font-bold text-lg">BF SUMA</span>
              <p className="text-xs text-muted-foreground">Affiliate Dashboard</p>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Welcome back!</h1>
            <p className="text-muted-foreground">Track your referrals and earnings</p>
          </div>
          {affiliate.status === 'active' ? (
            <Badge className="bg-green-500/20 text-green-600 border-green-500/30 w-fit">
              Active Affiliate
            </Badge>
          ) : (
            <Badge variant="destructive" className="w-fit">
              Account {affiliate.status}
            </Badge>
          )}
        </div>

        {/* Referral Link Card */}
        <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <LinkIcon className="h-5 w-5 text-primary" />
              Your Referral Link
            </CardTitle>
            <CardDescription>
              Share this link to earn {affiliate.commission_rate}% commission on every sale
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                readOnly
                value={affiliate.referral_url}
                className="flex-1 bg-background"
              />
              <Button onClick={copyLink} className="gap-2">
                <Copy className="h-4 w-4" /> Copy Link
              </Button>
            </div>
            <p className="text-sm text-muted-foreground mt-2">
              Code: <code className="text-primary font-semibold">{affiliate.referral_code}</code>
            </p>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <MousePointer className="h-4 w-4" />
                <span className="text-sm">Clicks</span>
              </div>
              <p className="text-3xl font-bold">{affiliate.total_clicks || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <UserPlus className="h-4 w-4" />
                <span className="text-sm">Sign-ups</span>
              </div>
              <p className="text-3xl font-bold">{affiliate.total_signups || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <ShoppingCart className="h-4 w-4" />
                <span className="text-sm">Conversions</span>
              </div>
              <p className="text-3xl font-bold">{affiliate.total_conversions || 0}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <TrendingUp className="h-4 w-4" />
                <span className="text-sm">Total Sales</span>
              </div>
              <p className="text-2xl font-bold">KES {Number(affiliate.total_sales || 0).toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="bg-gradient-to-br from-primary/10 to-accent/10 border-primary/20">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2 text-muted-foreground mb-2">
                <DollarSign className="h-4 w-4" />
                <span className="text-sm">Commission</span>
              </div>
              <p className="text-2xl font-bold text-primary">
                KES {Number(affiliate.total_commission || 0).toLocaleString()}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Referrals */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Referrals
            </CardTitle>
            <CardDescription>Your latest sign-ups and conversions</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No referrals yet. Share your link to start earning!</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>User</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Commission</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {referrals.map((referral) => (
                    <TableRow key={referral.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{referral.profiles?.full_name || 'Anonymous'}</p>
                          <p className="text-sm text-muted-foreground">{referral.profiles?.email || '-'}</p>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(referral.referral_type)}</TableCell>
                      <TableCell>{getStatusBadge(referral.status)}</TableCell>
                      <TableCell>
                        {referral.commission_amount > 0
                          ? `KES ${Number(referral.commission_amount).toLocaleString()}`
                          : '-'}
                      </TableCell>
                      <TableCell className="text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card>
          <CardHeader>
            <CardTitle>Tips to Maximize Earnings</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 text-muted-foreground">
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Share your referral link on social media platforms</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Tell friends and family about BF SUMA products</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Include your link in your email signature</span>
              </li>
              <li className="flex items-start gap-2">
                <ExternalLink className="h-4 w-4 mt-1 text-primary" />
                <span>Create content around health and wellness featuring our products</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default AffiliateDashboard;
