import { useEffect, useRef, useState, useCallback } from 'react';
import { Loader2 } from 'lucide-react';

const PAYPAL_CLIENT_ID = 'AUfjZUjWnYi8mc-NdnscH1Q-c00Sr681sVjFhUZ5SZmc9w4-5AwztOk_Sdf-_TpkY8T0SMHVFKGXzN1R';

interface PayPalButtonProps {
  amount: number;
  currency?: string;
  onCreateOrder?: () => Promise<void>;
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
  const prevCurrencyRef = useRef(currency);

  // Use refs for callbacks so PayPal buttons always call the latest version
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

  // Load or reload PayPal SDK when currency changes
  useEffect(() => {
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
      script.src = `https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=${currency}&enable-funding=card`;
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
    };

    if (prevCurrencyRef.current !== currency || !window.paypal) {
      prevCurrencyRef.current = currency;
      loadSdk();
    } else if (window.paypal) {
      setSdkReady(true);
      setLoading(false);
    }
  }, [currency]);

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
          // Use refs to get latest callback and values
          if (onCreateOrderRef.current) {
            await onCreateOrderRef.current();
          }
          return actions.order.create({
            purchase_units: [{
              amount: {
                value: amountRef.current.toFixed(2),
                currency_code: currencyRef.current,
              },
              description: 'BF SUMA ROYAL Order',
            }],
          });
        },
        onApprove: async (data: any, actions: any) => {
          try {
            const details = await actions.order.capture();
            await onApproveRef.current(data.orderID, details);
          } catch (err) {
            onErrorRef.current(err);
          }
        },
        onError: (err: any) => {
          onErrorRef.current(err);
        },
        onCancel: () => {},
      }).render(containerRef.current);
    } catch (err) {
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

  return (
    <div
      ref={containerRef}
      className={disabled ? 'opacity-50 pointer-events-none' : ''}
    />
  );
};

export default PayPalButton;
