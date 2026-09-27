import { useEffect, useState } from 'react';
import { fetchContentMedia, type MediaMap } from '@/lib/content-media';

export const BUSINESS_CONTENT_TYPE = 'business';
export const JOIN_BUSINESS_CONTENT_ID = 'join-business';

let cache: Promise<MediaMap> | null = null;

/** Shared, fetched-once visual-story media for the Join Business page. */
export const useBusinessMedia = (): MediaMap => {
  const [media, setMedia] = useState<MediaMap>({});
  useEffect(() => {
    if (!cache) {
      cache = fetchContentMedia(BUSINESS_CONTENT_TYPE, JOIN_BUSINESS_CONTENT_ID).catch(() => {
        cache = null;
        return {};
      });
    }
    let alive = true;
    cache.then((m) => alive && setMedia(m));
    return () => { alive = false; };
  }, []);
  return media;
};
