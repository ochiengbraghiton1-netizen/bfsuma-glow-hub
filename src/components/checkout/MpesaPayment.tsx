import { Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from '@/hooks/use-toast';

interface MpesaPaymentProps {
  amount: number;
  orderId?: string | null;
  onCreateOrder?: () => Promise<string>;
  onPaymentSuccess?: (orderId: string, receipt: string) => void;
  onPaymentFailed?: (error: string) => void;
  disabled?: boolean;
  defaultPhone?: string;
}

const MpesaPayment = ({ amount }: MpesaPaymentProps) => {
  const handleClick = () => {
    toast({
      title: 'Coming Soon! 🚀',
      description: 'M-Pesa payments will be available shortly. Please use another payment method for now.',
    });
  };

  return (
    <div className="space-y-4">
      <div className="bg-[#4CAF50]/5 rounded-xl p-4 border border-[#4CAF50]/20 relative">
        <Badge className="absolute top-3 right-3 bg-amber-500 hover:bg-amber-500 text-white text-[10px]">
          Coming Soon
        </Badge>
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

        <Button
          type="button"
          onClick={handleClick}
          className="w-full bg-[#4CAF50]/60 hover:bg-[#4CAF50]/70 text-white cursor-pointer"
          size="lg"
        >
          <Phone className="h-4 w-4 mr-2" />
          Pay with M-Pesa — Coming Soon
        </Button>
      </div>
    </div>
  );
};

export default MpesaPayment;
