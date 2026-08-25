import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Instagram, Facebook, Twitter, Video, ExternalLink, Upload, X, Loader2 } from "lucide-react";
import { compressImage, formatFileSize } from "@/lib/image-compression";

const platformOptions = [
  { value: "instagram", label: "Instagram", icon: Instagram },
  { value: "facebook", label: "Facebook", icon: Facebook },
  { value: "twitter", label: "X / Twitter", icon: Twitter },
  { value: "tiktok", label: "TikTok", icon: Video },
];

const categoryOptions = [
  { value: "health", label: "Health" },
  { value: "business", label: "Business" },
];

const emptyForm = {
  platform: "instagram",
  content_category: "",
  author_name: "",
  author_handle: "",
  content: "",
  image_url: "",
  video_url: "",
  post_url: "",
  hashtags: "",
  likes_count: 0,
  is_featured: false,
  is_approved: true,
  display_order: 0,
};


const SocialPosts = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragActive, setDragActive] = useState(false);
  const [videoUploading, setVideoUploading] = useState(false);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-social-posts"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("social_posts")
        .select("*")
        .order("display_order")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const saveMutation = useMutation({
    mutationFn: async () => {
      const payload = {
        ...form,
        hashtags: form.hashtags ? form.hashtags.split(",").map((t) => t.trim().replace(/^#/, "")) : [],
        likes_count: Number(form.likes_count) || 0,
        display_order: Number(form.display_order) || 0,
      };

      if (editingId) {
        const { error } = await supabase.from("social_posts").update(payload).eq("id", editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("social_posts").insert(payload);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      toast({ title: editingId ? "Post updated" : "Post created" });
      setDialogOpen(false);
      resetForm();
    },
    onError: (err: any) => {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("social_posts").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-social-posts"] });
      queryClient.invalidateQueries({ queryKey: ["social-posts"] });
      toast({ title: "Post deleted" });
    },
  });

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
  };

  const openEdit = (post: any) => {
    setEditingId(post.id);
    setForm({
      platform: post.platform,
      content_category: post.content_category || "",
      author_name: post.author_name || "",
      author_handle: post.author_handle || "",
      content: post.content || "",
      image_url: post.image_url || "",
      video_url: post.video_url || "",
      post_url: post.post_url || "",
      hashtags: post.hashtags?.join(", ") || "",
      likes_count: post.likes_count || 0,
      is_featured: post.is_featured || false,
      is_approved: post.is_approved || false,
      display_order: post.display_order || 0,
    });

    setDialogOpen(true);
  };

  const handleImageUpload = async (file: File) => {
    setUploading(true);
    try {
      const originalSize = file.size;
      const compressed = await compressImage(file, 1200, 1200, 0.8);
      const saved = originalSize - compressed.size;

      const ext = compressed.name.split(".").pop();
      const path = `${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage.from("social-posts").upload(path, compressed);
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("social-posts").getPublicUrl(path);
      setForm((prev) => ({ ...prev, image_url: urlData.publicUrl }));
      const desc = saved > 0
        ? `Compressed from ${formatFileSize(originalSize)} to ${formatFileSize(compressed.size)} (saved ${formatFileSize(saved)})`
        : `Uploaded ${formatFileSize(compressed.size)}`;
      toast({ title: "Image uploaded", description: desc });
    } catch (err: any) {
      toast({ title: "Upload failed", description: err.message, variant: "destructive" });
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };
  const ALLOWED_VIDEO_TYPES = ["video/mp4", "video/webm", "video/quicktime"];
  const MAX_VIDEO_BYTES = 50 * 1024 * 1024; // 50 MB

  const handleVideoUpload = async (file: File) => {
    if (!ALLOWED_VIDEO_TYPES.includes(file.type)) {
      toast({
        title: "Unsupported video format",
        description: "Please use MP4, WebM or MOV.",
        variant: "destructive",
      });
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      toast({
        title: "Video too large",
        description: `Maximum size is 50 MB. This file is ${formatFileSize(file.size)}.`,
        variant: "destructive",
      });
      if (videoInputRef.current) videoInputRef.current.value = "";
      return;
    }

    setVideoUploading(true);
    try {
      const ext = file.name.split(".").pop() || "mp4";
      const path = `videos/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("social-posts")
        .upload(path, file, { contentType: file.type });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from("social-posts").getPublicUrl(path);
      setForm((prev) => ({ ...prev, video_url: urlData.publicUrl }));
      toast({ title: "Video uploaded", description: formatFileSize(file.size) });
    } catch (err: any) {
      // Keep any existing video_url intact on failure
      toast({ title: "Video upload failed", description: err.message, variant: "destructive" });
    } finally {
      setVideoUploading(false);
      if (videoInputRef.current) videoInputRef.current.value = "";
    }
  };


  const PlatformBadge = ({ platform }: { platform: string }) => {
    const p = platformOptions.find((o) => o.value === platform);
    if (!p) return <span>{platform}</span>;
    const Icon = p.icon;
    return (
      <Badge variant="outline" className="gap-1">
        <Icon className="w-3 h-3" />
        {p.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Social / UGC Posts</h1>
          <p className="text-muted-foreground text-sm">Manage community social media posts displayed on the site</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button><Plus className="w-4 h-4 mr-2" />Add Post</Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Post" : "Add Social Post"}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Content Category *</Label>
                <Select value={form.content_category} onValueChange={(v) => setForm({ ...form, content_category: v })}>
                  <SelectTrigger><SelectValue placeholder="Select Health or Business" /></SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((c) => (
                      <SelectItem key={c.value} value={c.value}>{c.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!form.content_category && (
                  <p className="text-xs text-destructive mt-1">Choose whether this post belongs to the Health or Business journey.</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Platform</Label>
                  <Select value={form.platform} onValueChange={(v) => setForm({ ...form, platform: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {platformOptions.map((p) => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Display Order</Label>
                  <Input type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Author Name *</Label>
                  <Input value={form.author_name} onChange={(e) => setForm({ ...form, author_name: e.target.value })} placeholder="Jane Doe" />
                </div>
                <div>
                  <Label>Handle</Label>
                  <Input value={form.author_handle} onChange={(e) => setForm({ ...form, author_handle: e.target.value })} placeholder="janedoe" />
                </div>
              </div>

              <div>
                <Label>Content / Caption</Label>
                <Textarea value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} rows={3} placeholder="What they said about the product..." />
              </div>

              {/* Image upload section */}
              <div>
                <Label>Image</Label>
                <div className="space-y-2">
                  {form.image_url && (
                    <div className="relative w-full h-40 rounded-lg overflow-hidden border bg-muted">
                      <img src={form.image_url} alt="Preview" className="w-full h-full object-cover" />
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute top-2 right-2 h-6 w-6"
                        onClick={() => setForm({ ...form, image_url: "" })}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  )}
                  <div
                    className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
                      dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25 hover:border-primary/50"
                    }`}
                    onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                    onDragEnter={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(true); }}
                    onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); setDragActive(false); }}
                    onDrop={(e) => {
                      e.preventDefault(); e.stopPropagation(); setDragActive(false);
                      const file = e.dataTransfer.files?.[0];
                      if (file && file.type.startsWith("image/")) handleImageUpload(file);
                    }}
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) handleImageUpload(file);
                      }}
                    />
                    {uploading ? (
                      <div className="flex flex-col items-center gap-1">
                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                        <span className="text-sm text-muted-foreground">Uploading...</span>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center gap-1">
                        <Upload className="h-6 w-6 text-muted-foreground" />
                        <span className="text-sm font-medium">Drag & drop an image here, or click to browse</span>
                        <span className="text-xs text-muted-foreground">or paste a URL below</span>
                      </div>
                    )}
                  </div>
                  <Input
                    value={form.image_url}
                    onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                    placeholder="https://..."
                  />
                </div>
              </div>

              <div>
                <Label>Post URL</Label>
                <Input value={form.post_url} onChange={(e) => setForm({ ...form, post_url: e.target.value })} placeholder="https://instagram.com/p/..." />
              </div>
              <div>
                <Label>Hashtags (comma-separated)</Label>
                <Input value={form.hashtags} onChange={(e) => setForm({ ...form, hashtags: e.target.value })} placeholder="BFSuma, Wellness, Health" />
              </div>
              <div>
                <Label>Likes Count</Label>
                <Input type="number" value={form.likes_count} onChange={(e) => setForm({ ...form, likes_count: Number(e.target.value) })} />
              </div>
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_approved} onCheckedChange={(v) => setForm({ ...form, is_approved: v })} />
                  <Label>Approved</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch checked={form.is_featured} onCheckedChange={(v) => setForm({ ...form, is_featured: v })} />
                  <Label>Featured (homepage)</Label>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Cancel</Button>
              <Button onClick={() => saveMutation.mutate()} disabled={!form.author_name || !form.content_category || saveMutation.isPending}>
                {saveMutation.isPending ? "Saving..." : editingId ? "Update" : "Create"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Category / Platform</TableHead>
                <TableHead>Author</TableHead>
                <TableHead className="hidden md:table-cell">Content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">Loading...</TableCell></TableRow>
              ) : !posts?.length ? (
                <TableRow><TableCell colSpan={5} className="text-center py-8 text-muted-foreground">No social posts yet. Add one to get started!</TableCell></TableRow>
              ) : (
                posts.map((post) => (
                  <TableRow key={post.id}>
                    <TableCell>
                      <div className="flex flex-col gap-1 items-start">
                        <Badge
                          variant="outline"
                          className={
                            post.content_category === "business"
                              ? "text-xs border-accent/40 text-accent"
                              : "text-xs border-primary/30 text-primary"
                          }
                        >
                          {post.content_category === "business" ? "Business" : "Health"}
                        </Badge>
                        <PlatformBadge platform={post.platform} />
                      </div>
                    </TableCell>

                    <TableCell>
                      <div>
                        <p className="font-medium text-sm">{post.author_name}</p>
                        {post.author_handle && <p className="text-xs text-muted-foreground">@{post.author_handle}</p>}
                      </div>
                    </TableCell>
                    <TableCell className="hidden md:table-cell max-w-[200px]">
                      <p className="text-sm text-muted-foreground truncate">{post.content || "—"}</p>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <Badge variant={post.is_approved ? "default" : "secondary"} className="text-xs w-fit">
                          {post.is_approved ? "Approved" : "Draft"}
                        </Badge>
                        {post.is_featured && (
                          <Badge variant="outline" className="text-xs w-fit border-primary/30 text-primary">Featured</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {post.post_url && (
                          <Button variant="ghost" size="icon" className="h-8 w-8" asChild>
                            <a href={post.post_url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(post)}>
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive" onClick={() => deleteMutation.mutate(post.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SocialPosts;
