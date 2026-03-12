
## Plan: Add SEO-Friendly Alt Text and Update Meta Tags

### Current State Analysis

**Images Missing Alt Text:**
1. **Hero background** (`Hero.tsx`): Currently `alt=""` - This is the LCP (Largest Contentful Paint) image and should have descriptive alt text for SEO
2. **Join & Earn background** (`JoinEarn.tsx`): Currently `alt=""` - decorative but could benefit from alt text
3. **Community background** (`Community.tsx`): Currently `alt=""` - decorative but could benefit from alt text

**Images with Alt Text (OK):**
- Doctor consultation image: `alt="Wellness consultation"` - could be improved
- Product cards: Use `alt={name}` - good, dynamically uses product name

**Meta Tags:**
- The `index.html` title and description don't fully align with the new hero messaging

---

### Changes Required

#### 1. Hero.tsx - Add Alt Text to Hero Image
```text
Current:  alt=""
Updated:  alt="BF SUMA Royal premium wellness supplements and natural health products display"
```

#### 2. DoctorConsultation.tsx - Improve Alt Text
```text
Current:  alt="Wellness consultation"
Updated:  alt="BF SUMA Royal wellness expert providing personalized health consultation"
```

#### 3. JoinEarn.tsx - Add Alt Text to Background
```text
Current:  alt=""
Updated:  alt="BF SUMA Royal business opportunity and wellness entrepreneur community"
```

#### 4. Community.tsx - Add Alt Text to Background
```text
Current:  alt=""
Updated:  alt="BF SUMA Royal wellness community training and mentorship program"
```

#### 5. index.html - Update Meta Title and Description

**Title:**
```text
Current:  "BF SUMA ROYAL Kenya - Premium Natural Supplements & Wellness Business Opportunity"
Updated:  "BF SUMA Royal - Premium Supplements for Better Health | Wellness Business Opportunity Kenya"
```

**Meta Description:**
```text
Current:  "Discover BF SUMA ROYAL's premium natural health supplements in Kenya..."
Updated:  "BF SUMA Royal offers trusted wellness products designed to support your health journey. Premium supplements backed by a real business opportunity. Shop NMN Capsules, ArthroXtra, Ganoderma & more in Kenya."
```

**Open Graph Title and Description** will also be updated to match.

---

### Technical Details

All changes are simple string replacements in the following files:
- `src/components/Hero.tsx` (line 24)
- `src/components/DoctorConsultation.tsx` (line 58)
- `src/components/JoinEarn.tsx` (line 37)
- `src/components/Community.tsx` (line 17)
- `index.html` (lines 21, 22, 29, 30, 35, 36)

### SEO Benefits
- Improved image indexing for Google Image Search
- Better accessibility for screen readers
- Meta tags aligned with hero content for consistent messaging
- Keywords included: "BF SUMA Royal", "supplements", "wellness", "business opportunity", "Kenya"
