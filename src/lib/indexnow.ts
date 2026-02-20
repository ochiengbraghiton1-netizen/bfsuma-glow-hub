import { supabase } from '@/integrations/supabase/client';

type NotifyType = 'blog_published' | 'blog_updated' | 'product_created' | 'product_updated';

/**
 * Notify search engines via IndexNow when content changes.
 * Silently fails — never blocks the caller.
 */
export const notifyIndexNow = async (urls: string[], type: NotifyType) => {
  try {
    const { data, error } = await supabase.functions.invoke('indexnow', {
      body: { urls, type },
    });
    if (error) {
      console.warn('[IndexNow] invoke error:', error);
    } else {
      console.log('[IndexNow] success:', data);
    }
  } catch (e) {
    console.warn('[IndexNow] failed silently:', e);
  }
};
