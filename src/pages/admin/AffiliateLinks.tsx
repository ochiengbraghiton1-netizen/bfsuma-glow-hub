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
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [assignedTo, setAssignedTo] = useState('');
  const [creating, setCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchLinks();
    fetchProducts();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('product_affiliate_links' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch product names for each link
      const linksWithProducts: AffiliateLink[] = [];
      for (const link of (data || [])) {
        const { data: product } = await supabase
          .from('products')
          .select('id, name')
          .eq('id', (link as any).product_id)
          .maybeSingle();
        
        linksWithProducts.push({
          ...(link as any),
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
      const { data: agentCodeData, error: codeError } = await supabase
        .rpc('generate_next_agent_code' as any);

      if (codeError) throw codeError;

      const agentCode = agentCodeData as string;
      const product = products.find(p => p.id === selectedProductId);
      if (!product) throw new Error('Product not found');

      const productSlug = generateProductSlug(product.name);
      const fullSlug = `${productSlug}-${agentCode.toLowerCase()}`;

      // Validate slug format
      const slugPattern = /^[a-z0-9-]+-a\d{2,}$/;
      if (!slugPattern.test(fullSlug)) {
        throw new Error('Invalid slug format generated');
      }

      const { error: insertError } = await supabase
        .from('product_affiliate_links' as any)
        .insert({
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
        .from('product_affiliate_links' as any)
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
      const { error } = await supabase
        .from('product_affiliate_links' as any)
        .delete()
        .eq('id', linkId);

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

  const copyLink = (slug: string) => {
    const fullUrl = `${SITE_BASE_URL}/p/${slug}`;
    navigator.clipboard.writeText(fullUrl);
    toast({
      title: 'Copied!',
      description: 'Affiliate link copied to clipboard',
    });
  };

  const filteredLinks = links.filter((link) => {
    const matchesSearch =
      link.slug.toLowerCase().includes(search.toLowerCase()) ||
      link.product?.name?.toLowerCase().includes(search.toLowerCase()) ||
      link.assigned_to?.toLowerCase().includes(search.toLowerCase()) ||
      link.agent_code.toLowerCase().includes(search.toLowerCase());
    
    return matchesSearch;
  });

  // Calculate totals
  const totalClicks = links.reduce((acc, link) => acc + (link.click_count || 0), 0);
  const activeLinks = links.filter(l => l.is_active).length;

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
          <p className="text-2xl font-bold text-green-400">{activeLinks}</p>
        </div>
        <div className="bg-[hsl(var(--admin-card))] border border-[hsl(var(--admin-border))] rounded-xl p-4">
          <div className="flex items-center gap-2 text-[hsl(var(--admin-text-muted))] mb-2">
            <MousePointer className="h-4 w-4" />
            <span className="text-sm">Total Clicks</span>
          </div>
          <p className="text-2xl font-bold text-[hsl(var(--admin-text))]">{totalClicks.toLocaleString()}</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[hsl(var(--admin-text-muted))]" />
        <Input
          placeholder="Search by slug, product, or assignee..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10 bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]"
        />
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
            <Button 
              variant="outline" 
              className="mt-4"
              onClick={() => setCreateDialogOpen(true)}
            >
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
                <TableRow key={link.id} className="border-[hsl(var(--admin-border))] hover:bg-[hsl(var(--admin-card-hover))]">
                  <TableCell>
                    <p className="font-medium text-[hsl(var(--admin-text))]">
                      {link.product?.name || 'Unknown Product'}
                    </p>
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
                  <TableCell className="text-right text-[hsl(var(--admin-text))]">
                    {link.click_count || 0}
                  </TableCell>
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
                      <DropdownMenuContent align="end" className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                        <DropdownMenuItem
                          onClick={() => copyLink(link.slug)}
                          className="cursor-pointer"
                        >
                          <Copy className="h-4 w-4 mr-2" /> Copy Link
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => window.open(`${SITE_BASE_URL}/p/${link.slug}`, '_blank')}
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
                        <DropdownMenuItem
                          onClick={() => deleteLink(link.id)}
                          className="cursor-pointer text-red-400"
                        >
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
        <DialogContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))] text-[hsl(var(--admin-text))]">
          <DialogHeader>
            <DialogTitle>Generate New Affiliate Link</DialogTitle>
            <DialogDescription className="text-[hsl(var(--admin-text-muted))]">
              Create a unique affiliate link for a product. The link format will be: product-slug-A01
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Select Product *</Label>
              <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                <SelectTrigger className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))]">
                  <SelectValue placeholder="Choose a product" />
                </SelectTrigger>
                <SelectContent className="bg-[hsl(var(--admin-card))] border-[hsl(var(--admin-border))]">
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Assign to Team Member (optional)</Label>
              <Input
                placeholder="Enter team member name"
                value={assignedTo}
                onChange={(e) => setAssignedTo(e.target.value)}
                className="bg-[hsl(var(--admin-bg))] border-[hsl(var(--admin-border))]"
              />
              <p className="text-xs text-[hsl(var(--admin-text-muted))]">
                This helps you track which team member should use this link
              </p>
            </div>
            {selectedProductId && (
              <div className="bg-[hsl(var(--admin-bg))] p-3 rounded-lg border border-[hsl(var(--admin-border))]">
                <p className="text-xs text-[hsl(var(--admin-text-muted))] mb-1">Preview:</p>
                <code className="text-sm text-[hsl(var(--admin-accent))]">
                  {SITE_BASE_URL}/p/{generateProductSlug(products.find(p => p.id === selectedProductId)?.name || '')}-a##
                </code>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setCreateDialogOpen(false)}
              className="bg-transparent border-[hsl(var(--admin-border))]"
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
