import { supabase } from '@/integrations/supabase/client';

export const MEDIA_BUCKET = 'content-media';

export const IMAGE_MAX_BYTES = 5 * 1024 * 1024; // 5MB
export const VIDEO_MAX_BYTES = 20 * 1024 * 1024; // 20MB

// Ten years, so links stay valid for indexed pages
const SIGNED_URL_TTL = 60 * 60 * 24 * 365 * 10;

export type MediaType = 'image' | 'video';

export type SlotKey =
  | 'hero'
  | 'recognition'
  | 'desired_outcome'
  | 'education'
  | 'product_context'
  | 'trust'
  | 'closing';

/** Where the important part of an image sits, so full-bleed crops keep it visible. */
export type FocalPosition =
  | 'top-left' | 'top' | 'top-right'
  | 'left' | 'center' | 'right'
  | 'bottom-left' | 'bottom' | 'bottom-right';

export const isFocalPosition = (value: unknown): value is FocalPosition =>
  typeof value === 'string' && FOCAL_POSITIONS.some((p) => p.value === value);

export const FOCAL_POSITIONS: { value: FocalPosition; label: string; x: number; y: number }[] = [
  { value: 'top-left', label: 'Top left', x: 0, y: 0 },
  { value: 'top', label: 'Top', x: 50, y: 0 },
  { value: 'top-right', label: 'Top right', x: 100, y: 0 },
  { value: 'left', label: 'Left', x: 0, y: 50 },
  { value: 'center', label: 'Center', x: 50, y: 50 },
  { value: 'right', label: 'Right', x: 100, y: 50 },
  { value: 'bottom-left', label: 'Bottom left', x: 0, y: 100 },
  { value: 'bottom', label: 'Bottom', x: 50, y: 100 },
  { value: 'bottom-right', label: 'Bottom right', x: 100, y: 100 },
];

/** CSS object-position for a stored focal position; anything unknown falls back to center. */
export const focalObjectPosition = (value: string | null | undefined): string => {
  const fallback = FOCAL_POSITIONS.find((item) => item.value === 'center')!;
  const p = FOCAL_POSITIONS.find((item) => item.value === value) || fallback;
  return `${p.x}% ${p.y}%`;
};

/** How much a hero photo is darkened. */
export type OverlayLevel = 'none' | 'light' | 'medium';

export const OVERLAY_LEVELS: { value: OverlayLevel; label: string }[] = [
  { value: 'none', label: 'Clear photo (text in a soft panel)' },
  { value: 'light', label: 'Light' },
  { value: 'medium', label: 'Medium' },
];

export const isOverlayLevel = (value: unknown): value is OverlayLevel =>
  typeof value === 'string' && OVERLAY_LEVELS.some((o) => o.value === value);

/** Neutral overlay classes for a hero photo; null means no overlay. Unknown falls back to light. */
export const heroOverlayClass = (value: string | null | undefined): string | null => {
  const level = isOverlayLevel(value) ? value : 'light';
  if (level === 'none') return null;
  return level === 'medium'
    ? 'bg-black/55 md:bg-transparent md:bg-gradient-to-r md:from-black/70 md:via-black/45 md:to-black/15'
    : 'bg-black/35 md:bg-transparent md:bg-gradient-to-r md:from-black/55 md:via-black/25 md:to-transparent';
};

/** Soft panel around hero text when the photo is left clear. */
export const heroTextPanelClass = (value: string | null | undefined): string =>
  value === 'none'
    ? 'rounded-3xl bg-black/35 backdrop-blur-sm ring-1 ring-white/15 p-6 md:p-8 w-full md:w-fit max-w-2xl'
    : '';

export const HERO_TEXT_SHADOW = 'drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)]';

export const MEDIA_SLOTS: { key: SlotKey; label: string; hint: string }[] = [
  { key: 'hero', label: 'Hero image/video', hint: 'Sets the tone at the very top of the page.' },
  { key: 'recognition', label: 'Recognition, does this sound familiar?', hint: 'Shows the everyday moment a visitor recognises.' },
  { key: 'desired_outcome', label: 'Desired outcome', hint: 'Shows life after the concern eases.' },
  { key: 'education', label: 'Education, how it works', hint: 'Sits beside the educational content.' },
  { key: 'product_context', label: 'Product in context', hint: 'Products in real everyday use.' },
  { key: 'trust', label: 'Trust, real people', hint: 'Real customers or the wellness team.' },
  { key: 'closing', label: 'Closing', hint: 'Final reassuring visual near the last call to action.' },
];

export interface ContentMediaItem {
  id?: string;
  content_type: string;
  content_id: string;
  slot_key: SlotKey;
  media_type: MediaType;
  media_url: string;
  before_media_url: string | null;
  alt_text: string;
  before_alt_text: string | null;
  heading: string | null;
  caption: string | null;
  display_order: number;
  focal_position: FocalPosition;
  overlay_level: OverlayLevel;
}

export type MediaMap = Partial<Record<SlotKey, ContentMediaItem>>;

export const detectMediaType = (file: File): MediaType | null => {
  if (file.type.startsWith('image/')) return 'image';
  if (file.type.startsWith('video/')) return 'video';
  return null;
};

export const maxBytesFor = (type: MediaType) =>
  type === 'image' ? IMAGE_MAX_BYTES : VIDEO_MAX_BYTES;

/** Upload a file and return a long-lived readable URL. */
export const uploadContentMedia = async (
  file: File,
  contentType: string,
  contentId: string,
  slotKey: SlotKey,
  variant: 'main' | 'before' = 'main'
): Promise<string> => {
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase();
  const path = `${contentType}/${contentId}/${slotKey}-${variant}-${Date.now()}.${ext}`;

  const { error } = await supabase.storage
    .from(MEDIA_BUCKET)
    .upload(path, file, { contentType: file.type, upsert: true, cacheControl: '31536000' });
  if (error) throw error;

  const { data, error: signErr } = await supabase.storage
    .from(MEDIA_BUCKET)
    .createSignedUrl(path, SIGNED_URL_TTL);
  if (signErr || !data?.signedUrl) throw signErr || new Error('Could not create media URL');

  return data.signedUrl;
};

export const fetchContentMedia = async (
  contentType: string,
  contentId: string
): Promise<MediaMap> => {
  const { data } = await (supabase as any)
    .from('content_media')
    .select('*')
    .eq('content_type', contentType)
    .eq('content_id', contentId);

  const map: MediaMap = {};
  ((data || []) as ContentMediaItem[]).forEach((row) => {
    map[row.slot_key] = row;
  });
  return map;
};

/** Replace the full media set for one piece of content. */
export const saveContentMedia = async (
  contentType: string,
  contentId: string,
  media: MediaMap
) => {
  const invalidItem = Object.values(media).find((item) => item && (
    !item.alt_text.trim()
    || (item.before_media_url && !item.before_alt_text?.trim())
  ));
  if (invalidItem) throw new Error('Alt text is required for every uploaded image.');

  await (supabase as any)
    .from('content_media')
    .delete()
    .eq('content_type', contentType)
    .eq('content_id', contentId);

  const rows = MEDIA_SLOTS.flatMap((slot, i) => {
    const item = media[slot.key];
    if (!item) return [];
    return [{
      content_type: contentType,
      content_id: contentId,
      slot_key: slot.key,
      media_type: item.media_type,
      media_url: item.media_url,
      before_media_url: slot.key === 'desired_outcome' ? item.before_media_url || null : null,
      alt_text: item.alt_text,
      before_alt_text: slot.key === 'desired_outcome' ? item.before_alt_text || null : null,
      heading: item.heading?.trim() || null,
      caption: item.caption || null,
      display_order: i,
      focal_position: isFocalPosition(item.focal_position) ? item.focal_position : 'center',
      overlay_level: isOverlayLevel(item.overlay_level) ? item.overlay_level : 'light',
    }];
  });

  if (rows.length) {
    const { error } = await (supabase as any).from('content_media').insert(rows);
    if (error) throw error;
  }
};
