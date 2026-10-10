// 30-day attribution window, last link wins (product link vs ?ref= code).
const WINDOW_MS = 30 * 24 * 60 * 60 * 1000;

export const getAttribution = (): { affiliate_slug?: string; referral_code?: string } => {
  try {
    const now = Date.now();
    let prod: { slug?: string; ts: number } | null = null;
    const raw = localStorage.getItem("bf_product_affiliate");
    if (raw) {
      const p = JSON.parse(raw);
      const ts = new Date(p?.timestamp).getTime();
      if (p?.slug && ts && now - ts < WINDOW_MS) prod = { slug: p.slug, ts };
    }
    let ref: { code: string; ts: number } | null = null;
    const code = localStorage.getItem("bf_referral_code");
    const exp = localStorage.getItem("bf_referral_expiry");
    if (code && exp) {
      const expTs = new Date(exp).getTime();
      if (expTs > now) ref = { code, ts: expTs - WINDOW_MS };
    }
    if (prod && (!ref || prod.ts >= ref.ts)) return { affiliate_slug: prod.slug };
    if (ref) return { referral_code: ref.code };
  } catch { /* ignore */ }
  return {};
};
