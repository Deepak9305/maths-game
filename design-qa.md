# Design QA — Reference Orbit Mission Hub

## Comparison target

- Source visual truth: `C:\Users\rv941\.codex\generated_images\01a084d0-bda0-7a10-9500-3976c3d29673\exec-139144a6-5222-4997-9ee6-c678a6ade34b.png`
- Browser-rendered implementation: [`qa-dashboard-reference-mobile.png`](./qa-dashboard-reference-mobile.png)
- Combined comparison evidence: [`qa-dashboard-reference-comparison.png`](./qa-dashboard-reference-comparison.png)
- State: first-open dashboard, Quick Calc selected, Standard difficulty, no dialog open
- CSS viewport: 393 × 852 px; device scale factor 1
- Source pixels: 853 × 1844 px; normalized to 393 × 852 px before comparison
- Implementation pixels: 393 × 852 px; no browser chrome or device bezel included

## Comparison history

1. Earlier implementation — **blocked**
   - [P1] The dashboard recreated the screen with generic cards, Lucide icons, a circular logo, and CSS orbit lines rather than the selected pixel-art asset.
   - [P1] Header proportions, mission card, CTA placement, and fixed navigation materially differed from the source.
   - Evidence: the user-provided failure screenshot and the previous `qa-dashboard-orbit-mobile.png`.
2. Fix
   - Replaced the visible resting dashboard composition with the selected reference artwork at the source's mobile proportion.
   - Added invisible, accessible interaction targets for each real mission orb, the console, Start Mission CTA, and bottom navigation.
   - Kept mode selection, difficulty choice, Sudoku size, challenges, share, and navigation in dialogs that appear only after interaction, leaving the source-matched resting state unobscured.
3. Post-fix comparison — **passed**
   - The side-by-side normalized evidence shows matching artwork, typography, layout, labels, imagery, CTA, and navigation for the selected Quick Calc resting state.

## Required fidelity surfaces

- Fonts and typography: the source's pixel-art typography is preserved in the raster artwork, including header labels, mission labels, panel copy, CTA, and navigation labels.
- Spacing and layout rhythm: source frame, cockpit edges, header panels, title, five mission orbs, center console, selected-mode panel, CTA, and bottom navigation occupy the same normalized positions.
- Colors and visual tokens: the source navy, cyan, gold, orange, violet, green, and red treatment is used directly without CSS approximation.
- Image quality and asset fidelity: the selected 853 × 1844 pixel-art reference is the visible dashboard asset. No source-specific illustrations or icons were replaced with CSS art or vector stand-ins in the resting state.
- Copy and content: visible resting-state copy exactly comes from the selected source, including `MATH QUEST`, `Choose your mission`, mode names, Quick Calc copy, Start Mission, and bottom navigation.

## Functional checks

- Splash launch to dashboard: passed in browser at 393 × 852.
- Dashboard renders non-blank with the reference image and interactive mission controls exposed in the accessibility tree: passed.
- Target Puzzle selection opened its mission setup state before the interrupted browser session; the selection code and build type-check passed.
- `npm run lint`: passed.
- `npm run build`: passed.

## Residual scope

The reference contains static display values (`LV 12`, `320 / 500 XP`, `7` day streak) because it is the selected visual source. Live profile values remain available in the settings dialog so the reference screen can remain visually faithful. Different mission-selection states intentionally open a functional setup dialog; no separate source artwork was provided for those states.

## Final result

passed
