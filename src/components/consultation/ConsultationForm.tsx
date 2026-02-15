import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2, Stethoscope } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { HoneypotField } from "@/components/ui/honeypot-field";
import { PhoneInput } from "@/components/ui/phone-input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

import { supabase } from "@/integrations/supabase/client";
import { isBot } from "@/lib/honeypot";
import {
  consultationSchema,
  ConsultationFormData,
  AGE_RANGES,
  HEALTH_CONCERNS,
  GENDERS,
} from "@/lib/consultation-validation";

export interface ConsultationData {
  fullName: string;
  phone: string;
  email?: string;
  ageRange: string;
  gender?: string;
  healthConcern: string;
  message?: string;
}

interface ConsultationFormProps {
  onSuccess: (data: ConsultationData) => void;
}

const ConsultationForm = ({ onSuccess }: ConsultationFormProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<ConsultationFormData>({
    resolver: zodResolver(consultationSchema),
    defaultValues: {
      fullName: "",
      phone: "+254",
      email: "",
      ageRange: undefined,
      gender: undefined,
      healthConcern: undefined,
      message: "",
      consent: false,
      honeypot: "",
    },
  });

  const onSubmit = async (data: ConsultationFormData) => {
    // Bot detection
    if (isBot(data.honeypot)) {
      toast.success("Request submitted successfully!");
      return;
    }

    setIsSubmitting(true);

    try {
      // Build structured notes with additional info
      const structuredNotes = JSON.stringify({
        ageRange: data.ageRange,
        gender: data.gender || "Not specified",
        healthConcern: data.healthConcern,
        userMessage: data.message || "",
      });

      // Insert into consultations table (no .select() to avoid RLS issues)
      const { error } = await supabase.from("consultations").insert({
        client_name: data.fullName.trim(),
        client_phone: data.phone.trim(),
        client_email: data.email?.trim() || null,
        notes: structuredNotes,
        status: "pending",
      });

      if (error) {
        console.error("Consultation submission error:", error);
        throw new Error("Failed to submit consultation request");
      }

      // Pass data to success handler
      onSuccess({
        fullName: data.fullName.trim(),
        phone: data.phone.trim(),
        email: data.email?.trim(),
        ageRange: data.ageRange,
        gender: data.gender,
        healthConcern: data.healthConcern,
        message: data.message?.trim(),
      });
    } catch (error) {
      console.error("Consultation error:", error);
      toast.error("Unable to submit your request. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent mb-4">
          <Stethoscope className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-2">
          Request a Consultation
        </h2>
        <p className="text-muted-foreground max-w-md mx-auto">
          Complete the form below and a certified BF SUMA health consultant will guide you through personalized wellness recommendations.
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <HoneypotField
            value={form.watch("honeypot") || ""}
            onChange={(value) => form.setValue("honeypot", value)}
          />

          {/* Name and Phone - Two columns on desktop */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="fullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your full name"
                      {...field}
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>WhatsApp Number *</FormLabel>
                  <FormControl>
                    <PhoneInput
                      value={field.value}
                      onChange={field.onChange}
                      placeholder="712 345 678"
                      disabled={isSubmitting}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Email */}
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address (optional)</FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Age Range and Gender - Two columns */}
          <div className="grid md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="ageRange"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Age Range *</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select your age range" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {AGE_RANGES.map((range) => (
                        <SelectItem key={range} value={range}>
                          {range}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender (optional)</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    disabled={isSubmitting}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {GENDERS.map((gender) => (
                        <SelectItem key={gender} value={gender}>
                          {gender}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Health Concern */}
          <FormField
            control={form.control}
            name="healthConcern"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Primary Health Concern *</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                  disabled={isSubmitting}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your main concern" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {HEALTH_CONCERNS.map((concern) => (
                      <SelectItem key={concern} value={concern}>
                        {concern}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Message */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Details (optional)</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Describe your health concern or any specific questions you have..."
                    className="min-h-[100px] resize-none"
                    {...field}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Consent Checkbox */}
          <FormField
            control={form.control}
            name="consent"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border border-border p-4 bg-muted/30">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={isSubmitting}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel className="text-sm font-normal cursor-pointer">
                    I agree to be contacted by a BF SUMA health consultant via WhatsApp. *
                  </FormLabel>
                  <FormMessage />
                </div>
              </FormItem>
            )}
          />

          {/* Disclaimer */}
          <p className="text-xs text-muted-foreground text-center">
            ⚕️ This consultation does not replace medical diagnosis or emergency care. 
            For urgent medical issues, please contact your healthcare provider.
          </p>

          {/* Submit Button */}
          <Button
            type="submit"
            variant="hero"
            size="xl"
            className="w-full"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                Submitting Request...
              </>
            ) : (
              "Submit Consultation Request"
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default ConsultationForm;
