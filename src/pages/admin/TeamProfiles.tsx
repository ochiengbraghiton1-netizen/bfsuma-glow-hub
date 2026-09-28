import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Loader2, Plus, Pencil, Trash2, Upload, X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { compressImage } from '@/lib/image-compression';
import ContentMediaEditor from '@/components/admin/ContentMediaEditor';
import { fetchContentMedia, saveContentMedia, IMAGE_MAX_BYTES, type MediaMap } from '@/lib/content-media';
import { BUSINESS_CONTENT_TYPE, JOIN_BUSINESS_CONTENT_ID } from '@/hooks/use-business-media';
import type { TeamProfile } from '@/components/join-business/TeamSection';

type FormState = Omit<TeamProfile, 'id'>;
const empty: FormState = { name: '', role: '', photo_url: null, bio: '', display_order: 0, is_active: true };

const TeamProfiles = () => {
  const { toast } = useToast();
  const [profiles, setProfiles] = useState<TeamProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<TeamProfile | null>(null);
  const [form, setForm] = useState<FormState>(empty);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const [media, setMedia] = useState<MediaMap>({});
  const [savingMedia, setSavingMedia] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any).from('team_profiles').select('*').order('display_order');
    if (error) toast({ title: 'Could not load team profiles', variant: 'destructive' });
    setProfiles(data || []);
    setLoading(false);
  };

  useEffect(() => {
    load();
    fetchContentMedia(BUSINESS_CONTENT_TYPE, JOIN_BUSINESS_CONTENT_ID).then(setMedia).catch(() => {});
  }, []);

  const openNew = () => { setEditing(null); setForm({ ...empty, display_order: profiles.length }); setOpen(true); };
  const openEdit = (p: TeamProfile) => { setEditing(p); setForm({ ...p, bio: p.bio || '' }); setOpen(true); };

  const handleUpload = async (file: File) => {
    if (!file.type.startsWith('image/')) return toast({ title: 'Please select an image file', variant: 'destructive' });
    if (file.size > IMAGE_MAX_BYTES) return toast({ title: 'Image is too large (max 5MB)', variant: 'destructive' });
    setUploading(true);
    try {
      const compressed = await compressImage(file, 800, 800, 0.8);
      const path = `team/${Date.now()}.webp`;
      const { error } = await supabase.storage.from('categories').upload(path, compressed, { contentType: 'image/webp', upsert: true, cacheControl: '31536000' });
      if (error) throw error;
      const { data: { publicUrl } } = supabase.storage.from('categories').getPublicUrl(path);
      setForm((f) => ({ ...f, photo_url: publicUrl }));
    } catch (e) {
      console.error(e);
      toast({ title: 'Photo upload failed', variant: 'destructive' });
    } finally { setUploading(false); }
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name.trim() || !form.role.trim()) return toast({ title: 'Name and role are required', variant: 'destructive' });
    setSaving(true);
    const payload = { ...form, name: form.name.trim(), role: form.role.trim(), bio: form.bio?.trim() || null };
    const q = editing
      ? (supabase as any).from('team_profiles').update(payload).eq('id', editing.id)
      : (supabase as any).from('team_profiles').insert(payload);
    const { error } = await q;
    setSaving(false);
    if (error) return toast({ title: 'Save failed', description: error.message, variant: 'destructive' });
    toast({ title: editing ? 'Profile updated' : 'Profile added' });
    setOpen(false);
    load();
  };

  const remove = async (p: TeamProfile) => {
    if (!confirm(`Delete ${p.name}?`)) return;
    const { error } = await (supabase as any).from('team_profiles').delete().eq('id', p.id);
    if (error) return toast({ title: 'Delete failed', variant: 'destructive' });
    load();
  };

  const saveMedia = async () => {
    setSavingMedia(true);
    try {
      await saveContentMedia(BUSINESS_CONTENT_TYPE, JOIN_BUSINESS_CONTENT_ID, media);
      toast({ title: 'Join Business visuals saved' });
    } catch (e: any) {
      toast({ title: 'Could not save visuals', description: e?.message, variant: 'destructive' });
    } finally { setSavingMedia(false); }
  };

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Join Business Page</h1>
            <p className="text-muted-foreground text-sm">Leadership profiles and visuals shown on /join-business.</p>
          </div>
          <Button onClick={openNew}><Plus className="h-4 w-4 mr-2" />Add profile</Button>
        </div>

        {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (
          <div className="space-y-2">
            {profiles.length === 0 && <p className="text-sm text-muted-foreground">No profiles yet.</p>}
            {profiles.map((p) => (
              <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg border bg-card">
                <div className="h-12 w-12 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                  {p.photo_url ? <img src={p.photo_url} alt="" className="h-full w-full object-cover" /> : <span className="text-sm text-muted-foreground">{p.name[0]}</span>}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{p.name} {!p.is_active && <span className="text-xs text-muted-foreground">(hidden)</span>}</p>
                  <p className="text-sm text-muted-foreground truncate">{p.role}</p>
                </div>
                <span className="text-xs text-muted-foreground">#{p.display_order}</span>
                <Button size="icon" variant="ghost" onClick={() => openEdit(p)} aria-label={`Edit ${p.name}`}><Pencil className="h-4 w-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => remove(p)} aria-label={`Delete ${p.name}`}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="space-y-4 pt-6 border-t">
        <ContentMediaEditor contentType={BUSINESS_CONTENT_TYPE} contentId={JOIN_BUSINESS_CONTENT_ID} media={media} onChange={setMedia} />
        <p className="text-xs text-muted-foreground">Where each slot appears on the Join Business page: Hero (top banner), Recognition (Support / mentorship photo), Desired outcome (Travel rewards card), Education (How it works), Product in context (Car awards card), Trust (Why join), Closing (final banner). Until you upload, the starter images show.</p>
        <Button onClick={saveMedia} disabled={savingMedia}>
          {savingMedia && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}Save visuals
        </Button>
      </section>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? 'Edit profile' : 'Add profile'}</DialogTitle></DialogHeader>
          <form onSubmit={save} className="space-y-4">
            <div><Label htmlFor="tp-name">Name</Label><Input id="tp-name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div><Label htmlFor="tp-role">Role</Label><Input id="tp-role" value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
            <div><Label htmlFor="tp-bio">Short bio</Label><Textarea id="tp-bio" rows={3} value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>Photo</Label>
              <div className="flex items-center gap-3">
                <div className="h-16 w-16 rounded-full bg-muted overflow-hidden">
                  {form.photo_url && <img src={form.photo_url} alt="" className="h-full w-full object-cover" />}
                </div>
                <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleUpload(f); e.target.value = ''; }} />
                <Button type="button" variant="outline" onClick={() => fileRef.current?.click()} disabled={uploading}>
                  {uploading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}Upload
                </Button>
                {form.photo_url && <Button type="button" variant="ghost" size="icon" onClick={() => setForm({ ...form, photo_url: null })} aria-label="Remove photo"><X className="h-4 w-4" /></Button>}
              </div>
            </div>
            <div><Label htmlFor="tp-order">Display order</Label><Input id="tp-order" type="number" value={form.display_order} onChange={(e) => setForm({ ...form, display_order: Number(e.target.value) || 0 })} /></div>
            <div className="flex items-center justify-between"><Label htmlFor="tp-active">Active (shown on site)</Label><Switch id="tp-active" checked={form.is_active} onCheckedChange={(v) => setForm({ ...form, is_active: v })} /></div>
            <Button type="submit" className="w-full" disabled={saving || uploading}>
              {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}{editing ? 'Update' : 'Create'}
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TeamProfiles;
