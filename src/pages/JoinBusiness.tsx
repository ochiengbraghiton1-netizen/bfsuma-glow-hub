import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { ArrowLeft, Users } from 'lucide-react';
import HeroSection from '@/components/join-business/HeroSection';
import HowItWorks from '@/components/join-business/HowItWorks';
import StarLevels from '@/components/join-business/StarLevels';
import IncomeStreamsGraphic from '@/components/join-business/IncomeStreamsGraphic';
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
      { '@type': 'Question', name: 'How do I join BF Suma Royal?', acceptedAnswer: { '@type': 'Answer', text: 'Fill out the registration form on this page, or contact us on WhatsApp. You\'ll pay a one-time registration fee of KES 7,000 to get started with a product kit and distributor access.' } },
      { '@type': 'Question', name: 'Do I need any experience?', acceptedAnswer: { '@type': 'Answer', text: 'No experience is needed. BF Suma provides full training and mentorship for all new distributors. You\'ll learn about the products, how to sell, and how to grow your team step by step.' } },
      { '@type': 'Question', name: 'How do I earn money?', acceptedAnswer: { '@type': 'Answer', text: 'You earn in three main ways: (1) Retail profit — buy products at distributor price and sell at retail price for up to 20% profit. (2) Performance bonus — earn up to 28% based on your team\'s total sales. (3) Leadership bonus — earn an additional 25% when you develop qualified leaders in your team.' } },
      { '@type': 'Question', name: 'What support do I get as a new member?', acceptedAnswer: { '@type': 'Answer', text: 'Every new member receives personal mentorship, product training, marketing materials, and ongoing WhatsApp support from our team. Star 1–7 distributors receive extra attention to ensure they build a strong foundation.' } },
      { '@type': 'Question', name: 'Can I do this part-time?', acceptedAnswer: { '@type': 'Answer', text: 'Absolutely. Many of our most successful distributors started part-time while keeping their regular jobs. You set your own schedule and grow at your own pace.' } },
      { '@type': 'Question', name: 'Is this a pyramid scheme?', acceptedAnswer: { '@type': 'Answer', text: 'No. BF Suma is a legitimate direct selling company with real physical products. You earn income from actual product sales, not from recruitment alone. The company is registered and operates in over 30 countries worldwide.' } },
      { '@type': 'Question', name: 'What products does BF Suma sell?', acceptedAnswer: { '@type': 'Answer', text: 'BF Suma sells a wide range of health and wellness products including nutritional supplements, personal care items, and health drinks. All products are internationally certified and sold across Africa and Asia.' } },
      { '@type': 'Question', name: 'What are the travel and car rewards?', acceptedAnswer: { '@type': 'Answer', text: 'As you advance through the ranks, you qualify for all-expenses-paid trips (regional and international) and car incentives. These are real rewards that BF Suma provides to its top-performing distributors worldwide.' } },
    ],
  };

  const webPageSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Join BF Suma Royal Business',
    description: 'Start your own health and wellness business in Kenya with BF Suma Royal. Earn commissions, travel rewards, and car awards. Register for KES 7,000.',
    url: 'https://bfsumaroyal.com/join-business',
    isPartOf: {
      '@type': 'WebSite',
      name: 'BF Suma Royal',
      url: 'https://bfsumaroyal.com',
    },
    publisher: {
      '@type': 'Organization',
      name: 'BF Suma Royal',
      url: 'https://bfsumaroyal.com',
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: '+254795454053',
        contactType: 'sales',
        availableLanguage: ['English', 'Swahili'],
      },
      sameAs: [
        'https://www.facebook.com/share/1G6uTXLkpw/',
        'https://www.instagram.com/bf_suma_royal',
        'https://www.tiktok.com/@bfsumaroyal',
      ],
    },
    speakable: {
      '@type': 'SpeakableSpecification',
      cssSelector: ['h1', '.hero-description'],
    },
  };

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Join BF SUMA Business Kenya | Earn From Home</title>
        <meta name="description" content="Start your own wellness business in Kenya with BF SUMA Royal. Earn commissions, travel rewards & car awards. Register for KES 7,000. Join today!" />
        <link rel="canonical" href="https://bfsumaroyal.com/join-business" />
        <meta property="og:title" content="Join BF SUMA Business Kenya | Earn From Home" />
        <meta property="og:description" content="Start your wellness business in Kenya. Earn commissions, travel rewards & car awards. Register today!" />
        <meta property="og:url" content="https://bfsumaroyal.com/join-business" />
        <meta property="og:type" content="website" />
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
        <script type="application/ld+json">{JSON.stringify(webPageSchema)}</script>
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
      <IncomeStreamsGraphic />
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
