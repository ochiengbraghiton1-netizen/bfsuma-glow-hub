import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { PhoneInput } from '@/components/ui/phone-input';
import { Label } from '@/components/ui/label';
import { Loader2, Phone, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface MpesaPaymentProps {
  amount: number;
  orderId: string | null;
  onCreateOrder: () => Promise<string>;
  onPaymentSuccess: (orderId: string, receipt: string) => void;
  onPaymentFailed: (error: string) => void;
  disabled?: boolean;
  defaultPhone?: string;
}

type MpesaStatus = 'idle' | 'creating_order' | 'sending_stk' | 'waiting' | 'success' | 'failed' | 'timeout';

const MpesaPayment = ({
  amount,
  orderId: existingOrderId,
  onCreateOrder,
  onPaymentSuccess,
  onPaymentFailed,
  disabled,
  defaultPhone = '+254',
}: MpesaPaymentProps) => {
  const { toast } = useToast();
  const [mpesaPhone, setMpesaPhone] = useState(defaultPhone);
  const [status, setStatus] = useState<MpesaStatus>('idle');
  const [orderId, setOrderId] = useState<string | null>(existingOrderId);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const startPolling = (oid: string) => {
    // Poll every 5 seconds for up to 2 minutes
    let elapsed = 0;
    const POLL_INTERVAL = 5000;
    const MAX_WAIT = 120000;

    pollRef.current = setInterval(async () => {
      elapsed += POLL_INTERVAL;

      try {
        const { data, error } = await supabase.functions.invoke('mpesa-query', {
          body: { orderId: oid },
        });

        if (error) {
          console.error('Poll error:', error);
          return;
        }

        if (data?.status === 'paid') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setStatus('success');
          onPaymentSuccess(oid, data.mpesaReceipt || '');
        } else if (data?.paymentStatus === 'failed') {
          clearInterval(pollRef.current!);
          pollRef.current = null;
          setStatus('failed');
          onPaymentFailed('M-Pesa payment was not completed. Please try again.');
        }
      } catch (err) {
        console.error('Poll error:', err);
      }

      if (elapsed >= MAX_WAIT) {
        clearInterval(pollRef.current!);
        pollRef.current = null;
        setStatus('timeout');
        toast({
          title: 'Payment Timeout',
          description: 'We didn\'t receive a response from M-Pesa. Please check your phone or try again.',
          variant: 'destructive',
        });
      }
    }, POLL_INTERVAL);
  };

  const handlePayWithMpesa = async () => {
    // Validate phone
    const cleanPhone = mpesaPhone.replace(/[\s\-]/g, '');
    if (!/^\+?254\d{9}$/.test(cleanPhone) && !/^0\d{9}$/.test(cleanPhone)) {
      toast({
        title: 'Invalid Phone',
        description: 'Please enter a valid Safaricom phone number (e.g., 0712345678 or +254712345678)',
        variant: 'destructive',
      });
      return;
    }

    try {
      let currentOrderId = orderId;

      // Create order first if not already created
      if (!currentOrderId) {
        setStatus('creating_order');
        currentOrderId = await onCreateOrder();
        setOrderId(currentOrderId);
      }

      // Send STK push
      setStatus('sending_stk');
      const { data, error } = await supabase.functions.invoke('mpesa-stk-push', {
        body: {
          phone: cleanPhone,
          amount: Math.ceil(amount),
          orderId: currentOrderId,
        },
      });

      if (error || data?.error) {
        throw new Error(data?.error || error?.message || 'Failed to initiate M-Pesa payment');
      }

      // STK push sent successfully - start polling
      setStatus('waiting');
      toast({
        title: 'Check Your Phone 📱',
        description: 'Enter your M-Pesa PIN to complete payment.',
      });
      startPolling(currentOrderId);
    } catch (err: any) {
      console.error('M-Pesa error:', err);
      setStatus('failed');
      toast({
        title: 'M-Pesa Error',
        description: err.message || 'Failed to initiate payment. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const resetState = () => {
    if (pollRef.current) clearInterval(pollRef.current);
    setStatus('idle');
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#4CAF50]/5 rounded-xl p-4 border border-[#4CAF50]/20">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 bg-[#4CAF50] rounded-lg flex items-center justify-center">
            <Phone className="h-5 w-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-sm">Lipa na M-Pesa</p>
            <p className="text-xs text-muted-foreground">
              Pay KSh {Math.ceil(amount).toLocaleString()} via STK Push
            </p>
          </div>
        </div>

        {status === 'idle' || status === 'failed' || status === 'timeout' ? (
          <>
            <div className="mb-3">
              <Label htmlFor="mpesa-phone" className="text-sm">Safaricom Phone Number</Label>
              <PhoneInput
                value={mpesaPhone}
                onChange={setMpesaPhone}
                placeholder="712 345 678"
              />
            </div>

            {(status === 'failed' || status === 'timeout') && (
              <p className="text-sm text-destructive mb-2 flex items-center gap-1">
                <XCircle className="h-4 w-4" />
                {status === 'timeout'
                  ? 'Payment timed out. Please try again.'
                  : 'Payment failed. Please try again.'}
              </p>
            )}

            <Button
              type="button"
              onClick={handlePayWithMpesa}
              disabled={disabled}
              className="w-full bg-[#4CAF50] hover:bg-[#388E3C] text-white"
              size="lg"
            >
              <Phone className="h-4 w-4 mr-2" />
              Pay KSh {Math.ceil(amount).toLocaleString()} with M-Pesa
            </Button>
          </>
        ) : status === 'creating_order' || status === 'sending_stk' ? (
          <div className="text-center py-4 space-y-2">
            <Loader2 className="h-8 w-8 animate-spin mx-auto text-[#4CAF50]" />
            <p className="text-sm font-medium">
              {status === 'creating_order' ? 'Creating order...' : 'Sending payment request...'}
            </p>
          </div>
        ) : status === 'waiting' ? (
          <div className="text-center py-4 space-y-3">
            <div className="relative mx-auto w-16 h-16">
              <Loader2 className="h-16 w-16 animate-spin text-[#4CAF50]/30" />
              <Phone className="h-8 w-8 absolute top-4 left-4 text-[#4CAF50]" />
            </div>
            <div>
              <p className="font-semibold text-sm">Waiting for M-Pesa confirmation...</p>
              <p className="text-xs text-muted-foreground mt-1">
                Check your phone and enter your M-Pesa PIN to complete the payment.
              </p>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={resetState}
            >
              Cancel & Try Again
            </Button>
          </div>
        ) : status === 'success' ? (
          <div className="text-center py-4 space-y-2">
            <CheckCircle className="h-12 w-12 mx-auto text-[#4CAF50]" />
            <p className="font-semibold text-sm text-[#4CAF50]">Payment Successful!</p>
            <p className="text-xs text-muted-foreground">Redirecting to confirmation...</p>
          </div>
        ) : null}
      </div>

      <p className="text-xs text-muted-foreground text-center">
        You will receive an STK push on your phone. Enter your M-Pesa PIN to complete payment.
      </p>
    </div>
  );
};

export default MpesaPayment;
