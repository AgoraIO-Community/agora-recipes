/**
 * Hero capability carousel: Voice and Video each show for one step, then
 * Conversational AI holds before the cycle replays from Voice.
 */
export const HERO_CAROUSEL_STEP_MS = 2800;
export const HERO_CAROUSEL_AGENT_HOLD_MS = 14400;
export const HERO_CAROUSEL_COUNT = 3;

/** How long a tab stays selected before the cycle advances. */
export function heroCarouselHoldMs(index: number) {
  return index === HERO_CAROUSEL_COUNT - 1 ? HERO_CAROUSEL_AGENT_HOLD_MS : HERO_CAROUSEL_STEP_MS;
}

export type HeroCarouselPause = 'offscreen' | 'hidden' | 'user';

type Clock = {
  setTimeout: (callback: () => void, delay: number) => unknown;
  clearTimeout: (handle: unknown) => void;
  now: () => number;
};

const systemClock: Clock = {
  setTimeout: (callback, delay) => globalThis.setTimeout(callback, delay),
  clearTimeout: (handle) => globalThis.clearTimeout(handle as Parameters<typeof clearTimeout>[0]),
  now: () => Date.now(),
};

/**
 * Show a tab, hold it, show the next. While the Hero is off-screen or the
 * document is hidden the countdown pauses and keeps the current tab's
 * remaining hold, so it never advances unseen and never bursts to catch up.
 * `stop()` is permanent (a visitor picked a tab).
 */
export function createHeroCarouselCycle({
  onShow,
  clock = systemClock,
}: {
  onShow: (index: number) => void;
  clock?: Clock;
}) {
  let index = 0;
  let remaining = 0;
  let deadline = 0;
  let handle: unknown;
  let stopped = false;
  const pauses = new Set<HeroCarouselPause>();

  const clear = () => {
    if (handle !== undefined) clock.clearTimeout(handle);
    handle = undefined;
  };
  const schedule = () => {
    clear();
    if (stopped || pauses.size > 0) return;
    deadline = clock.now() + remaining;
    handle = clock.setTimeout(() => {
      handle = undefined;
      show((index + 1) % HERO_CAROUSEL_COUNT);
    }, remaining);
  };
  const show = (next: number) => {
    if (stopped) return;
    index = next;
    remaining = heroCarouselHoldMs(next);
    onShow(next);
    schedule();
  };

  return {
    start(from = 0) {
      show(from);
    },
    setPaused(reason: HeroCarouselPause, paused: boolean) {
      if (stopped || paused === pauses.has(reason)) return;
      if (paused) {
        if (pauses.size === 0 && handle !== undefined)
          remaining = Math.max(0, deadline - clock.now());
        pauses.add(reason);
        clear();
      } else {
        pauses.delete(reason);
        schedule();
      }
    },
    stop() {
      stopped = true;
      clear();
    },
  };
}
