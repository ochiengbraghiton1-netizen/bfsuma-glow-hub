import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

const REFERRAL_KEY = 'bf_referral_code';
const REFERRAL_EXPIRY_KEY = 'bf_referral_expiry';
const REFERRAL_EXPIRY_DAYS = 30; // Attribution window in days

export const useReferral = () => {
  const [referralCode, setReferralCode] = useState<string | null>(null);

  useEffect(() => {
    // Check URL for referral code
    const urlParams = new URLSearchParams(window.location.search);
    const refCode = urlParams.get('ref');

    if (refCode) {
      // Store in localStorage with expiry
      localStorage.setItem(REFERRAL_KEY, refCode);
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS);
      localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
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
      const expiry = localStorage.getItem(REFERRAL_EXPIRY_KEY);
      
      if (stored) {
        // Check if referral has expired
        if (expiry && new Date(expiry) > new Date()) {
          setReferralCode(stored);
        } else if (!expiry) {
          // Legacy: stored without expiry, set one now
          const expiryDate = new Date();
          expiryDate.setDate(expiryDate.getDate() + REFERRAL_EXPIRY_DAYS);
          localStorage.setItem(REFERRAL_EXPIRY_KEY, expiryDate.toISOString());
          setReferralCode(stored);
        } else {
          // Referral expired, clear it
          localStorage.removeItem(REFERRAL_KEY);
          localStorage.removeItem(REFERRAL_EXPIRY_KEY);
        }
      }
    }
  }, []);

  const trackClick = async (code: string) => {
    try {
      // Get affiliate ID from code
      const { data: affiliate } = await supabase
        .from('affiliates')
        .select('id')
        .eq('referral_code', code)
        .eq('status', 'active')
        .maybeSingle();

      if (affiliate) {
        // Record the click
        await supabase.from('affiliate_clicks').insert({
          affiliate_id: affiliate.id,
          ip_address: null,
          user_agent: navigator.userAgent,
          referrer_url: document.referrer || window.location.href,
        });

        // Increment click count using RPC
        await supabase.rpc('increment_affiliate_clicks', { affiliate_code: code });
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
    localStorage.removeItem(REFERRAL_EXPIRY_KEY);
    setReferralCode(null);
  };

  return {
    referralCode,
    getReferralCode,
    clearReferral,
  };
};
