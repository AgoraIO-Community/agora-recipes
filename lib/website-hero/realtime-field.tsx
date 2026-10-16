import { useLayoutEffect, useRef, type MutableRefObject } from 'react';
import {
  TAU,
  clamp,
  ease,
  fract,
  readParticlePalette,
  smoothstep,
  sphereHue,
  spherePoint,
  type SphereFrame,
} from './particle-sphere';
import {
  createFieldParticleSeed,
  fieldParticleCount,
  fieldShaftTops,
  type FieldParticleSeed,
} from './hero-field-model';
import { readHeroQaClock } from './hero-renderer-policy';
import {
  type CurtainFrame,
  createCurtainLayer,
  curtainFrame,
  curtainLightAt,
  curtainPalette,
  curtainTarget,
} from './hero-voice-curtains';

type FieldPhase =
  | 'idle'
  | 'ready'
  | 'connecting'
  | 'listening'
  | 'thinking'
  | 'responding'
  | 'interrupted'
  | 'complete'
  | 'unavailable'
  | 'failed';

type FieldIntent = 'idle' | 'prepare' | 'audio' | 'video' | 'conversation';

type Props = {
  phase: FieldPhase;
  intent: FieldIntent;
  amplitudeRef: MutableRefObject<number>;
  exitProgressRef: MutableRefObject<number>;
  paused?: boolean;
};

type Particle = FieldParticleSeed & { x: number; y: number };

type Shaft = {
  centerX: number;
  centerY: number;
  topY: number;
  floorY: number;
  width: number;
  color: string;
  alpha: number;
  band: number;
};

export function RealtimeField({ phase, intent, amplitudeRef, exitProgressRef, paused = false }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef({ phase, intent, paused });
  const previousPhaseRef = useRef<FieldPhase>(phase);
  const eventRef = useRef({ arrival: 0, interrupt: 0, connect: 0 });
  const redrawRef = useRef<(() => void) | null>(null);
  const playbackRef = useRef<(() => void) | null>(null);

  useLayoutEffect(() => {
    runtimeRef.current.paused = paused;
    playbackRef.current?.();
  }, [paused]);

  useLayoutEffect(() => {
    runtimeRef.current.phase = phase;
    if (phase !== previousPhaseRef.current) {
      if (phase === 'responding') eventRef.current.arrival = 1;
      if (phase === 'interrupted') eventRef.current.interrupt = 1;
      if (phase === 'connecting') eventRef.current.connect = 1;
      previousPhaseRef.current = phase;
    }
    redrawRef.current?.();
  }, [phase]);

  useLayoutEffect(() => {
    runtimeRef.current.intent = intent;
    redrawRef.current?.();
  }, [intent]);

  useLayoutEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const drawingContext = canvas.getContext('2d', {
      alpha: true,
      desynchronized: true,
    });
    if (!drawingContext) return;
    const context = drawingContext;

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    let reducedMotion = motionQuery.matches;
    const qaClock = readHeroQaClock(window.location.search);
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const cores = navigator.hardwareConcurrency ?? 8;
    const lowPower = cores <= 4 || (memory !== undefined && memory <= 4);

    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);
    // Voice curtains live in the host box's uv space, as the WebGPU medium
    // pass draws them; particles use the viewport-sized field space.
    const host = canvas.parentElement;
    let hostWidth = host?.clientWidth || width;
    let hostHeight = host?.clientHeight || height;
    let curtains: CurtainFrame = curtainFrame(hostWidth, hostHeight);
    const curtainLayer = createCurtainLayer();
    const curtainTargetPoint = { x: 0, y: 0 };
    let dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 0.9 : 1.1);
    let particles: Particle[] = [];
    // Each mote's curtain light, refreshed for a third of the motes per frame
    // (it changes by far less than a level between frames).
    let moteCurtainLight = new Float32Array(0);
    let moteCurtainLightFresh = false;
    let moteCurtainLightPhase = 0;
    let frame = 0;
    let canvasInView = true;
    let visible = !document.hidden;
    let lastFrame = performance.now();
    let pausedAt: number | null = null;
    let pausedDuration = 0;
    let hasPainted = false;
    let lightTheme = false;
    let neutralRgb = '135, 157, 187';
    let brightRgb = '221, 234, 248';
    let cyanRgb = '74, 190, 225';
    let violetRgb = '138, 113, 221';
    let curtainColors = curtainPalette(brightRgb, cyanRgb, violetRgb);

    let audioIntent = 0;
    let videoIntent = 0;
    let conversationIntent = 0;
    let prepareIntent = 0;
    let liveStrength = runtimeRef.current.phase === 'idle' ? 0 : 1;
    let userStrength = 0;
    let aiStrength = 0;
    let audioEnvelope = 0;
    let cameraX = 0;
    let cameraY = 0;
    let cameraDepth = 0;
    const redrawStatic = () => {
      if ((!reducedMotion && !runtimeRef.current.paused) || !visible) return;
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(render);
    };
    redrawRef.current = redrawStatic;
    // Keep the rendered population stable. The previous adaptive counter
    // changed the visible particle count in discrete batches, which read as
    // particles popping in and out and could itself create frame spikes.
    const qualityScale = 1;
    const videoColumns = 8;
    const videoRows = 5;
    const glowSprites = new Map<string, HTMLCanvasElement>();

    const pointer = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      active: false,
    };

    const refreshTheme = () => {
      const palette = readParticlePalette(host ?? undefined);
      neutralRgb = palette.neutral;
      brightRgb = palette.bright;
      cyanRgb = palette.cyan;
      violetRgb = palette.violet;
      lightTheme = document.documentElement.dataset.theme === 'light';
      curtainColors = curtainPalette(brightRgb, cyanRgb, violetRgb);
      curtainLayer.invalidate();
      glowSprites.clear();
      redrawStatic();
    };

    const particleCount = () => fieldParticleCount(width, lowPower);

    const createParticle = (index: number): Particle => ({
      ...createFieldParticleSeed(index),
      x: width * 0.68,
      y: height * 0.58,
    });

    const seedParticles = () => {
      particles = Array.from({ length: particleCount() }, (_, index) => createParticle(index));
    };

    // Targets are recomputed from the viewport every frame, so existing
    // particles ease to a new composition on their own. Only the count
    // depends on width: trim or grow from the end, and start new particles on
    // top of existing ones so nothing flies in from the spawn point.
    const fitParticleCount = () => {
      const count = particleCount();
      const current = particles.length;
      if (count < current) {
        particles.length = count;
        return;
      }
      for (let index = current; index < count; index += 1) {
        const particle = createParticle(index);
        const anchor = particles[index % current];
        particle.x = anchor.x;
        particle.y = anchor.y;
        particles.push(particle);
      }
    };

    const resize = () => {
      // Seed only on the first run. Reseeding collapses every particle back
      // to its spawn point and replays the load-in: mobile toolbars fire
      // height-only resizes during scroll, and dragging a desktop window
      // fires width changes continuously.
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      dpr = Math.min(window.devicePixelRatio || 1, lowPower ? 0.9 : 1.1);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      measureHost();
      if (particles.length === 0) seedParticles();
      else fitParticleCount();
      redrawStatic();
    };

    function measureHost() {
      hostWidth = host?.clientWidth || width;
      hostHeight = host?.clientHeight || height;
      curtains = curtainFrame(hostWidth, hostHeight);
      curtainLayer.invalidate();
    }
    const hostObserver = new ResizeObserver(() => {
      measureHost();
      redrawStatic();
    });

    const onPointerMove = (event: PointerEvent) => {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.active = true;
    };

    const onPointerLeave = () => {
      pointer.active = false;
    };

    const onVisibility = () => {
      visible = !document.hidden && canvasInView;
      if (visible) {
        lastFrame = performance.now();
        cancelAnimationFrame(frame);
        frame = requestAnimationFrame(render);
      } else {
        cancelAnimationFrame(frame);
      }
    };
    const onMotionChange = () => {
      reducedMotion = motionQuery.matches;
      onVisibility();
    };
    playbackRef.current = onVisibility;

    const visibilityObserver = new IntersectionObserver(
      ([entry]) => {
        canvasInView = entry.isIntersecting;
        const nextVisible = !document.hidden && canvasInView;
        if (nextVisible === visible) return;
        visible = nextVisible;
        cancelAnimationFrame(frame);
        if (visible) {
          lastFrame = performance.now();
          frame = requestAnimationFrame(render);
        }
      },
      { rootMargin: '10% 0px' },
    );

    const shaftTops = fieldShaftTops;

    const shaftSpan = (band: number, time: number, audioAmount: number) => {
      const distance = Math.abs(band - 6) / 6;
      const baseHalfSpan = 0.13 + Math.max(0, 0.6 - shaftTops[band]) * 0.62;
      const pressure =
        audioAmount *
        (0.018 +
          Math.sin(time * 2.15 - band * 0.72) * 0.014 +
          Math.sin(time * 0.83 + band * 0.41) * 0.008);
      const centerLift = (1 - distance) * audioAmount * 0.018;
      return baseHalfSpan + pressure + centerLift;
    };

    const getShafts = (time: number): Shaft[] => {
      const cameraShiftX = cameraX * width * 0.018;
      const cameraShiftY = cameraY * height * 0.012;
      return shaftTops.map((_, band) => {
        const distance = Math.abs(band - 6) / 6;
        const centerY = height * 0.495 + cameraShiftY * (0.38 + distance * 0.32);
        const halfHeight = height * shaftSpan(band, time, audioIntent);
        return {
          centerX: width * (0.405 + band * 0.0445) + cameraShiftX * (0.55 + band / 18),
          centerY,
          topY: centerY - halfHeight,
          floorY: centerY + halfHeight,
          width: width * (0.018 + (1 - distance) * 0.01 + (band % 3 === 0 ? 0.004 : 0)),
          color: band < 4 ? cyanRgb : band > 8 ? violetRgb : brightRgb,
          alpha: 0.19 + (1 - distance) * 0.17,
          band,
        };
      });
    };

    const drawForwardShaft = (shaft: Shaft, alphaScale: number, time: number) => {
      const halfHeight = Math.max(1, (shaft.floorY - shaft.topY) * 0.5);
      const lean = cameraX * width * 0.006;

      const getGlowSprite = (color: string) => {
        const cached = glowSprites.get(color);
        if (cached) return cached;
        const sprite = document.createElement('canvas');
        sprite.width = 192;
        sprite.height = 192;
        const spriteContext = sprite.getContext('2d');
        if (!spriteContext) return sprite;
        const gradient = spriteContext.createRadialGradient(96, 96, 0, 96, 96, 96);
        gradient.addColorStop(0, `rgba(${color},1)`);
        gradient.addColorStop(0.18, `rgba(${color},0.72)`);
        gradient.addColorStop(0.52, `rgba(${color},0.28)`);
        gradient.addColorStop(0.82, `rgba(${color},0.055)`);
        gradient.addColorStop(1, `rgba(${color},0)`);
        spriteContext.fillStyle = gradient;
        spriteContext.fillRect(0, 0, 192, 192);
        glowSprites.set(color, sprite);
        return sprite;
      };

      const scatter = (
        offsetX: number,
        widthScale: number,
        heightScale: number,
        opacity: number,
      ) => {
        context.save();
        context.translate(
          shaft.centerX + offsetX + lean * (offsetX / shaft.width + 0.28),
          shaft.centerY,
        );
        context.scale(Math.max(0.012, (shaft.width * widthScale) / halfHeight), heightScale);
        const alpha = shaft.alpha * alphaScale * opacity;
        context.globalAlpha *= alpha;
        context.drawImage(
          getGlowSprite(shaft.color),
          -halfHeight,
          -halfHeight,
          halfHeight * 2,
          halfHeight * 2,
        );
        context.restore();
      };

      // Broad atmospheric scatter establishes the shaft. Narrow, offset
      // interference lobes make it optical without drawing a visible column.
      scatter(0, 3.25, 1.08, 0.5);
      scatter(Math.sin(time * 0.23 + shaft.band * 1.7) * shaft.width * 0.28, 1.36, 0.98, 0.76);
      scatter(
        -shaft.width * 0.27 + Math.sin(time * 0.17 + shaft.band) * shaft.width * 0.11,
        0.54,
        0.92,
        0.32,
      );
      scatter(
        shaft.width * 0.33 + Math.cos(time * 0.19 + shaft.band * 0.8) * shaft.width * 0.09,
        0.3,
        0.84,
        0.19,
      );
    };

    const drawSourceBloom = (alphaScale: number) => {
      const x = width * (0.69 + cameraX * 0.012);
      const y = height * (0.5 + cameraY * 0.008);
      const radius = Math.min(width, height) * 0.34;
      context.save();
      context.translate(x, y);
      context.scale(1.55, 0.72);
      const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
      gradient.addColorStop(0, `rgba(${brightRgb},${0.22 * alphaScale})`);
      gradient.addColorStop(0.16, `rgba(${cyanRgb},${0.13 * alphaScale})`);
      gradient.addColorStop(0.45, `rgba(${violetRgb},${0.05 * alphaScale})`);
      gradient.addColorStop(1, `rgba(${violetRgb},0)`);
      context.fillStyle = gradient;
      context.fillRect(-radius, -radius, radius * 2, radius * 2);
      context.restore();
    };

    const drawRefractiveEnvironment = (time: number) => {
      const sphereMode = Math.max(conversationIntent, prepareIntent, liveStrength);
      const activeMedia = clamp(0.16 + videoIntent * 0.56 + sphereMode * 0.62);
      const themeScale = lightTheme ? 0.34 : 1;
      const driftX = cameraX * width * 0.035;
      const driftY = cameraY * height * 0.024;

      const pane = (
        x: number,
        y: number,
        radius: number,
        scaleX: number,
        scaleY: number,
        color: string,
        alpha: number,
      ) => {
        context.save();
        context.translate(x + driftX, y + driftY);
        context.rotate(cameraX * 0.035);
        context.scale(scaleX, scaleY);
        const gradient = context.createRadialGradient(0, 0, 0, 0, 0, radius);
        gradient.addColorStop(0, `rgba(${color},${alpha})`);
        gradient.addColorStop(0.32, `rgba(${color},${alpha * 0.46})`);
        gradient.addColorStop(0.72, `rgba(${color},${alpha * 0.08})`);
        gradient.addColorStop(1, `rgba(${color},0)`);
        context.fillStyle = gradient;
        context.fillRect(-radius, -radius, radius * 2, radius * 2);
        context.restore();
      };

      context.save();
      context.globalCompositeOperation = lightTheme ? 'multiply' : 'screen';

      // Broad ceiling and floor exposure: the room is lit through changes in
      // density, not outlined with visible cube edges.
      pane(
        width * 0.71,
        height * 0.02,
        Math.min(width, height) * 0.54,
        1.42,
        0.34,
        brightRgb,
        activeMedia * themeScale * 0.075,
      );
      pane(
        width * 0.66,
        height * 0.98,
        Math.min(width, height) * 0.58,
        1.56,
        0.3,
        cyanRgb,
        activeMedia * themeScale * 0.085,
      );

      // Slow, overlapping refractive pockets read like different densities in
      // the same volume. Their motion follows the camera, never the pointer as
      // a local light source.
      const shimmer = Math.sin(time * 0.21) * width * 0.018;
      pane(
        width * 0.82 + shimmer,
        height * 0.19,
        Math.min(width, height) * 0.31,
        0.58,
        1.38,
        violetRgb,
        activeMedia * themeScale * 0.05,
      );
      pane(
        width * 0.52 - shimmer * 0.55,
        height * 0.82,
        Math.min(width, height) * 0.28,
        0.72,
        1.18,
        brightRgb,
        activeMedia * themeScale * 0.045,
      );
      context.restore();
    };

    const drawAtmosphere = (time: number, shafts: Shaft[], audio: number) => {
      const shapeSuppression = clamp(
        Math.max(videoIntent, conversationIntent, prepareIntent, liveStrength),
      );
      // Idle and Audio are light-led. In the more graphic states the shafts
      // recede, leaving only enough atmosphere to keep the field coherent.
      const stateScale = (1 - shapeSuppression * 0.94) * (1 + audioIntent * 0.38);
      const themeScale = (lightTheme ? 0.34 : 1.42) * stateScale;
      // Voice hands the shaft light and bloom to the volumetric curtains, as
      // the WebGPU medium pass does.
      const voice = clamp(audioIntent * (1 - shapeSuppression));
      const shaftScale = themeScale * (1 - voice);
      context.save();
      context.globalCompositeOperation = lightTheme ? 'multiply' : 'screen';
      drawRefractiveEnvironment(time);
      if (shaftScale > 0.001) {
        drawSourceBloom(shaftScale);
        for (const shaft of shafts) {
          drawForwardShaft(shaft, shaftScale, time);
        }
      }
      if (voice > 0.001 && !lightTheme) {
        // The light drifts under a pixel between refreshes, so every sixth
        // row is refreshed per frame (all at once for a static frame).
        const stride = reducedMotion ? 1 : lowPower ? 8 : 6;
        curtainLayer.update(curtains, time, audio, cameraX, cameraY, curtainColors, stride);
        curtainLayer.draw(context, curtains, voice);
      } else {
        curtainLayer.invalidate();
      }
      context.restore();
    };

    const project = (u: number, v: number, depth: number) => {
      const focalU = 0.68;
      const focalV = 0.58;
      const perspective = 0.78 + depth * (0.44 + cameraDepth * 0.16);
      const parallaxX = cameraX * (depth - 0.24) * 0.04;
      const parallaxY = cameraY * (depth - 0.24) * 0.031;
      return {
        x: width * (focalU + (u - focalU) * perspective + parallaxX),
        y: height * (focalV + (v - focalV) * perspective + parallaxY),
      };
    };

    const flowDepth = (particle: Particle, time: number) => {
      const speed = particle.group === 0 ? 0.026 : particle.group === 1 ? 0.052 : 0.014;
      return fract(particle.depth + particle.seed * 0.37 + time * speed);
    };

    const depthFade = (depth: number) =>
      smoothstep(0.02, 0.14, depth) * (1 - smoothstep(0.84, 0.995, depth));

    const baseTarget = (particle: Particle, time: number) => {
      const movingDepth = flowDepth(particle, time);
      if (particle.group === 0) {
        const floorRipple =
          Math.sin(particle.u * 13.5 + particle.depth * 4.2 - time * 0.32 + particle.seed * 3) *
          (0.006 + particle.depth * 0.012);
        return project(particle.u, particle.v + floorRipple, movingDepth);
      }

      if (particle.group === 1) {
        const halfSpan = shaftSpan(particle.band, time, 0);
        const top = 0.495 - halfSpan;
        const bottom = 0.495 + halfSpan;
        const plumeY =
          top +
          clamp(particle.v) ** 0.92 * (bottom - top) +
          Math.sin(particle.v * 5.8 + particle.seed * 8 + time * (0.18 + particle.depth * 0.08)) *
            (0.006 + particle.depth * 0.009);
        const plumeX =
          particle.u +
          Math.sin(time * 0.13 + particle.seed * 14) * (0.003 + particle.depth * 0.006);
        return project(plumeX, plumeY, movingDepth);
      }

      const mistX =
        particle.u + Math.sin(time * 0.08 + particle.seed * 17) * (0.003 + particle.depth * 0.007);
      const mistY =
        particle.v + Math.cos(time * 0.075 + particle.seed * 13) * (0.002 + particle.depth * 0.006);
      return project(mistX, mistY, movingDepth);
    };

    const storyStrengthAt = (exit: number) =>
      smoothstep(0.16, 0.44, exit) * (1 - smoothstep(0.86, 1, exit));

    const videoTarget = (particle: Particle, index: number) => {
      const cell = index % (videoColumns * videoRows);
      const column = cell % videoColumns;
      const row = Math.floor(cell / videoColumns);
      const localX = particle.videoLocalX;
      const localY = particle.videoLocalY;
      const mobile = width < 680;
      const cellSize = Math.min(
        width * (mobile ? 0.092 : 0.061),
        height * (mobile ? 0.074 : 0.092),
      );
      const gap = cellSize * 0.14;
      const inner = cellSize - gap;
      const planeWidth = videoColumns * cellSize;
      const planeHeight = videoRows * cellSize;
      const centerX = width * (mobile ? 0.62 : 0.7);
      const centerY = height * (mobile ? 0.41 : 0.43);
      const localPlaneX = -planeWidth * 0.5 + column * cellSize + gap * 0.5 + localX * inner;
      const localPlaneY = -planeHeight * 0.5 + row * cellSize + gap * 0.5 + localY * inner;
      const rigidYaw = cameraX * 0.055;
      const rigidPitch = cameraY * 0.045;

      // The grid is one rigid plane, so every cell keeps the same size and
      // spacing. Camera movement changes its viewing angle without randomly
      // stretching individual squares.
      return {
        x: centerX + localPlaneX + localPlaneY * rigidYaw + cameraX * width * 0.018,
        y: centerY + localPlaneY + localPlaneX * rigidPitch + cameraY * height * 0.014,
      };
    };

    const sphereFrame: SphereFrame = {
      centerX: 0,
      centerY: 0,
      outerRadius: 0,
      time: 0,
      reducedMotion,
      live: false,
      strength: 0,
      audio: 0,
      userStrength: 0,
      aiStrength: 0,
      cameraX: 0,
      cameraY: 0,
    };

    const sphereTarget = (
      particle: Particle,
      index: number,
      time: number,
      strength: number,
      live: boolean,
      audio: number,
    ) => {
      // One reused frame record keeps the per-particle call allocation-free.
      const mobile = width < 680;
      sphereFrame.centerX = width * (mobile ? 0.63 : 0.715);
      sphereFrame.centerY = height * (mobile ? 0.43 : 0.42);
      sphereFrame.outerRadius = Math.min(width, height) * (mobile ? 0.22 : live ? 0.285 : 0.265);
      sphereFrame.time = time;
      sphereFrame.reducedMotion = reducedMotion;
      sphereFrame.live = live;
      sphereFrame.strength = strength;
      sphereFrame.audio = audio;
      sphereFrame.userStrength = userStrength;
      sphereFrame.aiStrength = aiStrength;
      sphereFrame.cameraX = cameraX;
      sphereFrame.cameraY = cameraY;
      return spherePoint(particle, sphereFrame);
    };

    const targetForParticle = (particle: Particle, index: number, time: number, audio: number) => {
      const base = baseTarget(particle, time);
      let x = base.x;
      let y = base.y;
      let sphereWave = 0;

      if (particle.group === 1) {
        if (audioIntent > 0.001) {
          // Voice: shaft motes gather in the curtains (thirteen, or five on phones).
          const target = curtainTarget(
            curtains,
            particle,
            flowDepth(particle, time),
            time,
            cameraX,
            cameraY,
            curtainTargetPoint,
          );
          x += (target.x - x) * audioIntent;
          y += (target.y - y) * audioIntent;
        }
        if (videoIntent > 0.001) {
          const target = videoTarget(particle, index);
          x += (target.x - x) * videoIntent;
          y += (target.y - y) * videoIntent;
        }
        const sphereStrength = Math.max(conversationIntent, prepareIntent);
        if (sphereStrength > 0.001) {
          const target = sphereTarget(particle, index, time, sphereStrength, false, audio);
          x += (target.x - x) * sphereStrength;
          y += (target.y - y) * sphereStrength;
          sphereWave = Math.max(sphereWave, target.wave * sphereStrength);
        }
        if (liveStrength > 0.001) {
          const target = sphereTarget(particle, index, time, 1, true, audio);
          x += (target.x - x) * liveStrength;
          y += (target.y - y) * liveStrength;
          sphereWave = Math.max(sphereWave, target.wave * liveStrength);
        }
      }

      const transition = Math.sin(liveStrength * Math.PI);
      const throughField = transition * eventRef.current.connect;
      if (throughField > 0.001 && particle.group !== 0) {
        const centerX = width * 0.68;
        const centerY = height * 0.5;
        const zoom = 1 + throughField * (0.25 + particle.depth * 1.25);
        x = centerX + (x - centerX) * zoom;
        y = centerY + (y - centerY) * zoom;
      }

      // The opening field becomes the transition into the story below. As the
      // page moves past the hero, particles separate around a calm central
      // lane and fall behind the incoming typography. This keeps the same
      // medium on screen while changing its composition rather than replacing
      // one scene with another.
      const exit =
        runtimeRef.current.phase === 'idle' ? smoothstep(0.02, 0.98, exitProgressRef.current) : 0;
      if (exit > 0.001) {
        const centerX = width * 0.56;
        const centerY = height * 0.52;
        const side = x < centerX ? -1 : 1;
        const verticalSide = y < centerY ? -1 : 1;
        const depthSpread = 0.45 + particle.depth * 0.55;
        x += side * width * exit * 0.035 * depthSpread;
        y += verticalSide * height * exit * 0.028 * depthSpread;

        y -= height * exit * (0.01 + particle.depth * 0.014);
      }

      return { x, y, throughField, sphereWave, exit };
    };

    const shaftExposureAt = (x: number, y: number, shafts: Shaft[]) => {
      let exposure = 0;
      const firstCenter = shafts[0]?.centerX ?? 0;
      const lastCenter = shafts[shafts.length - 1]?.centerX ?? firstCenter + 1;
      const averageStep = (lastCenter - firstCenter) / Math.max(1, shafts.length - 1);
      const nearest = clamp(
        Math.round((x - firstCenter) / Math.max(1, averageStep)),
        0,
        shafts.length - 1,
      );
      const start = Math.max(0, nearest - 1);
      const end = Math.min(shafts.length - 1, nearest + 1);
      for (let index = start; index <= end; index += 1) {
        const shaft = shafts[index];
        const t = clamp((y - shaft.topY) / Math.max(1, shaft.floorY - shaft.topY));
        const centerX = shaft.centerX + cameraX * width * 0.008 * (1 - t);
        const distance = Math.abs(x - centerX);
        const radius = shaft.width * (0.42 + t * 0.2);
        const vertical = smoothstep(0, 0.13, t) * (1 - smoothstep(0.86, 1, t));
        exposure = Math.max(exposure, (1 - smoothstep(radius * 0.18, radius, distance)) * vertical);
      }
      return exposure;
    };

    const drawParticles = (time: number, delta: number, audio: number, shafts: Shaft[]) => {
      const themeAlpha = lightTheme ? 0.48 : 1;
      const movement = reducedMotion || (runtimeRef.current.paused && !hasPainted)
        ? 1 : runtimeRef.current.paused ? 0 : clamp(delta * 6.5, 0.035, 0.18);
      const renderCount = Math.max(1, Math.floor(particles.length * qualityScale));
      const densityCompensation = 1 / Math.sqrt(qualityScale);

      context.save();
      context.globalCompositeOperation = lightTheme ? 'multiply' : 'screen';

      if (moteCurtainLight.length < renderCount) {
        moteCurtainLight = new Float32Array(renderCount);
        moteCurtainLightFresh = false;
      }
      const curtainsLit = audioIntent > 0.001;
      const lightAllMotes = !moteCurtainLightFresh || reducedMotion;
      moteCurtainLightPhase = (moteCurtainLightPhase + 1) % 3;

      for (let index = 0; index < renderCount; index += 1) {
        const particle = particles[index];
        const target = targetForParticle(particle, index, time, audio);
        particle.x += (target.x - particle.x) * movement;
        particle.y += (target.y - particle.y) * movement;

        const titleDistance = Math.hypot(
          (particle.x - width * 0.23) / (width * 0.4),
          (particle.y - height * 0.69) / (height * 0.34),
        );
        const titleAttenuation = 1 - (1 - smoothstep(0.48, 1.15, titleDistance)) * 0.68;
        // Voice motes catch the curtains' light; other modes use the shafts.
        const shaftLight =
          audioIntent < 0.999 ? shaftExposureAt(particle.x, particle.y, shafts) : 0;
        if (curtainsLit && (lightAllMotes || index % 3 === moteCurtainLightPhase))
          moteCurtainLight[index] = curtainLightAt(curtains, particle.x, particle.y, time, audio);
        const curtainLight = curtainsLit ? moteCurtainLight[index] : 0;
        const shaftExposure =
          (shaftLight + (curtainLight - shaftLight) * audioIntent) *
          (particle.group === 2 ? 0.35 : 1);
        const sphereMode = Math.max(conversationIntent, prepareIntent, liveStrength);
        const shapeSuppression = clamp(Math.max(videoIntent, sphereMode));
        const shaftVisibility = (1 - shapeSuppression * 0.94) * (1 + audioIntent * 0.4);
        const visibleShaftExposure = shaftExposure * shaftVisibility;
        const sideSpeaking =
          particle.side < 0 ? userStrength + aiStrength * 0.08 : aiStrength + userStrength * 0.14;
        const videoCell = index % (videoColumns * videoRows);
        const videoRow = Math.floor(videoCell / videoColumns);
        const videoColumn = videoCell % videoColumns;
        const reflectionPhase =
          time * 0.48 + videoColumn * 0.91 + videoRow * 1.27 + particle.reflectionSeed;
        const videoReflection =
          videoIntent *
          clamp(
            0.5 + Math.sin(reflectionPhase) * 0.28 + Math.sin(reflectionPhase * 0.43 + 1.7) * 0.22,
          ) **
            3.2;
        const videoParticleVisibility = 1 - videoIntent * (index % 3 === 0 ? 0 : 0.48);

        let color =
          particle.group === 1 && particle.depth > 0.58
            ? brightRgb
            : particle.depth > 0.64
              ? cyanRgb
              : neutralRgb;
        if (visibleShaftExposure > 0.16) color = brightRgb;
        if (videoIntent > 0.1) {
          color = (videoRow + videoColumn) % 2 ? neutralRgb : cyanRgb;
          if (videoReflection > 0.34) color = brightRgb;
        }
        if (sphereMode > 0.08) {
          const hue = sphereHue(particle.hueSeed, target.sphereWave);
          color = hue === 0 ? brightRgb : hue === 1 ? cyanRgb : violetRgb;
        }

        const movingDepth = flowDepth(particle, time);
        const shapeMode = particle.group === 1 ? Math.max(videoIntent, sphereMode) : 0;
        const environmentStrength = clamp(0.12 + videoIntent * 0.48 + sphereMode * 0.56);
        const mediaLift = particle.group === 2 ? 1 + environmentStrength * 1.45 : 1;
        const visualDepth = movingDepth + (particle.depth - movingDepth) * shapeMode;
        const outwardFade = depthFade(movingDepth) + (1 - depthFade(movingDepth)) * shapeMode;
        const depthScale = 0.68 + visualDepth * 0.7;
        const alpha =
          particle.alpha *
          themeAlpha *
          densityCompensation *
          titleAttenuation *
          outwardFade *
          videoParticleVisibility *
          mediaLift *
          (0.62 +
            visualDepth * 0.28 +
            visibleShaftExposure * 0.96 +
            videoReflection * 0.78 +
            sideSpeaking * sphereMode * 0.12 +
            target.sphereWave * 0.42) *
          (1 - smoothstep(0.6, 1, target.exit) * 0.93);
        const size =
          particle.size *
          depthScale *
          (particle.group === 2 ? 1 + environmentStrength * 0.18 : 1) *
          (1 +
            visibleShaftExposure * 0.26 +
            target.throughField * 0.5 +
            videoReflection * 0.34 +
            sideSpeaking * sphereMode * 0.1 +
            target.sphereWave * 0.44);

        if (videoIntent > 0.16 && videoReflection > 0.24 && index % 11 === 0) {
          context.fillStyle = `rgba(${brightRgb},${Math.min(
            0.16,
            alpha * videoReflection * 0.34,
          )})`;
          context.beginPath();
          context.arc(particle.x, particle.y, size * 2.6, 0, TAU);
          context.fill();
        }
        context.fillStyle = `rgba(${color},${Math.min(0.96, alpha)})`;
        if (size < 2.3) {
          context.fillRect(particle.x, particle.y, size, size);
        } else {
          context.beginPath();
          context.arc(particle.x, particle.y, size * 0.5, 0, TAU);
          context.fill();
        }
      }

      moteCurtainLightFresh = curtainsLit;
      context.restore();
    };

    function render(now: number) {
      if (!visible) return;
      const isPaused = runtimeRef.current.paused;
      if (isPaused && pausedAt === null) pausedAt = now;
      if (!isPaused && pausedAt !== null) {
        pausedDuration += now - pausedAt;
        pausedAt = null;
      }
      const rawDelta = isPaused ? 0 : Math.min(0.034, Math.max(0.001, (now - lastFrame) / 1000));
      lastFrame = now;
      const delta = reducedMotion ? 0 : rawDelta;
      const time = reducedMotion ? 0 : (qaClock ?? ((pausedAt ?? now) - pausedDuration) / 1000);
      const currentPhase = runtimeRef.current.phase;
      const currentIntent = runtimeRef.current.intent;
      const isLive = currentPhase !== 'idle';
      const measuredAudio =
        currentPhase === 'listening' || currentPhase === 'responding'
          ? clamp(amplitudeRef.current * 2.85)
          : 0;
      audioEnvelope = ease(
        audioEnvelope,
        measuredAudio,
        measuredAudio > audioEnvelope ? 22 : 10,
        rawDelta,
      );
      const audio = reducedMotion ? 0 : audioEnvelope;
      const settle = (value: number, target: number, speed: number) =>
        reducedMotion || (isPaused && !hasPainted) ? target : ease(value, target, speed, rawDelta);

      audioIntent = settle(
        audioIntent,
        currentIntent === 'audio' ? 1 : 0,
        currentIntent === 'audio' ? 3.8 : 2.2,
      );
      videoIntent = settle(
        videoIntent,
        currentIntent === 'video' ? 1 : 0,
        currentIntent === 'video' ? 3.8 : 2.2,
      );
      conversationIntent = settle(
        conversationIntent,
        currentIntent === 'conversation' ? 1 : 0,
        currentIntent === 'conversation' ? 3.6 : 2.1,
      );
      prepareIntent = settle(
        prepareIntent,
        currentIntent === 'prepare' ? 1 : 0,
        currentIntent === 'prepare' ? 3.8 : 2.2,
      );
      liveStrength = settle(liveStrength, isLive ? 1 : 0, isLive ? 3.4 : 1.8);
      userStrength = settle(
        userStrength,
        currentPhase === 'listening' || currentPhase === 'interrupted' ? 1 : 0,
        8,
      );
      aiStrength = settle(aiStrength, currentPhase === 'responding' ? 1 : 0, 9);

      pointer.x = ease(pointer.x, pointer.targetX, 9, rawDelta);
      pointer.y = ease(pointer.y, pointer.targetY, 9, rawDelta);
      const normalizedPointerX = (pointer.x / width - 0.5) * 2;
      const normalizedPointerY = (pointer.y / height - 0.5) * 2;
      cameraX = ease(cameraX, pointer.active ? normalizedPointerX : 0, 2.7, rawDelta);
      cameraY = ease(cameraY, pointer.active ? normalizedPointerY : 0, 2.7, rawDelta);
      cameraDepth = ease(cameraDepth, pointer.active ? 1 : 0.35, 2.2, rawDelta);

      eventRef.current.arrival *= Math.exp(-1.45 * rawDelta);
      eventRef.current.interrupt *= Math.exp(-5 * rawDelta);
      eventRef.current.connect *= Math.exp(-0.82 * rawDelta);

      context.setTransform(dpr, 0, 0, dpr, 0, 0);
      context.clearRect(0, 0, width, height);
      const fieldHasExited = currentPhase === 'idle' && exitProgressRef.current >= 0.995;
      if (fieldHasExited) {
        if (!reducedMotion && !isPaused) frame = requestAnimationFrame(render);
        return;
      }
      const shafts = getShafts(time);
      const storyScene = currentPhase === 'idle' ? storyStrengthAt(exitProgressRef.current) : 0;
      context.save();
      context.globalAlpha = 1 - storyScene * 0.985;
      drawAtmosphere(time, shafts, audio);
      context.restore();
      drawParticles(time, delta, audio, shafts);
      hasPainted = true;

      if (!reducedMotion && !isPaused) frame = requestAnimationFrame(render);
    }

    refreshTheme();
    resize();
    window.addEventListener('resize', resize);
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);
    document.addEventListener('visibilitychange', onVisibility);
    motionQuery.addEventListener('change', onMotionChange);
    const themeObserver = new MutationObserver(refreshTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    visibilityObserver.observe(canvas);
    if (host) hostObserver.observe(host);
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(render);

    return () => {
      cancelAnimationFrame(frame);
      redrawRef.current = null;
      playbackRef.current = null;
      window.removeEventListener('resize', resize);
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      document.removeEventListener('visibilitychange', onVisibility);
      motionQuery.removeEventListener('change', onMotionChange);
      themeObserver.disconnect();
      visibilityObserver.disconnect();
      hostObserver.disconnect();
    };
  }, [amplitudeRef, exitProgressRef]);

  return <canvas ref={canvasRef} className="realtime-field" aria-hidden="true" />;
}
