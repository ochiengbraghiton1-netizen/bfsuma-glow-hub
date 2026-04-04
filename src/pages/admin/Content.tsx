import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save, Upload, X, Image as ImageIcon } from 'lucide-react';
import { siteContentSchema } from '@/lib/validations';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { compressImage } from '@/lib/image-compression';

interface ContentSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
}

const defaultSections = [
  { key: 'hero', label: 'Hero Section', description: 'Main banner at the top of the page. Upload a real, high-quality image of your team or community.', hasImageUpload: true },
  { key: 'about', label: 'About Section', description: 'Information about BF SUMA', hasImageUpload: false },
  { key: 'doctor_consultation', label: 'Doctor Consultation', description: 'Wellness consultation section', hasImageUpload: false },
  { key: 'join_earn', label: 'Join & Earn', description: 'Business opportunity section', hasImageUpload: false },
  { key: 'community', label: 'Community', description: 'Training and mentorship section', hasImageUpload: false },
  { key: 'instagram_widget', label: 'Instagram Live Feed', description: 'Elfsight widget ID for the Community page Instagram feed. Paste only the widget ID (e.g. abc123-def456)', hasImageUpload: false },
];

const Content = () => {
  const [sections, setSections] = useState<Record<string, ContentSection>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchContent = async () => {
    const { data, error } = await supabase
      .from('site_content')
      .select('*');

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch content', variant: 'destructive' });
    } else {
      const contentMap: Record<string, ContentSection> = {};
      data?.forEach((item) => {
        contentMap[item.section_key] = item;
      });
      setSections(contentMap);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleSave = async (sectionKey: string, formData: Partial<ContentSection>) => {
    setSaving(sectionKey);

    const validation = siteContentSchema.safeParse(formData);
    if (!validation.success) {
      const firstError = validation.error.errors[0];
      toast({ title: 'Validation Error', description: firstError.message, variant: 'destructive' });
      setSaving(null);
      return;
    }

    const existing = sections[sectionKey];
    let error;

    const sanitizedData = {
      title: formData.title?.trim() || null,
      subtitle: formData.subtitle?.trim() || null,
      content: formData.content?.trim() || null,
      image_url: formData.image_url?.trim() || null,
    };

    if (existing) {
      const result = await supabase
        .from('site_content')
        .update(sanitizedData)
        .eq('id', existing.id);
      error = result.error;
    } else {
      const result = await supabase.from('site_content').insert({
        section_key: sectionKey,
        ...sanitizedData,
      });
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error', description: 'Failed to save content. Please try again.', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Content saved successfully' });
      fetchContent();
    }
    setSaving(null);
  };

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
        <h1 className="text-3xl font-bold">Site Content</h1>
        <p className="text-muted-foreground">Edit the text and images on your website</p>
      </div>

      <div className="space-y-6">
        {defaultSections.map((section) => (
          <ContentCard
            key={section.key}
            sectionKey={section.key}
            label={section.label}
            description={section.description}
            hasImageUpload={section.hasImageUpload}
            data={sections[section.key]}
            onSave={handleSave}
            saving={saving === section.key}
          />
        ))}
      </div>
    </div>
  );
};

interface ContentCardProps {
  sectionKey: string;
  label: string;
  description: string;
  hasImageUpload?: boolean;
  data?: ContentSection;
  onSave: (key: string, data: Partial<ContentSection>) => void;
  saving: boolean;
}

const ContentCard = ({ sectionKey, label, description, hasImageUpload, data, onSave, saving }: ContentCardProps) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    subtitle: data?.subtitle || '',
    content: data?.content || '',
    image_url: data?.image_url || '',
  });
  const [uploading, setUploading] = useState(false);
  const [imagePreview, setImagePreview] = useState<string | null>(data?.image_url || null);
  const { toast } = useToast();

  useEffect(() => {
    setFormData({
      title: data?.title || '',
      subtitle: data?.subtitle || '',
      content: data?.content || '',
      image_url: data?.image_url || '',
    });
    setImagePreview(data?.image_url || null);
  }, [data]);

  const handleImageUpload = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Error', description: 'Please select an image file', variant: 'destructive' });
      return;
    }

    setUploading(true);
    try {
      const compressed = await compressImage(file, 1920, 1080, 0.85);
      const fileName = `${sectionKey}-${Date.now()}.${compressed.type.includes('png') ? 'png' : 'jpg'}`;

      const { error: uploadError } = await supabase.storage
        .from('categories')
        .upload(`site-content/${fileName}`, compressed, { upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('categories')
        .getPublicUrl(`site-content/${fileName}`);

      const publicUrl = urlData.publicUrl;
      setFormData(prev => ({ ...prev, image_url: publicUrl }));
      setImagePreview(publicUrl);
      toast({ title: 'Image uploaded', description: 'Click Save to apply changes.' });
    } catch (err) {
      toast({ title: 'Upload failed', description: 'Could not upload image. Try again.', variant: 'destructive' });
    } finally {
      setUploading(false);
    }
  }, [sectionKey, toast]);

  const clearImage = () => {
    setFormData(prev => ({ ...prev, image_url: '' }));
    setImagePreview(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(sectionKey, formData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{label}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Image upload for hero */}
          {hasImageUpload && (
            <div className="space-y-3">
              <Label>Hero Image (Upload a real photo — team, community, or customers)</Label>
              {imagePreview ? (
                <div className="relative rounded-lg overflow-hidden border border-border max-w-md">
                  <img src={imagePreview} alt="Preview" className="w-full h-48 object-cover" />
                  <button
                    type="button"
                    onClick={clearImage}
                    className="absolute top-2 right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:opacity-80"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-center w-full max-w-md h-48 border-2 border-dashed border-border rounded-lg bg-muted/30">
                  <div className="text-center text-muted-foreground">
                    <ImageIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No image uploaded</p>
                  </div>
                </div>
              )}
              <div className="flex gap-3 items-center">
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
                    {uploading ? 'Uploading...' : imagePreview ? 'Replace Image' : 'Upload Image'}
                  </span>
                </label>
              </div>
            </div>
          )}

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor={`${sectionKey}-title`}>Title</Label>
              <Input
                id={`${sectionKey}-title`}
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Section title"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor={`${sectionKey}-subtitle`}>Subtitle</Label>
              <Input
                id={`${sectionKey}-subtitle`}
                value={formData.subtitle}
                onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                placeholder="Section subtitle"
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor={`${sectionKey}-content`}>Content</Label>
            <RichTextEditor
              content={formData.content}
              onChange={(content) => setFormData({ ...formData, content })}
              placeholder="Main content text..."
              minHeight="200px"
            />
          </div>
          {!hasImageUpload && (
            <div className="space-y-2">
              <Label htmlFor={`${sectionKey}-image`}>Image URL</Label>
              <Input
                id={`${sectionKey}-image`}
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
          )}
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
            Save Changes
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default Content;
