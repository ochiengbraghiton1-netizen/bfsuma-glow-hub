import ProductCard from "./ProductCard";
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
    image: nmnImage
  },
  {
    name: "ArthroXtra Tablets",
    price: "KSh 7,020",
    benefit: "Joint health support with natural inflammation relief",
    image: arthroxtraImage
  },
  {
    name: "X Power Man Capsules",
    price: "KSh 7,371",
    benefit: "Enhanced vitality and male wellness support",
    image: xPowerManImage
  },
  {
    name: "Pure & Broken Ganoderma Spores",
    price: "KSh 19,305",
    benefit: "Premium immunity booster with powerful antioxidants",
    image: ganodermaImage
  },
  {
    name: "Youth Essence Cream",
    price: "KSh 5,967",
    benefit: "Anti-aging skincare for radiant, youthful complexion",
    image: youthEssenceImage
  },
  {
    name: "Ez-Xlim Capsule",
    price: "KSh 9,126",
    benefit: "Natural weight management and metabolism support",
    image: ezXlimImage
  },
  {
    name: "Refined Yunzhi Capsules",
    price: "KSh 5,089.50",
    benefit: "Immune system enhancement and digestive wellness",
    image: yunzhiImage
  },
  {
    name: "GluzoJoint-F Capsules",
    price: "KSh 4,914",
    benefit: "Joint flexibility and cartilage health support",
    image: gluzojointImage
  },
  {
    name: "Feminegy Capsules",
    price: "KSh 5,265",
    benefit: "Women's hormonal balance and vitality enhancement",
    image: feminiegyImage
  },
  {
    name: "SUMA GRAND 2",
    price: "KSh 22,113",
    benefit: "Premium comprehensive wellness package",
    image: sumaGrandImage
  },
  {
    name: "FemiCalcium D3",
    price: "KSh 5,500",
    benefit: "Prenatal calcium potency for bone health and pregnancy support",
    image: femiCalciumImage
  },
  {
    name: "Detoxilive Soft Gels",
    price: "KSh 3,000",
    benefit: "Liver detoxification and natural body cleansing support",
    image: detoxiliveImage
  },
  {
    name: "Vitamin C Chewable Tablets",
    price: "KSh 3,600",
    benefit: "Immune system enhancement and antioxidant protection",
    image: vitaminCImage
  }
];

const ProductShowcase = () => {
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
            <div 
              key={index}
              className="animate-scale-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <ProductCard {...product} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ProductShowcase;
