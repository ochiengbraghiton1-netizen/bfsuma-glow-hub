import { useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2 } from 'lucide-react';

export interface BulkStockProduct {
  id: string;
  name: string;
  stock_quantity: number;
  track_inventory: boolean;
}

interface BulkStockUpdateProps {
  products: BulkStockProduct[];
  onUpdated: () => void;
}

const BulkStockUpdate = ({ products, onUpdated }: BulkStockUpdateProps) => {
  const { toast } = useToast();
  const [query, setQuery] = useState('');
  const [stockValue, setStockValue] = useState('');
  const [updating, setUpdating] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Record<string, boolean>>({});

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter((p) => p.name.toLowerCase().includes(q));
  }, [products, query]);

  const selectedCount = useMemo(() => {
    return Object.values(selectedIds).filter(Boolean).length;
  }, [selectedIds]);

  const allVisibleSelected = useMemo(() => {
    if (filtered.length === 0) return false;
    return filtered.every((p) => selectedIds[p.id]);
  }, [filtered, selectedIds]);

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds((prev) => {
      const next = { ...prev };
      for (const p of filtered) {
        next[p.id] = checked;
      }
      return next;
    });
  };

  const updateSelected = async () => {
    const ids = Object.entries(selectedIds)
      .filter(([, v]) => v)
      .map(([id]) => id);

    const parsed = Number.parseInt(stockValue, 10);
    if (!Number.isFinite(parsed) || parsed < 0) {
      toast({
        title: 'Invalid stock value',
        description: 'Please enter a valid non-negative number.',
        variant: 'destructive',
      });
      return;
    }

    if (ids.length === 0) {
      toast({
        title: 'No products selected',
        description: 'Select at least one product to update.',
        variant: 'destructive',
      });
      return;
    }

    setUpdating(true);
    try {
      const { error } = await supabase.from('products').update({ stock_quantity: parsed }).in('id', ids);
      if (error) throw error;

      toast({
        title: 'Stock updated',
        description: `Updated stock for ${ids.length} product${ids.length === 1 ? '' : 's'}.`,
      });

      setSelectedIds({});
      setStockValue('');
      onUpdated();
    } catch (e) {
      console.error('Bulk stock update failed:', e);
      toast({
        title: 'Update failed',
        description: 'Could not update stock for selected products.',
        variant: 'destructive',
      });
    } finally {
      setUpdating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Bulk stock update</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="bulk-search">Search products</Label>
            <Input
              id="bulk-search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Type to filter products..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="bulk-stock">Set stock quantity</Label>
            <Input
              id="bulk-stock"
              type="number"
              min={0}
              value={stockValue}
              onChange={(e) => setStockValue(e.target.value)}
              placeholder="e.g. 50"
            />
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="text-sm text-muted-foreground">
            Selected: <span className="text-foreground font-medium">{selectedCount}</span>
          </div>
          <Button onClick={updateSelected} disabled={updating || selectedCount === 0 || stockValue.trim() === ''}>
            {updating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Update selected
          </Button>
        </div>

        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-10">
                  <Checkbox checked={allVisibleSelected} onCheckedChange={(v) => toggleAllVisible(Boolean(v))} />
                </TableHead>
                <TableHead>Product</TableHead>
                <TableHead className="text-right">Current stock</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="py-8 text-center text-muted-foreground">
                    No products match your search.
                  </TableCell>
                </TableRow>
              ) : (
                filtered.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <Checkbox
                        checked={Boolean(selectedIds[p.id])}
                        onCheckedChange={(v) => setSelectedIds((prev) => ({ ...prev, [p.id]: Boolean(v) }))}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{p.name}</TableCell>
                    <TableCell className="text-right">{p.track_inventory ? p.stock_quantity : '—'}</TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default BulkStockUpdate;
