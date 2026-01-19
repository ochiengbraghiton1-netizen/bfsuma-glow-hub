import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Loader2, Search, Eye, CheckCircle, XCircle, Users, Clock, UserCheck, Network } from 'lucide-react';
import { format } from 'date-fns';

interface BusinessRegistration {
  id: string;
  full_name: string;
  phone: string;
  email: string | null;
  county_city: string;
  has_sponsor: boolean;
  sponsor_name: string | null;
  sponsor_phone: string | null;
  sponsor_membership_id: string | null;
  assigned_sponsor_id: string | null;
  entry_fee: number;
  agreement_accepted: boolean;
  status: string;
  approved_at: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  assigned_sponsor?: BusinessRegistration | null;
}

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
  approved: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  rejected: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
};

const BusinessRegistrations = () => {
  const [registrations, setRegistrations] = useState<BusinessRegistration[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedRegistration, setSelectedRegistration] = useState<BusinessRegistration | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [actionDialogOpen, setActionDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject'>('approve');
  const [rejectionReason, setRejectionReason] = useState('');
  const [processing, setProcessing] = useState(false);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRegistrations = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('business_registrations')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;
      if (error) throw error;
      setRegistrations((data as BusinessRegistration[]) || []);
    } catch (error: any) {
      console.error('Error fetching registrations:', error);
      toast({
        title: 'Error',
        description: 'Failed to load registrations',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, [statusFilter]);

  const handleApprove = async () => {
    if (!selectedRegistration || !user) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('business_registrations')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id,
        })
        .eq('id', selectedRegistration.id);

      if (error) throw error;

      toast({
        title: 'Registration Approved',
        description: `${selectedRegistration.full_name} has been approved.`,
      });
      setActionDialogOpen(false);
      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to approve registration',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async () => {
    if (!selectedRegistration) return;
    setProcessing(true);
    try {
      const { error } = await supabase
        .from('business_registrations')
        .update({
          status: 'rejected',
          rejection_reason: rejectionReason || null,
        })
        .eq('id', selectedRegistration.id);

      if (error) throw error;

      toast({
        title: 'Registration Rejected',
        description: `${selectedRegistration.full_name}'s application has been rejected.`,
      });
      setActionDialogOpen(false);
      setRejectionReason('');
      fetchRegistrations();
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to reject registration',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const openActionDialog = (registration: BusinessRegistration, type: 'approve' | 'reject') => {
    setSelectedRegistration(registration);
    setActionType(type);
    setActionDialogOpen(true);
  };

  const filteredRegistrations = registrations.filter((r) => {
    const query = searchQuery.toLowerCase();
    return (
      r.full_name.toLowerCase().includes(query) ||
      r.phone.includes(query) ||
      r.county_city.toLowerCase().includes(query) ||
      (r.sponsor_name && r.sponsor_name.toLowerCase().includes(query))
    );
  });

  // Calculate stats
  const stats = {
    total: registrations.length,
    pending: registrations.filter((r) => r.status === 'pending').length,
    approved: registrations.filter((r) => r.status === 'approved').length,
    withSponsor: registrations.filter((r) => r.has_sponsor).length,
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
      <div>
        <h1 className="text-2xl font-bold text-[hsl(var(--admin-text))]">Business Registrations</h1>
        <p className="text-[hsl(var(--admin-text-muted))]">Manage BF SUMA business membership applications</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-blue-500/10">
                <Users className="h-6 w-6 text-blue-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Total Applications</p>
                <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-yellow-500/10">
                <Clock className="h-6 w-6 text-yellow-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Pending</p>
                <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{stats.pending}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-green-500/10">
                <UserCheck className="h-6 w-6 text-green-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">Approved</p>
                <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{stats.approved}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-xl bg-purple-500/10">
                <Network className="h-6 w-6 text-purple-500" />
              </div>
              <div>
                <p className="text-sm text-[hsl(var(--admin-text-muted))]">With Sponsor</p>
                <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{stats.withSponsor}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
          <Input
            placeholder="Search by name, phone, or location..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px] bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--admin-border))]">
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Applicant</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Contact</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Location</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Sponsor</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Status</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Date</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRegistrations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-[hsl(var(--admin-text-muted))]">
                    No registrations found
                  </TableCell>
                </TableRow>
              ) : (
                filteredRegistrations.map((registration) => (
                  <TableRow key={registration.id} className="border-[hsl(var(--admin-border))]">
                    <TableCell className="font-medium text-[hsl(var(--admin-text))]">
                      {registration.full_name}
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-text-muted))]">
                      <div>{registration.phone}</div>
                      {registration.email && (
                        <div className="text-xs">{registration.email}</div>
                      )}
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-text-muted))]">
                      {registration.county_city}
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-text-muted))]">
                      {registration.has_sponsor ? (
                        <div>
                          <div className="font-medium">{registration.sponsor_name}</div>
                          <div className="text-xs">{registration.sponsor_phone}</div>
                        </div>
                      ) : (
                        <span className="text-xs italic">Company Assigned</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[registration.status]}>
                        {registration.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-text-muted))]">
                      {format(new Date(registration.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedRegistration(registration);
                            setDetailsOpen(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        {registration.status === 'pending' && (
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-green-600 hover:text-green-700 hover:bg-green-100 dark:hover:bg-green-900/20"
                              onClick={() => openActionDialog(registration, 'approve')}
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/20"
                              onClick={() => openActionDialog(registration, 'reject')}
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Registration Details</DialogTitle>
            <DialogDescription>
              Application submitted on {selectedRegistration && format(new Date(selectedRegistration.created_at), 'MMMM d, yyyy h:mm a')}
            </DialogDescription>
          </DialogHeader>
          {selectedRegistration && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Full Name</h4>
                  <p className="font-medium">{selectedRegistration.full_name}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Phone</h4>
                  <p className="font-medium">{selectedRegistration.phone}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Email</h4>
                  <p className="font-medium">{selectedRegistration.email || 'Not provided'}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground mb-1">Location</h4>
                  <p className="font-medium">{selectedRegistration.county_city}</p>
                </div>
              </div>

              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Sponsor Information</h3>
                {selectedRegistration.has_sponsor ? (
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Sponsor Name</h4>
                      <p className="font-medium">{selectedRegistration.sponsor_name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-muted-foreground mb-1">Sponsor Phone</h4>
                      <p className="font-medium">{selectedRegistration.sponsor_phone}</p>
                    </div>
                    {selectedRegistration.sponsor_membership_id && (
                      <div>
                        <h4 className="text-sm font-medium text-muted-foreground mb-1">Sponsor Membership ID</h4>
                        <p className="font-medium">{selectedRegistration.sponsor_membership_id}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground italic">No sponsor - will be assigned to company account</p>
                )}
              </div>

              <div className="border-t pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-medium text-muted-foreground mb-1">Entry Fee</h4>
                    <p className="text-xl font-bold">KES {selectedRegistration.entry_fee.toLocaleString()}</p>
                  </div>
                  <Badge className={statusColors[selectedRegistration.status]} variant="outline">
                    {selectedRegistration.status.toUpperCase()}
                  </Badge>
                </div>
              </div>

              {selectedRegistration.rejection_reason && (
                <div className="border-t pt-4">
                  <h4 className="text-sm font-medium text-red-600 mb-1">Rejection Reason</h4>
                  <p className="text-muted-foreground">{selectedRegistration.rejection_reason}</p>
                </div>
              )}
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDetailsOpen(false)}>
              Close
            </Button>
            {selectedRegistration?.status === 'pending' && (
              <>
                <Button
                  variant="destructive"
                  onClick={() => {
                    setDetailsOpen(false);
                    openActionDialog(selectedRegistration, 'reject');
                  }}
                >
                  Reject
                </Button>
                <Button
                  onClick={() => {
                    setDetailsOpen(false);
                    openActionDialog(selectedRegistration, 'approve');
                  }}
                >
                  Approve
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Action Confirmation Dialog */}
      <Dialog open={actionDialogOpen} onOpenChange={setActionDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {actionType === 'approve' ? 'Approve Registration' : 'Reject Registration'}
            </DialogTitle>
            <DialogDescription>
              {actionType === 'approve'
                ? `Are you sure you want to approve ${selectedRegistration?.full_name}'s application?`
                : `Please provide a reason for rejecting ${selectedRegistration?.full_name}'s application.`}
            </DialogDescription>
          </DialogHeader>
          {actionType === 'reject' && (
            <Textarea
              placeholder="Reason for rejection (optional)"
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setActionDialogOpen(false)} disabled={processing}>
              Cancel
            </Button>
            <Button
              variant={actionType === 'approve' ? 'default' : 'destructive'}
              onClick={actionType === 'approve' ? handleApprove : handleReject}
              disabled={processing}
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : actionType === 'approve' ? (
                'Approve'
              ) : (
                'Reject'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default BusinessRegistrations;
