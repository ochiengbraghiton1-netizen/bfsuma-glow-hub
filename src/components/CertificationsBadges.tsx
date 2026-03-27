import { Shield, Award, CheckCircle, FileCheck } from "lucide-react";

const certifications = [
  { icon: Shield, label: "ISO 22000", sublabel: "UKAS Accredited" },
  { icon: CheckCircle, label: "HACCP", sublabel: "Certified" },
  { icon: FileCheck, label: "FSSC 22000", sublabel: "Food Safety" },
  { icon: Award, label: "GMP", sublabel: "Certified Manufacturing" },
];

const patents = [
  { country: "🇯🇵", label: "Japan Patent" },
  { country: "🇨🇳", label: "China Patent" },
  { country: "🇺🇸", label: "US Patent" },
  { country: "🇮🇳", label: "India Patent" },
  { country: "🇰🇷", label: "Korea Patent" },
];

const CertificationsBadges = () => {
  return (
    <section className="py-14 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Certifications & Quality Assurance
          </h2>
          <p className="text-muted-foreground mt-2 max-w-lg mx-auto">
            Our products are manufactured in certified facilities meeting global safety and quality standards.
          </p>
        </div>

        {/* Certifications Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto mb-8">
          {certifications.map((cert) => (
            <div
              key={cert.label}
              className="flex flex-col items-center gap-2 p-5 bg-card rounded-2xl border border-border/50 hover:border-primary/30 hover:shadow-glow transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <cert.icon className="w-6 h-6 text-primary" />
              </div>
              <span className="text-sm font-bold text-foreground text-center">{cert.label}</span>
              <span className="text-xs text-muted-foreground text-center">{cert.sublabel}</span>
            </div>
          ))}
        </div>

        {/* Patents Row */}
        <div className="flex flex-wrap justify-center gap-3">
          {patents.map((patent) => (
            <div
              key={patent.label}
              className="flex items-center gap-2 px-4 py-2 bg-card rounded-full border border-border/50 text-sm"
            >
              <span className="text-lg">{patent.country}</span>
              <span className="font-medium text-foreground">{patent.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsBadges;
