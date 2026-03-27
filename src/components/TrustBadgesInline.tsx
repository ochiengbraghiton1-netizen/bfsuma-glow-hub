import { Shield, Truck, CheckCircle } from "lucide-react";

const TrustBadgesInline = () => {
  return (
    <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-muted-foreground mt-3">
      <span className="flex items-center gap-1">
        <CheckCircle className="w-3.5 h-3.5 text-primary" />
        Trusted by customers across Kenya
      </span>
      <span className="flex items-center gap-1">
        <Shield className="w-3.5 h-3.5 text-primary" />
        Secure Checkout
      </span>
      <span className="flex items-center gap-1">
        <Truck className="w-3.5 h-3.5 text-primary" />
        Pay via M-Pesa on WhatsApp
      </span>
    </div>
  );
};

export default TrustBadgesInline;
