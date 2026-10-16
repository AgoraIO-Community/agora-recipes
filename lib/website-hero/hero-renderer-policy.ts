/**
 * Hero renderer selection. Any viewport with WebGPU, phones included, starts
 * the GPU renderer immediately (the field then checks for an adapter before
 * importing the runtime). Reduced motion, Save-Data, no WebGPU and
 * `?heroRenderer=canvas` use the Canvas field and never request the runtime
 * (about 700 KB of JS). Pure so it can be unit-tested.
 */

export type HeroRendererPlan =
  | { renderer: 'canvas'; reason: HeroCanvasReason }
  | { renderer: 'webgpu'; reason: 'forced' | 'available' };

export type HeroCanvasReason = 'forced' | 'no-webgpu' | 'reduced-motion' | 'save-data';

export type HeroRendererEnvironment = {
  /** `location.search`; `?heroRenderer=canvas|webgpu` overrides the policy. */
  search: string;
  hasWebGPU: boolean;
  reducedMotion: boolean;
  saveData?: boolean;
};

/**
 * The device budget both renderers use to cap backing resolution and
 * population. It is not a renderer gate: Safari reports 4 cores on every
 * iPhone (WebKit buckets cores to 4 or 8). Only signals that are present count: Safari exposes no
 * `deviceMemory`, so an unknown value is never low-power.
 */
export function isLowPowerDevice(hardwareConcurrency?: number, deviceMemory?: number) {
  return (
    (hardwareConcurrency !== undefined && hardwareConcurrency <= 4) ||
    (deviceMemory !== undefined && deviceMemory <= 4)
  );
}

/**
 * QA only: `?heroClock=<seconds>` freezes both renderers' field clock at that
 * time, so Canvas and WebGPU captures can be compared at the same moment.
 * Intents, camera and particle easing still run, so formations settle.
 */
export function readHeroQaClock(search: string): number | null {
  const value = new URLSearchParams(search).get('heroClock');
  if (value === null || value.trim() === '') return null;
  const seconds = Number(value);
  return Number.isFinite(seconds) && seconds >= 0 ? seconds : null;
}

export function selectHeroRenderer(env: HeroRendererEnvironment): HeroRendererPlan {
  const requested = new URLSearchParams(env.search).get('heroRenderer');
  if (requested === 'canvas') return { renderer: 'canvas', reason: 'forced' };
  if (!env.hasWebGPU) return { renderer: 'canvas', reason: 'no-webgpu' };
  // QA override: initialise WebGPU even with reduced motion or Save-Data.
  if (requested === 'webgpu') return { renderer: 'webgpu', reason: 'forced' };
  if (env.reducedMotion) return { renderer: 'canvas', reason: 'reduced-motion' };
  if (env.saveData) return { renderer: 'canvas', reason: 'save-data' };
  return { renderer: 'webgpu', reason: 'available' };
}

export function readHeroRendererEnvironment(win: Window = window): HeroRendererEnvironment {
  const nav = win.navigator as Navigator & { connection?: { saveData?: boolean } };
  return {
    search: win.location.search,
    hasWebGPU: Boolean(Reflect.get(nav, 'gpu')),
    reducedMotion: win.matchMedia('(prefers-reduced-motion: reduce)').matches,
    saveData: nav.connection?.saveData === true,
  };
}
