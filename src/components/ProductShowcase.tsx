import ProductCard from "./ProductCard";

const products = [
  {
    name: "NMN Capsules",
    price: "KSh 13,165",
    benefit: "Supports cellular energy, anti-aging, and longevity enhancement"
  },
  {
    name: "ArthroXtra Tablets",
    price: "KSh 7,020",
    benefit: "Joint health support with natural inflammation relief"
  },
  {
    name: "X Power Man Capsules",
    price: "KSh 7,371",
    benefit: "Enhanced vitality and male wellness support"
  },
  {
    name: "Pure & Broken Ganoderma Spores",
    price: "KSh 19,305",
    benefit: "Premium immunity booster with powerful antioxidants"
  },
  {
    name: "Youth Essence Cream",
    price: "KSh 5,967",
    benefit: "Anti-aging skincare for radiant, youthful complexion"
  },
  {
    name: "Ez-Xlim Capsule",
    price: "KSh 9,126",
    benefit: "Natural weight management and metabolism support"
  },
  {
    name: "Refined Yunzhi Capsules",
    price: "KSh 5,089.50",
    benefit: "Immune system enhancement and digestive wellness"
  },
  {
    name: "GluzoJoint-F Capsules",
    price: "KSh 4,914",
    benefit: "Joint flexibility and cartilage health support"
  },
  {
    name: "Feminegy Capsules",
    price: "KSh 5,265",
    benefit: "Women's hormonal balance and vitality enhancement"
  },
  {
    name: "SUMA GRAND 2",
    price: "KSh 22,113",
    benefit: "Premium comprehensive wellness package"
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
