import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { locations } from "@/config/locations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Save, Plus, Trash2 } from "lucide-react";

interface FAQ { q: string; a: string }

interface CityPage {
  city_slug: string;
  hero_title: string;
  hero_description: string;
  main_content_html: string;
  faqs: FAQ[];
  meta_title: string;
  meta_description: string;
  seo_keywords: string[];
  og_title: string;
  og_description: string;
  og_image_url: string;
  canonical_url: string;
  is_published: boolean;
}

const empty = (slug: string): CityPage => ({
  city_slug: slug,
  hero_title: "",
  hero_description: "",
  main_content_html: "",
  faqs: [],
  meta_title: "",
  meta_description: "",
  seo_keywords: [],
  og_title: "",
  og_description: "",
  og_image_url: "",
  canonical_url: "",
  is_published: true,
});

export default function LocationPages() {
  const { toast } = useToast();
  const [slug, setSlug] = useState(locations[0].slug);
  const [page, setPage] = useState<CityPage>(empty(locations[0].slug));
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      const { data } = await (supabase as any)
        .from("location_pages")
        .select("*")
        .eq("city_slug", slug)
        .maybeSingle();
      if (data) {
        setPage({
          ...empty(slug),
          ...data,
          faqs: Array.isArray(data.faqs) ? data.faqs : [],
          seo_keywords: data.seo_keywords || [],
        });
      } else {
        setPage(empty(slug));
      }
      setLoading(false);
    })();
  }, [slug]);

  const save = async () => {
    setSaving(true);
    const { error } = await (supabase as any)
      .from("location_pages")
      .upsert(page, { onConflict: "city_slug" });
    setSaving(false);
    if (error) {
      toast({ title: "Save failed", description: error.message, variant: "destructive" });
    } else {
      toast({ title: "Saved", description: `Updated /${slug} SEO content.` });
    }
  };

  const updateField = <K extends keyof CityPage>(k: K, v: CityPage[K]) =>
    setPage(p => ({ ...p, [k]: v }));

  const addFaq = () => updateField("faqs", [...page.faqs, { q: "", a: "" }]);
  const updateFaq = (i: number, f: Partial<FAQ>) =>
    updateField("faqs", page.faqs.map((x, idx) => idx === i ? { ...x, ...f } : x));
  const removeFaq = (i: number) =>
    updateField("faqs", page.faqs.filter((_, idx) => idx !== i));

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 text-[hsl(var(--admin-text))]">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">City SEO Pages</h1>
          <p className="text-sm opacity-70">Edit hero, body content, FAQs & metadata for each city landing page.</p>
        </div>
        <Button onClick={save} disabled={saving || loading}>
          {saving ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
          Save
        </Button>
      </div>

      <div>
        <Label>City</Label>
        <select
          className="w-full mt-1 h-10 px-3 rounded-md border bg-background"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
        >
          {locations.map(l => (
            <option key={l.slug} value={l.slug}>{l.city} (/{l.slug})</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex items-center gap-2"><Loader2 className="w-4 h-4 animate-spin" /> Loading…</div>
      ) : (
        <>
          <div className="flex items-center gap-3">
            <Switch checked={page.is_published} onCheckedChange={(v) => updateField("is_published", v)} />
            <Label>Published</Label>
          </div>

          <div className="grid gap-3">
            <div>
              <Label>Hero Title</Label>
              <Input value={page.hero_title} onChange={(e) => updateField("hero_title", e.target.value)} placeholder="Natural Supplements in Nairobi" />
            </div>
            <div>
              <Label>Hero Description</Label>
              <Textarea rows={3} value={page.hero_description} onChange={(e) => updateField("hero_description", e.target.value)} />
            </div>
            <div>
              <Label>Main SEO Content (HTML)</Label>
              <Textarea rows={12} className="font-mono text-xs" value={page.main_content_html} onChange={(e) => updateField("main_content_html", e.target.value)} placeholder="<h2>Heading</h2><p>Paragraph...</p>" />
              <p className="text-xs opacity-60 mt-1">Supports HTML: h2, h3, p, ul, ol, li, strong, a. Product mentions auto-link.</p>
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-base">Custom FAQs</Label>
              <Button size="sm" variant="outline" onClick={addFaq}><Plus className="w-3 h-3 mr-1" />Add FAQ</Button>
            </div>
            {page.faqs.map((f, i) => (
              <div key={i} className="border rounded p-3 space-y-2">
                <div className="flex justify-between gap-2">
                  <Input value={f.q} onChange={(e) => updateFaq(i, { q: e.target.value })} placeholder="Question" />
                  <Button size="icon" variant="ghost" onClick={() => removeFaq(i)}><Trash2 className="w-4 h-4" /></Button>
                </div>
                <Textarea rows={2} value={f.a} onChange={(e) => updateFaq(i, { a: e.target.value })} placeholder="Answer" />
              </div>
            ))}
          </div>

          <div className="grid md:grid-cols-2 gap-3 pt-4 border-t">
            <div>
              <Label>Meta Title</Label>
              <Input value={page.meta_title} onChange={(e) => updateField("meta_title", e.target.value)} maxLength={70} />
            </div>
            <div>
              <Label>Canonical URL</Label>
              <Input value={page.canonical_url} onChange={(e) => updateField("canonical_url", e.target.value)} placeholder={`https://bfsumaroyal.com/${slug}`} />
            </div>
            <div className="md:col-span-2">
              <Label>Meta Description</Label>
              <Textarea rows={2} maxLength={170} value={page.meta_description} onChange={(e) => updateField("meta_description", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>SEO Keywords (comma-separated)</Label>
              <Input value={page.seo_keywords.join(", ")} onChange={(e) => updateField("seo_keywords", e.target.value.split(",").map(s => s.trim()).filter(Boolean))} />
            </div>
            <div>
              <Label>OG Title</Label>
              <Input value={page.og_title} onChange={(e) => updateField("og_title", e.target.value)} />
            </div>
            <div>
              <Label>OG Image URL</Label>
              <Input value={page.og_image_url} onChange={(e) => updateField("og_image_url", e.target.value)} />
            </div>
            <div className="md:col-span-2">
              <Label>OG Description</Label>
              <Textarea rows={2} value={page.og_description} onChange={(e) => updateField("og_description", e.target.value)} />
            </div>
          </div>
        </>
      )}
    </div>
  );
}
