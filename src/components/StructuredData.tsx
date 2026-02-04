import { Helmet } from "react-helmet-async";

interface FAQItem {
  question: string;
  answer: string;
}

interface StructuredDataProps {
  faqs?: FAQItem[];
}

const StructuredData = ({ faqs }: StructuredDataProps) => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BF SUMA ROYAL Kenya",
    "alternateName": "BF SUMA ROYAL",
    "url": "https://bfsuma-glow-hub.lovable.app",
    "logo": "https://bfsuma-glow-hub.lovable.app/favicon.png",
    "description": "Premium natural health supplements and wellness business opportunity in Kenya",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "JKUAT Towers, Westlands",
      "addressLocality": "Nairobi",
      "addressCountry": "KE"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+254795454053",
      "contactType": "sales",
      "availableLanguage": ["English", "Swahili"]
    },
    "sameAs": [
      "https://www.facebook.com/profile.php?id=100067452825041",
      "https://www.instagram.com/ochiengbraghiton254"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "BF SUMA ROYAL Kenya - Braghiton Ochieng",
    "image": "https://bfsuma-glow-hub.lovable.app/favicon.png",
    "url": "https://bfsuma-glow-hub.lovable.app",
    "telephone": "+254795454053",
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "JKUAT Towers, Westlands",
      "addressLocality": "Nairobi",
      "addressCountry": "KE"
    },
    "priceRange": "KSh 1,500 - KSh 15,000",
    "openingHoursSpecification": {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "08:00",
      "closes": "18:00"
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BF SUMA ROYAL Kenya",
    "url": "https://bfsuma-glow-hub.lovable.app",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bfsuma-glow-hub.lovable.app/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  const faqSchema = faqs && faqs.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqs.map(faq => ({
      "@type": "Question",
      "name": faq.question,
      "acceptedAnswer": {
        "@type": "Answer",
        "text": faq.answer
      }
    }))
  } : null;

  return (
    <Helmet>
      <script type="application/ld+json">
        {JSON.stringify(organizationSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(localBusinessSchema)}
      </script>
      <script type="application/ld+json">
        {JSON.stringify(websiteSchema)}
      </script>
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default StructuredData;
