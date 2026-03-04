import { Clock, CreditCard, Package, Truck, CheckCircle, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

const timelineSteps = [
  { key: "placed", label: "Placed", icon: Clock },
  { key: "paid", label: "Paid", icon: CreditCard },
  { key: "confirmed", label: "Confirmed", icon: Package },
  { key: "shipped", label: "Shipped", icon: Truck },
  { key: "completed", label: "Completed", icon: CheckCircle },
];

// Maps any order status to which timeline step it corresponds to
const statusToStep: Record<string, number> = {
  pending: 0,
  pending_whatsapp: 0,
  whatsapp_initiated: 0,
  paid: 1,
  confirmed: 2,
  processing: 2,
  shipped: 3,
  delivered: 4,
  completed: 4,
};

interface OrderTimelineProps {
  status: string;
}

const OrderTimeline = ({ status }: OrderTimelineProps) => {
  const isCancelled = status === "cancelled";
  const activeStep = statusToStep[status] ?? 0;

  if (isCancelled) {
    return (
      <div className="flex items-center gap-2 py-3 px-4 rounded-lg bg-red-500/5 border border-red-500/10">
        <XCircle className="h-5 w-5 text-red-500 shrink-0" />
        <span className="text-sm font-medium text-red-600 dark:text-red-400">
          This order has been cancelled
        </span>
      </div>
    );
  }

  return (
    <div className="py-3">
      {/* Desktop: horizontal */}
      <div className="hidden sm:flex items-center gap-0">
        {timelineSteps.map((step, i) => {
          const isCompleted = i <= activeStep;
          const isCurrent = i === activeStep;
          const StepIcon = step.icon;

          return (
            <div key={step.key} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center gap-1.5">
                <div
                  className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center border-2 transition-all duration-300",
                    isCompleted
                      ? "bg-primary border-primary text-primary-foreground"
                      : "bg-muted/50 border-border text-muted-foreground",
                    isCurrent && "ring-2 ring-primary/30 ring-offset-2 ring-offset-background"
                  )}
                >
                  <StepIcon className="h-3.5 w-3.5" />
                </div>
                <span
                  className={cn(
                    "text-[10px] font-medium leading-tight text-center",
                    isCompleted ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </div>
              {i < timelineSteps.length - 1 && (
                <div
                  className={cn(
                    "flex-1 h-0.5 mx-1 mt-[-18px] rounded-full transition-all duration-300",
                    i < activeStep ? "bg-primary" : "bg-border"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      {/* Mobile: compact horizontal */}
      <div className="sm:hidden">
        <div className="flex items-center gap-0">
          {timelineSteps.map((step, i) => {
            const isCompleted = i <= activeStep;
            const isCurrent = i === activeStep;
            const StepIcon = step.icon;

            return (
              <div key={step.key} className="flex items-center flex-1 last:flex-none">
                <div className="flex flex-col items-center gap-1">
                  <div
                    className={cn(
                      "h-6 w-6 rounded-full flex items-center justify-center border transition-all duration-300",
                      isCompleted
                        ? "bg-primary border-primary text-primary-foreground"
                        : "bg-muted/50 border-border text-muted-foreground",
                      isCurrent && "ring-2 ring-primary/20 ring-offset-1 ring-offset-background"
                    )}
                  >
                    <StepIcon className="h-3 w-3" />
                  </div>
                  <span
                    className={cn(
                      "text-[9px] font-medium leading-tight text-center max-w-[48px]",
                      isCompleted ? "text-primary" : "text-muted-foreground"
                    )}
                  >
                    {step.label}
                  </span>
                </div>
                {i < timelineSteps.length - 1 && (
                  <div
                    className={cn(
                      "flex-1 h-0.5 mx-0.5 mt-[-14px] rounded-full transition-all duration-300",
                      i < activeStep ? "bg-primary" : "bg-border"
                    )}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderTimeline;
