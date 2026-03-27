import { Award } from "lucide-react";
import { Card } from "@/components/ui/card";
import expertAmina from "@/assets/expert-amina.jpg";
import expertDavid from "@/assets/expert-david.jpg";
import expertFaith from "@/assets/expert-faith.jpg";

const experts = [
  {
    name: "Amina Wanjiku",
    title: "Wellness Consultant",
    bio: "With over 8 years of experience in holistic wellness, Amina specializes in helping Kenyans build sustainable health routines using natural supplements tailored to local lifestyles.",
    image: expertAmina,
  },
  {
    name: "David Ochieng",
    title: "Nutrition Specialist",
    bio: "A certified nutritionist with a background in biochemistry, David works closely with BF Suma's product team to ensure every supplement meets the highest standards of efficacy and safety.",
    image: expertDavid,
  },
  {
    name: "Faith Muthoni",
    title: "Health Educator & Community Lead",
    bio: "Faith leads wellness education across Kenya, training distributors and educating communities on the science behind BF Suma supplements and healthy living practices.",
    image: expertFaith,
  },
];

const ExpertAuthority = () => {
  return (
    <section className="py-16 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-1.5 rounded-full text-sm font-medium mb-4">
            <Award className="w-4 h-4" />
            Our Team
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Backed by Wellness Experts
          </h2>
          <p className="text-muted-foreground mt-2 max-w-xl mx-auto">
            Our team of qualified professionals ensures every product recommendation is grounded in science and real-world results.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {experts.map((expert) => (
            <Card
              key={expert.name}
              className="overflow-hidden bg-card border-border/50 hover:shadow-glow transition-shadow duration-300"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={expert.image}
                  alt={`${expert.name} — ${expert.title} at BF Suma Royal`}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="p-5">
                <h3 className="text-lg font-bold text-foreground">{expert.name}</h3>
                <p className="text-sm font-medium text-primary mb-2">{expert.title}</p>
                <p className="text-sm text-muted-foreground leading-relaxed">{expert.bio}</p>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ExpertAuthority;
