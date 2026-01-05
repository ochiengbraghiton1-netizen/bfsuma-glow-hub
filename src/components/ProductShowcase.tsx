import { useState } from "react";
import ProductCard from "./ProductCard";
import ProductDetailModal from "./ProductDetailModal";
import nmnImage from "@/assets/products/nmn-capsules.jpg";
import arthroxtraImage from "@/assets/products/arthroxtra.jpg";
import xPowerManImage from "@/assets/products/x-power-man.jpg";
import ganodermaImage from "@/assets/products/ganoderma-spores.jpg";
import youthEssenceImage from "@/assets/products/youth-essence.jpg";
import ezXlimImage from "@/assets/products/ez-xlim.jpg";
import yunzhiImage from "@/assets/products/yunzhi-capsules.jpg";
import gluzojointImage from "@/assets/products/gluzojoint.jpg";
import feminiegyImage from "@/assets/products/feminegy.jpg";
import sumaGrandImage from "@/assets/products/suma-grand.jpg";
import femiCalciumImage from "@/assets/products/femi-calcium.jpg";
import detoxiliveImage from "@/assets/products/detoxilive.jpg";
import vitaminCImage from "@/assets/products/vitamin-c.jpg";

const products = [
  {
    name: "NMN Capsules",
    price: "KSh 13,165",
    benefit: "Supports cellular energy, anti-aging, and longevity enhancement",
    description: "NMN (Nicotinamide Mononucleotide) Capsules are a cutting-edge anti-aging supplement that boosts NAD+ levels in your body. This premium formula supports cellular energy production, promotes healthy aging, and enhances overall vitality. Perfect for those seeking to maintain youthful energy and cognitive function.",
    image: nmnImage
  },
  {
    name: "ArthroXtra Tablets",
    price: "KSh 7,020",
    benefit: "Joint health support with natural inflammation relief",
    description: "ArthroXtra Tablets are specially formulated to support joint health and mobility. Contains a powerful blend of glucosamine, chondroitin, and natural anti-inflammatory ingredients to help reduce joint discomfort and improve flexibility. Ideal for active individuals and those experiencing joint stiffness.",
    image: arthroxtraImage
  },
  {
    name: "X Power Man Capsules",
    price: "KSh 7,371",
    benefit: "Enhanced vitality and male wellness support",
    description: "X Power Man Capsules are designed to support male vitality and overall wellness. This natural formula helps boost energy levels, enhance stamina, and promote hormonal balance. Made with premium herbal extracts for optimal male health support.",
    image: xPowerManImage
  },
  {
    name: "Pure & Broken Ganoderma Spores",
    price: "KSh 19,305",
    benefit: "Premium immunity booster with powerful antioxidants",
    description: "Pure & Broken Ganoderma Spores represent the pinnacle of immune support supplements. Using advanced wall-breaking technology, these spores deliver maximum bioavailability of beneficial compounds. Supports immune function, promotes relaxation, and provides powerful antioxidant protection.",
    image: ganodermaImage
  },
  {
    name: "Youth Essence Cream",
    price: "KSh 5,967",
    benefit: "Anti-aging skincare for radiant, youthful complexion",
    description: "Youth Essence Cream is a luxurious anti-aging skincare solution that nourishes and revitalizes your skin. Formulated with premium botanical extracts and peptides to reduce fine lines, improve skin elasticity, and restore a youthful, radiant glow.",
    image: youthEssenceImage
  },
  {
    name: "Ez-Xlim Capsule",
    price: "KSh 9,126",
    benefit: "Natural weight management and metabolism support",
    description: "Ez-Xlim Capsules support healthy weight management through natural metabolism enhancement. This carefully formulated supplement helps control appetite, boost fat burning, and maintain healthy energy levels throughout your weight management journey.",
    image: ezXlimImage
  },
  {
    name: "Refined Yunzhi Capsules",
    price: "KSh 5,089.50",
    benefit: "Immune system enhancement and digestive wellness",
    description: "Refined Yunzhi Capsules harness the power of Turkey Tail mushroom to support immune health and digestive wellness. This traditional remedy has been refined using modern extraction techniques for maximum potency and effectiveness.",
    image: yunzhiImage
  },
  {
    name: "GluzoJoint-F Capsules",
    price: "KSh 4,914",
    benefit: "Joint flexibility and cartilage health support",
    description: "GluzoJoint-F Capsules provide comprehensive joint support with a specialized formula for cartilage health. Contains glucosamine and natural compounds that help maintain joint flexibility, reduce stiffness, and support overall joint function.",
    image: gluzojointImage
  },
  {
    name: "Feminegy Capsules",
    price: "KSh 5,265",
    benefit: "Women's hormonal balance and vitality enhancement",
    description: "Feminegy Capsules are specially formulated for women's health, supporting hormonal balance and overall vitality. This natural supplement helps manage menstrual comfort, supports reproductive health, and promotes energy and wellbeing.",
    image: feminiegyImage
  },
  {
    name: "SUMA GRAND 2",
    price: "KSh 22,113",
    benefit: "Premium comprehensive wellness package",
    description: "SUMA GRAND 2 is our premium comprehensive wellness package combining multiple health benefits in one powerful formula. This elite supplement supports overall health, boosts immunity, enhances energy, and promotes longevity.",
    image: sumaGrandImage
  },
  {
    name: "FemiCalcium D3",
    price: "KSh 5,500",
    benefit: "Prenatal calcium potency for bone health and pregnancy support",
    description: "FemiCalcium D3 provides essential calcium and vitamin D3 specially formulated for women. Supports strong bones, healthy pregnancy, and optimal calcium absorption. Ideal for women at all life stages who need enhanced bone health support.",
    image: femiCalciumImage
  },
  {
    name: "Detoxilive Soft Gels",
    price: "KSh 3,000",
    benefit: "Liver detoxification and natural body cleansing support",
    description: "Detoxilive Soft Gels support your body's natural detoxification processes with a focus on liver health. This gentle yet effective formula helps cleanse and protect the liver while promoting overall digestive wellness.",
    image: detoxiliveImage
  },
  {
    name: "Vitamin C Chewable Tablets",
    price: "KSh 3,600",
    benefit: "Immune system enhancement and antioxidant protection",
    description: "Vitamin C Chewable Tablets provide a delicious and convenient way to boost your daily vitamin C intake. Supports immune function, provides antioxidant protection, and promotes healthy skin. Great taste for the whole family.",
    image: vitaminCImage
  }
];

type Product = typeof products[0];

const ProductShowcase = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Premium Products
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Natural supplements scientifically formulated for optimal health and wellness
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {products.map((product, index) => (
            <ProductCard 
              key={index}
              {...product} 
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>
      </div>

      <ProductDetailModal 
        product={selectedProduct}
        open={modalOpen}
        onOpenChange={setModalOpen}
      />
    </section>
  );
};

export default ProductShowcase;
