import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, X, Search, Link2 } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  is_active: boolean;
}

interface KeywordMap {
  [productId: string]: string[];
}

const ProductKeywords = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [keywords, setKeywords] = useState<KeywordMap>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [newKeyword, setNewKeyword] = useState<{ [productId: string]: string }>({});
  const [search, setSearch] = useState('');
  const { toast } = useToast();

  const fetchData = async () => {
    const [{ data: prods }, { data: kws }] = await Promise.all([
      supabase.from('products').select('id, name, is_active').eq('is_active', true).order('name'),
      supabase.from('product_keywords' as any).select('product_id, keyword, id'),
    ]);

    setProducts(prods || []);

    const map: KeywordMap = {};
    for (const kw of (kws || []) as any[]) {
      if (!map[kw.product_id]) map[kw.product_id] = [];
      map[kw.product_id].push(kw.keyword);
    }
    setKeywords(map);
    setLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const addKeyword = async (productId: string) => {
    const kw = (newKeyword[productId] || '').trim();
    if (!kw) return;

    setSaving(productId);
    const { error } = await supabase.from('product_keywords' as any).insert({
      product_id: productId,
      keyword: kw,
    });

    if (error) {
      toast({
        title: 'Error',
        description: error.message.includes('duplicate') ? 'Keyword already exists for this product' : error.message,
        variant: 'destructive',
      });
    } else {
      setKeywords((prev) => ({
        ...prev,
        [productId]: [...(prev[productId] || []), kw],
      }));
      setNewKeyword((prev) => ({ ...prev, [productId]: '' }));
      toast({ title: 'Keyword added' });
    }
    setSaving(null);
  };

  const removeKeyword = async (productId: string, keyword: string) => {
    const { error } = await supabase
      .from('product_keywords' as any)
      .delete()
      .eq('product_id', productId)
      .eq('keyword', keyword);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setKeywords((prev) => ({
        ...prev,
        [productId]: (prev[productId] || []).filter((k) => k !== keyword),
      }));
    }
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Product Keywords</h1>
        <p className="text-muted-foreground">
          Define keywords for automatic internal linking in blog posts. Each keyword will auto-link to the product page when found in blog content.
        </p>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search products..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="grid gap-4">
        {filtered.map((product) => {
          const productKeywords = keywords[product.id] || [];
          return (
            <Card key={product.id}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Link2 className="h-4 w-4 text-primary" />
                  {product.name}
                  {productKeywords.length > 0 && (
                    <Badge variant="secondary" className="ml-auto">
                      {productKeywords.length} keyword{productKeywords.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {productKeywords.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {productKeywords.map((kw) => (
                      <Badge
                        key={kw}
                        variant="outline"
                        className="gap-1 pr-1"
                      >
                        {kw}
                        <button
                          onClick={() => removeKeyword(product.id, kw)}
                          className="ml-1 rounded-full p-0.5 hover:bg-destructive/10 hover:text-destructive transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div className="flex gap-2">
                  <Input
                    placeholder='e.g., "joint pain", "bone health"'
                    value={newKeyword[product.id] || ''}
                    onChange={(e) =>
                      setNewKeyword((prev) => ({ ...prev, [product.id]: e.target.value }))
                    }
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addKeyword(product.id);
                      }
                    }}
                    className="max-w-xs"
                  />
                  <Button
                    size="sm"
                    onClick={() => addKeyword(product.id)}
                    disabled={saving === product.id || !(newKeyword[product.id] || '').trim()}
                  >
                    {saving === product.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default ProductKeywords;
