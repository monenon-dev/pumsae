import type { CanvasElementPosition, HeroLayout } from "@/types/dojang";

/**
 * HeroCopy is used by every hero layout except CANVAS (which has no
 * fixed layout of its own to reference default positions from).
 */
export type HeroLayoutId = Exclude<HeroLayout, "CANVAS">;

type HeroDefaultPositions = {
  title: { desktop: CanvasElementPosition; mobile: CanvasElementPosition };
  description: { desktop: CanvasElementPosition; mobile: CanvasElementPosition };
  trialButtonText: { desktop: CanvasElementPosition; mobile: CanvasElementPosition };
};

// All 11 non-canvas heroes render title/description/button left-aligned
// (none of them apply text-center/items-center to HeroCopy's content
// block or its headingClassName) - only the *vertical* anchor differs:
//   - "BOTTOM": header is `flex-col justify-end` (or `justify-between`,
//     which still pushes the text block itself to the bottom) - the
//     content sits low, in the last ~35% of the hero.
//   - "CENTER": header is `flex-col justify-center` - the content block
//     sits vertically centered, roughly the middle third of the hero.
const BOTTOM_ANCHORED: HeroDefaultPositions = {
  title: {
    desktop: { xPct: 8, yPct: 60, widthPct: 55 },
    mobile: { xPct: 8, yPct: 55, widthPct: 84 },
  },
  description: {
    desktop: { xPct: 8, yPct: 75, widthPct: 45 },
    mobile: { xPct: 8, yPct: 72, widthPct: 84 },
  },
  trialButtonText: {
    desktop: { xPct: 8, yPct: 88, widthPct: 25 },
    mobile: { xPct: 8, yPct: 86, widthPct: 50 },
  },
};

const CENTERED: HeroDefaultPositions = {
  title: {
    desktop: { xPct: 8, yPct: 40, widthPct: 55 },
    mobile: { xPct: 8, yPct: 38, widthPct: 84 },
  },
  description: {
    desktop: { xPct: 8, yPct: 52, widthPct: 45 },
    mobile: { xPct: 8, yPct: 50, widthPct: 84 },
  },
  trialButtonText: {
    desktop: { xPct: 8, yPct: 64, widthPct: 25 },
    mobile: { xPct: 8, yPct: 62, widthPct: 50 },
  },
};

export const DEFAULT_CANVAS_POSITIONS: Record<HeroLayoutId, HeroDefaultPositions> = {
  // `flex-col justify-center` - the only vertically-centered hero.
  GRADIENT: CENTERED,
  // Everything else is `flex-col justify-end` (Ocean is `justify-between`,
  // but with only two flex children the text block is still the one
  // pushed to the bottom, same as the justify-end group).
  SOLID: BOTTOM_ANCHORED,
  PHOTO_COVER: BOTTOM_ANCHORED,
  TRADITIONAL: BOTTOM_ANCHORED,
  DYNAMIC: BOTTOM_ANCHORED,
  KIDS: BOTTOM_ANCHORED,
  PREMIUM: BOTTOM_ANCHORED,
  OCEAN: BOTTOM_ANCHORED,
  MONO: BOTTOM_ANCHORED,
  SPOTLIGHT: BOTTOM_ANCHORED,
  BADGE: BOTTOM_ANCHORED,
};
