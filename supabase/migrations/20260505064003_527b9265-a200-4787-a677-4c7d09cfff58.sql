-- Wellness hubs schema
CREATE TABLE public.wellness_hubs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  hero_title text NOT NULL,
  hero_description text NOT NULL,
  intro_html text,
  meta_title text,
  meta_description text,
  faq jsonb NOT NULL DEFAULT '[]'::jsonb,
  display_order integer NOT NULL DEFAULT 0,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE public.wellness_hub_products (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid NOT NULL REFERENCES public.wellness_hubs(id) ON DELETE CASCADE,
  product_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hub_id, product_id)
);

CREATE TABLE public.wellness_hub_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  hub_id uuid NOT NULL REFERENCES public.wellness_hubs(id) ON DELETE CASCADE,
  blog_post_id uuid NOT NULL,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (hub_id, blog_post_id)
);

CREATE INDEX idx_wellness_hub_products_hub ON public.wellness_hub_products(hub_id);
CREATE INDEX idx_wellness_hub_articles_hub ON public.wellness_hub_articles(hub_id);

-- RLS
ALTER TABLE public.wellness_hubs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_hub_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wellness_hub_articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active hubs" ON public.wellness_hubs
  FOR SELECT USING (is_active = true);
CREATE POLICY "Admins can manage hubs" ON public.wellness_hubs
  FOR ALL USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Anyone can view hub products" ON public.wellness_hub_products
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage hub products" ON public.wellness_hub_products
  FOR ALL USING (is_admin_or_editor(auth.uid()));

CREATE POLICY "Anyone can view hub articles" ON public.wellness_hub_articles
  FOR SELECT USING (true);
CREATE POLICY "Admins can manage hub articles" ON public.wellness_hub_articles
  FOR ALL USING (is_admin_or_editor(auth.uid()));

-- updated_at trigger
CREATE TRIGGER update_wellness_hubs_updated_at
  BEFORE UPDATE ON public.wellness_hubs
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Seed 7 hubs
INSERT INTO public.wellness_hubs (slug, name, hero_title, hero_description, intro_html, meta_title, meta_description, faq, display_order) VALUES
('joint-pain-mobility', 'Joint Pain & Mobility', 'Joint Pain & Mobility Support in Kenya',
 'Natural supplements to ease joint pain, stiffness and improve mobility — trusted across Kenya.',
 '<p>Joint pain affects millions of Kenyans, especially adults over 40, athletes and people with physically demanding jobs. BF SUMA Royal offers a curated range of natural joint-care supplements designed to reduce inflammation, lubricate joints and rebuild cartilage so you can move freely again.</p><p>Whether you are dealing with arthritis, post-injury stiffness or wear-and-tear from years of activity, our hub brings together our best products, expert articles and FAQs in one place.</p>',
 'Joint Pain & Mobility Supplements Kenya | BF SUMA Royal',
 'Natural joint pain relief and mobility supplements in Kenya. Reduce stiffness, ease arthritis and rebuild cartilage with BF SUMA Royal. Order via WhatsApp.',
 '[
   {"q":"What causes joint pain in adults?","a":"Common causes include osteoarthritis, inflammation, injury, mineral deficiencies and overuse. Natural supplements with glucosamine, MSM and turmeric help reduce inflammation and support cartilage."},
   {"q":"How long until I feel relief?","a":"Most users report noticeable improvement in 2–6 weeks of consistent daily use, alongside light exercise and hydration."},
   {"q":"Are these supplements safe with medication?","a":"Always consult your doctor before combining supplements with prescribed medication, especially blood thinners."},
   {"q":"Do you deliver across Kenya?","a":"Yes — fast delivery to Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Kakamega and all major counties."},
   {"q":"Can I order via WhatsApp?","a":"Absolutely. Message +254 795 454 053 for personalised guidance and same-day order processing."}
 ]'::jsonb, 1),

('weight-management-metabolism', 'Weight Management & Metabolism', 'Weight Management & Metabolism Support Kenya',
 'Boost metabolism, burn fat and reach a healthy weight naturally with BF SUMA Royal supplements.',
 '<p>Sustainable weight management is about more than calories — it depends on a healthy metabolism, balanced hormones and good digestion. Our weight management hub features supplements that support fat burning, appetite control and energy without harsh stimulants.</p><p>Combined with our nutrition guides and free WhatsApp consultations, you get a complete plan to reach your goals safely.</p>',
 'Weight Loss & Metabolism Supplements Kenya | BF SUMA Royal',
 'Natural weight management supplements in Kenya. Boost metabolism, control appetite and burn fat safely with BF SUMA Royal. Free WhatsApp consultation.',
 '[
   {"q":"Are these supplements safe?","a":"Yes — our products are GMP, ISO and Halal certified, and contain no harsh stimulants or banned substances."},
   {"q":"How fast will I see results?","a":"Most users notice changes within 4–8 weeks when combined with balanced eating and regular movement."},
   {"q":"Do I need to follow a strict diet?","a":"No strict diet — but eating balanced meals and staying hydrated greatly improves results."},
   {"q":"Will I gain the weight back?","a":"Our products support metabolic health, so when paired with healthy habits results are sustainable."},
   {"q":"Is consultation free?","a":"Yes — book a free WhatsApp consultation with our wellness team before ordering."}
 ]'::jsonb, 2),

('digestion-detox', 'Digestion & Detox', 'Digestion & Detox Support in Kenya',
 'Cleanse your gut, ease bloating and improve digestion naturally with trusted BF SUMA Royal formulas.',
 '<p>Poor digestion, bloating, constipation and toxin build-up are common in modern Kenyan lifestyles. Our digestion and detox hub focuses on gentle, effective supplements that restore gut health, support liver function and improve nutrient absorption.</p><p>Healthy digestion is the foundation for energy, immunity and clear skin.</p>',
 'Digestion & Detox Supplements Kenya | BF SUMA Royal',
 'Natural digestion and detox supplements in Kenya. Ease bloating, cleanse the gut and support liver health with BF SUMA Royal. Order via WhatsApp.',
 '[
   {"q":"What are signs I need to detox?","a":"Bloating, fatigue, dull skin, irregular bowel movements and brain fog are common signs your body could benefit from a gentle detox."},
   {"q":"Is detox safe long-term?","a":"Our formulas use mild, natural ingredients designed for safe periodic use — typically 4 to 8 week cycles."},
   {"q":"Will I have to fast?","a":"No fasting required. Eat normally and drink plenty of water for best results."},
   {"q":"Can I take with probiotics?","a":"Yes — combining detox with probiotics often improves gut health outcomes."},
   {"q":"Do you offer guidance?","a":"Yes — message +254 795 454 053 for a free personalised digestion consultation."}
 ]'::jsonb, 3),

('womens-wellness-hormones', 'Women''s Wellness & Hormones', 'Women''s Wellness & Hormone Balance Kenya',
 'Natural support for hormonal balance, fertility, menopause and women''s vitality.',
 '<p>From menstrual irregularities to menopause symptoms, hormonal imbalances affect women at every life stage. Our women''s wellness hub features supplements specifically formulated to support hormone balance, reproductive health and overall vitality.</p><p>Backed by natural ingredients and free WhatsApp consultations with our wellness team.</p>',
 'Women''s Hormone Balance Supplements Kenya | BF SUMA Royal',
 'Natural women''s wellness and hormone balance supplements in Kenya. Support fertility, menopause and menstrual health with BF SUMA Royal.',
 '[
   {"q":"Can supplements really balance hormones?","a":"Yes — natural ingredients like vitex, evening primrose and adaptogens have been shown to support hormonal balance over 8–12 weeks."},
   {"q":"Are these safe during pregnancy?","a":"Always consult your doctor before taking any supplement during pregnancy or breastfeeding."},
   {"q":"Do they help with menopause?","a":"Many women report relief from hot flashes, mood swings and sleep issues after consistent use."},
   {"q":"Can men use them?","a":"These formulas are specifically designed for women — see our men''s wellness range instead."},
   {"q":"How do I get personalised advice?","a":"Book a free WhatsApp consultation with our female wellness advisors."}
 ]'::jsonb, 4),

('energy-focus-fatigue', 'Energy, Focus & Fatigue', 'Energy, Focus & Fatigue Support Kenya',
 'Beat fatigue, sharpen focus and boost daily energy with natural BF SUMA Royal supplements.',
 '<p>Constant tiredness, brain fog and afternoon crashes hold back millions of Kenyans. Our energy and focus hub features supplements that nourish your nervous system, balance blood sugar and oxygenate your cells for sustained natural energy — without caffeine jitters.</p>',
 'Energy & Focus Supplements Kenya | BF SUMA Royal',
 'Natural energy, focus and anti-fatigue supplements in Kenya. Beat tiredness and brain fog with BF SUMA Royal. Fast nationwide delivery.',
 '[
   {"q":"Will these make me jittery?","a":"No — our formulas focus on natural energy from B-vitamins, adaptogens and minerals, not high-dose caffeine."},
   {"q":"How quickly will I feel results?","a":"Most users notice improved energy and clarity within 1–2 weeks of consistent use."},
   {"q":"Can I take them daily?","a":"Yes, daily use is recommended for sustained results — follow the dosage on the label."},
   {"q":"Are they safe with coffee?","a":"Generally yes, but reduce caffeine intake for the best results."},
   {"q":"Good for students and shift workers?","a":"Yes — our energy stack is popular with students, drivers and night-shift workers across Kenya."}
 ]'::jsonb, 5),

('sleep-recovery', 'Sleep & Recovery', 'Sleep & Recovery Support in Kenya',
 'Sleep deeper, recover faster and wake up refreshed with natural BF SUMA Royal supplements.',
 '<p>Quality sleep is the foundation of health, hormones and immunity. Our sleep and recovery hub features gentle, non-habit-forming supplements that calm your nervous system, ease muscle tension and help your body repair overnight.</p>',
 'Sleep & Recovery Supplements Kenya | BF SUMA Royal',
 'Natural sleep and recovery supplements in Kenya. Sleep deeper, ease stress and wake refreshed with BF SUMA Royal. Order via WhatsApp.',
 '[
   {"q":"Will I become dependent?","a":"No — our sleep formulas use natural ingredients like magnesium and herbal extracts that are non-habit-forming."},
   {"q":"How soon will I sleep better?","a":"Many users notice improved sleep quality within 3–7 nights of consistent use."},
   {"q":"Can I take them with melatonin?","a":"Consult your doctor before combining supplements, especially if already taking sleep aids."},
   {"q":"Will they make me drowsy in the morning?","a":"No — our formulas are designed to help you wake refreshed without grogginess."},
   {"q":"Good for athletes?","a":"Yes — recovery is essential for athletic performance, and our products support muscle repair overnight."}
 ]'::jsonb, 6),

('immune-support-healthy-aging', 'Immune Support & Healthy Aging', 'Immune Support & Healthy Aging Kenya',
 'Strengthen immunity, slow aging and stay vibrant at every age with BF SUMA Royal.',
 '<p>A strong immune system and healthy aging start with the right nutrients. Our immune and aging hub features antioxidant-rich supplements that protect your cells, support immunity and promote youthful vitality — perfect for adults of all ages and the elderly.</p>',
 'Immune Support & Anti-Aging Supplements Kenya | BF SUMA Royal',
 'Natural immune support and healthy aging supplements in Kenya. Strengthen immunity and slow aging with BF SUMA Royal. Fast delivery.',
 '[
   {"q":"Are these good for the elderly?","a":"Yes — our immune and anti-aging formulas are gentle and well-tolerated by adults of all ages."},
   {"q":"Can I take them daily?","a":"Yes, daily use is recommended for sustained immune support and antioxidant protection."},
   {"q":"How are these different from a multivitamin?","a":"Our formulas use targeted, high-bioavailability ingredients that work synergistically — beyond what a basic multivitamin offers."},
   {"q":"Will they prevent illness?","a":"They strengthen your body''s natural defences but are not a substitute for medical care."},
   {"q":"Safe for children?","a":"Most products are formulated for adults — consult our team for children''s wellness recommendations."}
 ]'::jsonb, 7);
