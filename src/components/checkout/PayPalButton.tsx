import { useEffect, useRef, useState } from 'react';
import { Loader2 } from 'lucide-react';

const PAYPAL_CLIENT_ID = 'AUfjZUjWnYi8mc-NdnscH1Q-c00Sr681sVjFhUZ5SZmc9w4-5AwztOk_Sdf-_TpkY8T0SMHVFKGXzN1R';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onApprove: (orderId: string, details: any) => Promise<void>;
  onError: (error: any) => void;
  disabled?: boolean;
}

declare global {
  interface Window {
    paypal?: any;
  }
}

const PayPalButton = ({ amount, currency = 'USD', onApprove, onError, disabled }: PayPalButtonProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [sdkReady, setSdkReady] = useState(false);
  const [loading, setLoading] = useState(true);
  const buttonsRendered = useRef(false);

  // Load PayPal SDK
  useEffect(() => {
    const existingScript = document.getElementById('paypal-sdk');
    if (existingScript) {
      if (window.paypal) {
        setSdkReady(true);
        setLoading(false);
      } else {
        existingScript.addEventListener('load', () => {
          setSdkReady(true);
          setLoading(false);
        });
      }
      return;
    }

    const script = document.createElement('script');
    script.id = 'paypal-sdk';
    script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}`;
    script.async = true;
    script.onload = () => {
      setSdkReady(true);
      setLoading(false);
    };
    script.onerror = () => {
      setLoading(false);
      onError(new Error('Failed to load PayPal SDK'));
    };
    document.body.appendChild(script);
  }, [currency]);

  // Render PayPal buttons
  useEffect(() => {
    if (!sdkReady || !window.paypal || !containerRef.current || disabled) return;

    // Clear previous buttons
    if (containerRef.current) {
      containerRef.current.innerHTML = '';
    }
    buttonsRendered.current = false;

    try {
      window.paypal.Buttons({
        style: {
          layout: 'vertical',
          color: 'gold',
          shape: 'rect',
          label: 'paypal',
          height: 48,
        },
        createOrder: (_data: any, actions: any) => {
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amount.toFixed(2),
                currency_code: currency,
              },
              description: 'BF SUMA ROYAL Order',
            }],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            await onApprove(data.orderID, details);
          } catch (err) {
            onError(err);
          }
        },
        onError: (err: any) => {
          onError(err);
        },
        onCancel: () => {
          // User cancelled - no action needed
        },
      }).render(containerRef.current);
      buttonsRendered.current = true;
    } catch (err) {
      onError(err);
    }
  }, [sdkReady, amount, currency, disabled]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">Loading PayPal...</span>
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
