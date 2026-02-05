import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SITE_BASE_URL } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Users, 
  Search, 
  MoreVertical, 
  Eye, 
  Ban, 
  CheckCircle, 
  XCircle,
  Link as LinkIcon,
  MousePointer,
  UserPlus,
  ShoppingCart,
  DollarSign,
  Copy,
  TrendingUp,
  Loader2,
} from 'lucide-react';

interface Affiliate {
  id: string;
  user_id: string;
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
  profiles?: {
    full_name: string | null;
    email: string | null;
  };
}

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const { data: affData, error: affError } = await supabase
        .from('affiliates' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (affError) throw affError;

      const rawData = affData as unknown as any[];
      const affiliatesWithProfiles: Affiliate[] = [];
      for (const aff of (rawData || [])) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name, email')
          .eq('user_id', aff.user_id)
          .maybeSingle();
        
        affiliatesWithProfiles.push({
          ...aff,
          profiles: profile || undefined,
        } as Affiliate);
      }

      setAffiliates(affiliatesWithProfiles);
    } catch (error) {
      console.error('Error fetching affiliates:', error);
      toast({
        title: 'Error',
        description: 'Failed to load affiliates',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (affiliateId: string, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('affiliates' as any)
        .update({ status: newStatus })
        .eq('id', affiliateId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Affiliate ${newStatus === 'active' ? 'activated' : newStatus === 'suspended' ? 'suspended' : 'revoked'}`,
      });

      fetchAffiliates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update affiliate status',
        variant: 'destructive',
      });
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({
      title: 'Copied!',
      description: 'Referral link copied to clipboard',
    });
  };

  const getAffiliateLink = (affiliate: Affiliate): string => {
    // Always construct link using correct production base URL
    return `${SITE_BASE_URL}/?ref=${affiliate.referral_code}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Suspended</Badge>;
      case 'revoked':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Revoked</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.referral_code.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.profiles?.full_name?.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.profiles?.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Calculate totals
  const totals = affiliates.reduce(
    (acc, aff) => ({
      clicks: acc.clicks + (aff.total_clicks || 0),
      signups: acc.signups + (aff.total_signups || 0),
      conversions: acc.conversions + (aff.total_conversions || 0),
      sales: acc.sales + Number(aff.total_sales || 0),
      commission: acc.commission + Number(aff.total_commission || 0),
    }),
    { clicks: 0, signups: 0, conversions: 0, sales: 0, commission: 0 }
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--admin-text))]">Affiliates</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage affiliate partners and track performance</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <MousePointer className="h-4 w-4" />
            <span className="text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{totals.clicks.toLocaleString()}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <UserPlus className="h-4 w-4" />
            <span className="text-sm">Sign-ups</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{totals.signups.toLocaleString()}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <ShoppingCart className="h-4 w-4" />
            <span className="text-sm">Conversions</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{totals.conversions.toLocaleString()}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <TrendingUp className="h-4 w-4" />
            <span className="text-sm">Total Sales</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">KES {totals.sales.toLocaleString()}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <DollarSign className="h-4 w-4" />
            <span className="text-sm">Commissions</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">KES {totals.commission.toLocaleString()}</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
          <Input
            placeholder="Search affiliates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
          />
        </div>
        <div className="flex gap-2">
          {['all', 'active', 'suspended', 'revoked'].map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? 'default' : 'outline'}
              size="sm"
              onClick={() => setStatusFilter(status)}
              className={statusFilter === status ? '' : 'bg-transparent border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text-muted))]'}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
          </div>
        ) : filteredAffiliates.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--admin-text-muted))]">
            <Users className="h-12 w-12 mb-4 opacity-50" />
            <p>No affiliates found</p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--admin-border))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Affiliate</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Code</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Status</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Clicks</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Sign-ups</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Sales</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Commission</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.map((affiliate) => (
                <TableRow key={affiliate.id} className="border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-card-hover))]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-[hsl(var(--admin-text))]">
                        {affiliate.profiles?.full_name || 'Unknown'}
                      </p>
                      <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                        {affiliate.profiles?.email || '-'}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-[hsl(var(--admin-accent))]">{affiliate.referral_code}</code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyLink(getAffiliateLink(affiliate))}
                        title="Copy affiliate link"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(affiliate.status)}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">{affiliate.total_clicks || 0}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">{affiliate.total_signups || 0}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">
                    KES {Number(affiliate.total_sales || 0).toLocaleString()}
                  </TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">
                    KES {Number(affiliate.total_commission || 0).toLocaleString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                        <DropdownMenuItem
                          onClick={() => {
                            setSelectedAffiliate(affiliate);
                            setDetailsOpen(true);
                          }}
                          className="cursor-pointer"
                        >
                          <Eye className="h-4 w-4 mr-2" /> View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => copyLink(getAffiliateLink(affiliate))}
                          className="cursor-pointer"
                        >
                          <LinkIcon className="h-4 w-4 mr-2" /> Copy Link
                        </DropdownMenuItem>
                        {affiliate.status !== 'active' && (
                          <DropdownMenuItem
                            onClick={() => updateStatus(affiliate.id, 'active')}
                            className="cursor-pointer text-green-400"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> Activate
                          </DropdownMenuItem>
                        )}
                        {affiliate.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() => updateStatus(affiliate.id, 'suspended')}
                            className="cursor-pointer text-yellow-400"
                          >
                            <Ban className="h-4 w-4 mr-2" /> Suspend
                          </DropdownMenuItem>
                        )}
                        {affiliate.status !== 'revoked' && (
                          <DropdownMenuItem
                            onClick={() => updateStatus(affiliate.id, 'revoked')}
                            className="cursor-pointer text-red-400"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Revoke
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-lg">
          <DialogHeader>
            <DialogTitle>Affiliate Details</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Full performance breakdown for this affiliate
            </DialogDescription>
          </DialogHeader>
          {selectedAffiliate && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Name</p>
                  <p className="font-medium">{selectedAffiliate.profiles?.full_name || 'Unknown'}</p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Email</p>
                  <p className="font-medium">{selectedAffiliate.profiles?.email || '-'}</p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Referral Code</p>
                  <code className="text-[hsl(var(--admin-accent))]">{selectedAffiliate.referral_code}</code>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Status</p>
                  {getStatusBadge(selectedAffiliate.status)}
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Commission Rate</p>
                  <p className="font-medium">{selectedAffiliate.commission_rate}%</p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Joined</p>
                  <p className="font-medium">{new Date(selectedAffiliate.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="border-t border-[hsl(var(--admin-border))] pt-4">
                <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-2">Referral URL</p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    value={getAffiliateLink(selectedAffiliate)}
                    className="bg-[hsl(var(--admin-bg))] text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyLink(getAffiliateLink(selectedAffiliate))}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 border-t border-[hsl(var(--admin-border))] pt-4">
                <div className="text-center p-3 bg-[hsl(var(--admin-bg))] rounded-lg">
                  <p className="text-2xl font-bold">{selectedAffiliate.total_clicks || 0}</p>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Clicks</p>
                </div>
                <div className="text-center p-3 bg-[hsl(var(--admin-bg))] rounded-lg">
                  <p className="text-2xl font-bold">{selectedAffiliate.total_signups || 0}</p>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Sign-ups</p>
                </div>
                <div className="text-center p-3 bg-[hsl(var(--admin-bg))] rounded-lg">
                  <p className="text-2xl font-bold">{selectedAffiliate.total_conversions || 0}</p>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Conversions</p>
                </div>
                <div className="text-center p-3 bg-[hsl(var(--admin-bg))] rounded-lg">
                  <p className="text-2xl font-bold">KES {Number(selectedAffiliate.total_sales || 0).toLocaleString()}</p>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Total Sales</p>
                </div>
              </div>
              <div className="text-center p-4 bg-gradient-to-r from-[hsl(var(--admin-accent))]/20 to-[hsl(var(--admin-accent-glow))]/20 rounded-lg border border-[hsl(var(--admin-accent))]/30">
                <p className="text-3xl font-bold text-[hsl(var(--admin-accent))]">
                  KES {Number(selectedAffiliate.total_commission || 0).toLocaleString()}
                </p>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Total Commission Earned</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Affiliates;
