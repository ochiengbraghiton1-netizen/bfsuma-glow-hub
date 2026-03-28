

# Plan: Add Interactive Infographics to Join Business Page

## What we'll build

Three visual infographic components that make the compensation plan intuitive at a glance, placed strategically within the existing page flow.

---

### 1. Network Tree Diagram (new component: `NetworkTreeGraphic.tsx`)

A visual SVG/CSS tree showing how the network structure works:

```text
           ┌─────────┐
           │   YOU    │
           │ 28% OPB │
           └────┬────┘
        ┌───────┼───────┐
   ┌────┴────┐     ┌────┴────┐
   │ Member A│     │ Member B│
   │  9% OPB │     │ 13% OPB│
   └────┬────┘     └────┬────┘
   ┌────┴────┐     ┌────┴────┐
   │  Team A │     │  Team B │
   │  5% OPB │     │  9% OPB│
   └─────────┘     └─────────┘

   You earn the DIFFERENCE:
   28% - 9% = 19% on Member A's team
   28% - 13% = 15% on Member B's team
```

- Built with pure CSS/Tailwind (no SVG library needed) using flexbox and connecting lines via `before`/`after` pseudo-elements
- Animated nodes that pulse on hover to show the earnings flow
- Color-coded by rank tier (green for beginner, gold for leader)
- Placed **inside the StarLevels section** after the "How Your Earnings Grow" explainer box, replacing the text-only explanation with a visual one

### 2. Income Streams Flow Diagram (new component: `IncomeStreamsGraphic.tsx`)

A horizontal/vertical flow chart showing all 6 income streams branching from "Your Earnings":

```text
                    ┌──────────────┐
                    │ YOUR EARNINGS│
                    └──────┬───────┘
     ┌──────┬──────┬───────┼───────┬──────┬──────┐
     │      │      │       │       │      │
   Retail  OPB   LDB    7-Star   LSB   LGB
   20%     28%   25%     3%      6.5%   3%
```

- Each stream is a card/node with icon, percentage, and a one-line description
- Color intensity shows earning potential (darker = higher %)
- Animated: streams light up sequentially on scroll-into-view
- Placed **between HowItWorks and StarLevels** as a new "Your Income Streams" section

### 3. Rank Progression Ladder (new component: `RankProgressionGraphic.tsx`)

A vertical visual ladder/timeline replacing or supplementing the current card grid in StarLevels:

```text
  SCL ──── 25% LDB ──── US$25K Car
   │
  CL  ──── 20% LDB ──── US$4K Trip
   │
  SDL ──── 15% LDB
   │
  DL  ──── 8-10% LDB
   │
  SL  ──── 5% LDB
   │
  7★  ──── 28% OPB ──── 3% Cash Bonus
   │
  6★  ──── 22%
   │
  5★  ──── 17%
   │
  ...
  1★  ──── Start Here (KES 7,000)
```

- Vertical stepped path with milestone markers
- Each node shows rank, bonus %, and any unlocked rewards (trip/car icons)
- Current ranks glow/highlight as user scrolls past them
- Mobile-friendly: single column with connecting line down the left side
- Placed **at the top of StarLevels**, before the existing card grids

---

## Page layout order (updated)

1. Hero
2. How It Works (5 steps - unchanged)
3. **Income Streams Flow Diagram** (NEW)
4. Star Levels section containing:
   - **Rank Progression Ladder** (NEW - visual timeline)
   - Existing card grids (kept for detail)
   - **Network Tree Diagram** (NEW - replaces text explainer)
   - LSB/LGB boxes (unchanged)
5. Support System
6. Rewards & Incentives
7. Earnings Calculator
8. Why Join / CTA / FAQ / Registration

## Technical approach

- All built with Tailwind CSS + minimal inline styles (no external charting library)
- Scroll-triggered animations using the existing `use-in-view` hook
- Responsive: diagrams reflow to vertical/stacked on mobile
- Three new files in `src/components/join-business/`
- Minor updates to `StarLevels.tsx` and `JoinBusiness.tsx` for placement

