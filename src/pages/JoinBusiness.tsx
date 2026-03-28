import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import HeroSection from '@/components/join-business/HeroSection';
import HowItWorks from '@/components/join-business/HowItWorks';
import StarLevels from '@/components/join-business/StarLevels';
import SupportSystem from '@/components/join-business/SupportSystem';
import RewardsIncentives from '@/components/join-business/RewardsIncentives';
import WhyJoin from '@/components/join-business/WhyJoin';
import EarningsCalculator from '@/components/join-business/EarningsCalculator';
import JoinFAQ from '@/components/join-business/JoinFAQ';
import CTABanner from '@/components/join-business/CTABanner';
import RegistrationFormSection from '@/components/join-business/RegistrationFormSection';
import RegistrationSuccess from '@/components/business-registration/RegistrationSuccess';
import Footer from '@/components/Footer';

interface RegistrationData {
  id?: string;
  full_name: string;
  phone: string;
  email?: string;
  county_city: string;
  has_sponsor: boolean;
  sponsor_name?: string;
  sponsor_phone?: string;
  entry_fee: number;
  status: 'pending' | 'approved' | 'rejected' | 'payment_pending' | 'payment_received';
}

const REGISTRATION_STORAGE_KEY = 'bf_suma_registration';

const JoinBusiness = () => {
  const [registrationData, setRegistrationData] = useState<RegistrationData | null>(null);

  useEffect(() => {
    const storedRegistration = sessionStorage.getItem(REGISTRATION_STORAGE_KEY);
    if (storedRegistration) {
      try {
        setRegistrationData(JSON.parse(storedRegistration));
      } catch {
        sessionStorage.removeItem(REGISTRATION_STORAGE_KEY);
      }
    }
  }, []);

  const handleRegistrationSuccess = (data: Omit<RegistrationData, 'id'>) => {
    sessionStorage.setItem(REGISTRATION_STORAGE_KEY, JSON.stringify(data));
    setRegistrationData(data as RegistrationData);
  };

  const handleStartNew = () => {
    sessionStorage.removeItem(REGISTRATION_STORAGE_KEY);
    setRegistrationData(null);
  };

  if (registrationData) {
    return <RegistrationSuccess registrationData={registrationData} onStartNew={handleStartNew} />;
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      { '@type': 'Question', name: 'How do I join BF Suma Royal?', acceptedAnswer: { '@type': 'Answer', text: 'Fill out the registration form on our Join Business page, or contact us on WhatsApp. You\'ll pay a one-time registration fee of KES 7,000 to get started.' } },
      { '@type': 'Question', name: 'Do I need any experience?', acceptedAnswer: { '@type': 'Answer', text: 'No experience is needed. BF Suma provides full training and mentorship for all new distributors.' } },
      { '@type': 'Question', name: 'How do I earn money with BF Suma?', acceptedAnswer: { '@type': 'Answer', text: 'You earn through retail profit (up to 20%), performance bonus (up to 28%), and leadership bonus (up to 25%).' } },
      { '@type': 'Question', name: 'Is BF Suma a pyramid scheme?', acceptedAnswer: { '@type': 'Answer', text: 'No. BF Suma is a legitimate direct selling company with real physical products sold in over 30 countries worldwide.' } },
    ],
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Start a Wellness Business in Kenya | BF Suma Royal</title>
        <meta name="description" content="Join BF Suma Royal and start your own health and wellness business in Kenya. Earn commissions, travel rewards, and car awards. Register for KES 7,000." />
        <link rel="canonical" href="https://bfsumaroyal.com/join-business" />
        <meta property="og:title" content="Start a Wellness Business in Kenya | BF Suma Royal" />
        <meta property="og:description" content="Build income, grow your network, and unlock travel and car rewards with BF Suma Royal Kenya." />
        <meta property="og:url" content="https://bfsumaroyal.com/join-business" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      {/* Sticky Header */}
      <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span className="font-semibold">BF SUMA ROYAL Business</span>
          </div>
        </div>
      </header>

      <HeroSection />
      <HowItWorks />
      <StarLevels />
      <SupportSystem />
      <RewardsIncentives />
      <EarningsCalculator />
      <WhyJoin />
      <CTABanner />
      <JoinFAQ />
      <RegistrationFormSection onSuccess={handleRegistrationSuccess} />
      <Footer />
    </div>
  );
};

export default JoinBusiness;
