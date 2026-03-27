/**
 * Location data for local SEO landing pages.
 * Add a new entry here to auto-generate a fully optimized city page.
 */

export interface LocationTestimonial {
  name: string;
  city: string;
  quote: string;
}

export interface LocationProduct {
  name: string;
  slug: string;
  reason: string;
}

export interface LocationData {
  slug: string;
  city: string;
  county?: string;
  heroSubtext: string;
  localContext: string[];
  landmarks: string[];
  deliveryTime: string;
  deliveryNote: string;
  products: LocationProduct[];
  testimonials: LocationTestimonial[];
}

export const locations: LocationData[] = [
  {
    slug: "nairobi",
    city: "Nairobi",
    county: "Nairobi",
    heroSubtext:
      "Boost your energy, balance your hormones, and improve your wellness with premium BF Suma supplements — now available across Nairobi.",
    localContext: [
      "Life in Nairobi moves fast. Between the daily commute through CBD traffic, demanding office hours in Westlands, and the constant hustle that defines the capital city, stress and fatigue have become part of everyday life for millions of Kenyans. Poor sleep, low energy, and weakened immunity are common complaints — yet most people rely on quick fixes instead of addressing the root cause.",
      "That's where targeted nutritional supplementation comes in. Whether you live in Kilimani, Eastlands, or Karen, your body needs consistent support to keep up with Nairobi's pace. The right supplements don't just mask symptoms — they nourish your body at a cellular level, helping you perform at your best every single day.",
      "BF Suma Royal has been serving health-conscious Nairobians with GMP-certified, Halal-approved natural supplements since our founding. Our products are designed for the real challenges of urban Kenyan life — from energy depletion and hormonal imbalance to weakened immunity and joint discomfort.",
    ],
    landmarks: ["CBD", "Westlands", "Kilimani", "Karen", "Eastlands"],
    deliveryTime: "within 24 hours",
    deliveryNote:
      "We deliver to all areas across Nairobi County — including CBD, Westlands, Kilimani, Eastlands, Karen, and surrounding estates — within 24 hours of order confirmation.",
    products: [
      {
        name: "FemiVita",
        slug: "femivita",
        reason:
          "Nairobi's high-stress lifestyle disrupts hormonal balance, especially for working women. FemiVita supports natural hormone regulation, helping you stay energized and balanced through demanding workdays.",
      },
      {
        name: "Reishi Coffee",
        slug: "reishi-coffee",
        reason:
          "Replace your morning coffee with Reishi Coffee — a functional blend that delivers steady energy without the jitters, perfect for Nairobi's fast-paced professionals who need sustained focus.",
      },
      {
        name: "Ganoderma Spore Oil",
        slug: "ganoderma-spore-oil",
        reason:
          "Urban pollution and stress weaken your immune system. Ganoderma Spore Oil is a concentrated immune booster that helps your body fight back against Nairobi's environmental challenges.",
      },
    ],
    testimonials: [
      {
        name: "Mary Wanjiku",
        city: "Nairobi",
        quote:
          "Since I started using FemiVita, my energy levels have improved dramatically. I no longer feel exhausted by 3pm at the office in Westlands.",
      },
      {
        name: "James Ochieng",
        city: "Nairobi",
        quote:
          "Reishi Coffee replaced my regular coffee and the difference is incredible. Better focus, no crashes — and I work long hours in the CBD.",
      },
      {
        name: "Grace Muthoni",
        city: "Nairobi",
        quote:
          "I was constantly falling sick until a friend in Kilimani recommended Ganoderma Spore Oil. My immunity has been so much stronger this year.",
      },
    ],
  },
  {
    slug: "mombasa",
    city: "Mombasa",
    county: "Mombasa",
    heroSubtext:
      "Stay hydrated, energized, and healthy in Mombasa's coastal climate with natural wellness supplements delivered to your doorstep.",
    localContext: [
      "Mombasa's tropical heat and humidity create unique health challenges that many residents overlook. The coastal climate accelerates dehydration, depletes vital minerals through perspiration, and places extra strain on your cardiovascular system. Whether you're working along Moi Avenue, running a business in Nyali, or commuting through Likoni, your body needs specialized nutritional support.",
      "The coastal lifestyle — while beautiful — demands more from your body than you might realize. Salt air, intense UV exposure, and high temperatures mean your skin ages faster, your joints bear more stress, and your energy reserves deplete quickly. Many Mombasa residents struggle with fatigue, skin issues, and recurring infections without connecting these to nutritional gaps.",
      "BF Suma Royal's range of natural supplements is formulated to address exactly these coastal health challenges. From powerful antioxidants that protect your cells from heat-related oxidative stress to mineral-rich formulas that replenish what the Mombasa sun takes away, our products are trusted by thousands along the Kenyan coast.",
    ],
    landmarks: ["Nyali", "Likoni", "Moi Avenue", "Old Town", "Bamburi"],
    deliveryTime: "1–2 business days",
    deliveryNote:
      "We deliver across Mombasa County — including Nyali, Likoni, Bamburi, Old Town, and Changamwe — within 1–2 business days via trusted courier services.",
    products: [
      {
        name: "Vitamin C Chewable",
        slug: "vitamin-c-chewable",
        reason:
          "Mombasa's intense sun and heat increase oxidative stress on your body. Vitamin C Chewable tablets provide powerful antioxidant protection while boosting your immune defense against coastal infections.",
      },
      {
        name: "Femi Calcium D3",
        slug: "femi-calcium-d3",
        reason:
          "Despite abundant sunshine, many Mombasa residents have suboptimal calcium absorption. Femi Calcium D3 strengthens bones and joints — essential for staying active in the coastal heat.",
      },
      {
        name: "Pure & Broken Ganoderma Spore Powder",
        slug: "pure-broken-ganoderma-spore-powder",
        reason:
          "Humidity breeds infections. Ganoderma Spore Powder strengthens your natural immunity with concentrated beta-glucans, helping you stay healthy in Mombasa's tropical environment.",
      },
    ],
    testimonials: [
      {
        name: "Fatma Hassan",
        city: "Mombasa",
        quote:
          "Living in Nyali, the heat used to drain me completely. Since taking Vitamin C Chewable daily, I feel so much more resilient and energetic.",
      },
      {
        name: "Ahmed Bakari",
        city: "Mombasa",
        quote:
          "My joint pain was terrible from years of physical work near Likoni ferry. Femi Calcium D3 has made a real difference in my mobility.",
      },
      {
        name: "Amina Salim",
        city: "Mombasa",
        quote:
          "I used to catch every flu going around Old Town. Ganoderma Spore Powder has transformed my immunity — I haven't been sick in months.",
      },
    ],
  },
  {
    slug: "kisumu",
    city: "Kisumu",
    county: "Kisumu",
    heroSubtext:
      "Enhance your health naturally with premium supplements — now serving Kisumu and the greater Lake Victoria region.",
    localContext: [
      "Kisumu's unique lakeside location brings both beauty and specific health considerations. The warm, humid climate around Lake Victoria, combined with the region's dietary patterns — often heavy on fish and ugali — can leave nutritional gaps that affect energy, immunity, and overall wellbeing. Residents from Kondele to Milimani face these challenges daily.",
      "The growing urban lifestyle in Kisumu means more sedentary work, processed food consumption, and stress — a sharp contrast to the traditionally active lifestyle of the lakeside community. This shift has led to rising cases of lifestyle diseases, fatigue, and weakened immunity among working professionals and families across the city.",
      "BF Suma Royal understands the wellness needs of Kisumu residents. Our natural supplements bridge the nutritional gaps in the local diet, providing concentrated vitamins, minerals, and herbal extracts that support your body's natural defense systems and energy production.",
    ],
    landmarks: ["Kondele", "Milimani", "Kisumu CBD", "Mamboleo", "Nyalenda"],
    deliveryTime: "1–2 business days",
    deliveryNote:
      "We deliver throughout Kisumu County — including Kondele, Milimani, Kisumu CBD, Mamboleo, and surrounding areas — within 1–2 business days.",
    products: [
      {
        name: "Yunzhi Capsules",
        slug: "yunzhi-capsules",
        reason:
          "Kisumu's humid lakeside environment increases susceptibility to infections. Yunzhi Capsules provide powerful immune modulation with polysaccharopeptides that help your body fight threats naturally.",
      },
      {
        name: "Detoxilive Capsules",
        slug: "detoxilive-capsules",
        reason:
          "The local diet, while rich in protein, can burden the liver over time. Detoxilive Capsules support healthy liver function and cardiovascular health — essential for long-term wellness in Kisumu.",
      },
      {
        name: "EZ-Xlim",
        slug: "ez-xlim",
        reason:
          "As Kisumu urbanizes, sedentary lifestyles and changing diets are driving weight concerns. EZ-Xlim supports healthy weight management alongside a balanced diet and regular exercise.",
      },
    ],
    testimonials: [
      {
        name: "Otieno Ouma",
        city: "Kisumu",
        quote:
          "Working in Kisumu CBD, I used to feel sluggish after lunch every day. Yunzhi Capsules have given me consistent energy and I rarely get sick now.",
      },
      {
        name: "Achieng Adhiambo",
        city: "Kisumu",
        quote:
          "Detoxilive has been a game-changer for my digestive health. Living in Milimani, I recommend it to all my neighbors.",
      },
      {
        name: "Peter Onyango",
        city: "Kisumu",
        quote:
          "I've lost 8kg in 3 months with EZ-Xlim and regular walks along the lake. Finally feeling confident about my health.",
      },
    ],
  },
  {
    slug: "nakuru",
    city: "Nakuru",
    county: "Nakuru",
    heroSubtext:
      "Discover natural health solutions in Nakuru — premium supplements for energy, immunity, and total wellness delivered across the county.",
    localContext: [
      "Nakuru has evolved from a quiet agricultural town into one of Kenya's fastest-growing urban centers. With this rapid growth comes the health challenges of urbanization — increased stress, sedentary office work, and reliance on processed foods. Residents across Nakuru Town, Lanet, and the surrounding areas are increasingly looking for natural ways to support their health.",
      "The Rift Valley climate — with its cool highlands and fluctuating temperatures — puts extra demands on your immune system. Seasonal changes can trigger respiratory issues, while the altitude affects energy levels for those not accustomed to it. Proper supplementation helps your body adapt and thrive in Nakuru's unique environment.",
      "BF Suma Royal is proud to serve the growing health-conscious community in Nakuru County. Our range of certified natural supplements addresses the specific wellness needs of Rift Valley residents, from immune support during cold seasons to energy enhancement for busy professionals.",
    ],
    landmarks: ["Nakuru Town", "Lanet", "Free Area", "Section 58", "Milimani"],
    deliveryTime: "1–2 business days",
    deliveryNote:
      "We deliver throughout Nakuru County — including Nakuru Town, Lanet, Free Area, Section 58, and Milimani — within 1–2 business days.",
    products: [
      {
        name: "Ganoderma Spore Oil",
        slug: "ganoderma-spore-oil",
        reason:
          "Nakuru's cool Rift Valley climate and seasonal temperature swings challenge your immune system. Ganoderma Spore Oil provides concentrated immune support to keep you healthy through every season.",
      },
      {
        name: "Reishi Coffee",
        slug: "reishi-coffee",
        reason:
          "Nakuru's growing professional class needs sustained energy without crashes. Reishi Coffee combines the ritual of your morning cup with adaptogenic mushroom benefits for all-day focus.",
      },
      {
        name: "GluzoJoint",
        slug: "gluzojoint",
        reason:
          "The cool highland climate can aggravate joint stiffness. GluzoJoint provides glucosamine and natural anti-inflammatory compounds to keep your joints flexible and pain-free.",
      },
    ],
    testimonials: [
      {
        name: "Catherine Wambui",
        city: "Nakuru",
        quote:
          "The cold mornings in Nakuru used to make my joints stiff. GluzoJoint has made such a difference — I can walk to the market in Free Area without pain.",
      },
      {
        name: "David Kiprop",
        city: "Nakuru",
        quote:
          "As a teacher in Lanet, I need energy that lasts all day. Reishi Coffee gives me that steady focus without the afternoon crash.",
      },
      {
        name: "Susan Chebet",
        city: "Nakuru",
        quote:
          "I kept catching colds every time the weather changed. Ganoderma Spore Oil has been my shield — I've stayed healthy for months now.",
      },
    ],
  },
  {
    slug: "kakamega",
    city: "Kakamega",
    county: "Kakamega",
    heroSubtext:
      "Your trusted source for natural health supplements in Kakamega — our home county. Enjoy same-day delivery and local expertise.",
    localContext: [
      "Kakamega holds a special place in the BF Suma Royal story — it's where our journey began and where our headquarters stand today. This gives Kakamega residents a unique advantage: direct access to our team, same-day delivery across Kakamega Town, and the personal touch that comes from serving your own community.",
      "The blend of rural and urban life in Kakamega creates diverse health needs. Farmers and agricultural workers need joint support and sustained energy, while the growing number of professionals in Kakamega Town face the modern challenges of stress, poor diet, and sedentary lifestyles. The region's tropical rainfall also means higher exposure to waterborne and mosquito-borne illnesses.",
      "As your local wellness partner, BF Suma Royal understands Kakamega's unique health landscape intimately. We've personally witnessed how our supplements transform lives in our own community — from market traders in the town centre to teachers in surrounding areas. Our mission is to make premium natural health products accessible to every family in Western Kenya.",
    ],
    landmarks: [
      "Kakamega Town",
      "Kakamega Forest",
      "Shinyalu",
      "Lurambi",
      "Mumias Road",
    ],
    deliveryTime: "same day",
    deliveryNote:
      "As our home base, Kakamega enjoys same-day delivery for all orders placed before 2pm. We deliver across Kakamega Town, Shinyalu, Lurambi, and the greater Kakamega County.",
    products: [
      {
        name: "FemiVita",
        slug: "femivita",
        reason:
          "Women across Kakamega County trust FemiVita for natural hormonal balance and energy support. It's our most recommended product for the busy mothers and professionals of Western Kenya.",
      },
      {
        name: "ArthroXtra",
        slug: "arthroxtra",
        reason:
          "For Kakamega's farming communities and active residents, joint health is crucial. ArthroXtra provides targeted support for joint flexibility and comfort, keeping you moving without pain.",
      },
      {
        name: "Vitamin C Chewable",
        slug: "vitamin-c-chewable",
        reason:
          "Kakamega's tropical rains bring seasonal infections. Vitamin C Chewable tablets provide daily immune protection that the whole family can enjoy — delicious and effective.",
      },
    ],
    testimonials: [
      {
        name: "Janet Khakasa",
        city: "Kakamega",
        quote:
          "I love that BF Suma Royal is right here in Kakamega. I ordered FemiVita in the morning and it was at my door by lunchtime. My energy has never been better!",
      },
      {
        name: "Moses Wekesa",
        city: "Kakamega",
        quote:
          "Farming near Shinyalu takes a toll on my joints. ArthroXtra has given me back my mobility. I can work full days without the pain I used to feel.",
      },
      {
        name: "Rose Nafula",
        city: "Kakamega",
        quote:
          "My children used to catch colds every rainy season. Since I started giving them Vitamin C Chewable, they've been healthier and more active in school.",
      },
    ],
  },
];

export const getLocationBySlug = (slug: string): LocationData | undefined =>
  locations.find((l) => l.slug === slug);
