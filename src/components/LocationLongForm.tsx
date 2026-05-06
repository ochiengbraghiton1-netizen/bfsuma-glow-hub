import { Link } from "react-router-dom";
import type { LocationData } from "@/config/locations";

const WHATSAPP = "https://wa.me/254795454053";

/**
 * Long-form, locally-flavored editorial section for each city.
 * Combines per-city editorial paragraphs with shared, evergreen
 * wellness scaffolding so each page reads as a unique 1,200–1,800 word article.
 */
const LocationLongForm = ({ location }: { location: LocationData }) => {
  const { city, county, landmarks, deliveryTime, editorial, products } = location;
  const area = landmarks[0] || city;

  return (
    <section className="py-16 md:py-20 bg-background">
      <article className="container mx-auto px-4 max-w-3xl prose prose-lg dark:prose-invert">

        <h2>Wellness in {city}: what locals are really dealing with</h2>
        <p>{editorial.climateNote}</p>
        <p>{editorial.workLifeNote}</p>

        <h3>The most common wellness concerns we hear from {city} residents</h3>
        <ul>
          {editorial.topConcerns.map((c, i) => <li key={i}>{c}</li>)}
        </ul>

        <h2>Food, water and the {city} plate</h2>
        <p>{editorial.foodNote}</p>
        <p>
          A balanced plate in {city} doesn’t require expensive imports. Half the plate vegetables — sukuma, spinach, managu,
          terere or cabbage — a quarter lean protein like beans, fish or chicken, and a sensible fist-sized portion of ugali,
          rice or sweet potato keeps blood sugar steady through long workdays around {area} and beyond.
        </p>
        <p>
          Hydration is the second easy win. Two litres of water daily, more if you spend hours outdoors or in {city}'s warmer
          months, keeps energy, focus and joints working as they should. Replace one daily soda with water or unsweetened
          lemon water and you remove around 35,000 empty calories a year — without dieting.
        </p>

        <h2>Movement that fits real life in {city}</h2>
        <p>
          You don’t need a gym membership to stay healthy in {city}. A 30-minute brisk walk, climbing stairs at work, weekend
          hikes, dancing, swimming or playing football on a free pitch all count. Aim for 150 minutes of movement per week
          spread across most days. Two short strength sessions — squats, push-ups, planks — protect bone density and metabolism,
          which both decline naturally after 30.
        </p>
        <p>{editorial.recoveryNote}</p>

        <h2>Sleep, stress and the silent drag on health</h2>
        <p>
          The single most underrated wellness habit is consistent sleep. Adults in {city} who sleep less than six hours a night
          are statistically more likely to gain weight around the belly, fall sick more often and feel low through the day.
          A simple routine helps: phone out of the bedroom, lights dim by 10pm, last meal three hours before bed, and a
          consistent wake-up time even on weekends.
        </p>
        <p>
          Stress is the other quiet thief. Chronic stress raises cortisol, which weakens immunity, disturbs hormones and
          stores fat around the middle. Five minutes of prayer, meditation or simply walking outside daily moves the needle
          more than any supplement.
        </p>

        <h2>Where natural supplements fit in</h2>
        <p>
          Even with the best food and habits, modern Kenyan life leaves real nutrition gaps — soils are tired, vegetables travel
          long distances and most adults don’t get enough oily fish, magnesium or vitamin D from food alone. Targeted natural
          supplements quietly bridge those gaps. They are not magic — but combined with sleep, water and movement, they
          accelerate results that food alone delivers slowly.
        </p>

        <h3>Supplements that suit {city} lifestyles</h3>
        <ul>
          {products.map((p) => (
            <li key={p.slug}>
              <Link to={`/product/${p.slug}`} className="font-semibold">{p.name}</Link>
              {" — "}{p.reason}
            </li>
          ))}
        </ul>

        <h2>Healthy aging starts now, not at 60</h2>
        <p>
          Whether you are 28 in your first job or 58 enjoying grandchildren, the principles are the same: protect bone density,
          maintain muscle, manage inflammation and keep the immune system resilient. The earlier you start, the gentler aging
          becomes. Calcium with vitamin D3, joint support, antioxidants and adequate protein form the foundation. Skin, mood
          and energy follow.
        </p>

        <h2>When to ask for help — and when to see a doctor</h2>
        <p>
          Daily fatigue, low mood, joint stiffness or weight gain that lingers more than a few weeks deserves attention.
          Start with the basics — sleep, hydration, nutrition. If symptoms persist, please consult your nearest clinic.
          Conditions like anaemia, thyroid imbalance, hypertension or diabetes are common across Kenya and very treatable
          when caught early.
        </p>

        <h2>Trusted, certified, locally supported</h2>
        <p>{editorial.trustNote}</p>
        <p>
          Every BF SUMA Royal product is GMP, ISO 22000 and Halal certified, used in 15+ countries and supported by a real
          Kenyan team you can talk to. Delivery to {city} typically arrives {deliveryTime}, and ordering is simple — through
          this website or directly via WhatsApp.
        </p>

        <h2>Your simple next step</h2>
        <p>
          Pick one habit this week. Maybe a daily walk. Maybe replacing soda with water. Maybe a single supplement aligned
          with your biggest concern — energy, joints, immunity or hormones. Layer the next change two weeks later. That’s
          how lasting wellness is built — quietly, consistently, in {city} just as anywhere else.
        </p>

        <p className="not-prose mt-8 flex flex-wrap gap-3">
          <a
            href={`${WHATSAPP}?text=Hi, I'm in ${city} and would like wellness guidance.`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl bg-accent text-accent-foreground font-bold hover:scale-[1.03] transition-transform"
          >
            Free WhatsApp Consultation
          </a>
          <Link
            to="/wellness"
            className="inline-flex items-center justify-center h-12 px-6 rounded-xl border-2 border-primary/30 text-primary font-semibold hover:bg-primary/5 transition-colors"
          >
            Explore Wellness Hubs
          </Link>
        </pre>

        <h2 className="mt-12">Internal linking for {city} readers</h2>
        <ul>
          <li><Link to="/wellness/joint-pain-mobility">Joint pain &amp; mobility wellness hub</Link> — for stiff knees, arthritis and active joint care.</li>
          <li><Link to="/wellness/energy-focus-fatigue">Energy, focus &amp; fatigue hub</Link> — practical advice for tiredness that won't quit.</li>
          <li><Link to="/wellness/womens-wellness-hormones">Women’s wellness &amp; hormones hub</Link> — periods, perimenopause and beyond.</li>
          <li><Link to="/wellness/immune-support-healthy-aging">Immune support &amp; healthy aging hub</Link> — strong defences at any age.</li>
          <li><Link to="/blog">Latest health articles</Link> on the BF SUMA Royal blog.</li>
          <li><Link to="/contact">Contact our {county || "Kenya"} team</Link> for personalised guidance.</li>
        </ul>
      </article>
    </section>
  );
};

export default LocationLongForm;
