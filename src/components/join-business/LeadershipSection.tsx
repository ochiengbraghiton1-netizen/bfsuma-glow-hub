import TeamSection from './TeamSection';

const LeadershipSection = () => (
  <section className="py-16 md:py-24 bg-background">
    <div className="container mx-auto px-4 max-w-5xl">
      <div className="text-center mb-8">
        <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">Meet Our Leadership</h2>
        <p className="text-lg text-primary font-medium">Real people, real mentorship, right here in Kakamega.</p>
      </div>
      <p className="text-muted-foreground text-base md:text-lg max-w-3xl mx-auto text-center">
        BF SUMA ROYAL is led by Julius Waka, who brought the business to Kakamega over 8 years ago after being introduced to it by his own upline in Mombasa. Since then, he's built a dedicated team, including doctors who provide health screenings for our community, and helped dozens of Kenyans start their own BF Suma journey through mentorship and hands-on training. New distributors join by invitation and are personally trained by the team, so you're never building alone.
      </p>
      <TeamSection />
    </div>
  </section>
);

export default LeadershipSection;
