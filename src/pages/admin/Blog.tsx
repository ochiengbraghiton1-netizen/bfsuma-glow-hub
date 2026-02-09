import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { format } from 'date-fns';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

const initialFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  meta_title: '',
  meta_description: '',
  status: 'draft',
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const { toast } = useToast();

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch blog posts', variant: 'destructive' });
    } else {
      setPosts(data || []);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData({
      ...formData,
      title,
      slug: editingPost ? formData.slug : generateSlug(title),
      meta_title: formData.meta_title || title,
    });
  };

  const openCreateDialog = () => {
    setEditingPost(null);
    setFormData(initialFormState);
    setDialogOpen(true);
  };

  const openEditDialog = (post: BlogPost) => {
    setEditingPost(post);
    setFormData({
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      status: post.status,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.title.trim() || !formData.slug.trim()) {
      toast({ title: 'Error', description: 'Title and slug are required', variant: 'destructive' });
      return;
    }

    setSaving(true);

    const postData = {
      title: formData.title.trim(),
      slug: formData.slug.trim(),
      excerpt: formData.excerpt.trim() || null,
      content: formData.content || null,
      featured_image: formData.featured_image.trim() || null,
      meta_title: formData.meta_title.trim() || null,
      meta_description: formData.meta_description.trim() || null,
      status: formData.status,
      published_at: formData.status === 'published' ? new Date().toISOString() : null,
    };

    let error;

    if (editingPost) {
      const result = await supabase
        .from('blog_posts')
        .update(postData)
        .eq('id', editingPost.id);
      error = result.error;
    } else {
      const result = await supabase.from('blog_posts').insert(postData);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Blog post ${editingPost ? 'updated' : 'created'} successfully` });
      setDialogOpen(false);
      fetchPosts();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    const { error } = await supabase.from('blog_posts').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to delete post', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Post deleted successfully' });
      fetchPosts();
    }
  };

  const toggleStatus = async (post: BlogPost) => {
    const newStatus = post.status === 'published' ? 'draft' : 'published';
    const { error } = await supabase
      .from('blog_posts')
      .update({
        status: newStatus,
        published_at: newStatus === 'published' ? new Date().toISOString() : null,
      })
      .eq('id', post.id);

    if (error) {
      toast({ title: 'Error', description: 'Failed to update status', variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: `Post ${newStatus === 'published' ? 'published' : 'unpublished'}` });
      fetchPosts();
    }
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
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[hsl(var(--admin-text))]">Blog Posts</h1>
          <p className="text-muted-foreground">Manage your blog content and marketing copy</p>
        </div>
        <Button onClick={openCreateDialog}>
          <Plus className="h-4 w-4 mr-2" />
          New Post
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-[hsl(var(--admin-text))]">All Posts</CardTitle>
        </CardHeader>
        <CardContent>
          {posts.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No blog posts yet. Create your first post!
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="text-[hsl(var(--admin-text))]">Title</TableHead>
                  <TableHead className="text-[hsl(var(--admin-text))]">Status</TableHead>
                  <TableHead className="text-[hsl(var(--admin-text))]">Created</TableHead>
                  <TableHead className="text-[hsl(var(--admin-text))]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium text-[hsl(var(--admin-text))]">{post.title}</p>
                        <p className="text-sm text-muted-foreground">/blog/{post.slug}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={post.status === 'published' ? 'default' : 'secondary'}>
                        {post.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-[hsl(var(--admin-text))]">
                      {format(new Date(post.created_at), 'MMM d, yyyy')}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleStatus(post)}
                          title={post.status === 'published' ? 'Unpublish' : 'Publish'}
                        >
                          {post.status === 'published' ? (
                            <EyeOff className="h-4 w-4" />
                          ) : (
                            <Eye className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(post)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        {post.status === 'published' && (
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(post.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6">
            {/* Basic Info */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-[hsl(var(--admin-text))]">Title *</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => handleTitleChange(e.target.value)}
                  placeholder="Enter post title"
                  className="text-[hsl(var(--admin-text))] bg-background"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="slug" className="text-[hsl(var(--admin-text))]">URL Slug *</Label>
                <Input
                  id="slug"
                  value={formData.slug}
                  onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                  placeholder="post-url-slug"
                  className="text-[hsl(var(--admin-text))] bg-background"
                />
              </div>
            </div>

            {/* Excerpt */}
            <div className="space-y-2">
              <Label htmlFor="excerpt" className="text-[hsl(var(--admin-text))]">Excerpt</Label>
              <Input
                id="excerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                placeholder="Brief description for previews"
                className="text-[hsl(var(--admin-text))] bg-background"
              />
            </div>

            {/* Content Editor */}
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Content</Label>
              <RichTextEditor
                content={formData.content}
                onChange={(content) => setFormData({ ...formData, content })}
                placeholder="Write your blog post content..."
                minHeight="300px"
              />
            </div>

            {/* Featured Image */}
            <div className="space-y-2">
              <Label htmlFor="featured_image" className="text-[hsl(var(--admin-text))]">Featured Image URL</Label>
              <Input
                id="featured_image"
                value={formData.featured_image}
                onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                placeholder="https://example.com/image.jpg"
                className="text-[hsl(var(--admin-text))] bg-background"
              />
            </div>

            {/* SEO Fields */}
            <div className="border-t pt-4">
              <h3 className="font-medium mb-4 text-[hsl(var(--admin-text))]">SEO Settings</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="meta_title" className="text-[hsl(var(--admin-text))]">Meta Title</Label>
                  <Input
                    id="meta_title"
                    value={formData.meta_title}
                    onChange={(e) => setFormData({ ...formData, meta_title: e.target.value })}
                    placeholder="SEO title (max 60 chars)"
                    maxLength={60}
                    className="text-[hsl(var(--admin-text))] bg-background"
                  />
                  <p className="text-xs text-muted-foreground">{formData.meta_title.length}/60</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-[hsl(var(--admin-text))]">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                  >
                    <SelectTrigger className="text-[hsl(var(--admin-text))] bg-background">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[60]">
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-2 mt-4">
                <Label htmlFor="meta_description" className="text-[hsl(var(--admin-text))]">Meta Description</Label>
                <Input
                  id="meta_description"
                  value={formData.meta_description}
                  onChange={(e) => setFormData({ ...formData, meta_description: e.target.value })}
                  placeholder="SEO description (max 160 chars)"
                  maxLength={160}
                  className="text-[hsl(var(--admin-text))] bg-background"
                />
                <p className="text-xs text-muted-foreground">{formData.meta_description.length}/160</p>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={saving}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {editingPost ? 'Update Post' : 'Create Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
