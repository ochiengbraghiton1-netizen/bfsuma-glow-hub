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
    }];
  });

  if (rows.length) {
    const { error } = await (supabase as any).from('content_media').insert(rows);
    if (error) throw error;
  }
};
