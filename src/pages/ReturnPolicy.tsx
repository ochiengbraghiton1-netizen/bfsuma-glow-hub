import { Helmet } from "react-helmet-async";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Shield, Clock, Package, AlertTriangle, CheckCircle, ArrowLeftRight } from "lucide-react";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Return & Exchange Policy | BF SUMA Royal Kenya</title>
        <meta name="description" content="BF SUMA Royal's easy exchange policy. Request an exchange within 72 hours. Hassle-free returns with conditions apply." />
        <link rel="canonical" href="https://bfsumaroyal.com/return-policy" />
      </Helmet>
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <ArrowLeftRight className="w-4 h-4" />
              Easy Exchange Policy
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Return & Exchange Policy
            </h1>
            <p className="text-muted-foreground mt-3">
              Hassle-Free Returns (Conditions Apply)
            </p>
          </div>

          <div className="space-y-8">
            {/* Quick Summary Icons */}
            <div className="grid grid-cols-3 gap-4">
              <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 text-center">
                <Clock className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-foreground">72-Hour Window</span>
                <span className="text-xs text-muted-foreground">Request within 72hrs</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 text-center">
                <Package className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-foreground">Original Condition</span>
                <span className="text-xs text-muted-foreground">Unopened & unused</span>
              </div>
              <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 text-center">
                <Shield className="w-6 h-6 text-primary" />
                <span className="text-sm font-semibold text-foreground">7-Day Exchange</span>
                <span className="text-xs text-muted-foreground">After pickup</span>
              </div>
            </div>

            {/* Policy Sections */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-primary" />
                  Exchange Eligibility
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Customers must request an exchange within <strong className="text-foreground">72 hours</strong> of delivery.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Products must be <strong className="text-foreground">unopened, unused, and in original condition</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Original invoice or receipt is required.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-accent" />
                  Products Will NOT Be Accepted If
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Opened or tampered with
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Damaged due to improper storage, heat, water, or handling
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-3 flex items-center gap-2">
                  <ArrowLeftRight className="w-5 h-5 text-primary" />
                  Exchange Process
                </h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Exchange delivery will be completed within <strong className="text-foreground">7 days</strong> after pickup.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    If exchange is not possible, a <strong className="text-foreground">refund will be processed via your original payment method</strong> (M-Pesa or card) within 24 hours.
                  </li>
                </ul>
              </div>

              <div>
                <h2 className="text-lg font-bold text-foreground mb-3">Transport Charges</h2>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Incorrect deliveries:</strong> No transport charges apply.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Customer order errors:</strong> Transport charges apply.
                  </li>
                </ul>
              </div>

              <p className="text-xs text-muted-foreground italic pt-2 border-t border-border">
                The company reserves the right to approve or reject exchange requests based on the above conditions.
              </p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ReturnPolicy;
