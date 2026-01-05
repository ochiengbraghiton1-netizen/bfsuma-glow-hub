import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Save } from 'lucide-react';
import { siteContentSchema } from '@/lib/validations';

interface ContentSection {
  id: string;
  section_key: string;
  title: string | null;
  subtitle: string | null;
  content: string | null;
  image_url: string | null;
}

const defaultSections = [
  { key: 'hero', label: 'Hero Section', description: 'Main banner at the top of the page' },
  { key: 'about', label: 'About Section', description: 'Information about BF SUMA' },
  { key: 'doctor_consultation', label: 'Doctor Consultation', description: 'Wellness consultation section' },
  { key: 'join_earn', label: 'Join & Earn', description: 'Business opportunity section' },
  { key: 'community', label: 'Community', description: 'Training and mentorship section' },
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

    // Validate form data
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
  data?: ContentSection;
  onSave: (key: string, data: Partial<ContentSection>) => void;
  saving: boolean;
}

const ContentCard = ({ sectionKey, label, description, data, onSave, saving }: ContentCardProps) => {
  const [formData, setFormData] = useState({
    title: data?.title || '',
    subtitle: data?.subtitle || '',
    content: data?.content || '',
    image_url: data?.image_url || '',
  });

  useEffect(() => {
    setFormData({
      title: data?.title || '',
      subtitle: data?.subtitle || '',
      content: data?.content || '',
      image_url: data?.image_url || '',
    });
  }, [data]);

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
            <Textarea
              id={`${sectionKey}-content`}
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              placeholder="Main content text..."
              rows={4}
            />
          </div>
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
