import { CheckCircle, MessageCircle, Clock, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import type { ConsultationData } from "./ConsultationForm";

interface ConsultationSuccessProps {
  data: ConsultationData;
}

const WHATSAPP_NUMBER = "254795454053";

const ConsultationSuccess = ({ data }: ConsultationSuccessProps) => {
  const buildWhatsAppUrl = () => {
    const message = `Hello BF SUMA Health Team 👋

I have submitted a consultation request on the website.

*Personal Details:*
• Name: ${data.fullName}
• Age Range: ${data.ageRange}
• Gender: ${data.gender || "Not specified"}

*Health Concern:*
• Primary Concern: ${data.healthConcern}
${data.message ? `• Additional Details: ${data.message}` : ""}

I would like to proceed with a professional consultation. Thank you!`;

    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  const openWhatsApp = () => {
    window.open(buildWhatsAppUrl(), "_blank");
  };

  const steps = [
    {
      icon: CheckCircle,
      title: "Request Received",
      description: "Your consultation request has been logged",
      status: "complete",
    },
    {
      icon: UserCheck,
      title: "Consultant Review",
      description: "A health consultant will review your details",
      status: "pending",
    },
    {
      icon: MessageCircle,
      title: "WhatsApp Guidance",
      description: "Receive personalized recommendations via chat",
      status: "pending",
    },
  ];

  return (
    <div className="w-full max-w-2xl mx-auto text-center">
      {/* Success Icon */}
      <div className="mb-6 animate-scale-in">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent shadow-lg">
          <CheckCircle className="w-10 h-10 text-primary-foreground" />
        </div>
      </div>

      {/* Success Message */}
      <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3 animate-fade-in">
        Consultation Request Received ✅
      </h2>
      <p className="text-muted-foreground mb-8 max-w-md mx-auto animate-fade-in">
        Thank you, <span className="font-semibold text-foreground">{data.fullName}</span>! 
        A BF SUMA health consultant will review your details and guide you through the next steps.
      </p>

      {/* Progress Steps */}
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        {steps.map((step, index) => (
          <Card
            key={index}
            className={`p-4 transition-all duration-300 ${
              step.status === "complete"
                ? "bg-primary/10 border-primary/30"
                : "bg-card/50 border-border/50"
            }`}
          >
            <div
              className={`inline-flex items-center justify-center w-10 h-10 rounded-full mb-3 ${
                step.status === "complete"
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              <step.icon className="w-5 h-5" />
            </div>
            <h3 className="font-semibold text-sm text-foreground mb-1">
              {step.title}
            </h3>
            <p className="text-xs text-muted-foreground">{step.description}</p>
          </Card>
        ))}
      </div>

      {/* WhatsApp CTA Card */}
      <Card className="p-6 bg-gradient-to-br from-primary/10 to-accent/5 border-primary/20 mb-6">
        <div className="flex items-center justify-center gap-2 mb-3">
          <Clock className="w-5 h-5 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            Response typically within 24 hours
          </span>
        </div>

        <p className="text-foreground mb-4">
          Ready to continue? Connect with our health team on WhatsApp for faster guidance.
        </p>

        <Button
          onClick={openWhatsApp}
          variant="hero"
          size="xl"
          className="w-full"
        >
          <MessageCircle className="w-5 h-5" />
          Continue to WhatsApp Consultation
        </Button>

        <p className="text-xs text-muted-foreground mt-4">
          💬 A BF SUMA health consultant will guide you step-by-step through personalized wellness recommendations.
        </p>
      </Card>

      {/* Disclaimer */}
      <p className="text-xs text-muted-foreground">
        ⚕️ This consultation does not replace medical diagnosis or emergency care.
      </p>
    </div>
  );
};

export default ConsultationSuccess;
