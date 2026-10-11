import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { SITE_BASE_URL } from '@/config/routes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
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
  ShoppingCart,
  Zap,
  Copy,
  TrendingUp,
  Loader2,
  Plus,
} from 'lucide-react';

interface Affiliate {
  id: string;
  name: string | null;
  email: string | null;
  user_id: string | null;
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

interface AttributedOrder {
  id: string;
  affiliate_id: string;
  status: string;
  payment_status: string;
  total_amount: number;
  created_at: string;
  order_items?: { quantity: number; products: { pv_value: number } | null }[];
}

const NOT_CONFIRMED = ['pending', 'pending_payment', 'pending_whatsapp', 'whatsapp_initiated', 'cancelled', 'failed', 'refunded'];
const isConfirmed = (o: AttributedOrder) => o.payment_status === 'paid' || !NOT_CONFIRMED.includes(o.status);
const orderPV = (o: AttributedOrder) =>
  (o.order_items || []).reduce((s, i) => s + (i.quantity || 0) * Number(i.products?.pv_value || 0), 0);

const STATUS_LABEL: Record<string, string> = { active: 'Active', suspended: 'Frozen', revoked: 'Terminated' };

const Affiliates = () => {
  const [affiliates, setAffiliates] = useState<Affiliate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [createOpen, setCreateOpen] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [orders, setOrders] = useState<AttributedOrder[]>([]);
  const [confirmAction, setConfirmAction] = useState<{ affiliate: Affiliate; status: 'suspended' | 'revoked' } | null>(null);
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAffiliates();
  }, []);

  const fetchAffiliates = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('affiliates')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAffiliates((data || []) as unknown as Affiliate[]);

      const { data: ords, error: ordErr } = await supabase
        .from('orders')
        .select('id, affiliate_id, status, payment_status, total_amount, created_at, order_items(quantity, products(pv_value))')
        .not('affiliate_id', 'is', null)
        .order('created_at', { ascending: false });
      if (ordErr) console.error('Error fetching attributed orders:', ordErr);
      setOrders((ords || []) as unknown as AttributedOrder[]);
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

  const createAffiliate = async () => {
    if (!newName.trim()) {
      toast({ title: 'Error', description: 'Name is required', variant: 'destructive' });
      return;
    }

    setCreating(true);
    try {
      // Generate referral code
      const { data: codeData, error: codeError } = await supabase.rpc('generate_referral_code');
      if (codeError) throw codeError;

      const code = codeData as string;
      const referralUrl = `${SITE_BASE_URL}/?ref=${code}`;

      const { error } = await supabase.from('affiliates').insert({
        name: newName.trim(),
        email: newEmail.trim() || null,
        referral_code: code,
        referral_url: referralUrl,
        status: 'active',
        user_id: null as any,
      } as any);

      if (error) throw error;

      toast({ title: 'Affiliate Created', description: `${newName.trim()} has been added as an affiliate` });
      setCreateOpen(false);
      setNewName('');
      setNewEmail('');
      fetchAffiliates();
    } catch (error) {
      console.error('Error creating affiliate:', error);
      toast({ title: 'Error', description: 'Failed to create affiliate', variant: 'destructive' });
    } finally {
      setCreating(false);
    }
  };

  const updateStatus = async (affiliate: Affiliate, newStatus: string) => {
    try {
      const { error } = await supabase
        .from('affiliates')
        .update({ status: newStatus } as any)
        .eq('id', affiliate.id);

      if (error) throw error;

      let roleNote = '';
      if (newStatus === 'revoked' && affiliate.user_id) {
        const { error: roleErr, count } = await supabase
          .from('user_roles')
          .delete({ count: 'exact' })
          .eq('user_id', affiliate.user_id)
          .eq('role', 'distributor');
        if (roleErr) {
          console.error('Error removing distributor role:', roleErr);
          roleNote = ' Login access could not be removed.';
        } else {
          roleNote = count ? ' Distributor login access removed.' : ' No distributor login role was found.';
        }
      }

      toast({
        title: 'Status Updated',
        description: `Distributor ${newStatus === 'active' ? 'unfrozen' : newStatus === 'suspended' ? 'frozen' : 'terminated'}.${roleNote}`,
      });

      fetchAffiliates();
    } catch (error) {
      console.error('Error updating status:', error);
      toast({ title: 'Error', description: 'Failed to update affiliate status', variant: 'destructive' });
    }
  };

  const copyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    toast({ title: 'Copied!', description: 'Referral link copied to clipboard' });
  };

  const getAffiliateLink = (affiliate: Affiliate): string => {
    return `${SITE_BASE_URL}/?ref=${affiliate.referral_code}`;
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>;
      case 'suspended':
        return <Badge className="bg-yellow-500/20 text-yellow-400 border-yellow-500/30">Frozen</Badge>;
      case 'revoked':
        return <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Terminated</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const filteredAffiliates = affiliates.filter((affiliate) => {
    const matchesSearch =
      affiliate.referral_code.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.name?.toLowerCase().includes(search.toLowerCase()) ||
      affiliate.email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || affiliate.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const statsFor = (affId: string) => {
    const list = orders.filter((o) => o.affiliate_id === affId);
    const conf = list.filter(isConfirmed);
    return {
      placed: list.length,
      confirmed: conf.length,
      sales: conf.reduce((s, o) => s + Number(o.total_amount || 0), 0),
      pv: conf.reduce((s, o) => s + orderPV(o), 0),
      recent: list.slice(0, 10),
    };
  };

  const confirmedAll = orders.filter(isConfirmed);
  const totals = {
    clicks: affiliates.reduce((s, a) => s + (a.total_clicks || 0), 0),
    activeCount: affiliates.filter((a) => a.status === 'active').length,
    placed: orders.length,
    confirmed: confirmedAll.length,
    pv: confirmedAll.reduce((s, o) => s + orderPV(o), 0),
  };

  const card = (icon: React.ReactNode, label: string, value: string) => (
    <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
      <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
        {icon}
        <span className="text-sm">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{value}</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--admin-text))]">Affiliates</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage affiliate partners and track performance</p>
        </div>
        <Button onClick={() => setCreateOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Affiliate
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        {card(<Users className="h-4 w-4" />, 'Distributors (active)', totals.activeCount.toLocaleString())}
        {card(<ShoppingCart className="h-4 w-4" />, 'Orders placed', totals.placed.toLocaleString())}
        {card(<CheckCircle className="h-4 w-4" />, 'Confirmed orders', totals.confirmed.toLocaleString())}
        {card(<Zap className="h-4 w-4" />, 'Confirmed PV', totals.pv.toLocaleString())}
        {card(<MousePointer className="h-4 w-4" />, 'Clicks', totals.clicks.toLocaleString())}
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
              {status === 'all' ? 'All' : STATUS_LABEL[status]}
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
            <Button variant="outline" className="mt-4" onClick={() => setCreateOpen(true)}>
              Add your first affiliate
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--admin-border))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Affiliate</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Code</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Status</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Clicks</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Orders placed</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Confirmed</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Confirmed sales</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Confirmed PV</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Has login</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredAffiliates.map((affiliate) => { const st = statsFor(affiliate.id); return (
                <TableRow key={affiliate.id} className="border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-card-hover))]">
                  <TableCell>
                    <div>
                      <p className="font-medium text-[hsl(var(--admin-text))]">
                        {affiliate.name || 'Unnamed'}
                      </p>
                      <p className="text-sm text-[hsl(var(--admin-text-muted))]">
                        {affiliate.email || '-'}
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
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">{st.placed}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">{st.confirmed}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">KES {st.sales.toLocaleString()}</TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">{st.pv.toLocaleString()}</TableCell>
                  <TableCell>
                    <Badge variant={affiliate.user_id ? 'default' : 'secondary'}>{affiliate.user_id ? 'Yes' : 'No'}</Badge>
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
                            onClick={() => updateStatus(affiliate, 'active')}
                            className="cursor-pointer text-green-400"
                          >
                            <CheckCircle className="h-4 w-4 mr-2" /> {affiliate.status === 'revoked' ? 'Reactivate' : 'Unfreeze'}
                          </DropdownMenuItem>
                        )}
                        {affiliate.status === 'active' && (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ affiliate, status: 'suspended' })}
                            className="cursor-pointer text-yellow-400"
                          >
                            <Ban className="h-4 w-4 mr-2" /> Freeze
                          </DropdownMenuItem>
                        )}
                        {affiliate.status !== 'revoked' && (
                          <DropdownMenuItem
                            onClick={() => setConfirmAction({ affiliate, status: 'revoked' })}
                            className="cursor-pointer text-red-400"
                          >
                            <XCircle className="h-4 w-4 mr-2" /> Terminate
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ); })}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Affiliate Dialog */}
      <Dialog open={createOpen} onOpenChange={setCreateOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Affiliate</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Create a new affiliate partner. A unique referral code will be generated automatically.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Name *</Label>
              <Input
                placeholder="Enter affiliate name"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Email (optional)</Label>
              <Input
                type="email"
                placeholder="Enter email address"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCreateOpen(false)} className="bg-transparent border-[hsl(var(--admin-border))]">
              Cancel
            </Button>
            <Button onClick={createAffiliate} disabled={creating || !newName.trim()}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Create Affiliate
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

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
                  <p className="font-medium">{selectedAffiliate.name || 'Unnamed'}</p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Email</p>
                  <p className="font-medium">{selectedAffiliate.email || '-'}</p>
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
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Has login</p>
                  <p className="font-medium">{selectedAffiliate.user_id ? 'Yes' : 'No'}</p>
                </div>
                <div>
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">Created</p>
                  <p className="font-medium">{new Date(selectedAffiliate.created_at).toLocaleDateString()}</p>
                </div>
              </div>
              <div className="border-t border-[hsl(var(--admin-border))] pt-4">
                <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-2">Referral URL</p>
                <div className="flex gap-2">
                  <Input readOnly value={getAffiliateLink(selectedAffiliate)} className="bg-[hsl(var(--admin-bg))] text-sm" />
                  <Button variant="outline" size="icon" onClick={() => copyLink(getAffiliateLink(selectedAffiliate))}>
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {(() => { const st = statsFor(selectedAffiliate.id); return (<>
              <div className="grid grid-cols-2 gap-4 border-t border-[hsl(var(--admin-border))] pt-4">
                {[
                  ['Clicks', String(selectedAffiliate.total_clicks || 0)],
                  ['Orders placed', String(st.placed)],
                  ['Confirmed orders', String(st.confirmed)],
                  ['Confirmed sales', `KES ${st.sales.toLocaleString()}`],
                  ['Confirmed PV', st.pv.toLocaleString()],
                ].map(([l, v]) => (
                  <div key={l} className="text-center p-3 bg-[hsl(var(--admin-bg))] rounded-lg">
                    <p className="text-2xl font-bold">{v}</p>
                    <p className="text-sm text-[hsl(var(--admin-text-muted))]">{l}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-[hsl(var(--admin-border))] pt-4">
                <p className="text-sm text-[hsl(var(--admin-text-muted))] mb-2">Recent orders</p>
                {st.recent.length === 0 ? (
                  <p className="text-sm text-[hsl(var(--admin-text-muted))]">No orders yet.</p>
                ) : (
                  <ul className="space-y-1 text-sm max-h-48 overflow-y-auto">
                    {st.recent.map((o) => (
                      <li key={o.id} className="flex justify-between gap-2">
                        <span>{new Date(o.created_at).toLocaleDateString()}</span>
                        <span className="text-[hsl(var(--admin-text-muted))]">{o.status}</span>
                        <span>KES {Number(o.total_amount || 0).toLocaleString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              </>); })()}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!confirmAction} onOpenChange={(o) => !o && setConfirmAction(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {confirmAction?.status === 'revoked' ? 'Terminate' : 'Freeze'} {confirmAction?.affiliate.name || 'this distributor'}?
            </AlertDialogTitle>
            <AlertDialogDescription>
              {confirmAction?.status === 'revoked'
                ? 'Their links stop crediting permanently and their distributor login access is removed. Past orders keep their history.'
                : "New orders from this distributor's links will count as the shop's own until you unfreeze."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                if (confirmAction) updateStatus(confirmAction.affiliate, confirmAction.status);
                setConfirmAction(null);
              }}
            >
              {confirmAction?.status === 'revoked' ? 'Terminate' : 'Freeze'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Affiliates;
