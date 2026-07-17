# CourtCoach — Metric Research Sources

Sources backing the drill-metric fact-check in [`services/metrics.ts`](../services/metrics.ts).
Organized by **drill type**, with each source labeled by **article type** and a short summary.

**Article-type key**
- 🔬 **Peer-reviewed study** — empirical, journal-published, collected its own data
- 📄 **Research paper** — academic (conference proceeding / analytical paper / lower-tier journal)
- 📰 **Coaching article** — coaching site, blog, or product resource
- 📚 **Wiki / secondary** — educational reference summarizing other work

**Totals:** 24 usable sources — 8 peer-reviewed studies, 2 research papers, 13 coaching articles, 1 wiki. (+1 discarded.)

---

## 🏀 Shooting (10)

| # | Type | Source |
|---|---|---|
| S1 | 🔬 | Free-throw shooter biomechanics |
| S2 | 🔬 | Distance & proficiency shooting kinematics |
| S3 | 📚 | Biomechanics of the jump shot |
| S4 | 📰 | Arm & wrist angles |
| S5 | 🔬 | 3-point arm joint coordination |
| S6 | 📰 | Stance-width stability |
| S7 | 📰 | Wissel shooting mechanics |
| S8 | 🔬 | Layup ankle biomechanics |
| S9 | 🔬 | Layup fatigue / lower-extremity |
| S10 | 🔬 | Jump shot power & landing forces |

**S1** — 🔬 [Biomechanical characteristics of proficient free-throw shooters (Frontiers / PMC10436204)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10436204/)
Markerless motion capture comparing proficient vs. non-proficient free-throw shooters. Reports prep-phase knee flexion (~113° proficient / ~107° non-proficient) and elbow angles at prep vs. release. Primary support for the Free Throw knee range.

**S2** — 🔬 [Impact of Distance and Proficiency on Shooting Kinematics (PMC9590067)](https://pmc.ncbi.nlm.nih.gov/articles/PMC9590067/)
Prep-phase elbow and knee angles broken out by shot distance (free throw / 2-pt / 3-pt) and proficiency. Explicitly states the interior-angle convention (180° = straight) that CourtCoach also uses. Backs the 3-point elbow and knee ranges (knee ~112–117°, elbow ~63.6° ± 21.6°).

**S3** — 📚 [Biomechanics of the Basketball Jump Shot (Physiopedia)](https://www.physio-pedia.com/Biomechanics_of_the_Basketball_Jump_Shot)
Educational wiki: elbow ~75–90° during prep with near-full extension at release, knee ~115–120° when jumping, release at the highest point of the jump. Secondary/corroborating, not primary data.

**S4** — 📰 [The Overlooked Importance of Arm & Wrist Angles (Breakthrough Basketball)](https://www.breakthroughbasketball.com/fundamentals/shooting-arm-wrist-angle)
Coaching breakdown of wrist cock/snap timing and follow-through. The only source with any quantified arm-extension figure (~45° at release). Supports the follow-through discussion (which is a score, not a real wrist angle).

**S5** — 🔬 [Arm Joint Coordination When Shooting Behind the 3-Point Line (PMC12121896)](https://pmc.ncbi.nlm.nih.gov/articles/PMC12121896/)
Confirms the proximal-to-distal (shoulder → elbow → wrist) coordination pattern for 3-point shooting and the joint-angle measurement convention. No discrete degree targets.

**S6** — 📰 [Quantifying Stability in Basketball — Optimal Stance Widths (Coach Dave Love)](https://coachdavelove.com/quantifying-stability-in-basketball-the-science-behind-optimal-stance-widths/)
Base-of-support / stance-width analysis underpinning the qualitative validity of the Balance metric (higher balance floor for the fully static free throw).

**S7** — 📰 [Hal Wissel's Basketball Shooting Mechanics (Coach's Clipboard)](https://www.coachesclipboard.net/WisselShootingMechanics.html)
Established B.E.E.F. framework (Balance, Elbow, Eyes, Follow-through) and elbow-under-ball alignment guidance. Used to sanity-check qualitative claims, not for numeric ranges.

**S8** — 🔬 [Ankle biomechanics of the three-step layup (PMC10618240)](https://pmc.ncbi.nlm.nih.gov/articles/PMC10618240/)
Layup lower-body/landing biomechanics. Evidence that layup research targets injury/landing mechanics rather than a "shooting-form ideal" — support for flagging the Layup knee-bend metric as ill-defined.

**S9** — 🔬 [Effects of Muscle Fatigue on Lower Extremity Biomechanics During the Three-Step Layup (MDPI Biomechanics 2025)](https://www.mdpi.com/2673-7078/5/4/81)
Layup knee mechanics vary non-monotonically across takeoff/landing phases and with fatigue. Reinforces that a single static "ideal" knee-bend range doesn't fit a layup. (Full data present as figures.)

**S10** — 🔬 [Biomechanical Analysis of the Jump Shot in Basketball (Struzik et al., *Journal of Human Kinetics*, 2014)](https://pmc.ncbi.nlm.nih.gov/articles/PMC4234772/)
20 junior players; force-plate + motion analysis. Jump shots generate near-maximal lower-limb power (peak ~4837 W) and landing forces >5× body weight. **Measures power/force, not joint angles** — cited for loading/landing context, not metric ranges. Replaced the unverifiable IJSSST paper.

---

## 🤝 Passing (7)

> **Category caveat:** Passing biomechanics is thin. No source anywhere gives a target elbow or knee angle in degrees for a chest, bounce, or overhead pass. Most passing metric ranges are honest engineering estimates.

| # | Type | Source |
|---|---|---|
| P1 | 🔬 | Passing kinematics under fatigue |
| P2 | 🔬 | Athletic-stance response time |
| P3 | 📰 | Bent-elbow pass |
| P4 | 📰 | Chest pass fundamentals |
| P5 | 📰 | Body position for passing |
| P6 | 📰 | Overhead pass technique |
| P7 | 📰 | Outlet pass guide |

**P1** — 🔬 [Influence of Fatigue on Kinematic Parameters of Basketball Passing (IJERPH 18(2):700, 2021)](https://pmc.ncbi.nlm.nih.gov/articles/PMC7830610/)
The only basketball-passing-specific peer-reviewed kinematics study found. Reports angular **velocities** of the push pass under fatigue — **not** static release-angle degrees. Core evidence that no research-backed degree target exists for passing joint angles.

**P2** — 🔬 [Influence of Athletic Stance Height/Width on Response Time in Basketball (ResearchGate)](https://www.researchgate.net/publication/299594283)
General basketball stance knee-flexion data (~120°/150°). Closest available proxy for judging the plausibility of the passing knee-bend ranges — a weak proxy, not a passing-specific match.

**P3** — 📰 [Basketball Passing Skill: Bent Elbow Pass (PGC Basketball)](https://pgcbasketball.com/blog/key-basketball-skill-bent-elbow-pass/)
Describes the standard chest pass ending in a single, near-full-extension delivery point — evidence that a true chest-pass *release* is more extended than a mid-bend angle.

**P4** — 📰 [Chest Pass in Basketball: General Information (HoopStudent)](https://hoopstudent.com/basketball-chest-pass/)
Coaching description of the chest pass straightening the elbows from an initial bent position at release.

**P5** — 📰 [Body Position for Passing (Sportplan)](https://www.sportplan.net/drills/Basketball/Passing-Technique/Body-Position-for-Passing-Basket115.jsp)
Generic "bend your knees for a strong base" cue applied without differentiation across pass types — evidence against the (incorrect) straighter-stance assumption for the overhead pass.

**P6** — 📰 [Master How to Throw Overhead Pass Basketball (HoopsKing)](https://hoopsking.com/blogs/default-blog/master-how-to-throw-overhead-pass-basketball-expert-guide)
Overhead-pass technique: elbows slightly bent, knees slightly bent, arms extend fully at release. Used for both the elbow-extension and the overhead knee-bend correction arguments.

**P7** — 📰 [The Outlet Pass: A Basketball Coach's Guide (TheHoopsGeek)](https://www.thehoopsgeek.com/basketball-outlet-pass/)
Emphasizes leg-power generation for the overhead/outlet pass with no mention of a straighter stance — further evidence the overhead pass should not use a straighter-leg range than chest/bounce.

---

## ⛹️ Dribbling (7)

> **Category caveat:** Only one source (D7) publishes an actual dribble knee angle, and it's a low-rigor, non-indexed journal. Balance / Hand Position / Body Lean have no numeric literature — treat those thresholds as engineering placeholders backed by coaching cues.

| # | Type | Source |
|---|---|---|
| D1 | 📰 | Defensive stance keys |
| D2 | 📰 | Crossover drills |
| D3 | 📰 | Crossover technique |
| D4 | 📰 | Dribbling drills (USA Basketball cues) |
| D5 | 📰 | Defensive stance fundamentals |
| D6 | 📄 | Cutting-motion dribble study |
| D7 | 📄 | Low-dribble kinematics |

**D1** — 📰 [Basketball Defense: 10 Keys to a Great Defensive Stance (Breakthrough Basketball)](https://www.breakthroughbasketball.com/defense/stance)
Generic athletic/defensive stance cues (hips back, knees bent, butt down). No degree figures.

**D2** — 📰 [Beginner Drills To Develop An Effective Crossover Move (Breakthrough Basketball)](https://www.breakthroughbasketball.com/training/beginner-crossover.html)
Crossover-specific cues: "athletic stance sitting down," ball low and beneath the knees, kept tight to the body. Supports the crossover knee-bend depth and hand-position cues.

**D3** — 📰 [How to Do a Crossover Dribble (XbotGo)](https://xbotgo.com/blogs/knowledge/crossover-dribble)
Crossover stance (feet shoulder-width or wider, knees bent, weight on balls of feet), ball below knee height, and lean/shoulder-drop misdirection. Supports crossover knee-bend, hand-position, and the body-lean cue.

**D4** — 📰 [Basketball Dribbling Drills: 15 Drills for Every Level (joinstriveon.com)](https://joinstriveon.com/blog/basketball-dribbling-drills)
Cites USA Basketball's "waist-high or lower" dribble-height non-negotiable and a Figure-8 (stationary) correction: "bend the knees deeper... freeze head height." Supports the Ball Handling knee-bend and hand-position thresholds.

**D5** — 📰 [Fundamentals of Good Basketball Defensive Stance and Footwork (Sporator)](https://www.sporator.com/basketball-defensive-stance/)
The only coaching source with an explicit generic stance figure (~45° knee bend). Used as a shallower-bend reference point to judge the dribbling ranges.

**D6** — 📄 [Biomechanical Study on a Basketball Dribble with a Cutting Motion (ISBS / Uni Konstanz)](https://ojs.ub.uni-konstanz.de/cpa/article/view/6030)
Peer-reviewed conference paper on a crossover-type "cutting" dribble. Measures center-of-gravity velocity/acceleration (skilled vs. unskilled) — **not** joint angles. Evidence that rigorous dribbling literature exists but rarely measures what the app needs.

**D7** — 📄 [Kinematic Analysis of Low Dribble at Execution Phase in Basketball (Pandey & Patel, *Golden Research Thoughts*, 2012)](https://www.academia.edu/1264533)
The only source with real dribble joint angles at execution (n=20, single sagittal-plane frame): **knee 103.85° ± 18.95°**, elbow 100.25° ± 16.65°, hip 116.75° ± 21.76°, ankle 78.9° ± 8.2°, wrist 152.35° ± 10.97°. The ~104° knee sits at the low edge of the app's dribbling range. ⚠️ **Low-rigor, non-indexed journal — weak support only, never a keystone.**

---

## ❌ Discarded

- **gym-mikolo.com — "The Quarter Squat"** — a search-engine summary attributed a "110–140° knee angle" figure to this page that it does **not** contain (the page only says "roughly a 25-degree angle"). Caught fabrication; excluded from all evidence.

---

*Compiled 2026-07-17 from three parallel research passes against `services/metrics.ts`. Point-in-time synthesis — not a substitute for a sports scientist's review. Re-verify before shipping metric changes.*
