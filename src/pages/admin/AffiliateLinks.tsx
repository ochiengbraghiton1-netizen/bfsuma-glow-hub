import { useState, useEffect, useMemo } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Link as LinkIcon,
  Search,
  MoreVertical,
  Plus,
  Copy,
  Trash2,
  ToggleLeft,
  ToggleRight,
  MousePointer,
  Loader2,
  ExternalLink,
  Filter,
} from 'lucide-react';

interface Product {
  id: string;
  name: string;
}

interface AffiliateLink {
  id: string;
  product_id: string;
  slug: string;
  agent_code: string;
  assigned_to: string | null;
  is_active: boolean;
  click_count: number;
  created_at: string;
  product?: Product;
}

const AffiliateLinks = () => {
  const [links, setLinks] = useState<AffiliateLink[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Filters
  const [filterProductId, setFilterProductId] = useState<string>('all');
  const [filterAssignee, setFilterAssignee] = useState('');

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  // Always use the production domain for affiliate links
  const appBaseUrl = SITE_BASE_URL;

  useEffect(() => {
    fetchLinks();
    fetchProducts();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_affiliate_links')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product names for each link
      const linksWithProducts: AffiliateLink[] = [];
      for (const link of (data || [])) {
        const { data: product } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', link.product_id)
          .maybeSingle();

        linksWithProducts.push({
          ...link,
          product: product || undefined,
        });
      }

      setLinks(linksWithProducts);
    } catch (error) {
      console.error('Error fetching affiliate links:', error);
      toast({
        title: 'Error',
        description: 'Failed to load affiliate links',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProducts = async () => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('id, name')
        .eq('is_active', true)
        .order('name');

      if (error) throw error;
      setProducts(data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
    }
  };

  const generateProductSlug = (productName: string): string => {
    return productName
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  };

  const createLink = async () => {
    if (!selectedProductId) {
      toast({
        title: 'Error',
        description: 'Please select a product',
        variant: 'destructive',
      });
      return;
    }

    setCreating(true);
    try {
      // Get next agent code
      const { data: agentCodeData, error: codeError } = await supabase.rpc('generate_next_agent_code');

      if (codeError) throw codeError;

      const agentCode = agentCodeData as string;
      const product = products.find((p) => p.id === selectedProductId);
      if (!product) throw new Error('Product not found');

      const productSlug = generateProductSlug(product.name);
      const fullSlug = `${productSlug}-${agentCode.toLowerCase()}`;

      // Validate slug format
      const slugPattern = /^[a-z0-9-]+-a\d{2,}$/;
      if (!slugPattern.test(fullSlug)) {
        throw new Error('Invalid slug format generated');
      }

      const { error: insertError } = await supabase.from('product_affiliate_links').insert({
        product_id: selectedProductId,
        slug: fullSlug,
        agent_code: agentCode,
        assigned_to: assignedTo.trim() || null,
      });

      if (insertError) throw insertError;

      toast({
        title: 'Link Created',
        description: `Affiliate link "${fullSlug}" created successfully`,
      });

      setCreateDialogOpen(false);
      setSelectedProductId('');
      setAssignedTo('');
      fetchLinks();
    } catch (error) {
      console.error('Error creating affiliate link:', error);
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to create affiliate link',
        variant: 'destructive',
      });
    } finally {
      setCreating(false);
    }
  };

  const toggleLinkStatus = async (linkId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('product_affiliate_links')
        .update({ is_active: !currentStatus })
        .eq('id', linkId);

      if (error) throw error;

      toast({
        title: 'Status Updated',
        description: `Link ${!currentStatus ? 'activated' : 'deactivated'}`,
      });

      fetchLinks();
    } catch (error) {
      console.error('Error updating link status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update link status',
        variant: 'destructive',
      });
    }
  };

  const deleteLink = async (linkId: string) => {
    if (!confirm('Are you sure you want to delete this affiliate link?')) return;

    try {
      const { error } = await supabase.from('product_affiliate_links').delete().eq('id', linkId);

      if (error) throw error;

      toast({
        title: 'Link Deleted',
        description: 'Affiliate link has been removed',
      });

      fetchLinks();
    } catch (error) {
      console.error('Error deleting link:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete affiliate link',
        variant: 'destructive',
      });
    }
  };

  const getFullUrl = (slug: string) => `${appBaseUrl}/p/${slug}`;

  const copyLink = async (slug: string) => {
    const fullUrl = getFullUrl(slug);
    try {
      await navigator.clipboard.writeText(fullUrl);
      toast({ title: 'Copied!', description: 'Affiliate link copied to clipboard' });
    } catch {
      toast({
        title: 'Copy failed',
        description: 'Could not copy the link automatically. Please copy it manually.',
        variant: 'destructive',
      });
    }
  };

  const filteredLinks = useMemo(() => {
    const s = search.toLowerCase();
    const assignee = filterAssignee.trim().toLowerCase();

    return links.filter((link) => {
      const matchesSearch =
        link.slug.toLowerCase().includes(s) ||
        link.product?.name?.toLowerCase().includes(s) ||
        link.assigned_to?.toLowerCase().includes(s) ||
        link.agent_code.toLowerCase().includes(s);

      const matchesProduct = filterProductId === 'all' || link.product_id === filterProductId;
      const matchesAssignee = !assignee || (link.assigned_to || '').toLowerCase().includes(assignee);

      return matchesSearch && matchesProduct && matchesAssignee;
    });
  }, [links, search, filterProductId, filterAssignee]);

  // Calculate totals
  const totalClicks = links.reduce((acc, link) => acc + (link.click_count || 0), 0);
  const activeLinks = links.filter((l) => l.is_active).length;

  const showFiltersActive = filterProductId !== 'all' || filterAssignee.trim().length > 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--admin-text))]">Affiliate Links</h1>
          <p className="text-[hsl(var(--admin-text-muted))]">Manage product affiliate links for team members</p>
        </div>
        <Button onClick={() => setCreateDialogOpen(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Generate New Affiliate Link
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <LinkIcon className="h-4 w-4" />
            <span className="text-sm">Total Links</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{links.length}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <ToggleRight className="h-4 w-4" />
            <span className="text-sm">Active Links</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{activeLinks}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <MousePointer className="h-4 w-4" />
            <span className="text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{totalClicks.toLocaleString()}</p>
        </div>
      </div>

      {/* Search + Filters */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="relative lg:col-span-5">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
          <Input
            placeholder="Search by slug, product, or assignee..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
          />
        </div>

        <div className="lg:col-span-4">
          <Select value={filterProductId} onValueChange={setFilterProductId}>
            <SelectTrigger className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
              <SelectValue placeholder="Filter by product" />
            </SelectTrigger>
            <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
              <SelectItem value="all">All products</SelectItem>
              {products.map((p) => (
                <SelectItem key={p.id} value={p.id}>
                  {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="lg:col-span-3">
          <Input
            placeholder="Filter by assignee"
            value={filterAssignee}
            onChange={(e) => setFilterAssignee(e.target.value)}
            className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
          />
        </div>

        {showFiltersActive && (
          <div className="lg:col-span-12 -mt-1">
            <Button
              variant="outline"
              className="gap-2 bg-transparent border-[hsl(var(--admin-border))]"
              onClick={() => {
                setFilterProductId('all');
                setFilterAssignee('');
              }}
            >
              <Filter className="h-4 w-4" />
              Clear filters
            </Button>
          </div>
        )}
      </div>

      {/* Table */}
      <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[hsl(var(--admin-accent))]" />
          </div>
        ) : filteredLinks.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-[hsl(var(--admin-text-muted))]">
            <LinkIcon className="h-12 w-12 mb-4 opacity-50" />
            <p>No affiliate links found</p>
            <Button variant="outline" className="mt-4" onClick={() => setCreateDialogOpen(true)}>
              Create your first link
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="border-[hsl(var(--admin-border))] hover:bg-transparent">
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Product</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Affiliate Link</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Agent Code</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Assigned To</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Status</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))] text-right">Clicks</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]">Created</TableHead>
                <TableHead className="text-[hsl(var(--admin-text-muted))]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLinks.map((link) => (
                <TableRow
                  key={link.id}
                  className="border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-card-hover))]"
                >
                  <TableCell>
                    <p className="font-medium text-[hsl(var(--admin-text))]">{link.product?.name || 'Unknown Product'}</p>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <code className="text-sm text-[hsl(var(--admin-accent))] bg-[hsl(var(--admin-bg))] px-2 py-1 rounded">
                        /p/{link.slug}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => copyLink(link.slug)}
                        title="Copy full URL"
                      >
                        <Copy className="h-3 w-3" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {link.agent_code}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-[hsl(var(--admin-text))]">
                    {link.assigned_to || <span className="text-[hsl(var(--admin-text-muted))]">—</span>}
                  </TableCell>
                  <TableCell>
                    {link.is_active ? (
                      <Badge className="bg-green-500/20 text-green-400 border-green-500/30">Active</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-400 border-red-500/30">Inactive</Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">{link.click_count || 0}</TableCell>
                  <TableCell className="text-[hsl(var(--admin-text-muted))]">
                    {new Date(link.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="end"
                        className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]"
                      >
                        <DropdownMenuItem onClick={() => copyLink(link.slug)} className="cursor-pointer">
                          <Copy className="h-4 w-4 mr-2" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(getFullUrl(link.slug), '_blank')}
                          className="cursor-pointer"
                        >
                          <ExternalLink className="h-4 w-4 mr-2" /> Open Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => toggleLinkStatus(link.id, link.is_active)}
                          className="cursor-pointer"
                        >
                          {link.is_active ? (
                            <>
                              <ToggleLeft className="h-4 w-4 mr-2" /> Deactivate
                            </>
                          ) : (
                            <>
                              <ToggleRight className="h-4 w-4 mr-2" /> Activate
                            </>
                          )}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => deleteLink(link.id)} className="cursor-pointer text-destructive">
                          <Trash2 className="h-4 w-4 mr-2" /> Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </div>

      {/* Create Dialog */}
      <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))] z-50 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">Generate New Affiliate Link</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Create a unique affiliate link for a product.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Select Product *</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] z-[60]">
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id} className="text-[hsl(var(--admin-text))]">
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Assign to Team Member (optional)</Label>
              <Input
                placeholder="Enter team member name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
              />
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                This helps you track which team member should use this link
              </p>
            </div>
            {selectedProductId && (
              <div className="bg-[hsl(var(--admin-bg))] p-3 rounded-lg border border-[hsl(var(--admin-border))]">
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-1">Preview:</p>
                <code className="text-sm text-[hsl(var(--admin-accent))] break-all">
                  /p/{generateProductSlug(products.find((p) => p.id === selectedProductId)?.name || '')}-a##
                </code>
              </div>
            )}
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="bg-transparent border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
            >
              Cancel
            </Button>
            <Button onClick={createLink} disabled={creating || !selectedProductId}>
              {creating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Generate Link
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AffiliateLinks;

