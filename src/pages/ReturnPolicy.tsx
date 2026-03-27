import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PageSEO from "@/components/PageSEO";
import { Shield, Clock, Package, AlertTriangle, CheckCircle, ArrowLeftRight, Truck, Globe, CreditCard } from "lucide-react";

const ReturnPolicy = () => {
  return (
    <div className="min-h-screen bg-background">
      <PageSEO
        title="Return & Exchange Policy | BF SUMA Royal Kenya"
        description="BF SUMA Royal's return and exchange policy. Request exchanges within 72 hours of delivery. Covers online and international orders. Hassle-free process with conditions."
        path="/return-policy"
      />
      <Header />
      <main className="pt-20 pb-16">
        <div className="container mx-auto px-4 max-w-3xl">
          <div className="text-center mb-10">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
              <ArrowLeftRight className="w-4 h-4" />
              Easy Exchange Policy
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground">
              Return &amp; Exchange Policy
            </h1>
            <p className="text-muted-foreground mt-3 text-sm">
              Last updated: 27 March 2026
            </p>
          </div>

          {/* Quick Summary */}
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 text-center">
              <Clock className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">72-Hour Window</span>
              <span className="text-xs text-muted-foreground">Request within 72hrs</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 text-center">
              <Package className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">Original Condition</span>
              <span className="text-xs text-muted-foreground">Unopened &amp; unused</span>
            </div>
            <div className="flex flex-col items-center gap-2 p-4 bg-card rounded-2xl border border-border/50 text-center">
              <Shield className="w-6 h-6 text-primary" />
              <span className="text-sm font-semibold text-foreground">7-Day Exchange</span>
              <span className="text-xs text-muted-foreground">After pickup</span>
            </div>
          </div>

          <div className="space-y-6">
            {/* Online Purchases */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-6">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Truck className="w-5 h-5 text-primary" />
                Online Purchases
              </h2>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-primary" />
                  Eligible for Exchange
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Defective product</strong> — manufacturing defects or quality issues.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Wrong product received</strong> — item does not match your order.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Expired product</strong> — product delivered past its expiry date.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3">Exchange Conditions</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Request an exchange within <strong className="text-foreground">72 hours</strong> of delivery by contacting us on WhatsApp (<a href="https://wa.me/254795454053" className="text-primary hover:underline">+254 795 454053</a>) or email (<a href="mailto:bfsumaroyal@gmail.com" className="text-primary hover:underline">bfsumaroyal@gmail.com</a>).
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    Products must be <strong className="text-foreground">unopened, untampered, unused, and in original packaging</strong>.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    The <strong className="text-foreground">original invoice or receipt</strong> must be produced during the exchange.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    For wrongly delivered products, <strong className="text-foreground">do not open or tamper</strong> with the product.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-accent" />
                  NOT Eligible for Exchange
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Products opened or tampered with
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Buyer's remorse or change of mind
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Products ordered incorrectly by the customer
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-destructive mt-0.5">✕</span>
                    Products damaged due to improper storage, handling, heat, water, smoke, or fire
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3 flex items-center gap-2">
                  <ArrowLeftRight className="w-4 h-4 text-primary" />
                  Exchange Process
                </h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">1.</span>
                    Contact us within 72 hours of delivery via WhatsApp or email with your order number and reason.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">2.</span>
                    Our team will review your request and arrange pickup of the original product.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">3.</span>
                    Exchange delivery will be completed within <strong className="text-foreground">7 days</strong> after pickup.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">4.</span>
                    If exchange is not possible, a <strong className="text-foreground">refund will be processed via your original payment method</strong> (M-Pesa or card) within 24 hours.
                  </li>
                </ul>
              </div>

              <div>
                <h3 className="text-base font-bold text-foreground mb-3">Transport Charges</h3>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Incorrect deliveries (our error):</strong> No transport charges apply for pickup and re-delivery.
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-primary mt-0.5">•</span>
                    <strong className="text-foreground">Customer order errors:</strong> Transport charges apply for pickup and re-delivery.
                  </li>
                </ul>
              </div>
            </div>

            {/* International Orders */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <Globe className="w-5 h-5 text-primary" />
                International Orders
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  International exchange requests must be made within <strong className="text-foreground">72 hours</strong> of delivery.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Return shipping costs for international orders are the responsibility of the buyer, unless the error is on our part.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Refunds for international orders are processed via the original payment method within <strong className="text-foreground">3–5 business days</strong>.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Products must meet the same condition requirements as domestic orders.
                </li>
              </ul>
            </div>

            {/* Refund Policy */}
            <div className="bg-card rounded-2xl border border-border p-6 space-y-4">
              <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Refund Policy
              </h2>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  We do <strong className="text-foreground">not</strong> offer cash refunds.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  Refunds are processed via <strong className="text-foreground">M-Pesa or credit/debit card reversal</strong>, depending on the original payment method, within 24 hours.
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  The value of the exchanged goods must be equal to or greater than the original purchase. If greater, the difference will be charged.
                </li>
              </ul>
            </div>

            {/* Final Note */}
            <div className="bg-muted/30 rounded-2xl border border-border/50 p-5">
              <p className="text-xs text-muted-foreground italic">
                BF Suma Royal management reserves the right to inspect and approve or reject any product submitted for exchange. Management's decision is final. For questions, contact us at{" "}
                <a href="https://wa.me/254795454053" className="text-primary hover:underline">+254 795 454053</a> or{" "}
                <a href="mailto:bfsumaroyal@gmail.com" className="text-primary hover:underline">bfsumaroyal@gmail.com</a>.
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
