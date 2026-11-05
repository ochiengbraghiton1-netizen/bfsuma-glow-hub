import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  MEDIA_SLOTS, MediaMap, SlotKey, FOCAL_POSITIONS, OVERLAY_LEVELS, detectMediaType, maxBytesFor,
  uploadContentMedia,
} from '@/lib/content-media';
import { formatFileSize } from '@/lib/image-compression';

interface Props {
  contentType: string;
  contentId: string;
  media: MediaMap;
  onChange: (media: MediaMap) => void;
}

const ContentMediaEditor = ({ contentType, contentId, media, onChange }: Props) => {
  const [uploading, setUploading] = useState<SlotKey | null>(null);
  const [uploadingBefore, setUploadingBefore] = useState(false);
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
  const beforeInput = useRef<HTMLInputElement | null>(null);
  const { toast } = useToast();

  const patch = (slot: SlotKey, values: Partial<MediaMap[SlotKey]>) => {
    const current = media[slot];
    if (!current) return;
    onChange({ ...media, [slot]: { ...current, ...values } });
  };

  const handleFile = async (slot: SlotKey, file: File) => {
    const mediaType = detectMediaType(file);
    if (!mediaType) {
      toast({ title: 'Please choose an image or a video file', variant: 'destructive' });
      return;
    }
    const cap = maxBytesFor(mediaType);
    if (file.size > cap) {
      toast({
        title: `${mediaType === 'image' ? 'Image' : 'Video'} is too large`,
        description: `Maximum ${formatFileSize(cap)}. This file is ${formatFileSize(file.size)}.`,
        variant: 'destructive',
      });
      return;
    }

    setUploading(slot);
    try {
      const url = await uploadContentMedia(file, contentType, contentId || 'unsaved', slot);
      onChange({
        ...media,
        [slot]: {
          ...(media[slot] || {}),
          content_type: contentType,
          content_id: contentId,
          slot_key: slot,
          media_type: mediaType,
          media_url: url,
          before_media_url: mediaType === 'image' ? media[slot]?.before_media_url || null : null,
          alt_text: media[slot]?.alt_text || '',
          before_alt_text: mediaType === 'image' ? media[slot]?.before_alt_text || null : null,
          heading: media[slot]?.heading || null,
          caption: media[slot]?.caption || null,
          display_order: MEDIA_SLOTS.findIndex((s) => s.key === slot),
          focal_position: media[slot]?.focal_position || 'center',
          overlay_level: media[slot]?.overlay_level || 'light',
        },
      });
      toast({ title: 'Media uploaded' });
    } catch (err: any) {
      console.error('Media upload failed', err);
      toast({ title: 'Upload failed', description: err?.message, variant: 'destructive' });
    } finally {
      setUploading(null);
      const el = inputs.current[slot];
      if (el) el.value = '';
    }
  };

  const handleBeforeFile = async (file: File) => {
    const slot: SlotKey = 'desired_outcome';
    if (!file.type.startsWith('image/')) {
      toast({ title: 'Please choose an image file', variant: 'destructive' });
      return;
    }
    if (file.size > maxBytesFor('image')) {
      toast({
        title: 'Image is too large',
        description: `Maximum ${formatFileSize(maxBytesFor('image'))}. This file is ${formatFileSize(file.size)}.`,
        variant: 'destructive',
      });
      return;
    }

    setUploadingBefore(true);
    try {
      const url = await uploadContentMedia(file, contentType, contentId || 'unsaved', slot, 'before');
      patch(slot, { before_media_url: url });
      toast({ title: 'Before image uploaded' });
    } catch (err: any) {
      console.error('Before image upload failed', err);
      toast({ title: 'Upload failed', description: err?.message, variant: 'destructive' });
    } finally {
      setUploadingBefore(false);
      if (beforeInput.current) beforeInput.current.value = '';
    }
  };

  const remove = (slot: SlotKey) => {
    const next = { ...media };
    delete next[slot];
    onChange(next);
    const el = inputs.current[slot];
    if (el) el.value = '';
  };

  return (
    <div className="space-y-3">
      <div>
        <Label className="text-base">Visual Story</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Optional images or short videos placed at fixed points in the page. Images up to 5MB, videos up to 20MB.
          Keep clips short, most visitors are on mobile data.
        </p>
      </div>

      {MEDIA_SLOTS.map((slot) => {
        const item = media[slot.key];
        return (
          <div key={slot.key} className="border rounded-lg p-3 space-y-2 bg-muted/30">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-semibold">{slot.label}</p>
                <p className="text-xs text-muted-foreground">{slot.hint}</p>
              </div>
              {item && (
                <Button size="icon" variant="ghost" type="button" onClick={() => remove(slot.key)} aria-label={`Remove ${slot.label}`}>
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              )}
            </div>

            {item?.media_url && (
              <div className="rounded-md overflow-hidden border bg-background max-w-xs">
                {item.media_type === 'video' ? (
                  <video src={item.media_url} controls className="w-full" preload="metadata" />
                ) : (
                  <img src={item.media_url} alt={item.alt_text || slot.label} className="w-full object-cover" />
                )}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={(el) => { inputs.current[slot.key] = el; }}
                type="file"
                accept="image/*,video/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(slot.key, f);
                }}
              />
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={uploading === slot.key}
                onClick={() => inputs.current[slot.key]?.click()}
              >
                {uploading === slot.key
                  ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Uploading</>
                  : <><Upload className="w-3 h-3 mr-1" />{item?.media_url ? 'Replace file' : 'Upload image or video'}</>}
              </Button>
            </div>

            {item?.media_url && (
              <div className="grid gap-2 sm:grid-cols-2">
                {slot.key === 'hero' && item.media_type === 'image' && (
                  <div className="sm:col-span-2 border-t border-border pt-3">
                    <Label className="text-xs">Focus point</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Tap the part of the photo that must stay visible when the hero crops it on phones.
                    </p>
                    <div
                      role="radiogroup"
                      aria-label="Focus point"
                      className="mt-2 inline-grid grid-cols-3 gap-1 p-1 rounded-lg border bg-background"
                    >
                      {FOCAL_POSITIONS.map((pos) => {
                        const selected = (item.focal_position || 'center') === pos.value;
                        return (
                          <button
                            key={pos.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            title={pos.label}
                            onClick={() => patch(slot.key, { focal_position: pos.value })}
                            className={`relative h-7 w-9 rounded border transition-colors ${
                              selected ? 'border-primary bg-primary/15' : 'border-border hover:bg-muted'
                            }`}
                          >
                            <span
                              className={`absolute h-1.5 w-1.5 rounded-full -translate-x-1/2 -translate-y-1/2 ${
                                selected ? 'bg-primary' : 'bg-muted-foreground/50'
                              }`}
                              style={{ left: `${25 + pos.x / 2}%`, top: `${25 + pos.y / 2}%` }}
                            />
                            <span className="sr-only">{pos.label}</span>
                          </button>
                        );
                      })}
                    </div>
                    <Label className="text-xs block mt-4">Photo tint</Label>
                    <p className="text-xs text-muted-foreground mt-1">
                      Clear keeps the photo untinted and puts the headline in a soft panel. Use Light or Medium if the photo is very bright.
                    </p>
                    <div role="radiogroup" aria-label="Photo tint" className="mt-2 flex flex-wrap gap-2">
                      {OVERLAY_LEVELS.map((lvl) => {
                        const selected = (item.overlay_level || 'light') === lvl.value;
                        return (
                          <button
                            key={lvl.value}
                            type="button"
                            role="radio"
                            aria-checked={selected}
                            onClick={() => patch(slot.key, { overlay_level: lvl.value })}
                            className={`h-8 px-3 rounded-md border text-xs transition-colors ${
                              selected ? 'border-primary bg-primary/15 text-foreground' : 'border-border hover:bg-muted'
                            }`}
                          >
                            {lvl.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
                <div className="sm:col-span-2">
                  <Label className="text-xs">Heading (optional)</Label>
                  <Input
                    value={item.heading || ''}
                    maxLength={100}
                    placeholder="Write a short heading for this section"
                    onChange={(e) => patch(slot.key, { heading: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Alt text (required)</Label>
                  <Input
                    value={item.alt_text}
                    placeholder="Describe what the visual shows"
                    onChange={(e) => patch(slot.key, { alt_text: e.target.value })}
                  />
                </div>
                <div>
                  <Label className="text-xs">Caption (optional)</Label>
                  <Input
                    value={item.caption || ''}
                    placeholder="Short supporting line"
                    onChange={(e) => patch(slot.key, { caption: e.target.value })}
                  />
                </div>
              </div>
            )}

            {slot.key === 'desired_outcome' && item?.media_url && item.media_type === 'image' && (
              <div className="space-y-2 border-t border-border pt-3">
                <div>
                  <Label className="text-sm">Before image (optional)</Label>
                  <p className="text-xs text-muted-foreground mt-1">Add a second image to create a draggable before and after comparison.</p>
                </div>
                {item.before_media_url && (
                  <div className="rounded-md overflow-hidden border bg-background max-w-xs">
                    <img src={item.before_media_url} alt={item.before_alt_text || 'Before comparison preview'} className="w-full object-cover" />
                  </div>
                )}
                <input
                  ref={beforeInput}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleBeforeFile(file);
                  }}
                />
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="button" size="sm" variant="outline" disabled={uploadingBefore} onClick={() => beforeInput.current?.click()}>
                    {uploadingBefore
                      ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" />Uploading</>
                      : <><Upload className="w-3 h-3 mr-1" />{item.before_media_url ? 'Replace before image' : 'Upload before image'}</>}
                  </Button>
                  {item.before_media_url && (
                    <Button type="button" size="sm" variant="ghost" onClick={() => patch(slot.key, { before_media_url: null, before_alt_text: null })}>
                      <Trash2 className="w-3 h-3 mr-1" />Remove before image
                    </Button>
                  )}
                </div>
                {item.before_media_url && (
                  <div>
                    <Label className="text-xs">Before image alt text (required)</Label>
                    <Input
                      value={item.before_alt_text || ''}
                      placeholder="Describe what the before image shows"
                      onChange={(e) => patch(slot.key, { before_alt_text: e.target.value })}
                    />
                  </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default ContentMediaEditor;
