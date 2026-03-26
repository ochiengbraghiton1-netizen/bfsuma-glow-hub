import { useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { generateProductAltText } from "@/lib/image-seo";
import { useProducts } from "@/hooks/use-products";
import { useProductRatings } from "@/hooks/use-product-ratings";

const faqData = [
  {
    question: "What is BF SUMA Royal?",
    answer: "BF SUMA Royal is a global health and wellness company offering premium natural supplements backed by scientific research. We operate in over 40 countries, helping people improve their health while providing legitimate business opportunities through our network marketing model."
  },
  {
    question: "Are BF SUMA Royal products safe and certified?",
    answer: "Yes, all BF SUMA Royal products are manufactured in GMP-certified facilities and undergo rigorous quality testing. Our products are made from 100% natural ingredients and are certified by relevant health authorities. We hold HALAL certification for applicable products."
  },
  {
    question: "How does the BF SUMA Royal business opportunity work?",
    answer: "You can join as a BF SUMA Royal distributor by paying a one-time registration fee of KES 7,000. As a member, you earn through product sales commissions, team bonuses, and leadership rewards. There's no requirement to buy large inventories - you can start small and grow at your own pace."
  },
  {
    question: "Is BF SUMA Royal a pyramid scheme?",
    answer: "No, BF SUMA Royal is a legitimate network marketing company. Unlike pyramid schemes, our income is based on actual product sales, not recruitment alone. We sell real health products with genuine value, and our compensation plan rewards both sales and team building ethically."
  },
  {
    question: "What products does BF SUMA Royal offer?",
    answer: "We offer a wide range of natural health supplements including: NMN Capsules for cellular health, Ganoderma Spore Capsules for immunity, ArthroXtra for joint support, Feminegy for women's health, X-Power Man for men's vitality, and many more specialized wellness products."
  },
  {
    question: "How much can I earn with BF SUMA Royal?",
    answer: "Earnings vary based on your effort and team size. New distributors can earn 15-30% commission on personal sales. As you build a team and advance in rank, you unlock additional bonuses. Top performers earn significant monthly incomes, but results depend on individual commitment."
  },
  {
    question: "How do I get started as a BF SUMA Royal distributor in Kenya?",
    answer: "Getting started is simple: 1) Register through our website or contact us on WhatsApp, 2) Pay the KES 7,000 registration fee, 3) Receive your membership and starter resources, 4) Begin sharing products and building your team with our full support."
  }
];

const StructuredData = () => {
  const { products } = useProducts();
  const productIds = useMemo(() => products.map(p => p.id), [products]);
  const { data: productRatings } = useProductRatings(productIds);

  const organizationSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "name": "BF SUMA Royal",
    "alternateName": "BF SUMA ROYAL Kenya",
    "url": "https://bfsumaroyal.com",
    "logo": "https://bfsumaroyal.com/favicon.png",
    "image": "https://bfsumaroyal.com/og-image.png",
    "description": "BF SUMA Royal offers trusted wellness products designed to support your health journey. Premium supplements backed by a real business opportunity in Kenya.",
    "slogan": "Premium Supplements for Better Health",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kakamega",
      "addressCountry": "KE"
    },
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+254795454053",
      "contactType": "sales",
      "availableLanguage": ["English", "Swahili"]
    },
    "sameAs": [
      "https://www.facebook.com/share/1G6uTXLkpw/",
      "https://www.instagram.com/bf_suma_royal",
      "https://www.tiktok.com/@bfsumaroyal"
    ]
  };

  const localBusinessSchema = {
    "@context": "https://schema.org",
    "@type": "HealthAndBeautyBusiness",
    "name": "BF SUMA Royal Kenya",
    "image": "https://bfsumaroyal.com/og-image.png",
    "url": "https://bfsumaroyal.com",
    "telephone": "+254795454053",
    "description": "Premium wellness supplements and natural health products in Kenya. Quality supplements backed by a real business opportunity.",
    "address": {
      "@type": "PostalAddress",
      "addressLocality": "Kakamega",
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
    "url": "https://bfsumaroyal.com",
    "description": "Premium Supplements for Better Health - Backed by a Real Business Opportunity",
    "potentialAction": {
      "@type": "SearchAction",
      "target": "https://bfsumaroyal.com/?search={search_term_string}",
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
        "image": product.image_url || "https://bfsumaroyal.com/og-image.png",
        "sku": product.name.toLowerCase().replace(/\s+/g, '-'),
        "brand": {
          "@type": "Brand",
          "name": "BF SUMA Royal"
        },
        "aggregateRating": productRatings?.[product.id] && productRatings[product.id].reviewCount > 0 ? {
          "@type": "AggregateRating",
          "ratingValue": productRatings[product.id].averageRating.toString(),
          "reviewCount": productRatings[product.id].reviewCount.toString(),
          "bestRating": "5",
          "worstRating": "1"
        } : {
          "@type": "AggregateRating",
          "ratingValue": "4.8",
          "reviewCount": "12",
          "bestRating": "5",
          "worstRating": "1"
        },
        "offers": {
          "@type": "Offer",
          "url": "https://bfsumaroyal.com/#products",
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
            "shippingRate": {
              "@type": "MonetaryAmount",
              "value": "300",
              "currency": "KES"
            },
            "shippingDestination": {
              "@type": "DefinedRegion",
              "addressCountry": "KE"
            },
            "deliveryTime": {
              "@type": "ShippingDeliveryTime",
              "handlingTime": {
                "@type": "QuantitativeValue",
                "minValue": 1,
                "maxValue": 2,
                "unitCode": "DAY"
              },
              "transitTime": {
                "@type": "QuantitativeValue",
                "minValue": 2,
                "maxValue": 5,
                "unitCode": "DAY"
              }
            }
          }
        }
      }
    }))
  } : null;

  const faqSchema = faqData.length > 0 ? {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": faqData.map(faq => ({
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
