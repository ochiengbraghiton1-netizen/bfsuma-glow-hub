import { ArrowLeftRight, Clock, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const ReturnPolicySummary = () => {
  return (
    <div className="bg-muted/30 rounded-xl p-4 border border-border/50">
      <div className="flex items-center gap-2 mb-2">
        <ArrowLeftRight className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">Easy Exchange Policy</span>
      </div>
      <div className="flex flex-wrap gap-3 text-xs text-muted-foreground mb-2">
        <span className="flex items-center gap-1">
          <Clock className="w-3 h-3" /> 72-hour window
        </span>
        <span className="flex items-center gap-1">
          <Shield className="w-3 h-3" /> Refund if no exchange
        </span>
      </div>
      <Link to="/return-policy" className="text-xs text-primary hover:underline">
        View full policy →
      </Link>
    </div>
  );
};

export default ReturnPolicySummary;
