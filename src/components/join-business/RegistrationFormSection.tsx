import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Info, MessageCircle } from 'lucide-react';
import { businessRegistrationSchema, BusinessRegistrationFormData } from '@/lib/business-registration-validation';
import { HoneypotField } from '@/components/ui/honeypot-field';
import { isBot } from '@/lib/honeypot';
import { PhoneInput } from '@/components/ui/phone-input';

const WHATSAPP_URL = 'https://wa.me/254795454053?text=Hi%20BF%20SUMA%20team%20%F0%9F%91%8B%20I%20want%20to%20join%20the%20business.';

interface RegistrationFormSectionProps {
  onSuccess: (data: {
    full_name: string;
    phone: string;
    email?: string;
    county_city: string;
    has_sponsor: boolean;
    sponsor_name?: string;
    sponsor_phone?: string;
    entry_fee: number;
    status: 'pending';
  }) => void;
}

const RegistrationFormSection = ({ onSuccess }: RegistrationFormSectionProps) => {
  const [submitting, setSubmitting] = useState(false);
  const [honeypot, setHoneypot] = useState('');
  const { toast } = useToast();

  const form = useForm<BusinessRegistrationFormData>({
    resolver: zodResolver(businessRegistrationSchema),
    defaultValues: {
      full_name: '',
      phone: '+254',
      email: '',
      county_city: '',
      has_sponsor: false,
      sponsor_name: '',
      sponsor_phone: '+254',
      sponsor_membership_id: '',
      agreement_accepted: false as unknown as true,
    },
  });

  const hasSponsor = form.watch('has_sponsor');

  const onSubmit = async (data: BusinessRegistrationFormData) => {
    if (isBot(honeypot)) {
      toast({ title: 'Submission Failed', description: 'Something went wrong. Please try again.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);
    try {
      const { error } = await supabase
        .from('business_registrations')
        .insert({
          full_name: data.full_name,
          phone: data.phone,
          email: data.email || null,
          county_city: data.county_city,
          has_sponsor: data.has_sponsor,
          sponsor_name: data.has_sponsor ? data.sponsor_name : null,
          sponsor_phone: data.has_sponsor ? data.sponsor_phone : null,
          sponsor_membership_id: data.has_sponsor ? data.sponsor_membership_id : null,
          agreement_accepted: data.agreement_accepted,
          status: 'pending',
        });

      if (error) throw error;

      onSuccess({
        full_name: data.full_name,
        phone: data.phone,
        email: data.email || undefined,
        county_city: data.county_city,
        has_sponsor: data.has_sponsor,
        sponsor_name: data.has_sponsor ? data.sponsor_name : undefined,
        sponsor_phone: data.has_sponsor ? data.sponsor_phone : undefined,
        entry_fee: 7000,
        status: 'pending',
      });

      toast({ title: 'Registration Submitted!', description: 'Your application has been received.' });
    } catch (error: any) {
      console.error('Registration error:', error);
      toast({ title: 'Registration Failed', description: error.message || 'Something went wrong. Please try again.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section id="register" className="py-16 md:py-24 bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="container mx-auto px-4 max-w-2xl">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Ready to Start? Register Now
          </h2>
          <p className="text-muted-foreground text-lg">
            Fill in your details below and our team will guide you through the next steps.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Prefer WhatsApp?{' '}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline inline-flex items-center gap-1">
              <MessageCircle className="h-3.5 w-3.5" /> Chat with our team directly
            </a>
          </p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <HoneypotField value={honeypot} onChange={setHoneypot} />

            {/* Personal Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Personal Information</CardTitle>
                <CardDescription>Tell us about yourself</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="full_name" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Full Name *</FormLabel>
                    <FormControl><Input placeholder="Enter your full name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number *</FormLabel>
                    <FormControl><PhoneInput value={field.value} onChange={field.onChange} placeholder="712 345 678" /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="email" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email Address</FormLabel>
                    <FormControl><Input type="email" placeholder="your@email.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="county_city" render={({ field }) => (
                  <FormItem>
                    <FormLabel>County / City *</FormLabel>
                    <FormControl><Input placeholder="e.g., Nairobi, Mombasa, Kisumu" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            {/* Sponsor Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Business Referral Details</CardTitle>
                <CardDescription>If someone referred you to BF SUMA ROYAL, provide their details below</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField control={form.control} name="has_sponsor" render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Do you have an Upline or Sponsor?</FormLabel>
                      <FormDescription>Someone who introduced you to BF SUMA ROYAL</FormDescription>
                    </div>
                    <FormControl><Switch checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                  </FormItem>
                )} />

                {hasSponsor ? (
                  <div className="space-y-4 p-4 rounded-lg bg-muted/50 border">
                    <FormField control={form.control} name="sponsor_name" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor / Upline Full Name *</FormLabel>
                        <FormControl><Input placeholder="Enter sponsor's full name" {...field} /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sponsor_phone" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor / Upline Phone Number *</FormLabel>
                        <FormControl><PhoneInput value={field.value || '+254'} onChange={field.onChange} placeholder="712 345 678" /></FormControl>
                        <FormMessage />
                      </FormItem>
                    )} />
                    <FormField control={form.control} name="sponsor_membership_id" render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sponsor / Upline Membership ID</FormLabel>
                        <FormControl><Input placeholder="Optional" {...field} /></FormControl>
                        <FormDescription>If you know their BF SUMA ROYAL ID</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )} />
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-4 rounded-lg bg-blue-50 dark:bg-blue-950/30 border border-blue-200 dark:border-blue-800">
                    <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      No worries! If you don't have a sponsor, you will be assigned to our company team who will guide you through your BF SUMA ROYAL journey.
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Membership Fee & Agreement */}
            <Card>
              <CardHeader>
                <CardTitle className="text-xl">Membership Information</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 rounded-lg bg-primary/5 border border-primary/20">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">Business Entry Fee</span>
                    <span className="text-2xl font-bold text-primary">KES 7,000</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    One-time registration fee. Payment details will be shared after application review.
                  </p>
                </div>

                <FormField control={form.control} name="agreement_accepted" render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-lg border p-4">
                    <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-normal cursor-pointer">
                        I understand that BF SUMA ROYAL operates as a networking business and that my sponsor (upline) will benefit from my registration. *
                      </FormLabel>
                      <FormMessage />
                    </div>
                  </FormItem>
                )} />
              </CardContent>
            </Card>

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Submitting Application...</>
              ) : (
                'Submit Application'
              )}
            </Button>

            <p className="text-center text-sm text-muted-foreground">
              By submitting, you agree to be contacted by BF SUMA ROYAL representatives
            </p>
          </form>
        </Form>
      </div>
    </section>
  );
};

export default RegistrationFormSection;
