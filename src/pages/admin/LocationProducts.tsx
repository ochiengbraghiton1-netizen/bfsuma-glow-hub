import { useEffect, useMemo, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Plus, Trash2, ExternalLink, Save } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { locations as staticLocations } from '@/config/locations';

interface Product { id: string; name: string; slug: string }
interface Row {
  id: string;
  city_slug: string;
  product_id: string;
  reason: string | null;
  position: number;
}

const LocationProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCity, setActiveCity] = useState<string>(staticLocations[0]?.slug || '');
  const [savingId, setSavingId] = useState<string | null>(null);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const [{ data: pr }, { data: lp }] = await Promise.all([
      supabase.from('products').select('id,name,slug').eq('is_active', true).order('name'),
      (supabase as any).from('location_products').select('*').order('position'),
    ]);
    setProducts((pr || []) as Product[]);
    setRows((lp || []) as Row[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const cityRows = useMemo(
    () => rows.filter(r => r.city_slug === activeCity).sort((a, b) => a.position - b.position),
    [rows, activeCity]
  );
  const productMap = useMemo(() => new Map(products.map(p => [p.id, p])), [products]);

  const addRow = async () => {
    if (!products.length) return;
    const used = new Set(cityRows.map(r => r.product_id));
    const candidate = products.find(p => !used.has(p.id));
    if (!candidate) { toast({ title: 'All products already assigned to this city' }); return; }
    const position = cityRows.length;
    const { data, error } = await (supabase as any).from('location_products').insert({
      city_slug: activeCity,
      product_id: candidate.id,
      reason: '',
      position,
    }).select('*').single();
    if (error) { toast({ title: 'Add failed', description: error.message, variant: 'destructive' }); return; }
    setRows([...rows, data as Row]);
  };

  const updateRow = (id: string, patch: Partial<Row>) => {
    setRows(rs => rs.map(r => r.id === id ? { ...r, ...patch } : r));
  };

  const saveRow = async (row: Row) => {
    setSavingId(row.id);
    const { error } = await (supabase as any).from('location_products').update({
      product_id: row.product_id,
      reason: row.reason,
      position: row.position,
    }).eq('id', row.id);
    setSavingId(null);
    if (error) toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    else toast({ title: 'Saved' });
  };

  const removeRow = async (id: string) => {
    if (!confirm('Remove this product from the city?')) return;
    const { error } = await (supabase as any).from('location_products').delete().eq('id', id);
    if (error) { toast({ title: 'Delete failed', variant: 'destructive' }); return; }
    setRows(rs => rs.filter(r => r.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--admin-text))]">City Product Assignments</h1>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">
            Choose which products appear on each city's local landing page (e.g. /nairobi, /mombasa). Overrides any static defaults.
          </p>
        </div>
        <div className="flex items-end gap-3">
          <div className="w-56">
            <Label>City</Label>
            <Select value={activeCity} onValueChange={setActiveCity}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {staticLocations.map(l => (
                  <SelectItem key={l.slug} value={l.slug}>{l.city}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button variant="ghost" asChild>
            <a href={`/${activeCity}`} target="_blank" rel="noreferrer">
              <ExternalLink className="w-4 h-4 mr-1" /> View page
            </a>
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>{staticLocations.find(l => l.slug === activeCity)?.city || activeCity}</CardTitle>
          <Button size="sm" onClick={addRow}><Plus className="w-4 h-4 mr-1" />Add product</Button>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div>
          ) : cityRows.length === 0 ? (
            <p className="text-sm text-muted-foreground py-8 text-center">
              No products assigned. The page will fall back to the default static list until you add some.
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-16">Order</TableHead>
                  <TableHead className="w-72">Product</TableHead>
                  <TableHead>Why it's recommended (shown on the page)</TableHead>
                  <TableHead className="w-32" />
                </TableRow>
              </TableHeader>
              <TableBody>
                {cityRows.map((row) => (
                  <TableRow key={row.id}>
                    <TableCell>
                      <Input
                        type="number"
                        value={row.position}
                        onChange={(e) => updateRow(row.id, { position: Number(e.target.value) })}
                        className="w-16"
                      />
                    </TableCell>
                    <TableCell>
                      <Select value={row.product_id} onValueChange={(v) => updateRow(row.id, { product_id: v })}>
                        <SelectTrigger><SelectValue placeholder="Select product" /></SelectTrigger>
                        <SelectContent>
                          {products.map(p => (
                            <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Textarea
                        rows={2}
                        value={row.reason || ''}
                        placeholder={`Why ${productMap.get(row.product_id)?.name || 'this product'} fits residents of this city...`}
                        onChange={(e) => updateRow(row.id, { reason: e.target.value })}
                      />
                    </TableCell>
                    <TableCell className="text-right space-x-1 whitespace-nowrap">
                      <Button size="sm" variant="default" onClick={() => saveRow(row)} disabled={savingId === row.id}>
                        {savingId === row.id ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />Save</>}
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => removeRow(row.id)}>
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default LocationProducts;
