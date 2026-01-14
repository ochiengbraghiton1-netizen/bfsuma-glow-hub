import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_KEY = 'bf_referral_code';

export const useReferral = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      // Store in localStorage
      localStorage.setItem(REFERRAL_KEY, refCode);
      setReferralCode(refCode);
      
      // Track the click
      trackClick(refCode);
      
      // Clean URL
      const url = new URL(window.location.href);
      url.searchParams.delete('ref');
      window.history.replaceState({}, '', url.toString());
    } else {
      // Check localStorage for existing referral
      const stored = localStorage.getItem(REFERRAL_KEY);
      if (stored) {
        setReferralCode(stored);
      }
    }
  }, []);

  const trackClick = async (code: string) => {
    try {
      // Get affiliate ID from code using raw query
      const { data: affiliate } = await supabase
        .from('affiliates' as any)
        .select('id')
        .eq('referral_code', code)
        .eq('status', 'active')
        .maybeSingle();

      if (affiliate) {
        // Record the click
        await supabase.from('affiliate_clicks' as any).insert({
          affiliate_id: (affiliate as any).id,
          ip_address: null,
          user_agent: navigator.userAgent,
          referrer_url: document.referrer || null,
        });

        // Increment click count using RPC
        await supabase.rpc('increment_affiliate_clicks' as any, { affiliate_code: code });
      }
    } catch (error) {
      console.error('Error tracking referral click:', error);
    }
  };

  const getReferralCode = (): string | null => {
    return referralCode || localStorage.getItem(REFERRAL_KEY);
  };

  const clearReferral = () => {
    localStorage.removeItem(REFERRAL_KEY);
    setReferralCode(null);
  };

  return {
    referralCode,
    getReferralCode,
    clearReferral,
  };
};
