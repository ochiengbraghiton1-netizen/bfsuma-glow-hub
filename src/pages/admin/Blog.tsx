import { useEffect, useRef, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff, ExternalLink, Calendar as CalendarIcon, Tag, Copy, Check, CircleDot, ArrowUp, ArrowDown } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
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
import { Checkbox } from '@/components/ui/checkbox';
import RichTextEditor from '@/components/ui/rich-text-editor';
import { format } from 'date-fns';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { notifyIndexNow } from '@/lib/indexnow';

interface BlogCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
}

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string | null;
  featured_image: string | null;
  video_url: string | null;
  is_featured: boolean;
  meta_title: string | null;
  meta_description: string | null;
  status: string;
  published_at: string | null;
  scheduled_at: string | null;
  created_at: string;
  updated_at: string;
}

interface QuizOptionRow {
  id?: string;
  label: string;
  product_id: string;
  reason: string;
}

interface FaqRow {
  id?: string;
  question: string;
  answer: string;
}



interface ProductOption {
  id: string;
  name: string;
}

const initialFormState = {
  title: '',
  slug: '',
  excerpt: '',
  content: '',
  featured_image: '',
  video_url: '',
  is_featured: false,
  meta_title: '',
  meta_description: '',
  status: 'draft',
  content_type: 'health' as 'health' | 'business',
  scheduled_at: null as Date | null,
  category_ids: [] as string[],
  product_ids: [] as string[],
};

const Blog = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [categories, setCategories] = useState<BlogCategory[]>([]);
  const [postCategories, setPostCategories] = useState<Record<string, string[]>>({});
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [formData, setFormData] = useState(initialFormState);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [quizOptions, setQuizOptions] = useState<QuizOptionRow[]>([]);
  const [faqItems, setFaqItems] = useState<FaqRow[]>([]);
  const [saveState, setSaveState] = useState<'idle' | 'saving' | 'saved' | 'dirty'>('idle');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const savingRef = useRef(false);
  const baselineRef = useRef<string>('');
  const lastUpdatedRef = useRef<string | null>(null);
  const snapshotRef = useRef<{ formData: typeof initialFormState; quizOptions: QuizOptionRow[]; faqItems: FaqRow[]; editingPost: BlogPost | null }>({
    formData: initialFormState,
    quizOptions: [],
    faqItems: [],
    editingPost: null,
  });
  const { toast } = useToast();

  const serialize = (fd: typeof initialFormState, q: QuizOptionRow[], f: FaqRow[] = []) =>
    JSON.stringify({ ...fd, scheduled_at: fd.scheduled_at?.toISOString() || null, q, f });

  useEffect(() => {
    snapshotRef.current = { formData, quizOptions, faqItems, editingPost };
    if (!dialogOpen) return;
    if (savingRef.current) return;
    const dirty = serialize(formData, quizOptions, faqItems) !== baselineRef.current;
    setSaveState((prev) => (dirty ? 'dirty' : prev === 'dirty' ? (lastSavedAt ? 'saved' : 'idle') : prev));
  }, [formData, quizOptions, faqItems, editingPost, dialogOpen, lastSavedAt]);



  const fetchCategories = async () => {
    const { data, error } = await supabase
      .from('blog_categories')
      .select('*')
      .order('name');

    if (!error && data) {
      setCategories(data);
    }
  };

  const fetchPosts = async () => {
    const { data, error } = await supabase
      .from('blog_posts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error', description: 'Failed to fetch blog posts', variant: 'destructive' });
    } else {
      setPosts(data || []);

      // Fetch categories for all posts
      const { data: postCatsData } = await supabase
        .from('blog_post_categories')
        .select('post_id, category_id');

      if (postCatsData) {
        const catMap: Record<string, string[]> = {};
        postCatsData.forEach(pc => {
          if (!catMap[pc.post_id]) catMap[pc.post_id] = [];
          catMap[pc.post_id].push(pc.category_id);
        });
        setPostCategories(catMap);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
    fetchPosts();
    // Fetch all products for tagging
    supabase.from('products').select('id, name').eq('is_active', true).order('name').then(({ data }) => {
      if (data) setAllProducts(data);
    });
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
    setQuizOptions([]);
    setFaqItems([]);
    baselineRef.current = serialize(initialFormState, [], []);
    lastUpdatedRef.current = null;
    setLastSavedAt(null);
    setSaveState('idle');
    setDialogOpen(true);
  };

  const openEditDialog = async (post: BlogPost) => {
    setEditingPost(post);
    lastUpdatedRef.current = post.updated_at;
    setLastSavedAt(null);
    setSaveState('idle');

    
    // Fetch post categories
    const { data: postCats } = await supabase
      .from('blog_post_categories')
      .select('category_id')
      .eq('post_id', post.id);

    // Fetch post products
    const { data: postProds } = await supabase
      .from('blog_post_products')
      .select('product_id')
      .eq('post_id', post.id);

    // Fetch quiz options
    const { data: quizRows } = await supabase
      .from('blog_post_quiz_options')
      .select('id, label, product_id, reason, display_order')
      .eq('post_id', post.id)
      .order('display_order');

    const loadedQuiz: QuizOptionRow[] = (quizRows || []).map(r => ({
      id: r.id,
      label: r.label,
      product_id: r.product_id,
      reason: r.reason || '',
    }));
    setQuizOptions(loadedQuiz);

    // Fetch FAQ items
    const { data: faqRows } = await supabase
      .from('blog_post_faqs')
      .select('id, question, answer, display_order')
      .eq('post_id', post.id)
      .order('display_order');

    const loadedFaqs: FaqRow[] = (faqRows || []).map(r => ({
      id: r.id,
      question: r.question,
      answer: r.answer,
    }));
    setFaqItems(loadedFaqs);



    const loaded = {
      title: post.title,
      slug: post.slug,
      excerpt: post.excerpt || '',
      content: post.content || '',
      featured_image: post.featured_image || '',
      video_url: post.video_url || '',
      is_featured: post.is_featured || false,
      meta_title: post.meta_title || '',
      meta_description: post.meta_description || '',
      status: post.status,
      content_type: ((post as any).content_type === 'business' ? 'business' : 'health') as 'health' | 'business',
      scheduled_at: post.scheduled_at ? new Date(post.scheduled_at) : null,
      category_ids: postCats?.map(pc => pc.category_id) || [],
      product_ids: postProds?.map(pp => pp.product_id) || [],
    };
    setFormData(loaded);
    baselineRef.current = serialize(loaded, loadedQuiz, loadedFaqs);
    setDialogOpen(true);

  };

  const persist = useCallback(
    async (opts: { silent?: boolean; asDraft?: boolean; closeOnSuccess?: boolean } = {}) => {
      const { formData: fd, quizOptions: qo, faqItems: fq, editingPost: ep } = snapshotRef.current;

      if (!fd.title.trim() || !fd.slug.trim()) {
        if (!opts.silent) {
          toast({ title: 'Error', description: 'Title and slug are required', variant: 'destructive' });
        }
        return false;
      }

      // Prevent overlapping saves (autosave vs manual save)
      if (savingRef.current) return false;
      savingRef.current = true;
      if (!opts.silent) setSaving(true);
      setSaveState('saving');

      const attempted = serialize(fd, qo, fq);
      // Save Draft never unpublishes an already-published post
      const status = opts.asDraft && fd.status !== 'published' ? 'draft' : fd.status;

      const postData = {
        title: fd.title.trim(),
        slug: fd.slug.trim(),
        excerpt: fd.excerpt.trim() || null,
        content: fd.content || null,
        featured_image: fd.featured_image.trim() || null,
        video_url: fd.video_url.trim() || null,
        is_featured: fd.is_featured,
        meta_title: fd.meta_title.trim() || null,
        meta_description: fd.meta_description.trim() || null,
        status,
        content_type: fd.content_type,
        published_at: status === 'published' ? (ep?.published_at || new Date().toISOString()) : null,
        scheduled_at: fd.scheduled_at?.toISOString() || null,
      };

      let postId: string | null = null;
      let error: { message: string } | null = null;
      let newUpdatedAt: string | null = null;
      let stale = false;

      if (ep) {
        let query = supabase.from('blog_posts').update(postData).eq('id', ep.id);
        // Concurrency guard: refuse to overwrite a row changed since we loaded/saved it
        if (lastUpdatedRef.current) {
          query = query.lte('updated_at', lastUpdatedRef.current);
        }
        const result = await query.select('*').maybeSingle();
        error = result.error;
        if (!result.error && !result.data) {
          stale = true;
        } else if (result.data) {
          postId = ep.id;
          newUpdatedAt = (result.data as BlogPost).updated_at;
        }
      } else {
        const result = await supabase.from('blog_posts').insert(postData).select('*').single();
        error = result.error;
        postId = result.data?.id || null;
        newUpdatedAt = (result.data as BlogPost | null)?.updated_at || null;
        if (result.data) setEditingPost(result.data as BlogPost);
      }

      if (stale) {
        savingRef.current = false;
        setSaving(false);
        setSaveState('dirty');
        toast({
          title: 'Not saved',
          description: 'This article was changed somewhere else. Reopen it to get the latest version before saving again.',
          variant: 'destructive',
        });
        return false;
      }

      if (error || !postId) {
        savingRef.current = false;
        setSaving(false);
        setSaveState('dirty');
        if (!opts.silent) {
          toast({ title: 'Error', description: error?.message || 'Failed to save', variant: 'destructive' });
        }
        return false;
      }

      // Update categories
      await supabase.from('blog_post_categories').delete().eq('post_id', postId);
      if (fd.category_ids.length > 0) {
        await supabase.from('blog_post_categories').insert(
          fd.category_ids.map(catId => ({ post_id: postId!, category_id: catId }))
        );
      }

      // Update product links
      await supabase.from('blog_post_products').delete().eq('post_id', postId);
      if (fd.product_ids.length > 0) {
        await supabase.from('blog_post_products').insert(
          fd.product_ids.map(prodId => ({ post_id: postId!, product_id: prodId }))
        );
      }

      // Update quiz options
      await supabase.from('blog_post_quiz_options').delete().eq('post_id', postId);
      const validQuiz = qo.filter(q => q.label.trim() && q.product_id);
      if (validQuiz.length > 0) {
        await supabase.from('blog_post_quiz_options').insert(
          validQuiz.map((q, i) => ({
            post_id: postId!,
            label: q.label.trim(),
            product_id: q.product_id,
            reason: q.reason.trim() || null,
            display_order: i,
          }))
        );
      }

      // Update FAQ items
      await supabase.from('blog_post_faqs').delete().eq('post_id', postId);
      const validFaqs = fq.filter(f => f.question.trim() && f.answer.trim());
      if (validFaqs.length > 0) {
        await supabase.from('blog_post_faqs').insert(
          validFaqs.map((f, i) => ({
            post_id: postId!,
            question: f.question.trim(),
            answer: f.answer.trim(),
            display_order: i,
          }))
        );
      }



      lastUpdatedRef.current = newUpdatedAt;
      baselineRef.current = attempted;
      setLastSavedAt(new Date());
      setSaveState('saved');
      savingRef.current = false;
      setSaving(false);

      if (!opts.silent) {
        toast({
          title: 'Saved',
          description: status === 'published' ? 'Article saved and published' : 'Draft saved',
        });
      }

      fetchPosts();

      if (opts.closeOnSuccess) setDialogOpen(false);

      // Notify IndexNow only for published articles
      if (status === 'published') {
        const blogUrl = `/blog/${fd.slug.trim()}`;
        notifyIndexNow([blogUrl, '/blog'], ep ? 'blog_updated' : 'blog_published');
      }

      return true;
    },
    [toast]
  );

  const handleSave = () => persist({ closeOnSuccess: true });
  const handleSaveDraft = () => persist({ asDraft: true });

  // Autosave every 20s while there are unsaved changes
  useEffect(() => {
    if (!dialogOpen) return;
    const timer = setInterval(() => {
      const { formData: fd, quizOptions: qo, faqItems: fq } = snapshotRef.current;
      if (savingRef.current) return;
      if (!fd.title.trim() || !fd.slug.trim()) return;
      if (serialize(fd, qo, fq) === baselineRef.current) return;
      persist({ silent: true, asDraft: true });
    }, 20000);
    return () => clearInterval(timer);
  }, [dialogOpen, persist]);

  // Warn before closing the browser with unsaved changes
  useEffect(() => {
    if (!dialogOpen) return;
    const handler = (e: BeforeUnloadEvent) => {
      const { formData: fd, quizOptions: qo, faqItems: fq } = snapshotRef.current;
      if (serialize(fd, qo, fq) !== baselineRef.current) {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [dialogOpen]);

  const handleDialogOpenChange = (open: boolean) => {
    if (!open) {
      const { formData: fd, quizOptions: qo, faqItems: fq } = snapshotRef.current;
      if (serialize(fd, qo, fq) !== baselineRef.current && fd.title.trim()) {
        if (!confirm('You have unsaved changes. Close anyway? Use "Save Draft" to keep them.')) return;
      }
    }
    setDialogOpen(open);
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

  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) return;

    const slug = newCategoryName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const { error } = await supabase.from('blog_categories').insert({
      name: newCategoryName.trim(),
      slug,
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Category added' });
      setNewCategoryName('');
      fetchCategories();
    }
  };

  const handleDeleteCategory = async (id: string) => {
    if (!confirm('Delete this category? Posts will be uncategorized.')) return;

    const { error } = await supabase.from('blog_categories').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      fetchCategories();
    }
  };

  const toggleCategory = (categoryId: string) => {
    setFormData(prev => ({
      ...prev,
      category_ids: prev.category_ids.includes(categoryId)
        ? prev.category_ids.filter(id => id !== categoryId)
        : [...prev.category_ids, categoryId]
    }));
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCategoryDialogOpen(true)}>
            <Tag className="h-4 w-4 mr-2" />
            Categories
          </Button>
          <Button onClick={openCreateDialog}>
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>
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
                  <TableHead className="text-[hsl(var(--admin-text))]">Categories</TableHead>
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
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-[hsl(var(--admin-text))]">{post.title}</p>
                          {post.is_featured && <Badge variant="outline" className="text-xs">⭐ Featured</Badge>}
                          {post.video_url && <Badge variant="outline" className="text-xs">🎥 Video</Badge>}
                        </div>
                        <p className="text-sm text-muted-foreground">/blog/{post.slug}</p>
                        {post.scheduled_at && new Date(post.scheduled_at) > new Date() && (
                          <p className="text-xs text-amber-500 flex items-center gap-1 mt-1">
                            <CalendarIcon className="h-3 w-3" />
                            Scheduled: {format(new Date(post.scheduled_at), 'MMM d, yyyy h:mm a')}
                          </p>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap gap-1">
                        {postCategories[post.id]?.map(catId => {
                          const cat = categories.find(c => c.id === catId);
                          return cat ? (
                            <Badge key={catId} variant="secondary" className="text-xs">
                              {cat.name}
                            </Badge>
                          ) : null;
                        })}
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
                          <>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                const url = `https://bfsumaroyal.com/blog/${post.slug}`;
                                navigator.clipboard.writeText(url);
                                toast({ title: 'Copied!', description: url });
                              }}
                              title="Copy link"
                            >
                              <Copy className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              asChild
                            >
                              <a href={`/blog/${post.slug}`} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-4 w-4" />
                              </a>
                            </Button>
                          </>
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
      <Dialog open={dialogOpen} onOpenChange={handleDialogOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto z-50">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">
              {editingPost ? 'Edit Post' : 'Create New Post'}
            </DialogTitle>
            <DialogDescription>
              Fill in the details below to {editingPost ? 'update' : 'create'} your blog post.
            </DialogDescription>
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

            {/* Content Type */}
            <div className="space-y-2">
              <Label htmlFor="content_type" className="text-[hsl(var(--admin-text))]">Content Type *</Label>
              <Select
                value={formData.content_type}
                onValueChange={(value: 'health' | 'business') => setFormData({ ...formData, content_type: value })}
              >
                <SelectTrigger className="text-[hsl(var(--admin-text))] bg-background">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="z-[60]">
                  <SelectItem value="health">Health Content (shows on /blog and homepage)</SelectItem>
                  <SelectItem value="business">Business Opportunity Content (shows on /business)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Determines where this article appears. Health = /blog. Business = /business/blog.
              </p>
            </div>

            {/* Categories */}
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Categories</Label>
              <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/20">
                {categories.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No categories yet. Create one first.</p>
                ) : (
                  categories.map((cat) => (
                    <label
                      key={cat.id}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors",
                        formData.category_ids.includes(cat.id)
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted hover:bg-muted/80"
                      )}
                    >
                      <Checkbox
                        checked={formData.category_ids.includes(cat.id)}
                        onCheckedChange={() => toggleCategory(cat.id)}
                        className="sr-only"
                      />
                      <span className="text-sm">{cat.name}</span>
                    </label>
                  ))
                )}
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
              <Label className="text-[hsl(var(--admin-text))]">Featured Image</Label>
              {formData.featured_image && (
                <div className="relative w-full aspect-video rounded-lg overflow-hidden border bg-muted">
                  <img src={formData.featured_image} alt="Featured" className="w-full h-full object-cover" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="absolute top-2 right-2"
                    onClick={() => setFormData({ ...formData, featured_image: '' })}
                  >
                    Remove
                  </Button>
                </div>
              )}
              {!formData.featured_image && (
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        if (file.size > 5 * 1024 * 1024) {
                          toast({ title: 'File too large', description: 'Max 5MB', variant: 'destructive' });
                          return;
                        }
                        const fileExt = file.name.split('.').pop();
                        const fileName = `blog-featured-${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
                        const filePath = `blog-images/${fileName}`;
                        const { error: uploadError } = await supabase.storage.from('products').upload(filePath, file);
                        if (uploadError) {
                          toast({ title: 'Upload failed', description: uploadError.message, variant: 'destructive' });
                          return;
                        }
                        const { data: { publicUrl } } = supabase.storage.from('products').getPublicUrl(filePath);
                        setFormData({ ...formData, featured_image: publicUrl });
                        toast({ title: 'Image uploaded' });
                      }}
                      className="text-[hsl(var(--admin-text))] bg-background"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Or paste a URL:</p>
                  <Input
                    value={formData.featured_image}
                    onChange={(e) => setFormData({ ...formData, featured_image: e.target.value })}
                    placeholder="https://example.com/image.jpg"
                    className="text-[hsl(var(--admin-text))] bg-background"
                  />
                </div>
              )}
            </div>

            {/* Video URL */}
            <div className="space-y-2">
              <Label htmlFor="video_url" className="text-[hsl(var(--admin-text))]">Video URL (YouTube, TikTok, Instagram)</Label>
              <Input
                id="video_url"
                value={formData.video_url}
                onChange={(e) => setFormData({ ...formData, video_url: e.target.value })}
                placeholder="https://youtube.com/watch?v=..."
                className="text-[hsl(var(--admin-text))] bg-background"
              />
            </div>

            {/* Featured Toggle & Product Tagging */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Featured Post</Label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <Checkbox
                    checked={formData.is_featured}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_featured: !!checked })}
                  />
                  <span className="text-sm text-[hsl(var(--admin-text))]">Show on homepage "Community Stories"</span>
                </label>
              </div>
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Related Products</Label>
                <div className="flex flex-wrap gap-2 p-3 border rounded-md bg-muted/20 max-h-40 overflow-y-auto">
                  {allProducts.length === 0 ? (
                    <p className="text-sm text-muted-foreground">No products available.</p>
                  ) : (
                    allProducts.map((prod) => (
                      <label
                        key={prod.id}
                        className={cn(
                          "flex items-center gap-2 px-3 py-1.5 rounded-full cursor-pointer transition-colors text-sm",
                          formData.product_ids.includes(prod.id)
                            ? "bg-primary text-primary-foreground"
                            : "bg-muted hover:bg-muted/80"
                        )}
                      >
                        <Checkbox
                          checked={formData.product_ids.includes(prod.id)}
                          onCheckedChange={() => {
                            setFormData(prev => ({
                              ...prev,
                              product_ids: prev.product_ids.includes(prod.id)
                                ? prev.product_ids.filter(id => id !== prod.id)
                                : [...prev.product_ids, prod.id]
                            }));
                          }}
                          className="sr-only"
                        />
                        {prod.name}
                      </label>
                    ))
                  )}
                </div>
              </div>
            </div>


            {/* Reader Quiz */}
            <div className="space-y-2">
              <Label className="text-[hsl(var(--admin-text))]">Reader Quiz (optional)</Label>
              <p className="text-xs text-muted-foreground">
                Add 2-4 options so readers get a personalized mini-quiz on this post instead of a generic signup form.
              </p>
              <div className="space-y-2">
                {quizOptions.map((q, idx) => (
                  <div key={idx} className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto] items-center p-3 border rounded-md bg-muted/20">
                    <Input
                      value={q.label}
                      placeholder="e.g. Joint pain when climbing stairs"
                      onChange={(e) => setQuizOptions(prev => prev.map((r, i) => i === idx ? { ...r, label: e.target.value } : r))}
                      className="text-[hsl(var(--admin-text))] bg-background"
                    />
                    <Select
                      value={q.product_id}
                      onValueChange={(v) => setQuizOptions(prev => prev.map((r, i) => i === idx ? { ...r, product_id: v } : r))}
                    >
                      <SelectTrigger className="bg-background">
                        <SelectValue placeholder="Recommended product" />
                      </SelectTrigger>
                      <SelectContent className="z-[60]">
                        {allProducts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Input
                      value={q.reason}
                      placeholder="e.g. targeted joint support and mobility"
                      onChange={(e) => setQuizOptions(prev => prev.map((r, i) => i === idx ? { ...r, reason: e.target.value } : r))}
                      className="text-[hsl(var(--admin-text))] bg-background"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setQuizOptions(prev => prev.filter((_, i) => i !== idx))}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                ))}
              </div>
              {quizOptions.length < 4 && (
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setQuizOptions(prev => [...prev, { label: '', product_id: '', reason: '' }])}
                >
                  <Plus className="h-4 w-4 mr-2" /> Add option
                </Button>
              )}
            </div>

            {/* Scheduling */}
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label className="text-[hsl(var(--admin-text))]">Schedule Publication</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !formData.scheduled_at && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.scheduled_at ? format(formData.scheduled_at, "PPP") : "Pick a date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 z-[60]">
                    <Calendar
                      mode="single"
                      selected={formData.scheduled_at || undefined}
                      onSelect={(date) => setFormData({ ...formData, scheduled_at: date || null })}
                      disabled={(date) => date < new Date()}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {formData.scheduled_at && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData({ ...formData, scheduled_at: null })}
                    className="text-xs"
                  >
                    Clear date
                  </Button>
                )}
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
          </div>

          <DialogFooter className="gap-2 sm:justify-between">
            <div className="flex items-center text-xs text-muted-foreground min-h-[1.5rem]">
              {saveState === 'saving' && (
                <span className="flex items-center gap-1.5"><Loader2 className="h-3 w-3 animate-spin" /> Saving…</span>
              )}
              {saveState === 'saved' && (
                <span className="flex items-center gap-1.5 text-green-600">
                  <Check className="h-3 w-3" /> Saved{lastSavedAt ? ` at ${format(lastSavedAt, 'HH:mm')}` : ''}
                </span>
              )}
              {saveState === 'dirty' && (
                <span className="flex items-center gap-1.5 text-amber-600"><CircleDot className="h-3 w-3" /> Unsaved changes</span>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => handleDialogOpenChange(false)}>
                Cancel
              </Button>
              <Button variant="secondary" onClick={handleSaveDraft} disabled={saving}>
                Save Draft
              </Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                {editingPost ? 'Update Post' : 'Create Post'}
              </Button>
            </div>
          </DialogFooter>

        </DialogContent>
      </Dialog>

      {/* Categories Dialog */}
      <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
        <DialogContent className="max-w-md z-50">
          <DialogHeader>
            <DialogTitle className="text-[hsl(var(--admin-text))]">Manage Categories</DialogTitle>
            <DialogDescription>Add or remove blog post categories.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="New category name"
                className="text-[hsl(var(--admin-text))] bg-background"
              />
              <Button onClick={handleAddCategory}>Add</Button>
            </div>

            <div className="space-y-2">
              {categories.map((cat) => (
                <div key={cat.id} className="flex items-center justify-between p-2 border rounded">
                  <span className="text-[hsl(var(--admin-text))]">{cat.name}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
              {categories.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">No categories yet</p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button onClick={() => setCategoryDialogOpen(false)}>Done</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blog;
