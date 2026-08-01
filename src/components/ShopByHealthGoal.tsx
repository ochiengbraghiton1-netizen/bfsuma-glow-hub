import { Link } from "react-router-dom";
import { Activity, Zap, Leaf, Heart, Scale, Shield, Moon, ArrowRight, HelpCircle } from "lucide-react";

const goals = [
  {
    slug: "joint-pain-mobility",
    icon: Activity,
    title: "Joint Pain & Mobility",
    copy: "Stiff knees, sore shoulders or discomfort after a long day? Natural support for comfortable movement.",
    cta: "Explore Joint Support",
  },
  {
    slug: "energy-focus-fatigue",
    icon: Zap,
    title: "Low Energy & Fatigue",
    copy: "Always tired, foggy or drained mid-afternoon? Restore steady energy and sharper focus naturally.",
    cta: "Improve Energy Naturally",
  },
  {
    slug: "digestion-detox",
    icon: Leaf,
    title: "Digestion & Bloating",
    copy: "Bloating after meals, sluggish digestion or irregular bowel habits? Gentle, natural digestive support.",
    cta: "Ease Bloating Naturally",
  },
  {
    slug: "womens-wellness-hormones",
    icon: Heart,
    title: "Hormonal Balance",
    copy: "Mood swings, irregular cycles or menopause symptoms? Trusted natural hormone support for women.",
    cta: "Get Hormonal Support",
  },
  {
    slug: "weight-management-metabolism",
    icon: Scale,
    title: "Weight & Metabolism",
    copy: "Stubborn belly, slow metabolism or weight that won't shift? Natural support for healthy weight goals.",
    cta: "Support Weight Goals",
  },
  {
    slug: "immune-support-healthy-aging",
    icon: Shield,
    title: "Immunity & Healthy Aging",
    copy: "Catching every flu or feeling older than your years? Strengthen immunity and stay vibrant.",
    cta: "Boost Immunity",
  },
  {
    slug: "sleep-recovery",
    icon: Moon,
    title: "Sleep & Stress",
    copy: "Trouble falling asleep, waking up tired or constantly stressed? Sleep deeper, recover faster.",
    cta: "Sleep Better Naturally",
  },
];

const ShopByHealthGoal = () => {
  return (
    <section id="health-goals" className="py-16 bg-muted/30">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-10">
          <p className="text-accent font-semibold uppercase tracking-wider text-xs mb-2">Shop by Health Goal</p>
          <h2 className="text-2xl md:text-4xl font-bold mb-3">What's bothering you today?</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pick the area you'd like help with, we'll show you the right natural supplements and guidance.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {goals.map(({ slug, icon: Icon, title, copy, cta }) => (
            <Link
              key={slug}
              to={`/wellness/${slug}`}
              className="group bg-card border border-border rounded-2xl p-5 md:p-6 hover:shadow-elegant hover:border-primary/40 transition-all"
            >
              <div className="w-11 h-11 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-4 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg mb-2 group-hover:text-primary transition-colors">{title}</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{copy}</p>
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary">
                {cta} <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          ))}
        </div>

        {/* Start Here block */}
        <div className="mt-12 bg-gradient-to-br from-primary/10 via-accent/10 to-primary/5 border border-primary/20 rounded-3xl p-6 md:p-10 text-center">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-accent text-accent-foreground mb-4">
            <HelpCircle className="w-6 h-6" />
          </div>
          <h3 className="text-xl md:text-2xl font-bold mb-2">Not sure where to start?</h3>
          <p className="text-muted-foreground max-w-xl mx-auto mb-6">
            Tell our wellness team about your concern on WhatsApp. We'll recommend the right supplement for your body. Free, no pressure.
          </p>
          <a
            href="https://wa.me/254795454053?text=Hi%2C%20I%27m%20not%20sure%20which%20supplement%20fits%20me.%20Can%20you%20help%3F"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 h-12 px-6 rounded-full bg-accent text-accent-foreground font-bold hover:scale-105 transition-transform"
          >
            Talk to a Wellness Expert
            <ArrowRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </section>
  );
};

export default ShopByHealthGoal;
