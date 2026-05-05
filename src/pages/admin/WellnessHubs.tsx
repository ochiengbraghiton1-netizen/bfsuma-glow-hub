import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, Plus, Pencil, Trash2, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Checkbox } from '@/components/ui/checkbox';

interface Hub {
  id: string; slug: string; name: string;
  hero_title: string; hero_description: string;
  intro_html: string | null; meta_title: string | null; meta_description: string | null;
  faq: { q: string; a: string }[]; display_order: number; is_active: boolean;
}
interface Product { id: string; name: string }
interface Post { id: string; title: string }

const blank = (): Hub => ({
  id: '', slug: '', name: '', hero_title: '', hero_description: '',
  intro_html: '', meta_title: '', meta_description: '', faq: [], display_order: 0, is_active: true,
});

const WellnessHubs = () => {
  const [hubs, setHubs] = useState<Hub[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Hub | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [linkedProducts, setLinkedProducts] = useState<Set<string>>(new Set());
  const [linkedPosts, setLinkedPosts] = useState<Set<string>>(new Set());
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const load = async () => {
    setLoading(true);
    const { data } = await (supabase as any).from('wellness_hubs').select('*').order('display_order');
    setHubs((data || []) as Hub[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const openEdit = async (hub: Hub) => {
    setEditing({ ...hub, faq: hub.faq || [] });
    const { data: pr } = await supabase.from('products').select('id,name').eq('is_active', true).order('name');
    setProducts((pr || []) as Product[]);
    const { data: po } = await supabase.from('blog_posts').select('id,title').eq('status', 'published').order('title');
    setPosts((po || []) as Post[]);
    if (hub.id) {
      const { data: pl } = await (supabase as any).from('wellness_hub_products').select('product_id').eq('hub_id', hub.id);
      setLinkedProducts(new Set((pl || []).map((r: any) => r.product_id)));
      const { data: al } = await (supabase as any).from('wellness_hub_articles').select('blog_post_id').eq('hub_id', hub.id);
      setLinkedPosts(new Set((al || []).map((r: any) => r.blog_post_id)));
    } else {
      setLinkedProducts(new Set()); setLinkedPosts(new Set());
    }
  };

  const save = async () => {
    if (!editing) return;
    if (!editing.slug || !editing.name || !editing.hero_title) {
      toast({ title: 'Slug, name and hero title are required', variant: 'destructive' }); return;
    }
    setSaving(true);
    const payload = { ...editing };
    let id = editing.id;
    if (id) {
      const { error } = await (supabase as any).from('wellness_hubs').update(payload).eq('id', id);
      if (error) { toast({ title: 'Save failed', description: error.message, variant: 'destructive' }); setSaving(false); return; }
    } else {
      const { id: _omit, ...insert } = payload as any;
      const { data, error } = await (supabase as any).from('wellness_hubs').insert(insert).select('id').single();
      if (error) { toast({ title: 'Create failed', description: error.message, variant: 'destructive' }); setSaving(false); return; }
      id = data.id;
    }

    // Sync product links
    await (supabase as any).from('wellness_hub_products').delete().eq('hub_id', id);
    if (linkedProducts.size) {
      const rows = Array.from(linkedProducts).map((product_id, i) => ({ hub_id: id, product_id, position: i }));
      await (supabase as any).from('wellness_hub_products').insert(rows);
    }
    // Sync article links
    await (supabase as any).from('wellness_hub_articles').delete().eq('hub_id', id);
    if (linkedPosts.size) {
      const rows = Array.from(linkedPosts).map((blog_post_id, i) => ({ hub_id: id, blog_post_id, position: i }));
      await (supabase as any).from('wellness_hub_articles').insert(rows);
    }

    toast({ title: 'Hub saved' });
    setEditing(null); setSaving(false); load();
  };

  const remove = async (id: string) => {
    if (!confirm('Delete this hub?')) return;
    const { error } = await (supabase as any).from('wellness_hubs').delete().eq('id', id);
    if (error) toast({ title: 'Delete failed', variant: 'destructive' });
    else { toast({ title: 'Deleted' }); load(); }
  };

  const updateFaq = (idx: number, key: 'q' | 'a', val: string) => {
    if (!editing) return;
    const faq = [...editing.faq];
    faq[idx] = { ...faq[idx], [key]: val };
    setEditing({ ...editing, faq });
  };
  const addFaq = () => editing && setEditing({ ...editing, faq: [...editing.faq, { q: '', a: '' }] });
  const removeFaq = (i: number) => editing && setEditing({ ...editing, faq: editing.faq.filter((_, x) => x !== i) });

  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const next = new Set(set);
    next.has(id) ? next.delete(id) : next.add(id);
    setter(next);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[hsl(var(--admin-text))]">Wellness Hubs</h1>
          <p className="text-sm text-[hsl(var(--admin-text-muted))]">Manage the 7 topical authority hubs.</p>
        </div>
        <Button onClick={() => openEdit(blank())}><Plus className="w-4 h-4 mr-2" />New Hub</Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Hubs</CardTitle></CardHeader>
        <CardContent>
          {loading ? <div className="flex justify-center py-12"><Loader2 className="animate-spin" /></div> : (
            <Table>
              <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Slug</TableHead><TableHead>Order</TableHead><TableHead>Active</TableHead><TableHead /></TableRow></TableHeader>
              <TableBody>
                {hubs.map((h) => (
                  <TableRow key={h.id}>
                    <TableCell className="font-medium">{h.name}</TableCell>
                    <TableCell className="text-muted-foreground">{h.slug}</TableCell>
                    <TableCell>{h.display_order}</TableCell>
                    <TableCell>{h.is_active ? '✓' : '—'}</TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button size="sm" variant="ghost" asChild><a href={`/wellness/${h.slug}`} target="_blank" rel="noreferrer"><ExternalLink className="w-4 h-4" /></a></Button>
                      <Button size="sm" variant="ghost" onClick={() => openEdit(h)}><Pencil className="w-4 h-4" /></Button>
                      <Button size="sm" variant="ghost" onClick={() => remove(h.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? 'Edit Hub' : 'New Hub'}</DialogTitle>
            <DialogDescription>Configure the wellness hub content, products, articles, and FAQ.</DialogDescription>
          </DialogHeader>
          {editing && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Name</Label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
                <div><Label>Slug</Label><Input value={editing.slug} onChange={(e) => setEditing({ ...editing, slug: e.target.value })} /></div>
              </div>
              <div><Label>Hero Title</Label><Input value={editing.hero_title} onChange={(e) => setEditing({ ...editing, hero_title: e.target.value })} /></div>
              <div><Label>Hero Description</Label><Textarea rows={2} value={editing.hero_description} onChange={(e) => setEditing({ ...editing, hero_description: e.target.value })} /></div>
              <div><Label>Intro HTML</Label><Textarea rows={5} value={editing.intro_html || ''} onChange={(e) => setEditing({ ...editing, intro_html: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-3">
                <div><Label>Meta Title</Label><Input value={editing.meta_title || ''} onChange={(e) => setEditing({ ...editing, meta_title: e.target.value })} /></div>
                <div><Label>Meta Description</Label><Input value={editing.meta_description || ''} onChange={(e) => setEditing({ ...editing, meta_description: e.target.value })} /></div>
              </div>
              <div className="grid grid-cols-2 gap-3 items-end">
                <div><Label>Display Order</Label><Input type="number" value={editing.display_order} onChange={(e) => setEditing({ ...editing, display_order: Number(e.target.value) })} /></div>
                <div className="flex items-center gap-2"><Switch checked={editing.is_active} onCheckedChange={(v) => setEditing({ ...editing, is_active: v })} /><Label>Active</Label></div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2"><Label>FAQ</Label><Button size="sm" variant="outline" onClick={addFaq}><Plus className="w-3 h-3 mr-1" />Add</Button></div>
                <div className="space-y-2">
                  {editing.faq.map((f, i) => (
                    <div key={i} className="border rounded-lg p-3 space-y-2 bg-muted/40">
                      <div className="flex gap-2">
                        <Input placeholder="Question" value={f.q} onChange={(e) => updateFaq(i, 'q', e.target.value)} />
                        <Button size="icon" variant="ghost" onClick={() => removeFaq(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                      <Textarea rows={2} placeholder="Answer" value={f.a} onChange={(e) => updateFaq(i, 'a', e.target.value)} />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <Label>Linked Products ({linkedProducts.size})</Label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 mt-1 space-y-1">
                  {products.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/40 px-2 py-1 rounded">
                      <Checkbox checked={linkedProducts.has(p.id)} onCheckedChange={() => toggle(linkedProducts, setLinkedProducts, p.id)} />
                      {p.name}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <Label>Linked Articles ({linkedPosts.size})</Label>
                <div className="border rounded-lg max-h-48 overflow-y-auto p-2 mt-1 space-y-1">
                  {posts.map((p) => (
                    <label key={p.id} className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/40 px-2 py-1 rounded">
                      <Checkbox checked={linkedPosts.has(p.id)} onCheckedChange={() => toggle(linkedPosts, setLinkedPosts, p.id)} />
                      {p.title}
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Cancel</Button>
            <Button onClick={save} disabled={saving}>{saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WellnessHubs;
