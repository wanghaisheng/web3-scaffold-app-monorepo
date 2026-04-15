# Product Matrix & Brand Architecture

## Based on OneKey Monorepo Structure

---

## 1. Brand Architecture Overview

### 1) HeyTCM (Parent Brand / Endorsement Layer)

- **Responsibilities**: Trust & compliance, commercial & channel management, account systems, payments/risk, domain authority, PR & media relations
- **External Tone**: Stable, authoritative, traceable, compliant

### 2) GutHealthStudio (Studio / Production Layer)

- **Positioning**: Unified facade for gut health R&D, content, product experience, and narrative
- **Responsibilities**:
  - Standard methodology (symptom-first, ecosystem metaphor, evidence density, actionable pathways)
  - Unified design language & writing style
  - Unified release cadence & quality standards
- **Attribution Format**:  
  `GutHealthStudio (A HeyTCM Studio)`  
  Product attribution: `<ProductName> by GutHealthStudio (HeyTCM)`

> _Note: The studio name functions as "producer/creator" rather than a consumer brand. Users should remember the **product/IP**, not the studio itself._

### 3) Products / IP (Product Matrix / User Mental Layer)

- **Goal**: Each product must have a clear "role promise" to avoid functional overlap and positioning confusion
- **Candidate Matrix**:
  - `Gut Garden`: IP/Game/Concept carrier (high emotional value & virality)
  - `GutHealthPal`: Companion product (reminders, tracking, habit system - retention focused)
  - `GutHealthCoach`: Coach product (plans, bootcamps, guidance - conversion focused)

---

## 2. Naming & Mental Model Rules (Must Be Uniform)

### 2.1 One-Sentence Promise (Each Product Must Have)

Every app's homepage & store description must answer in 1 sentence:

- **Who** (typical symptom/persona)
- **What** (goal)
- **How** (method)
- **Next** (CTA)

**Examples (placeholder)**:

- `GutHealthPal`: "Get your daily 3-minute habit tracker that turns symptom signals into sustainable ecosystem maintenance."
- `GutHealthCoach`: "Bring a symptom, get a 5-minute analysis of ecosystem diagnosis + targeted herbal solutions + observation metrics."
- `Gut Garden`: "Turn your gut into a garden, complete an executable repair journey through gameplay."

### 2.2 Unified Signing & Brand Exposure

Uniformly appear in:

- Footer / About / Press Kit
- App Store / Google Play developer name & description
- OG images & structured data (Organization / Brand)

**Recommended Template**:

- `© GutHealthStudio (A HeyTCM Studio). All rights reserved.`
- "Built by GutHealthStudio, backed by HeyTCM."

### 2.3 Avoid Naming Conflicts & Confusion

Prohibited:

- Inconsistent naming across pages (`GutGarden` / `Gut Garden` / `gut-garden`)
- Using studio name as product name (users don't know what they're entering)
- Multiple products using identical CTA structures (users can't discern differences)

---

## 3. Site & Domain Strategy (No Domain Segregation)

### 3.1 Single Domain Strategy (Default)

- **Primary Domain**: `https://guthealth.heytcm.com`
- **Product Structure**: Path-based (`/garden`, `/pal`, `/coach`)
- **Benefits**:
  - Canonical URLs, consolidated sitemap, preserved link equity
  - Cross-product redirection without SEO penalty

### 3.2 When to Consider Independent Domains

Only when a product meets **all** of these:

- Has independent commercial loop (standalone ad spend/brand partnerships/press)
- Has mature user psyche no longer dependent on parent brand
- Requires standalone compliance & regional deployment

> Even with independent domains, maintain:
>
> - Unified `Organization` / `Publisher` attribution (HeyTCM + Studio)
> - Cross-domain canonical & hreflang design (prevent duplicate content)

---

## 4. Growth & Metric Allocation (Each Product Tracks One Primary Metric)

### Recommended Primary Metrics

- **Pal**: `D7/D30 retention`, daily active users, streak continuity
- **Coach**: Paid conversion rate, plan completion, repeat/renewal rate
- **Garden**: Share rate, viral coefficient, game progression completion, clicks to book/scheme

### Shared Metrics (Parent/Studio Layer)

- "Symptom keyword" organic growth (SEO)
- Content → Tool → Product funnel conversion
- Trust metrics (citable sources, content consistency, complaint/unsubscribe rates)

---

## 5. Relationship with Content/SEO Engine (Shared Foundation, Different Frontends)

Products share the same foundation (database/mapping/evidence system):

- Symptom → Intent → Landing → Remedy/Symptom/Recipe/Materia/Book
- Symptom → Ecosystem Metaphor → Evidence → Targeted Herbal Evidence → Actionable Solution

Execution Docs:

- `docs/brand-strategy/execution-appendix-index.md`
- `docs/plan/README.md`

---

## 6. Minimal Viable Launch Steps (Recommended)

1. **Unify Studio Signing & Footer**: `GutHealthStudio (A HeyTCM Studio)`
2. **Clarify Product Entrances & One-Sentence Promises** on navigation
3. **Focus Each Product on One Core Path** (don't overbuild initially)
4. **Start with `Gut Garden` as IP/Game Engine** to test virality & retention before deciding Pal/Coach priority

---

## 7. App Matrix Suffixes (Product Matrix Suffix Library & Selection Rules)

This file provides **naming suffixes** for multiple apps/IPs within the `HeyTCM → GutHealthStudio → Product Matrix` architecture, enabling scalability, clarity, and SEO friendliness.

### Core Principles

- **Suffix = User-understandable role promise** (not feature list)
- **One Primary Metric per Product** (Acquisition / Retention / Conversion)
- **Limit Launch Volume** (Avoid matrix chaos & mental confusion)

---

### Anchors

- **External Anchor**: `gut health` (ensures searchability, prevents matrix fragmentation)
- **Internal Anchors**:
  - **Worldview Foundation**: Ecosystem Management / Garden Metaphor (allows multiple game/experience extensions)
  - **Methodology Engine**: Evidence-Driven Targeted Interventions (ensures not vague, actionable pathways)

**One-Sentence Template** (for store descriptions & intros):

> We build `gut health` products that treat the body like an ecosystem (worldview) and improve it through evidence-based targeted interventions (methodology).

> **Important Clarification**:
>
> - **Ecosystem Repair** is a _goal/result_ domain (part of narrative), **not** the sole methodology driver. Methodology always returns to "evidence-based targeted interventions."

---

## 1) Common Suffix Categories

### A) Diagnosis / Matching (Strong SEO / Strong Conversion Entry)

Suited for symptom keyword capture & quick entry into next steps (book/solution/product).

- `Checker`: Quick self-test/risk assessment (lighter)
- `Quiz`: Path分流 (best for "symptom-first" entry)
- `Finder`: Find cause/solution/herb (recommender-style entry)
- `Matcher`: Symptom → solution/product matching (like recommendation engine entry)
- `Score` / `Index`: Quantified metrics (e.g., "Gut Load Index") for tracking/sharing

### B) Execution / Habit (Strong Retention)

Converts "knowing" to "doing". Primary metrics: D7/D30 retention, daily use, streak length.

- `Pal`: Companion (reminders, light interaction)
- `Tracker`: Symptom/diet/bowel/sleep tracking (data-focused)
- `Log`: Lighter recording approach
- `Journal` / `Diary`: More emotional/narrative recording (gut-brain axis emotion)
- `Routine`: Fixed workflow & daily checklist (7/14/28-day cycles)
- `Planner`: Action plan generation & review
- `Challenge`: Challenge-based growth (highly shareable)
- `Timer`: Time-window execution (post-meal walk, fasting window, breathing exercises)

### C) Content / Knowledge (Strong Authority & Shareability)

Suited for "understand/explain/evidence" needs, as trust foundation.

- `Guide`: Step-by-step instructions (more "how-to")
- `Handbook`: Systematized implementation handbook (more "executable system")
- `Library`: Knowledge collection (static/index-heavy)
- `Atlas`: Map (Materia/Herb/Ecosystem relationships)
- `Glossary`: Terminology dictionary (concept unification & cost reduction)

### D) Solution / Protocol (Strong Commercialization)

Easier to form paid loops but must avoid medical claims.

- `Coach`: Coach product (plan + guidance + feedback)
- `Protocol`: Standardized pathway/cycle (like "step-by-step execution")
- `Program`: Training camp/cycle offering (content + feedback)
- `Kit`: Bundle package (solution + recipe + product integration)
- `Rx`: Prescription-like feel (use cautiously, requires compliance & risk assessment)

### E) Assistant / Interaction (AI Entry Point)

Suited for Q&A/explanation/report analysis but must constrain boundaries to avoid generic chat.

- `Assistant`: Generic assistant entry
- `Copilot`: Decision support (provides options & next steps)
- `Navigator`: Path guidance (better for solution-type)
- `Analyst`: Evidence analysis & interpretation (better for authoritative content)

### F) Community / UGC (Growth Flywheel)

Best for long-term growth & word-of-mouth, but execute after core closure.

- `Community`: Discussion & Q&A
- `Club`: Membership with benefits
- `Lab`: Experiment / co-creation / A/B testing

---

## 2) Selection Rules (From Suffix to Product Definition)

Each candidate app must answer:

1. **What user intent does it address?** (Search / Confusion / Execution / Review / Purchase)
2. **What is its Primary Metric?** (Acquisition / Retention / Conversion - choose ONE)
3. **What is its "Next Step"?** (Leads to book/solution/product - no ambiguous CTAs)

**Suggested Launch Path**:

- Start with `Quiz` or `Checker` as **Acquisition Entry**
- Then build `Pal` or `Tracker` for **Retention**
- Finally develop `Coach` or `Protocol` for **Conversion**

`Gut Garden` functions as **IP/Game/Worldview Carrier** for emotional value & virality, not expected to handle all functions.

---

## 3) Market Scan: Habit / Yoga Naming Patterns (To Reverse-Engineer Gut Health Suffixes)

### 3.1 Habit Patterns (High Search Volume)

Frequent combinations in store searches:

- `Streak` / `Streaks` (makes "continuity" the narrative)
- `Habit Tracker` (directly states purpose)
- `Daily` (emphasizes frequency)
- `Goals` / `Planner` (emphasizes targets & planning)
- `Routine` (emphasizes fixed workflow)
- `AI Coach` (positions AI as "coach" not generic chat)

**Transfer Insight**: Habit apps rarely discuss abstract concepts - they focus on **one action** (track / plan / streak / daily).

### 3.2 Yoga Patterns (High Search Volume)

Frequent combinations:

- `Daily Yoga` (frequency + category)
- `Yoga Studio` (space-like positioning)
- `Flow` / `Stretch` (action-oriented: what you GET)

**Transfer Insight**: "Studio / Flow / Daily" are more about **experience & scenario**, suitable for positioning Gut Health as "executable practice / workflow".

### 3.3 Game Patterns (Casual Match/ Merge)

Observed high-frequency structures in match games:

- `Tile Match` / `Triple Match` / `Match Puzzle Game` (explicitly state mechanism)
- `Merge Farm` / `Farm Merge` (mechanic + setting)
- `... - Match Puzzle Game` (hyphenated "explanation" suffix)
- `3D` / `Connect` / `Sort` / `Blast` / `Mania` (mechanic/feel descriptors)

**Transfer Insight**: Game titles rely on **searchable mechanism words** (Match / Merge / Idle / Tycoon / Farm / Sim), not abstract storytelling. We can map "microbe / probiotic" into playable objects.

---

## 4) Gut Health × Game: Suffix Combination Strategies

### A) Mechanic Word in Title, "gut health" in Subtitle

Best for传播 (virality) games:

- **Title**: `Gut Garden: Microbe Match`
- **Subtitle**: `A gut health match puzzle`

Benefits:

- Game discovery via mechanism words (Match/Merge/Idle/Tycoon)
- Brand & domain reinforced via subtitle

### B) Keep "gut health" in Title, Use Suffix to Indicate Game Type

Better for educational/gamified tools:

- `Gut Health Match`
- `Gut Health Merge`
- `Gut Health Tycoon`

_Note: This is more generic; requires stronger creatives/CTAs to boost click-through._

### C) Game Suffix Pool (by Mechanics)

- **Match**: `Match` / `Tile Match` / `Triple Match` / `Connect` / `Sort`
- **Merge**: `Merge` / `Merge Farm` (contextualized) / `Merge Story`
- **Idle/Management**: `Idle` / `Tycoon` / `Sim` / `Farm` / `Valley`
- **Narrative**: `Quest` / `Saga` / `Adventure`

**Recommended Priority** (aligns with existing `/game/gutvalley`):

- `Farm/Valley` + `Match/Merge` → easiest alignment with "garden" metaphor

### D) Sub-Brand Example: GutValley (Stardew + Gut Health)

- **Sub-brand**: `GutValley`
- **Category Suffix** (store page/intro, not mandatory title): `Cozy Farm Sim` / `Idle Farm` / `Life Sim`
- **In-App Route** (current): `/game/gutvalley`
- **Matrix Position**: Branch of `Gut Garden` (IP) → potential future standalone "Game line" first title

**Naming Rules**:

- `GutValley` must evoke "Stardew-like fun"
- `gut health` conveyed through subtitle/screenshot/gameplay, not title
- If ASO needed: `GutValley: Cozy Farm Sim` (title) + `A gut health ecosystem game` (subtitle)

### D.2 Relationship to Gut Garden (Avoid Lock-In)

- `Gut Garden`: IP / game / concept carrier (emotional & viral)
- `Gut Health *`: Tools / habits / coaches (growth & commercialization)
- `GutHealthStudio`: Producer & methodology unifier

### D.3 Compliance Note

Avoid medical claims like "cure" or disease names in app titles. Prefer:

- `Tracker` / `Log` / `Routine` / `Quiz` / `Guide` / `Coach`
- Use pages & disclaimers for boundary-setting, not titles

---

## 5) Naming & Signing Standards (Prevent Mental Confusion)

**Unified External Signing**:

- `GutHealthStudio (A HeyTCM Studio)`
- `GutHealthPal by GutHealthStudio (HeyTCM)`
- `GutHealthCoach by GutHealthStudio (HeyTCM)`
- `Gut Garden by GutHealthStudio (HeyTCM)`

**Avoid**:

- Inconsistent naming across pages (spacing/casing/hyphenation)
- Using studio name as product name (users don't know what they enter)
- Multiple products with identical CTAs (users can't discern differences)

---

## 6) First Batch Recommendation (MVP Phase)

If building matrix MVP, recommend **only** these three:

- `GutHealthQuiz` (Acquisition)
- `GutHealthPal` (Retention)
- `GutHealthCoach` (Conversion)

All other suffixes remain **reserve pool** until data proves need.

---

## 8) Execution Appendix

- Execution Roadmap: `docs/brand-strategy/execution-appendix-index.md`
- Plan Documentation: `docs/plan/README.md`
