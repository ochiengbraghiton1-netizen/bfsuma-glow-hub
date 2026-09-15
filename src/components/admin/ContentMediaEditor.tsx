import { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2, Upload, Trash2 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  MEDIA_SLOTS, MediaMap, SlotKey, detectMediaType, maxBytesFor,
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
  const inputs = useRef<Record<string, HTMLInputElement | null>>({});
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
          alt_text: media[slot]?.alt_text || '',
          caption: media[slot]?.caption || null,
          display_order: MEDIA_SLOTS.findIndex((s) => s.key === slot),
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
          </div>
        );
      })}
    </div>
  );
};

export default ContentMediaEditor;
