const certifications = [
  { name: "GMP Certified", sub: "Good Manufacturing Practice" },
  { name: "Halal Certified", sub: "Islamic Dietary Standard" },
  { name: "ISO 22000", sub: "Food Safety Management" },
  { name: "KEBS Approved", sub: "Kenya Bureau of Standards" },
];

const CertificationsStrip = () => {
  return (
    <section className="py-6 bg-muted/40 border-y border-border/50">
      <div className="container mx-auto px-4">
        <div className="flex flex-wrap justify-center items-center gap-3 md:gap-4">
          {certifications.map((cert) => (
            <div
              key={cert.name}
              className="flex items-center gap-2 px-4 py-2 bg-background rounded-full border border-border/60"
            >
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="text-sm font-semibold text-foreground">{cert.name}</span>
              <span className="hidden md:inline text-xs text-muted-foreground">· {cert.sub}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default CertificationsStrip;
