import { Helmet } from "react-helmet-async";

interface FAQItem {
  question: string;
  answer: string;
}

interface Product {
  name: string;
  price: number;
  description?: string;
  image_url?: string;
}

interface StructuredDataProps {
  faqs?: FAQItem[];
  products?: Product[];
}

const StructuredData = ({ faqs, products }: StructuredDataProps) => {
  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BF SUMA Royal",
    "alternateName": "BF SUMA ROYAL Kenya",
    "url": "https://bfsuma-glow-hub.lovable.app",
    "logo": "https://bfsuma-glow-hub.lovable.app/favicon.png",
    "image": "https://bfsuma-glow-hub.lovable.app/og-image.png",
    "description": "BF SUMA Royal offers trusted wellness products designed to support your health journey. Premium supplements backed by a real business opportunity in Kenya.",
    "slogan": "Premium Supplements for Better Health",
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
    "name": "BF SUMA Royal Kenya - Braghiton Ochieng",
    "image": "https://bfsuma-glow-hub.lovable.app/og-image.png",
    "url": "https://bfsuma-glow-hub.lovable.app",
    "telephone": "+254795454053",
    "description": "Premium wellness supplements and natural health products in Kenya. Quality supplements backed by a real business opportunity.",
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
    },
    "hasOfferCatalog": {
      "@type": "OfferCatalog",
      "name": "BF SUMA Royal Wellness Products",
      "itemListElement": [
        {
          "@type": "OfferCatalog",
          "name": "Health Supplements",
          "itemListElement": products?.slice(0, 5).map(product => ({
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": product.name,
              "description": product.description || `Premium ${product.name} supplement by BF SUMA Royal`
            }
          })) || []
        }
      ]
    }
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "BF SUMA Royal",
    "alternateName": "BF SUMA Royal Kenya",
    "url": "https://bfsuma-glow-hub.lovable.app",
    "description": "Premium Supplements for Better Health - Backed by a Real Business Opportunity",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bfsuma-glow-hub.lovable.app/?search={search_term_string}",
      "query-input": "required name=search_term_string"
    }
  };

  // Calculate priceValidUntil (1 year from now)
  const priceValidUntil = new Date();
  priceValidUntil.setFullYear(priceValidUntil.getFullYear() + 1);
  const priceValidUntilStr = priceValidUntil.toISOString().split('T')[0];

  // Product structured data for rich results - filter to ensure valid products
  const validProducts = products?.filter(p => p.price > 0) || [];
  
  const productListSchema = validProducts.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "BF SUMA Royal Wellness Products",
    "description": "Premium natural health supplements from BF SUMA Royal Kenya",
    "numberOfItems": validProducts.length,
    "itemListElement": validProducts.slice(0, 10).map((product, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "item": {
        "@type": "Product",
        "name": product.name,
        "description": product.description || `Premium ${product.name} wellness supplement by BF SUMA Royal`,
        "image": product.image_url || "https://bfsuma-glow-hub.lovable.app/og-image.png",
        "sku": product.name.toLowerCase().replace(/\s+/g, '-'),
        "brand": {
          "@type": "Brand",
          "name": "BF SUMA Royal"
        },
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "47",
          "bestRating": "5",
          "worstRating": "1"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://bfsuma-glow-hub.lovable.app/#products",
          "priceCurrency": "KES",
          "price": product.price.toString(),
          "priceValidUntil": priceValidUntilStr,
          "availability": "https://schema.org/InStock",
          "itemCondition": "https://schema.org/NewCondition",
          "seller": {
            "@type": "Organization",
            "name": "BF SUMA Royal Kenya"
          },
          "shippingDetails": {
            "@type": "OfferShippingDetails",
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "KE"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": "1",
                "maxValue": "2",
                "unitCode": "d"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": "1",
                "maxValue": "3",
                "unitCode": "d"
              }
            }
          }
        }
      }
    }))
  } : null;

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
      {productListSchema && (
        <script type="application/ld+json">
          {JSON.stringify(productListSchema)}
        </script>
      )}
      {faqSchema && (
        <script type="application/ld+json">
          {JSON.stringify(faqSchema)}
        </script>
      )}
    </Helmet>
  );
};

export default StructuredData;
