import { useState, useMemo } from "react";
import { Search, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

const categories = [
  { id: "all", label: "All Products" },
  { id: "immunity", label: "Immunity" },
  { id: "joint", label: "Joint Health" },
  { id: "energy", label: "Energy & Vitality" },
  { id: "women", label: "Women's Health" },
  { id: "detox", label: "Detox & Cleanse" },
  { id: "skincare", label: "Skincare" },
];

const products = [
  {
    name: "NMN Capsules",
    price: "KSh 13,165",
    benefit: "Boost energy & vitality with cellular-level anti-aging support for longevity",
    description: "NMN (Nicotinamide Mononucleotide) Capsules are a cutting-edge anti-aging supplement that boosts NAD+ levels in your body. This premium formula supports cellular energy production, promotes healthy aging, and enhances overall vitality. Perfect for those seeking to maintain youthful energy and cognitive function.",
    image: nmnImage,
    category: "energy",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "ArthroXtra Tablets",
    price: "KSh 7,020",
    benefit: "Relieve joint pain naturally with advanced glucosamine and chondroitin formula",
    description: "ArthroXtra Tablets are specially formulated to support joint health and mobility. Contains a powerful blend of glucosamine, chondroitin, and natural anti-inflammatory ingredients to help reduce joint discomfort and improve flexibility. Ideal for active individuals and those experiencing joint stiffness.",
    image: arthroxtraImage,
    category: "joint",
    certifications: ["GMP", "ISO"]
  },
  {
    name: "X Power Man Capsules",
    price: "KSh 7,371",
    benefit: "Enhance male vitality and stamina with premium herbal extracts",
    description: "X Power Man Capsules are designed to support male vitality and overall wellness. This natural formula helps boost energy levels, enhance stamina, and promote hormonal balance. Made with premium herbal extracts for optimal male health support.",
    image: xPowerManImage,
    category: "energy",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "Pure & Broken Ganoderma Spores",
    price: "KSh 19,305",
    benefit: "Premium immunity booster with powerful antioxidants and immune modulators",
    description: "Pure & Broken Ganoderma Spores represent the pinnacle of immune support supplements. Using advanced wall-breaking technology, these spores deliver maximum bioavailability of beneficial compounds. Supports immune function, promotes relaxation, and provides powerful antioxidant protection.",
    image: ganodermaImage,
    category: "immunity",
    certifications: ["GMP", "Halal", "ISO"]
  },
  {
    name: "Youth Essence Cream",
    price: "KSh 5,967",
    benefit: "Anti-aging skincare that reduces fine lines and restores youthful radiance",
    description: "Youth Essence Cream is a luxurious anti-aging skincare solution that nourishes and revitalizes your skin. Formulated with premium botanical extracts and peptides to reduce fine lines, improve skin elasticity, and restore a youthful, radiant glow.",
    image: youthEssenceImage,
    category: "skincare",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "Ez-Xlim Capsule",
    price: "KSh 9,126",
    benefit: "Natural weight management with metabolism boost and appetite control",
    description: "Ez-Xlim Capsules support healthy weight management through natural metabolism enhancement. This carefully formulated supplement helps control appetite, boost fat burning, and maintain healthy energy levels throughout your weight management journey.",
    image: ezXlimImage,
    category: "detox",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "Refined Yunzhi Capsules",
    price: "KSh 5,089.50",
    benefit: "Strengthen immunity and digestive wellness with Turkey Tail mushroom",
    description: "Refined Yunzhi Capsules harness the power of Turkey Tail mushroom to support immune health and digestive wellness. This traditional remedy has been refined using modern extraction techniques for maximum potency and effectiveness.",
    image: yunzhiImage,
    category: "immunity",
    certifications: ["GMP", "ISO"]
  },
  {
    name: "GluzoJoint-F Capsules",
    price: "KSh 4,914",
    benefit: "Support joint flexibility and cartilage health with glucosamine complex",
    description: "GluzoJoint-F Capsules provide comprehensive joint support with a specialized formula for cartilage health. Contains glucosamine and natural compounds that help maintain joint flexibility, reduce stiffness, and support overall joint function.",
    image: gluzojointImage,
    category: "joint",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "Feminegy Capsules",
    price: "KSh 5,265",
    benefit: "Balance hormones naturally and enhance women's vitality and wellbeing",
    description: "Feminegy Capsules are specially formulated for women's health, supporting hormonal balance and overall vitality. This natural supplement helps manage menstrual comfort, supports reproductive health, and promotes energy and wellbeing.",
    image: feminiegyImage,
    category: "women",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "SUMA GRAND 2",
    price: "KSh 22,113",
    benefit: "Premium comprehensive wellness package for total health transformation",
    description: "SUMA GRAND 2 is our premium comprehensive wellness package combining multiple health benefits in one powerful formula. This elite supplement supports overall health, boosts immunity, enhances energy, and promotes longevity.",
    image: sumaGrandImage,
    category: "immunity",
    certifications: ["GMP", "Halal", "ISO"]
  },
  {
    name: "FemiCalcium D3",
    price: "KSh 5,500",
    benefit: "Essential calcium and D3 for strong bones and healthy pregnancy support",
    description: "FemiCalcium D3 provides essential calcium and vitamin D3 specially formulated for women. Supports strong bones, healthy pregnancy, and optimal calcium absorption. Ideal for women at all life stages who need enhanced bone health support.",
    image: femiCalciumImage,
    category: "women",
    certifications: ["GMP", "Halal"]
  },
  {
    name: "Detoxilive Soft Gels",
    price: "KSh 3,000",
    benefit: "Gentle liver detox and natural body cleansing for improved wellness",
    description: "Detoxilive Soft Gels support your body's natural detoxification processes with a focus on liver health. This gentle yet effective formula helps cleanse and protect the liver while promoting overall digestive wellness.",
    image: detoxiliveImage,
    category: "detox",
    certifications: ["GMP", "ISO"]
  },
  {
    name: "Vitamin C Chewable Tablets",
    price: "KSh 3,600",
    benefit: "Boost immunity and antioxidant protection with delicious chewable tablets",
    description: "Vitamin C Chewable Tablets provide a delicious and convenient way to boost your daily vitamin C intake. Supports immune function, provides antioxidant protection, and promotes healthy skin. Great taste for the whole family.",
    image: vitaminCImage,
    category: "immunity",
    certifications: ["GMP", "Halal"]
  }
];

type Product = typeof products[0];

const ProductShowcase = () => {
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  const handleProductClick = (product: Product) => {
    setSelectedProduct(product);
    setModalOpen(true);
  };

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                           product.benefit.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = activeCategory === "all" || product.category === activeCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, activeCategory]);

  return (
    <section id="products" className="py-24 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12 animate-fade-in">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Premium Products
            </span>
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Natural supplements scientifically formulated for optimal health and wellness
          </p>
        </div>

        {/* Search Bar */}
        <div className="max-w-xl mx-auto mb-8">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 pr-4 py-6 rounded-full border-border/50 bg-card focus:ring-2 focus:ring-primary/20"
            />
          </div>
        </div>

        {/* Category Filters */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={activeCategory === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setActiveCategory(category.id)}
              className={`rounded-full transition-all duration-300 ${
                activeCategory === category.id 
                  ? "" 
                  : "border-border/50 hover:border-primary/50"
              }`}
            >
              {category.label}
            </Button>
          ))}
        </div>
        
        {/* Products Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product, index) => (
            <ProductCard 
              key={index}
              {...product} 
              onClick={() => handleProductClick(product)}
            />
          ))}
        </div>

        {filteredProducts.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <p>No products found. Try a different search or category.</p>
          </div>
        )}
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
