import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onCreateOrder?: () => Promise<string | void>;
  onApprove: (orderId: string, details: any) => Promise<void>;
  onError: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalButton = ({ amount, currency = 'USD', onCreateOrder, onApprove, onError, disabled }: PayPalButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clientId, setClientId] = useState<string | null>(null);
  const prevCurrencyRef = useRef(currency);

  const onCreateOrderRef = useRef(onCreateOrder);
  const onApproveRef = useRef(onApprove);
  const onErrorRef = useRef(onError);
  const amountRef = useRef(amount);
  const currencyRef = useRef(currency);

  useEffect(() => { onCreateOrderRef.current = onCreateOrder; }, [onCreateOrder]);
  useEffect(() => { onApproveRef.current = onApprove; }, [onApprove]);
  useEffect(() => { onErrorRef.current = onError; }, [onError]);
  useEffect(() => { amountRef.current = amount; }, [amount]);
  useEffect(() => { currencyRef.current = currency; }, [currency]);

  // Fetch PayPal Client ID from backend
  useEffect(() => {
    const fetchClientId = async () => {
      try {
        const { data, error } = await supabase.functions.invoke('get-paypal-client-id');
        if (error || !data?.clientId) {
          console.error('Failed to fetch PayPal Client ID:', error);
          onError(new Error('PayPal is not configured. Please contact support.'));
          setLoading(false);
          return;
        }
        setClientId(data.clientId);
      } catch (err) {
        console.error('PayPal config error:', err);
        onError(new Error('Failed to load PayPal configuration'));
        setLoading(false);
      }
    };
    fetchClientId();
  }, []);

  // Load or reload PayPal SDK when currency or clientId changes
  useEffect(() => {
    if (!clientId) return;

    const loadSdk = () => {
      setLoading(true);
      setSdkReady(false);

      const existingScript = document.getElementById('paypal-sdk');
      if (existingScript) {
        existingScript.remove();
        delete window.paypal;
      }

      const script = document.createElement('script');
      script.id = 'paypal-sdk';
      // Removed enable-funding=card — cards are handled inside the PayPal popup
      script.src = `https://www.paypal.com/sdk/js?client-id=${clientId}&currency=${currency}&intent=capture&components=buttons`;
      script.async = true;
      script.onload = () => {
        setSdkReady(true);
        setLoading(false);
      };
      script.onerror = () => {
        setLoading(false);
        console.error('PayPal SDK script failed to load');
        onError(new Error('Failed to load PayPal. Please try again or use WhatsApp checkout.'));
      };
      document.body.appendChild(script);
    };

    if (prevCurrencyRef.current !== currency || !window.paypal) {
      prevCurrencyRef.current = currency;
      loadSdk();
    } else if (window.paypal) {
      setSdkReady(true);
      setLoading(false);
    }
  }, [currency, clientId]);

  // Render PayPal buttons
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || disabled) return;

    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'pay',
          height: 48,
        },
        createOrder: async (_data: any, actions: any) => {
          let dbOrderId: string | void;
          if (onCreateOrderRef.current) {
            dbOrderId = await onCreateOrderRef.current();
          }
          return actions.order.create({
            intent: 'CAPTURE',
            purchase_units: [{
              custom_id: dbOrderId,
              amount: {
                value: amountRef.current.toFixed(2),
                currency_code: currencyRef.current,
              },
              description: 'BF SUMA ROYAL Order',
            }],
            application_context: {
              shipping_preference: 'NO_SHIPPING',
            },
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            await onApproveRef.current(data.orderID, details);
          } catch (err) {
            console.error('PayPal capture error:', err);
            onErrorRef.current(err);
          }
        },
        onError: (err: any) => {
          console.error('PayPal button error:', err);
          onErrorRef.current(err);
        },
        onCancel: () => {
          console.log('PayPal payment cancelled by user');
        },
      }).render(containerRef.current);
    } catch (err) {
      console.error('PayPal render error:', err);
      onError(err);
    }
  }, [sdkReady, disabled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading PayPal...</span>
      </div>
    );
  }

  if (!clientId) {
    return (
      <div className="text-center py-4 text-sm text-destructive">
        PayPal is currently unavailable. Please use WhatsApp checkout.
      </div>
    );
  }

  return (
    <div
      ref={containerRef}
      className={disabled ? 'opacity-50 pointer-events-none' : ''}
    />
  );
};

export default PayPalButton;
