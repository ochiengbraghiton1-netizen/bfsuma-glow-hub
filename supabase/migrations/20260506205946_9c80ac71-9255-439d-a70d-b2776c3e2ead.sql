
-- =====================================================================
-- Enrich all 7 wellness hubs with long-form authority content + FAQs
-- =====================================================================

-- 1) JOINT PAIN & MOBILITY -------------------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Joint Pain & Mobility Support in Kenya | BF SUMA Royal',
  meta_description = 'Natural support for joint pain, stiffness and mobility in Kenya. Real causes, daily habits, food and supplements that help — explained simply.',
  intro_html = $HTML$
<h2>Why joint pain has become so common in Kenya</h2>
<p>Across Nairobi offices, Mombasa markets, Kakamega farms and Eldoret training tracks, more Kenyans are quietly living with stiff knees, sore shoulders and aching backs. Some blame age. Many blame the weather. The truth sits somewhere in between — and it is usually fixable.</p>
<p>Joint discomfort is rarely about one bad day. It builds up over months and years from a mix of repeated movement, weight gain, low-grade inflammation, poor hydration and missing nutrients. The encouraging part is that the same joints that started hurting can also recover with consistent care.</p>

<h2>What is actually happening inside a painful joint</h2>
<p>Every joint is a meeting point between two bones, cushioned by cartilage and lubricated by a thin layer of fluid. When that cushion thins or the fluid dries up, bones rub and the area becomes inflamed. The body responds with swelling, heat and pain — a signal asking you to slow down and repair.</p>

<h3>Common drivers we see in Kenya</h3>
<ul>
  <li><strong>Long sitting hours</strong> in matatus, offices and salons that stiffen the hips and lower back.</li>
  <li><strong>Manual work</strong> — farming, construction, salon work, riding boda boda — that overloads the knees, shoulders and wrists.</li>
  <li><strong>Cold highland mornings</strong> in Nyeri, Eldoret, Kitale and Limuru that tighten muscles around the joints.</li>
  <li><strong>Sudden weight gain</strong> after pregnancy or in the 30s and 40s that doubles the load on the knees.</li>
  <li><strong>Low water intake</strong> and high salt diets that dry the synovial fluid that should keep joints sliding smoothly.</li>
</ul>

<h2>Signs that should not be ignored</h2>
<ul>
  <li>Morning stiffness that takes more than 30 minutes to ease.</li>
  <li>A clicking or grinding sound when bending the knee or rotating the shoulder.</li>
  <li>Pain that wakes you up at night.</li>
  <li>Swelling around the knees, fingers or ankles.</li>
  <li>Loss of grip strength or difficulty squatting to use a pit latrine.</li>
</ul>
<p>Early action prevents the small cartilage wear that becomes osteoarthritis later in life.</p>

<h2>Foods that quietly help your joints</h2>
<p>Nairobi nutritionists keep repeating the same short list because it works:</p>
<ul>
  <li><strong>Omega-3 fish</strong> — sardines, mackerel and tilapia for natural anti-inflammatory fats.</li>
  <li><strong>Dark leafy greens</strong> — sukuma, spinach and managu for magnesium and antioxidants.</li>
  <li><strong>Bone broth</strong> from cow legs or chicken feet — a traditional Kenyan source of natural collagen.</li>
  <li><strong>Turmeric, ginger, garlic and dhania</strong> used generously in stews.</li>
  <li><strong>Avocado, groundnuts and pumpkin seeds</strong> for healthy fats that reduce joint inflammation.</li>
</ul>
<p>Cutting back on excess sugar, soda and deep-fried street food is just as important as adding the good foods.</p>

<h2>Daily habits that protect your joints</h2>
<h3>Move gently, often</h3>
<p>Joints are like hinges — they rust when they sit still. A 20–30 minute brisk walk, swimming at your local pool, or a slow yoga session three times a week is enough to keep cartilage nourished. Avoid heavy weight training when the joint is already inflamed.</p>

<h3>Mind your weight</h3>
<p>Every extra kilogram on the body adds roughly four kilograms of pressure through the knees with each step. Losing even 3 to 5 kg can dramatically reduce knee pain.</p>

<h3>Warm up before farm or factory work</h3>
<p>Five minutes of stretching before lifting maize sacks, standing at a salon chair or working a long shift in a Thika factory protects the lower back and shoulders.</p>

<h3>Stay hydrated</h3>
<p>Synovial fluid is mostly water. Aim for eight glasses a day, more in hot coastal towns like Mombasa or dry regions like Garissa.</p>

<h2>Where supplements come in</h2>
<p>Even with the best diet, modern Kenyan farming and food processing leave gaps — soils are tired, vegetables travel long distances, and most adults do not eat enough oily fish each week. Targeted natural supplements bridge those gaps.</p>

<h3>What to look for</h3>
<ul>
  <li><strong>Glucosamine and chondroitin</strong> to support cartilage repair.</li>
  <li><strong>Collagen type II</strong> for joint cushioning and elasticity.</li>
  <li><strong>Calcium with vitamin D3</strong> for bone density, especially after 35.</li>
  <li><strong>Natural anti-inflammatories</strong> like ganoderma, turmeric extract and omega-3 oil.</li>
</ul>
<p>BF SUMA Royal’s ArthroXtra, GluzoJoint and Femi Calcium D3 are formulated around exactly these nutrients and are trusted by thousands of customers across Kenya for steady, long-term joint support.</p>

<h2>When to see a doctor</h2>
<p>Supplements and lifestyle changes work best alongside medical advice. Visit a clinic if you experience:</p>
<ul>
  <li>Severe swelling, redness or fever in a joint.</li>
  <li>Pain following a fall or accident.</li>
  <li>Joint pain accompanied by chest pain, weight loss or skin rash.</li>
</ul>
<p>For everyday stiffness, soreness and creaking joints, the path forward is patient, daily care — better food, gentle movement, hydration and the right natural support.</p>

<h2>Your next step</h2>
<p>If you are unsure where to begin, our wellness team is on WhatsApp and will help you choose the right combination based on your age, lifestyle and the specific joints giving you trouble. Most customers feel a real difference within 6 to 8 weeks of consistent use.</p>
$HTML$,
  faq = '[
    {"q":"How long before I feel a difference in my joints?","a":"Most people in Kenya notice less stiffness within 3–4 weeks and a clear reduction in pain by 6–8 weeks of consistent daily use combined with gentle movement and better hydration."},
    {"q":"Are joint supplements safe to take with my blood pressure or diabetes medication?","a":"Glucosamine, calcium and ganoderma are generally well tolerated, but always show the supplement to your doctor or pharmacist if you are on prescription medication."},
    {"q":"I am only 35 and my knees already crack. Is this serious?","a":"Cracking without pain is usually harmless. If it comes with pain, swelling or stiffness, treat it early with weight management, hydration and joint-supporting nutrients before cartilage wears further."},
    {"q":"Will losing weight really reduce my knee pain?","a":"Yes. Each extra kilogram you lose removes about four kilograms of pressure from your knees with every step. Even a 3–5 kg loss helps significantly."},
    {"q":"Can farmers and boda boda riders take these supplements daily?","a":"Yes — physically active workers often benefit the most because their joints carry more daily load. Take with food and plenty of water."},
    {"q":"Do you deliver joint supplements across Kenya?","a":"Yes. We deliver to Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Kakamega, Thika, Nyeri, Machakos, Kitale and most other towns within 1–3 business days."},
    {"q":"Which is better for my situation — ArthroXtra or GluzoJoint?","a":"ArthroXtra suits inflamed, painful joints; GluzoJoint suits cartilage rebuilding for active people. Send a quick message on WhatsApp and our team will guide you."},
    {"q":"Is there a natural option for joint pain during cold Nyeri or Eldoret mornings?","a":"Yes. Warm food, light morning stretching and a daily anti-inflammatory supplement like ArthroXtra reduce cold-weather stiffness considerably."},
    {"q":"Can I order via WhatsApp instead of paying online?","a":"Absolutely. Most customers prefer WhatsApp ordering. Send us a message on +254 795 454 053 and we will guide you through M-Pesa or cash on delivery where available."}
  ]'::jsonb
WHERE slug = 'joint-pain-mobility';

-- 2) WEIGHT MANAGEMENT & METABOLISM ----------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Healthy Weight Management & Metabolism in Kenya | BF SUMA',
  meta_description = 'Lose weight the healthy Kenyan way. Real reasons behind weight gain, what works, what doesn’t, and supplements that gently support your metabolism.',
  intro_html = $HTML$
<h2>Weight gain is rarely just about food</h2>
<p>Many Kenyans walk into our offices in Kakamega holding the same story. They are eating less than before, walking more, even skipping ugali, yet the trouser size keeps climbing. The honest answer is that healthy weight is built on five pillars, not one — food, movement, sleep, stress and metabolism. Ignore any one of them and progress stalls.</p>

<h2>Why your metabolism slows down with time</h2>
<p>Metabolism is the rate at which your body turns food into energy. From the late twenties, this rate naturally drops by about 1–2% per decade. After 35, hormonal shifts, less muscle mass and more sitting amplify the slowdown. The result: the same chapati that did nothing to you at 25 now sticks to your waistline at 38.</p>

<h3>Common metabolism killers we see in Kenya</h3>
<ul>
  <li><strong>Skipping breakfast</strong> then over-eating lunch and supper.</li>
  <li><strong>Sugary drinks</strong> — soda, energy drinks and heavily-sugared chai.</li>
  <li><strong>Late, heavy dinners</strong> at 9 or 10 pm.</li>
  <li><strong>Five hours of sleep or less</strong> — a guaranteed way to gain belly fat.</li>
  <li><strong>Chronic stress</strong> from work, school fees and city life raises cortisol, which stores fat around the middle.</li>
  <li><strong>Sedentary jobs</strong> — long Zoom calls, driving, or counter work without breaks.</li>
</ul>

<h2>The Kenyan plate, reimagined</h2>
<p>You do not need to abandon ugali, chapati or rice. You need to balance them.</p>
<ul>
  <li><strong>Half your plate vegetables</strong> — sukuma, spinach, cabbage, kachumbari.</li>
  <li><strong>A quarter lean protein</strong> — beans, lentils, fish, chicken, eggs.</li>
  <li><strong>A quarter starch</strong> — a fist-sized portion of ugali, rice, sweet potato or arrowroot.</li>
  <li><strong>Healthy fats</strong> — avocado, groundnuts, sesame, olive or coconut oil.</li>
</ul>
<p>This single change has helped many of our customers shed 4–8 kg in three months without strict dieting.</p>

<h2>Movement that fits a busy Kenyan life</h2>
<p>Gym memberships are not realistic for everyone. What actually works:</p>
<ul>
  <li>A 30-minute brisk walk after dinner.</li>
  <li>Climbing stairs instead of taking the lift.</li>
  <li>Two short strength sessions a week — squats, push-ups, planks at home.</li>
  <li>Weekend hikes, dance, swimming or football for joy and consistency.</li>
</ul>

<h2>Sleep is the hidden weight-loss tool</h2>
<p>When you sleep less than 6 hours, your hunger hormone (ghrelin) rises and your fullness hormone (leptin) falls. You wake up genuinely hungrier and crave sugar and fat. Aim for 7–8 hours, ideally with lights out by 10:30 pm.</p>

<h2>Stress, cortisol and the stubborn belly</h2>
<p>Chronic stress raises cortisol, which signals the body to store fat around the abdomen. Daily prayer, meditation, a 10-minute walk in nature or simply switching off WhatsApp for 30 minutes can move the needle more than another diet.</p>

<h2>Where natural supplements help</h2>
<p>Supplements do not replace food, sleep or movement — but they can clear the path.</p>
<ul>
  <li><strong>EZ-Xlim</strong> supports gentle appetite control and fat metabolism.</li>
  <li><strong>Detoxilive</strong> helps the liver — your main fat-burning organ — work cleanly.</li>
  <li><strong>Ganoderma Spore Oil</strong> reduces stress-related inflammation that stalls weight loss.</li>
  <li><strong>Reishi Coffee</strong> replaces sugary morning drinks with a smarter, lower-calorie energy boost.</li>
</ul>

<h2>Realistic expectations</h2>
<p>Healthy weight loss is 0.5–1 kg per week. Faster losses usually return as faster regains. Aim for a sustainable lifestyle, not a punishment. Track progress with how your clothes fit, your energy and your blood pressure — not just the scale.</p>

<h2>When to seek medical advice</h2>
<p>If you are gaining weight despite eating well and moving, or losing weight without trying, ask your doctor to check your thyroid, blood sugar and hormones. Conditions like hypothyroidism, PCOS and insulin resistance need professional care alongside lifestyle changes.</p>

<h2>Your starting point</h2>
<p>Pick one habit this week — perhaps cutting soda, walking after supper, or swapping your evening chai for warm water with lemon. Small, repeatable wins beat dramatic resolutions every time. When you are ready for nutritional support, message us on WhatsApp and we will help you choose what fits your goals and budget.</p>
$HTML$,
  faq = '[
    {"q":"How quickly can I expect to lose weight safely?","a":"A healthy rate is 0.5–1 kg per week. Faster losses usually return quickly. Combine balanced meals, daily movement and good sleep for steady results."},
    {"q":"Will EZ-Xlim work without exercise?","a":"It will help, but results are far better when combined with a 30-minute daily walk and balanced meals. Supplements support — they don’t replace effort."},
    {"q":"Can I still eat ugali and chapati while losing weight?","a":"Yes. Eat smaller, fist-sized portions and pair them with plenty of vegetables and lean protein."},
    {"q":"Why does my belly fat refuse to go even when I lose weight elsewhere?","a":"Belly fat is closely tied to stress, sleep and insulin levels. Sleep 7–8 hours, manage stress, cut sugar and add resistance exercise twice a week."},
    {"q":"Are these weight supplements safe for breastfeeding mothers?","a":"We recommend waiting until you have stopped breastfeeding. Focus on balanced nutrition and gentle movement during this season."},
    {"q":"I am over 50 and my metabolism feels dead. What helps?","a":"Strength training twice a week is the strongest natural metabolism booster. Pair it with adequate protein, hydration and a supplement like Reishi Coffee for energy."},
    {"q":"Do you deliver weight management supplements outside Nairobi?","a":"Yes — we deliver across Kenya, including Mombasa, Kisumu, Nakuru, Kakamega, Eldoret, Thika, Nyeri, Machakos and Kitale."},
    {"q":"Can teenagers use weight management supplements?","a":"No. Teenagers should focus on portion control, water and active sport. Supplements like EZ-Xlim are intended for adults 18+."},
    {"q":"How do I order discreetly?","a":"Send us a private WhatsApp message on +254 795 454 053. We package and deliver discreetly anywhere in Kenya."}
  ]'::jsonb
WHERE slug = 'weight-management-metabolism';

-- 3) DIGESTION & DETOX -----------------------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Digestion & Natural Detox Support in Kenya | BF SUMA Royal',
  meta_description = 'Bloating, constipation, sluggish liver? Learn what is really going on with Kenyan digestion and how diet and natural supplements can restore balance.',
  intro_html = $HTML$
<h2>Your gut is your second brain</h2>
<p>Most Kenyans only think about digestion when something goes wrong — bloating after lunch, constipation that lasts days, or that uncomfortable feeling after a heavy nyama choma weekend. But your gut quietly runs more of your health than you realise. It controls 70% of your immune system, makes most of your serotonin, and decides how much energy you draw from each meal.</p>

<h2>Why digestion struggles are rising in Kenya</h2>
<ul>
  <li>More processed foods — packaged snacks, sodas, instant noodles.</li>
  <li>Less fibre — fewer traditional vegetables like terere, managu and saga in the daily plate.</li>
  <li>Antibiotics taken without probiotics afterwards, which wipes out the good gut bacteria.</li>
  <li>Stress, rushed meals and poor chewing.</li>
  <li>Limited water intake during long workdays in the sun.</li>
</ul>

<h2>Common signs your gut needs help</h2>
<ul>
  <li>Bloating that gets worse through the day.</li>
  <li>Going to the toilet less than once a day.</li>
  <li>Heartburn, especially at night.</li>
  <li>Bad breath even after brushing.</li>
  <li>Skin breakouts or eczema flares.</li>
  <li>Constant low energy after meals.</li>
</ul>

<h2>The truth about “detox”</h2>
<p>You don’t need expensive juices or three-day starvation cleanses. Your body already detoxes itself through the liver, kidneys, gut, lungs and skin — twenty-four hours a day. The real job is to support these organs, not punish them.</p>

<h3>Real detox habits</h3>
<ul>
  <li><strong>Drink water first thing in the morning</strong> — a full glass before tea.</li>
  <li><strong>Eat vegetables at every meal</strong> for fibre that sweeps the colon.</li>
  <li><strong>Limit alcohol</strong> to give the liver a break.</li>
  <li><strong>Move your body</strong> — sweat is part of natural detoxification.</li>
  <li><strong>Sleep 7–8 hours</strong> — the brain detoxes during deep sleep.</li>
</ul>

<h2>Foods that love your gut</h2>
<ul>
  <li>Fermented foods — natural yoghurt, mursik, busaa-style fermented porridges in moderation.</li>
  <li>Soluble fibre — oats, sweet potato, ripe bananas.</li>
  <li>Insoluble fibre — sukuma, cabbage, brown ugali, beans.</li>
  <li>Bitter vegetables — managu, terere, cassava leaves.</li>
  <li>Healthy oils — olive, coconut, avocado.</li>
</ul>

<h2>Foods that quietly damage the gut</h2>
<ul>
  <li>Daily sodas and energy drinks.</li>
  <li>Deep-fried street foods every day.</li>
  <li>Refined white flour mandazi and biscuits.</li>
  <li>Excess painkillers and antacids without medical guidance.</li>
</ul>

<h2>Liver — your body’s busiest worker</h2>
<p>The liver filters everything — food, alcohol, medication, environmental toxins from city air and farm chemicals. When overwhelmed, you feel tired, foggy and bloated. Common causes of liver strain in Kenya include excess alcohol, fatty meats, unmonitored herbal mixtures and long-term medication.</p>
<p>Detoxilive Capsules are formulated to gently support normal liver function with traditional botanicals — a quiet, daily ally rather than a harsh cleanse.</p>

<h2>The role of probiotics</h2>
<p>If you have recently taken antibiotics or have ongoing bloating, replenishing good bacteria is essential. Daily natural yoghurt, fermented foods and a quality probiotic supplement help restore balance within weeks.</p>

<h2>When to see a doctor</h2>
<ul>
  <li>Blood in stool.</li>
  <li>Persistent diarrhoea or constipation lasting more than 2 weeks.</li>
  <li>Sudden weight loss without trying.</li>
  <li>Severe abdominal pain.</li>
</ul>

<h2>A simple 14-day reset</h2>
<ol>
  <li>Wake with warm water and lemon.</li>
  <li>Eat a vegetable with every meal.</li>
  <li>Cut all soda and limit alcohol.</li>
  <li>Walk 30 minutes a day.</li>
  <li>Sleep by 10:30 pm.</li>
  <li>Add Detoxilive once or twice daily as guided.</li>
</ol>
<p>Two weeks of this is enough for most people to feel lighter, less bloated and clearer-skinned.</p>
$HTML$,
  faq = '[
    {"q":"Is a detox cleanse safe to do every month?","a":"Aggressive cleanses are not recommended. Gentle daily support — water, vegetables, fibre and a quality liver supplement — is far healthier than cycles of starvation."},
    {"q":"How do I know if my liver is overworked?","a":"Common signs include constant fatigue, brain fog, sluggish digestion, dull skin and discomfort under the right ribs after fatty meals."},
    {"q":"Can Detoxilive be taken with alcohol?","a":"It can help support recovery, but the best results come from also reducing alcohol intake to give the liver real time to repair."},
    {"q":"Why am I bloated even when I eat little?","a":"Bloating is often caused by gut bacteria imbalance, low stomach acid, rushed eating or food sensitivities — not just food volume."},
    {"q":"Are these supplements safe long-term?","a":"Yes, when used as directed. They are formulated with natural botanicals that have been used safely for many years."},
    {"q":"Do I need to fast to detox properly?","a":"No. Eating regularly while choosing clean foods supports detox better than fasting for most people."},
    {"q":"Can children take liver or digestion supplements?","a":"Children should focus on water, fruits, vegetables and yoghurt. Adult supplements are generally not intended for under-18s."},
    {"q":"How long until I feel less bloated?","a":"Most customers feel a clear difference within 7–14 days of cleaning up the diet and starting Detoxilive."},
    {"q":"Do you deliver across Kenya?","a":"Yes. We ship anywhere in Kenya within 1–3 business days, including Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Kakamega and beyond."}
  ]'::jsonb
WHERE slug = 'digestion-detox';

-- 4) WOMEN'S WELLNESS & HORMONES -------------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Women’s Wellness & Hormonal Balance in Kenya | BF SUMA',
  meta_description = 'Natural support for periods, fertility, energy and menopause for Kenyan women. Real talk on hormones, lifestyle and supplements that actually help.',
  intro_html = $HTML$
<h2>Hormones quietly run a woman’s life</h2>
<p>From the first period in school years to the long stretch after menopause, hormones shape a Kenyan woman’s mood, weight, sleep, skin and confidence. Yet most women only learn about them when something goes wrong — painful periods, sudden weight gain, low energy or hot flushes that arrive unannounced.</p>
<p>The good news is that the female body responds beautifully to small, consistent care: better food, better sleep, gentle movement and the right nutrients.</p>

<h2>The four major life stages</h2>
<h3>1. Teenage and early twenties</h3>
<p>Periods are still settling. Common challenges: cramps, acne, mood swings, irregular cycles. Focus on iron-rich foods, water, and reducing sugar.</p>

<h3>2. Twenties to mid-thirties</h3>
<p>Career, marriage and pregnancy years. Common challenges: fertility concerns, post-natal recovery, low energy, hair loss, weight gain. Focus on protein, folate, omega-3s and stress management.</p>

<h3>3. Mid-thirties to mid-forties</h3>
<p>Perimenopause begins quietly. Common challenges: heavier or unpredictable periods, mood changes, brain fog, sleep problems, stubborn belly fat. Focus on calcium, vitamin D, magnesium and adaptogens.</p>

<h3>4. Mid-forties and beyond</h3>
<p>Menopause and post-menopause. Common challenges: hot flushes, vaginal dryness, joint pain, low libido, bone loss. Focus on calcium, collagen, plant phyto-oestrogens and joint support.</p>

<h2>Common hormone disruptors in Kenya today</h2>
<ul>
  <li>Long working hours and chronic stress.</li>
  <li>Skipping breakfast and over-eating at night.</li>
  <li>Plastic containers heated in microwaves.</li>
  <li>Excess sugar and processed snacks.</li>
  <li>Sleep loss from late-night phone use.</li>
  <li>Unprescribed contraceptive switching.</li>
</ul>

<h2>Painful periods are common — but not normal</h2>
<p>Mild discomfort during the first day is normal. Pain that keeps you home from work, soaks pads quickly, or gets worse year by year deserves proper attention. Conditions like fibroids, endometriosis and PCOS are increasingly diagnosed in Kenya. Track your cycle, note unusual symptoms and consult a gynaecologist if needed.</p>

<h2>Foods that support female hormones</h2>
<ul>
  <li>Leafy greens — sukuma, spinach, managu — for magnesium and iron.</li>
  <li>Avocado, eggs, nuts and seeds for healthy hormone-building fats.</li>
  <li>Beans, lentils and quinoa for plant protein.</li>
  <li>Pumpkin seeds, sesame and flaxseed for natural phyto-oestrogens.</li>
  <li>Fatty fish like sardines for omega-3s that ease cramps.</li>
</ul>

<h2>Movement that supports hormones</h2>
<ul>
  <li>Brisk walking 4–5 days a week.</li>
  <li>Strength training twice a week to protect bones and metabolism.</li>
  <li>Yoga or stretching for stress relief and pelvic health.</li>
</ul>

<h2>Sleep is non-negotiable</h2>
<p>Hormones are built and rebalanced during deep sleep. Aim for 7–8 hours, screens off by 10 pm, and a consistent wake-up time. Even one extra hour of sleep transforms mood and energy within two weeks.</p>

<h2>Where natural supplements help women</h2>
<ul>
  <li><strong>FemiVita</strong> for hormonal balance, energy and PMS support.</li>
  <li><strong>Femi Calcium D3</strong> for bone strength, especially in the perimenopause and menopause years.</li>
  <li><strong>Reishi Coffee</strong> as a calming, focused alternative to over-caffeinated drinks.</li>
  <li><strong>Ganoderma Spore Oil</strong> for stress resilience and immunity.</li>
</ul>

<h2>Pregnancy and breastfeeding</h2>
<p>During pregnancy and breastfeeding, prioritise prenatal vitamins recommended by your doctor. Most general supplements can be paused during this season and resumed afterwards.</p>

<h2>Mental and emotional health</h2>
<p>Hormones, mood and stress are deeply connected. If you feel anxious, low or overwhelmed for more than two weeks, please speak to a counsellor or doctor. Hormonal support and mental health support work best together.</p>

<h2>Your gentle next step</h2>
<p>Start with one change this week — perhaps a vegetable-rich breakfast or a 10-minute walk after supper. Layer the next habit two weeks later. When you are ready, our team is on WhatsApp to help you choose the right combination of supplements based on your stage and goals.</p>
$HTML$,
  faq = '[
    {"q":"Can FemiVita help with painful periods?","a":"Many women report less cramping and steadier mood after 1–2 cycles, especially when combined with magnesium-rich foods and gentle exercise."},
    {"q":"I am 42 and my cycles are getting irregular. Is this menopause?","a":"It is likely perimenopause, the transition that can last several years. Lifestyle support, calcium, magnesium and FemiVita can ease symptoms significantly."},
    {"q":"Are these supplements safe during pregnancy?","a":"During pregnancy and breastfeeding, please use only doctor-recommended prenatal vitamins. Resume general supplements after weaning."},
    {"q":"Can FemiVita help with fertility?","a":"FemiVita supports overall hormonal balance and energy, which can help create a healthier environment for conception, but it is not a fertility drug."},
    {"q":"Do I really need calcium supplements? I drink milk daily.","a":"After 35, many women still fall short on calcium and especially vitamin D3. Femi Calcium D3 fills this gap and helps prevent bone loss."},
    {"q":"How can I manage hot flushes naturally?","a":"Cool layered clothing, reducing caffeine and spicy foods, daily walks, and FemiVita with Femi Calcium D3 give most women noticeable relief."},
    {"q":"Will hormonal supplements cause weight gain?","a":"No. In fact, balanced hormones often make weight loss easier when paired with good food and movement."},
    {"q":"Can teenagers take FemiVita for period pain?","a":"FemiVita is designed for adult women. Teenagers should focus on iron-rich foods, water, magnesium and gentle exercise, with a paediatrician’s guidance for severe cramps."},
    {"q":"How private is the delivery?","a":"All our orders ship in plain, discreet packaging anywhere in Kenya."},
    {"q":"Can I get a personal recommendation?","a":"Yes. Send us a WhatsApp message on +254 795 454 053 with your age and main concern, and our wellness team will guide you confidentially."}
  ]'::jsonb
WHERE slug = 'womens-wellness-hormones';

-- 5) ENERGY, FOCUS & FATIGUE -----------------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Natural Energy & Focus Support in Kenya | BF SUMA Royal',
  meta_description = 'Tired all the time? Discover the real reasons behind low energy in Kenya and the daily habits, foods and supplements that bring your focus back.',
  intro_html = $HTML$
<h2>Why so many Kenyans feel tired all the time</h2>
<p>It used to be a complaint of the elderly. Today, it is the silent struggle of taxi drivers in Nairobi, students in Eldoret, mothers in Kisumu and shopkeepers in Mombasa. Constant tiredness, brain fog and that familiar 3 pm crash have become almost normal — but they are not. They are signals.</p>

<h2>The real causes of low energy</h2>
<ul>
  <li><strong>Poor sleep quality</strong> — late nights, noisy estates, screens in bed.</li>
  <li><strong>Skipped or sugary breakfasts</strong> — mandazi and sweet tea spike then crash blood sugar.</li>
  <li><strong>Dehydration</strong> — even mild dehydration cuts focus by 10–15%.</li>
  <li><strong>Iron and vitamin B12 deficiency</strong> — extremely common, especially in women.</li>
  <li><strong>Chronic stress</strong> that exhausts the adrenal glands.</li>
  <li><strong>Hidden infections</strong> like malaria, typhoid or thyroid issues.</li>
</ul>

<h2>Caffeine is not the answer</h2>
<p>Two cups of coffee or three sodas may keep you going, but they borrow energy you have not produced and demand it back later — usually in the form of an afternoon crash and a poor night’s sleep.</p>

<h2>The energy ladder</h2>
<h3>Step 1: Hydration</h3>
<p>Drink a glass of water within ten minutes of waking. Carry a 1-litre bottle to work or school.</p>

<h3>Step 2: A real breakfast</h3>
<p>Aim for protein and fibre — eggs and whole-grain bread, sweet potato with peanut butter, or chai with mandazi swapped for boiled maize and avocado.</p>

<h3>Step 3: Smart snacks</h3>
<p>Groundnuts, boiled eggs, fruit and nuts beat biscuits and crisps every time.</p>

<h3>Step 4: Movement</h3>
<p>Ten minutes of stretching or a walk after lunch dissolves brain fog faster than any energy drink.</p>

<h3>Step 5: Sleep hygiene</h3>
<p>Same bedtime, dark room, no phone in bed. Magnesium-rich foods like sukuma, beans and bananas at supper improve sleep depth.</p>

<h2>Brain fog and focus</h2>
<p>Focus needs steady blood sugar, hydration, oxygen and rest. If you find yourself rereading the same WhatsApp message three times, the issue is rarely willpower — it is biology asking for water, food or rest.</p>

<h2>Where natural supplements help</h2>
<ul>
  <li><strong>Reishi Coffee</strong> — adaptogenic mushroom blend that gives clean focus without jitters.</li>
  <li><strong>Ganoderma Spore Oil</strong> for stress resilience and steady daily energy.</li>
  <li><strong>Vitamin C Chewable</strong> for adrenal support during long workdays.</li>
  <li><strong>Yunzhi Capsules</strong> for general vitality and immune-energy support.</li>
</ul>

<h2>When tiredness is a medical issue</h2>
<p>Visit a clinic if you have:</p>
<ul>
  <li>Tiredness that does not improve with two weeks of sleep and nutrition.</li>
  <li>Unexplained weight loss or weight gain.</li>
  <li>Pale skin, dizziness or shortness of breath.</li>
  <li>Heart palpitations.</li>
</ul>
<p>Iron-deficiency anaemia, hypothyroidism, diabetes and malaria are all common, treatable causes of fatigue.</p>

<h2>A 7-day energy reset</h2>
<ol>
  <li>Sleep 7+ hours nightly.</li>
  <li>Drink 2 litres of water daily.</li>
  <li>Replace one sugary drink with Reishi Coffee.</li>
  <li>Eat protein at every meal.</li>
  <li>Walk 20 minutes after lunch.</li>
  <li>Switch off screens by 9:30 pm.</li>
  <li>Take a quality multivitamin or Vitamin C Chewable each morning.</li>
</ol>
<p>Most customers tell us they feel like a different person within ten days.</p>
$HTML$,
  faq = '[
    {"q":"How is Reishi Coffee different from regular coffee?","a":"It blends arabica coffee with reishi mushroom extract, giving smoother focus and energy without the jitters or 3 pm crash."},
    {"q":"Will Reishi Coffee keep me awake at night?","a":"It contains less caffeine than a strong espresso. Most people drink it before 4 pm without sleep issues."},
    {"q":"I’m always tired even after sleeping 8 hours. What could it be?","a":"Possible causes include iron or B12 deficiency, thyroid problems, hidden infections or chronic stress. Get a basic blood test and review your diet, hydration and screen habits."},
    {"q":"Can students use these for exam season?","a":"Yes. Reishi Coffee, Vitamin C Chewable and good sleep work better than energy drinks for sustained study focus."},
    {"q":"Are these supplements safe for people with high blood pressure?","a":"Most are well tolerated, but always check with your doctor if you are on BP or heart medication."},
    {"q":"Do you sell decaf options?","a":"Yes — speak to our team on WhatsApp for a low-caffeine option."},
    {"q":"How long before I feel more energetic?","a":"Many people feel a difference within 5–10 days when supplements are paired with hydration, sleep and balanced meals."},
    {"q":"Can I take Reishi Coffee daily long-term?","a":"Yes, daily use is safe for most adults. Cycle off for a week every 2–3 months if you prefer."},
    {"q":"Do you deliver to my town?","a":"We deliver across Kenya — Nairobi, Mombasa, Kisumu, Nakuru, Eldoret, Kakamega, Thika, Nyeri, Machakos, Kitale and most other towns."}
  ]'::jsonb
WHERE slug = 'energy-focus-fatigue';

-- 6) SLEEP & RECOVERY ------------------------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Better Sleep & Recovery Naturally in Kenya | BF SUMA Royal',
  meta_description = 'Struggling to fall asleep or wake up rested? Real reasons behind poor sleep in Kenya, and natural ways to restore deep, restorative rest.',
  intro_html = $HTML$
<h2>Sleep is the most under-used medicine in Kenya</h2>
<p>We spend money on supplements, gym memberships and skincare while neglecting the one thing that repairs the body for free — sleep. Yet across Nairobi, Mombasa and most other Kenyan cities, more adults than ever are reporting trouble falling asleep, waking through the night and dragging themselves through the day.</p>

<h2>Why your sleep matters more than you think</h2>
<p>During deep sleep, your body:</p>
<ul>
  <li>Repairs muscles and joints.</li>
  <li>Cleans the brain of waste linked to memory loss.</li>
  <li>Balances hormones — including the ones that control hunger, mood and immunity.</li>
  <li>Strengthens the heart and lowers blood pressure.</li>
</ul>
<p>Lose two hours nightly for a week and you are functioning at the level of someone who has been awake for 24 hours straight.</p>

<h2>Common sleep wreckers in modern Kenya</h2>
<ul>
  <li>Phones in bed — blue light delays melatonin.</li>
  <li>Late, heavy meals and alcohol close to bedtime.</li>
  <li>Late-night news and social media that spike stress.</li>
  <li>Inconsistent sleep times — different bedtime each night.</li>
  <li>Bedroom too warm, too noisy or too lit.</li>
  <li>Caffeine after 2 pm.</li>
</ul>

<h2>The 90-minute pre-sleep routine</h2>
<ol>
  <li>Stop eating heavy food.</li>
  <li>Dim the lights at home.</li>
  <li>Put the phone in another room.</li>
  <li>Take a warm shower.</li>
  <li>Read, pray or journal for ten minutes.</li>
  <li>Lights out by 10:30 pm.</li>
</ol>

<h2>Foods that help you sleep</h2>
<ul>
  <li>Bananas — natural magnesium and potassium.</li>
  <li>Warm milk or chamomile tea.</li>
  <li>Pumpkin seeds and almonds.</li>
  <li>Oats and sweet potato for steady blood sugar through the night.</li>
</ul>

<h2>Foods and habits that ruin sleep</h2>
<ul>
  <li>Energy drinks and strong coffee in the afternoon.</li>
  <li>Spicy, oily late dinners.</li>
  <li>Alcohol — it knocks you out but breaks deep sleep.</li>
  <li>Long afternoon naps over 30 minutes.</li>
</ul>

<h2>Stress, anxiety and the racing mind</h2>
<p>Many Kenyans lie in bed mentally replaying the day’s frustrations. A simple journal — three things that went well and three things to do tomorrow — empties the mind beautifully. Daily walks, prayer and Reishi-based adaptogens also help calm an over-active nervous system.</p>

<h2>Recovery for active people</h2>
<p>Athletes in Eldoret, footballers across Nairobi estates and weekend warriors everywhere recover faster when they prioritise:</p>
<ul>
  <li>Adequate protein and water.</li>
  <li>Magnesium-rich foods.</li>
  <li>Joint support like ArthroXtra during heavy training periods.</li>
  <li>8+ hours of sleep nightly during high-intensity weeks.</li>
</ul>

<h2>Where natural supplements help</h2>
<ul>
  <li><strong>Ganoderma Spore Oil</strong> calms the nervous system and improves sleep depth.</li>
  <li><strong>Reishi Coffee (morning)</strong> reduces dependence on stronger caffeine that disrupts sleep.</li>
  <li><strong>Femi Calcium D3</strong> supplies calcium and magnesium that aid muscle relaxation.</li>
  <li><strong>FemiVita</strong> for women whose hormonal shifts disturb sleep.</li>
</ul>

<h2>When to see a doctor</h2>
<ul>
  <li>You snore loudly and wake gasping.</li>
  <li>You feel sleepy while driving.</li>
  <li>Insomnia lasts more than three weeks.</li>
  <li>You wake unrefreshed despite 8 hours.</li>
</ul>
<p>Sleep apnoea is more common than people realise and is treatable.</p>

<h2>Your simple sleep upgrade</h2>
<p>Start tonight: phone out of the bedroom, lights dim by 10 pm, last meal three hours before bed. Layer in supplementation as needed. Within two weeks most people sleep deeper, dream more vividly and wake genuinely refreshed.</p>
$HTML$,
  faq = '[
    {"q":"How long before sleep should I stop using my phone?","a":"At least 60–90 minutes. The blue light blocks melatonin, the hormone that triggers sleep."},
    {"q":"Will Ganoderma Spore Oil make me drowsy during the day?","a":"No. It calms the nervous system without sedation, supporting better sleep at night without daytime drowsiness."},
    {"q":"Can I take Reishi Coffee in the evening?","a":"It is best taken in the morning or early afternoon to avoid affecting your sleep."},
    {"q":"I wake up at 3 am and cannot sleep again. What helps?","a":"Common causes include stress, blood sugar dips, or hormonal shifts. Try a small protein snack before bed, journaling, and ganoderma support."},
    {"q":"Are sleep supplements addictive?","a":"Our natural options like ganoderma are not addictive and do not cause dependency, unlike sleeping pills."},
    {"q":"How many hours of sleep do I really need?","a":"Most adults need 7–9 hours. Quality matters as much as quantity."},
    {"q":"Does alcohol help me sleep?","a":"It may help you fall asleep but it severely disrupts deep sleep and increases night waking."},
    {"q":"Can children take any of these supplements?","a":"These are formulated for adults. Children sleep best with a consistent bedtime, no screens before bed and a calm environment."},
    {"q":"Do you deliver across Kenya?","a":"Yes — to all major towns within 1–3 business days."}
  ]'::jsonb
WHERE slug = 'sleep-recovery';

-- 7) IMMUNE SUPPORT & HEALTHY AGING ----------------------------------------
UPDATE public.wellness_hubs SET
  meta_title = 'Immune Support & Healthy Aging in Kenya | BF SUMA Royal',
  meta_description = 'Stay strong and protected at every age. Natural ways Kenyans can boost immunity, slow aging and feel younger longer with diet and supplements.',
  intro_html = $HTML$
<h2>Immunity is your daily insurance</h2>
<p>The last few years have changed how Kenyans think about health. We learned the hard way that the strongest defence against illness is not a single drug, but a daily commitment to keeping the body resilient. Whether you are 25 and want to stop catching every flu, or 55 and want to stay active for your grandchildren, the principles are the same.</p>

<h2>How your immune system actually works</h2>
<p>Your immune system is a network of organs, cells and proteins working around the clock. Skin, gut lining, white blood cells, lymph nodes and antibodies all play a part. Most of this work happens silently — until you push the system too far with poor sleep, stress, smoking, alcohol or junk food.</p>

<h2>Common immunity drainers in Kenya</h2>
<ul>
  <li>Sleep deprivation — even one bad night reduces immune cell activity by 70%.</li>
  <li>High sugar intake — slows down white blood cells for hours after a sugary meal.</li>
  <li>Chronic stress — long-term cortisol weakens the entire system.</li>
  <li>Vitamin D deficiency — surprisingly common despite our sunshine.</li>
  <li>Smoking and excess alcohol.</li>
  <li>Sedentary days followed by intense exercise.</li>
</ul>

<h2>Foods that arm your immune system</h2>
<ul>
  <li>Citrus fruits — oranges, lemons, passion fruit for natural vitamin C.</li>
  <li>Garlic, ginger, dhania and turmeric — anti-microbial and anti-inflammatory.</li>
  <li>Mushrooms — natural immune modulators.</li>
  <li>Yoghurt and fermented foods for gut-immune balance.</li>
  <li>Pumpkin, sweet potato, mangoes — rich in vitamin A.</li>
  <li>Beans, eggs and lean meat for zinc and protein.</li>
</ul>

<h2>Healthy aging starts in your 30s</h2>
<p>Aging is not just wrinkles — it is silent loss of muscle, bone density, cellular repair speed and immune efficiency. The earlier you begin caring for these systems, the better you age.</p>

<h3>Five pillars of healthy aging</h3>
<ol>
  <li><strong>Move daily</strong> — strength training is non-negotiable from 35 onwards.</li>
  <li><strong>Eat enough protein</strong> — 1 g per kg of body weight, more for active adults.</li>
  <li><strong>Sleep 7–8 hours</strong> — your repair shift.</li>
  <li><strong>Manage stress</strong> — chronic stress accelerates biological aging.</li>
  <li><strong>Stay socially connected</strong> — strong relationships are linked to longer life.</li>
</ol>

<h2>The role of antioxidants</h2>
<p>Free radicals are unstable molecules that damage cells and speed up aging. Antioxidants neutralise them. Brightly coloured vegetables, fruits, green tea and supplements like ganoderma are rich antioxidant sources.</p>

<h2>Where natural supplements help</h2>
<ul>
  <li><strong>Ganoderma Spore Oil</strong> — concentrated immune modulator and antioxidant.</li>
  <li><strong>Yunzhi Capsules</strong> — polysaccharopeptides shown to support immune function.</li>
  <li><strong>Vitamin C Chewable</strong> — daily antioxidant and immune support, family-friendly.</li>
  <li><strong>Femi Calcium D3</strong> — bone strength becomes critical from 35 onwards.</li>
  <li><strong>Pure & Broken Ganoderma Spore Powder</strong> — traditional Asian wellness, modern formulation.</li>
</ul>

<h2>Special seasons</h2>
<p>During cold and rainy seasons, increase Vitamin C, ginger tea and warm foods. During exam or work crunch periods, prioritise sleep and ganoderma to keep stress-related illness at bay.</p>

<h2>For those over 50</h2>
<p>Your priorities shift slightly:</p>
<ul>
  <li>Bone density — calcium, D3, weight-bearing exercise.</li>
  <li>Joint mobility — ArthroXtra, swimming, walking.</li>
  <li>Brain health — omega-3s, social activity, mental challenges.</li>
  <li>Heart health — limit salt, walk daily, monitor BP.</li>
</ul>

<h2>When to consult a doctor</h2>
<ul>
  <li>Recurring infections more than four times a year.</li>
  <li>Slow wound healing.</li>
  <li>Sudden, unexplained weight loss.</li>
  <li>Persistent fatigue alongside illness.</li>
</ul>

<h2>A daily checklist for lifelong health</h2>
<ul>
  <li>Hydrate.</li>
  <li>Eat at least three colours of vegetables.</li>
  <li>Move for 30 minutes.</li>
  <li>Sleep 7–8 hours.</li>
  <li>Take your daily immune support.</li>
  <li>Connect meaningfully with at least one person.</li>
</ul>
<p>Healthy aging is not a destination — it is a daily decision. Start today, stay consistent, and your future self will thank you.</p>
$HTML$,
  faq = '[
    {"q":"How can I tell if my immune system is weak?","a":"Frequent colds, slow-healing wounds, constant tiredness, mouth ulcers and digestive issues are common signs of weakened immunity."},
    {"q":"Can I take Vitamin C every day?","a":"Yes. The body does not store vitamin C, so daily intake through fruit and supplements is ideal."},
    {"q":"Are ganoderma supplements really effective?","a":"Ganoderma has decades of research behind it for immune modulation, antioxidant activity and stress support. Consistency matters most."},
    {"q":"At what age should I start anti-aging supplements?","a":"Healthy aging support ideally begins in your 30s — calcium, antioxidants, joint care and stress management."},
    {"q":"Can children take Vitamin C Chewable?","a":"Yes — it is family-friendly. Follow the recommended dose for the child’s age."},
    {"q":"Do these supplements help during flu season?","a":"They support overall immunity. Combine with sleep, hydration, ginger tea and limited sugar for best protection."},
    {"q":"Is it safe to take multiple immune supplements together?","a":"Yes, when used as directed. For tailored advice, message our wellness team on WhatsApp."},
    {"q":"How long before I notice fewer colds?","a":"Most customers report fewer infections within 6–8 weeks of consistent use plus better sleep and hydration."},
    {"q":"Do you deliver to rural areas?","a":"Yes — we ship across Kenya. Delivery to remote areas may take 2–4 business days."},
    {"q":"How can I personalise my routine?","a":"Send your age and main concern on WhatsApp +254 795 454 053 and our team will create a simple, affordable plan."}
  ]'::jsonb
WHERE slug = 'immune-support-healthy-aging';
