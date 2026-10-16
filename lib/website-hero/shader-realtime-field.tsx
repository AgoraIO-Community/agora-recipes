import { type ComponentProps, useEffect, useRef, useState } from 'react';
import type { shaderRendererGPU } from 'shaders/core';
import { clamp, ease, readParticlePalette, smoothstep } from './particle-sphere';
import { voiceCurtainLayout } from './hero-field-light';
import { fieldParticleCount } from './hero-field-model';
import type { createHeroParticleLayer } from './hero-particle-motion';
import {
  isLowPowerDevice,
  readHeroQaClock,
  readHeroRendererEnvironment,
  selectHeroRenderer,
} from './hero-renderer-policy';
import { RealtimeField as CanvasRealtimeField } from './realtime-field';

type Props = ComponentProps<typeof CanvasRealtimeField>;

const rgb = (channels: string) => channels.split(',').map((value) => Number(value.trim()) / 255);
const hex = (channels: string) =>
  `#${rgb(channels)
    .map((value) =>
      Math.round(value * 255)
        .toString(16)
        .padStart(2, '0'),
    )
    .join('')}`;

export function RealtimeField(props: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCanvasRef = useRef<HTMLCanvasElement>(null);
  const runtimeRef = useRef(props);
  const playbackRef = useRef<(() => void) | null>(null);
  const [renderer, setRenderer] = useState<'initializing' | 'webgpu' | 'canvas'>('initializing');
  runtimeRef.current = props;

  useEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    const particleCanvas = particleCanvasRef.current;
    if (!host || !canvas || !particleCanvas) return;
    // Any viewport with WebGPU, phones included, starts it at once; reduced-
    // motion and Save-Data views use Canvas and never request the WebGPU
    // runtime. `?heroRenderer=canvas|webgpu` overrides this for QA.
    const plan = selectHeroRenderer(readHeroRendererEnvironment());
    host.dataset.heroPlan = `${plan.renderer}:${plan.reason}`;
    if (plan.renderer === 'canvas') {
      setRenderer('canvas');
      return;
    }

    let disposed = false;
    let failed = false;
    let shader: ReturnType<typeof shaderRendererGPU> | undefined;
    let particles: Awaited<ReturnType<typeof createHeroParticleLayer>> | undefined;
    let colors: number[] = [];
    let lightTheme = false;
    let presented = false;
    let drawing = false;
    let redrawPending = false;
    let frame = 0;
    let generation = 0;
    let inView = true;
    let clock = 0;
    let previous = performance.now();
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const qaClock = readHeroQaClock(window.location.search);
    // The Canvas field's device budget, so both renderers draw the same
    // population at the same backing resolution.
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowPower = isLowPowerDevice(navigator.hardwareConcurrency, memory);
    let width = Math.max(1, window.innerWidth);
    let height = Math.max(1, window.innerHeight);

    // Field state eased exactly as the Canvas field's render loop eases it.
    const initialPhase = runtimeRef.current.phase;
    const state = {
      audioIntent: 0,
      videoIntent: 0,
      conversationIntent: 0,
      prepareIntent: 0,
      liveStrength: initialPhase === 'idle' ? 0 : 1,
      userStrength: 0,
      aiStrength: 0,
      audioEnvelope: 0,
      cameraX: 0,
      cameraY: 0,
      cameraDepth: 0,
      connect: 0,
      phase: initialPhase,
    };
    const pointer = {
      x: width * 0.5,
      y: height * 0.5,
      targetX: width * 0.5,
      targetY: height * 0.5,
      active: false,
    };

    const syncTheme = () => {
      const palette = readParticlePalette(host);
      lightTheme = document.documentElement.dataset.theme === 'light';
      update({ bright: hex(palette.bright), cyan: hex(palette.cyan), violet: hex(palette.violet) });
      colors = [palette.neutral, palette.bright, palette.cyan, palette.violet].flatMap((value) => [
        ...rgb(value),
        1,
      ]);
    };

    // Voice's volumetric curtains stay out of the Hero copy. Only measured
    // while Voice light is showing; transforms do not force layout.
    const copyBounds = () => {
      const copy =
        state.audioIntent > 0.001 ? host.closest('.hero')?.querySelector('.hero-content') : null;
      if (!copy) return { copyLeft: 0, copyTop: 0, copyRight: 0, copyBottom: 0 };
      const field = host.getBoundingClientRect();
      const bounds = copy.getBoundingClientRect();
      return {
        copyLeft: bounds.left - field.left,
        copyTop: bounds.top - field.top,
        copyRight: bounds.right - field.left,
        copyBottom: bounds.bottom - field.top,
      };
    };

    const update = (values: Record<string, unknown>) => {
      for (const [name, value] of Object.entries(values))
        shader?.updateUniformValue('hero', name, value);
    };

    const advance = (rawDelta: number, initialPause = false) => {
      const current = runtimeRef.current;
      const still = reduced.matches || initialPause;
      if (current.phase !== state.phase) {
        if (current.phase === 'connecting') state.connect = 1;
        state.phase = current.phase;
      }
      const settle = (value: number, target: number, speed: number) =>
        still ? target : ease(value, target, speed, rawDelta);
      const isLive = current.phase !== 'idle';
      const measuredAudio =
        current.phase === 'listening' || current.phase === 'responding'
          ? clamp(current.amplitudeRef.current * 2.85)
          : 0;
      state.audioEnvelope = ease(
        state.audioEnvelope,
        measuredAudio,
        measuredAudio > state.audioEnvelope ? 22 : 10,
        rawDelta,
      );
      const intent = current.intent;
      state.audioIntent = settle(
        state.audioIntent,
        intent === 'audio' ? 1 : 0,
        intent === 'audio' ? 3.8 : 2.2,
      );
      state.videoIntent = settle(
        state.videoIntent,
        intent === 'video' ? 1 : 0,
        intent === 'video' ? 3.8 : 2.2,
      );
      state.conversationIntent = settle(
        state.conversationIntent,
        intent === 'conversation' ? 1 : 0,
        intent === 'conversation' ? 3.6 : 2.1,
      );
      state.prepareIntent = settle(
        state.prepareIntent,
        intent === 'prepare' ? 1 : 0,
        intent === 'prepare' ? 3.8 : 2.2,
      );
      state.liveStrength = settle(state.liveStrength, isLive ? 1 : 0, isLive ? 3.4 : 1.8);
      state.userStrength = settle(
        state.userStrength,
        current.phase === 'listening' || current.phase === 'interrupted' ? 1 : 0,
        8,
      );
      state.aiStrength = settle(state.aiStrength, current.phase === 'responding' ? 1 : 0, 9);
      pointer.x = ease(pointer.x, pointer.targetX, 9, rawDelta);
      pointer.y = ease(pointer.y, pointer.targetY, 9, rawDelta);
      state.cameraX = ease(
        state.cameraX,
        pointer.active ? (pointer.x / width - 0.5) * 2 : 0,
        2.7,
        rawDelta,
      );
      state.cameraY = ease(
        state.cameraY,
        pointer.active ? (pointer.y / height - 0.5) * 2 : 0,
        2.7,
        rawDelta,
      );
      state.cameraDepth = ease(state.cameraDepth, pointer.active ? 1 : 0.35, 2.2, rawDelta);
      state.connect *= Math.exp(-0.82 * rawDelta);
    };

    const draw = async (now: number, currentGeneration: number) => {
      frame = 0;
      if (
        !shader ||
        !particles ||
        shader.getFailureReason() ||
        failed ||
        disposed ||
        !inView ||
        document.hidden
      )
        return;
      const rawDelta = Math.min(0.034, Math.max(0.001, (now - previous) / 1000));
      previous = now;
      const still = reduced.matches;
      advance(runtimeRef.current.paused ? 0 : rawDelta, !!runtimeRef.current.paused && !presented);
      if (!still) clock = qaClock ?? (runtimeRef.current.paused ? clock : clock + rawDelta);
      host.dataset.fieldClock = clock.toFixed(3);
      const current = runtimeRef.current;
      const idle = current.phase === 'idle';
      const exitProgress = current.exitProgressRef.current;
      const time = still ? 0 : clock;
      const sphereMode = Math.max(
        state.conversationIntent,
        state.prepareIntent,
        state.liveStrength,
      );
      const visible = !(idle && exitProgress >= 0.995);
      update({
        hostWidth: host.clientWidth,
        hostHeight: host.clientHeight,
        fieldWidth: width,
        fieldHeight: height,
        clock: time,
        audioIntent: state.audioIntent,
        videoIntent: state.videoIntent,
        sphereMode,
        cameraX: state.cameraX,
        cameraY: state.cameraY,
        story: idle
          ? smoothstep(0.16, 0.44, exitProgress) * (1 - smoothstep(0.86, 1, exitProgress))
          : 0,
        lightTheme: lightTheme ? 1 : 0,
        present: visible ? 1 : 0,
        amplitude: still ? 0 : state.audioEnvelope,
        mobile: host.clientWidth <= voiceCurtainLayout.phoneMaxWidth ? 1 : 0,
        ...copyBounds(),
      });
      // The exported core renderer presents one explicit frame. This avoids
      // relying on timing a pause against a second internal animation loop.
      drawing = true;
      try {
        await shader.renderSyntheticFrame(rawDelta, { waitForGpu: false });
        await particles.render(
          {
            width,
            height,
            pixelRatio: Math.min(window.devicePixelRatio || 1, lowPower ? 0.9 : 1.1),
            time,
            movement: current.paused ? (presented ? 0 : 1) : still ? 1 : clamp(rawDelta * 6.5, 0.035, 0.18),
            audioIntent: state.audioIntent,
            videoIntent: state.videoIntent,
            conversationIntent: state.conversationIntent,
            prepareIntent: state.prepareIntent,
            liveStrength: state.liveStrength,
            userStrength: state.userStrength,
            aiStrength: state.aiStrength,
            audio: still ? 0 : state.audioEnvelope,
            cameraX: state.cameraX,
            cameraY: state.cameraY,
            cameraDepth: state.cameraDepth,
            connect: state.connect,
            exit: idle ? smoothstep(0.02, 0.98, exitProgress) : 0,
            light: lightTheme ? 1 : 0,
            count: fieldParticleCount(width, lowPower),
            reduced: still ? 1 : 0,
            hostWidth: host.clientWidth,
            hostHeight: host.clientHeight,
          },
          colors,
          visible,
        );
        if (!disposed && !failed) host.dataset.presentedIntent = current.intent;
        if (!presented && !disposed && !failed && !shader.getFailureReason()) {
          presented = true;
          setRenderer('webgpu');
        }
      } catch (error) {
        failed = true;
        generation++;
        if (!disposed) {
          console.warn('Hero shader frame failed; using the Canvas field.', error);
          setRenderer('canvas');
        }
        particles?.cleanup();
        shader.cleanup();
        return;
      } finally {
        drawing = false;
      }
      if (redrawPending) {
        redrawPending = false;
        syncPlayback();
        return;
      }
      if (!still && !runtimeRef.current.paused && !disposed && currentGeneration === generation && inView && !document.hidden)
        frame = requestAnimationFrame((time) => void draw(time, currentGeneration));
    };

    const syncPlayback = () => {
      cancelAnimationFrame(frame);
      generation++;
      if (!shader || !particles || shader.getFailureReason() || disposed || failed) return;
      if (document.hidden || !inView) {
        shader.stopAnimation();
        host.dataset.playback = 'paused';
        return;
      }
      previous = performance.now();
      host.dataset.playback = reduced.matches ? 'static' : runtimeRef.current.paused ? 'paused' : 'running';
      // A resize or capability change may arrive while a frame is submitting.
      // Coalesce it into the next frame so older uniforms cannot overwrite it.
      if (drawing) {
        redrawPending = true;
        return;
      }
      const currentGeneration = generation;
      frame = requestAnimationFrame((time) => void draw(time, currentGeneration));
    };
    playbackRef.current = syncPlayback;

    // Like the Canvas field, positions live in a viewport-sized space; a
    // resize only changes targets, so particles ease rather than replay.
    const resize = () => {
      width = Math.max(1, window.innerWidth);
      height = Math.max(1, window.innerHeight);
      particleCanvas.style.width = `${width}px`;
      particleCanvas.style.height = `${height}px`;
      if (!shader || failed) return;
      shader.resize(host.clientWidth, host.clientHeight);
      syncPlayback();
    };
    const onPointer = (event: PointerEvent) => {
      pointer.targetX = event.clientX;
      pointer.targetY = event.clientY;
      pointer.active = true;
    };
    const onPointerLeave = () => {
      pointer.active = false;
    };
    const observer = new IntersectionObserver(
      ([entry]) => {
        inView = entry.isIntersecting;
        syncPlayback();
      },
      { rootMargin: '10% 0px' },
    );
    const resizeObserver = new ResizeObserver(resize);
    const themeObserver = new MutationObserver(() => {
      syncTheme();
      syncPlayback();
    });
    observer.observe(host);
    resizeObserver.observe(host);
    window.addEventListener('resize', resize);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    });
    reduced.addEventListener('change', syncPlayback);
    document.addEventListener('visibilitychange', syncPlayback);
    window.addEventListener('pointermove', onPointer, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    const onProbe = (event: Event) => {
      const detail = (
        event as CustomEvent<{
          clock: number;
          motion: number;
          resolve: (value: unknown) => void;
          reject: (error: unknown) => void;
        }>
      ).detail;
      if (!particles) {
        detail.reject(new Error('Particles not ready'));
        return;
      }
      void particles.probe(detail.clock, detail.motion).then(detail.resolve, detail.reject);
    };
    // The readback seam is enabled only by the local audit URL.
    const audit = new URLSearchParams(window.location.search).get('heroAudit') === 'particles';
    if (audit) host.addEventListener('hero-particle-probe', onProbe);

    const initialize = async () => {
      try {
        // Without an adapter the runtime would only fail; skip downloading it.
        const gpuApi = Reflect.get(navigator, 'gpu') as { requestAdapter(): Promise<unknown> };
        const adapter = await gpuApi.requestAdapter().catch(() => null);
        if (disposed) return;
        if (!adapter) {
          failed = true;
          host.dataset.gpuFailure = 'no-adapter';
          host.dataset.heroPlan = 'canvas:no-adapter';
          setRenderer('canvas');
          return;
        }
        const [
          { shaderRendererGPU, rootPassthrough },
          { heroParticleShader, heroParticleUniforms },
          { createHeroParticleLayer },
        ] = await Promise.all([
          import('./hero-shader-runtime'),
          import('./hero-particle-shader'),
          import('./hero-particle-motion'),
        ]);
        if (disposed) return;
        shader = shaderRendererGPU();
        shader.setOnUnavailable((reason) => {
          if (!disposed) {
            failed = true;
            generation++;
            cancelAnimationFrame(frame);
            host.dataset.gpuFailure = reason;
            particles?.cleanup();
            setRenderer('canvas');
          }
        });
        await shader.initialize({ canvas, observeElement: false });
        shader.stopAnimation();
        if (disposed) {
          shader.cleanup();
          return;
        }
        if (shader.getFailureReason()) {
          failed = true;
          setRenderer('canvas');
          shader.cleanup();
          return;
        }
        shader.registerNode(
          'shader-root',
          rootPassthrough.fragment,
          null,
          null,
          {},
          rootPassthrough,
        );
        shader.registerNode(
          'hero',
          heroParticleShader.fragment,
          'shader-root',
          { blendMode: 'normal', opacity: 1, renderOrder: 0 },
          heroParticleUniforms(),
          heroParticleShader,
        );
        const gpu = shader.getInternalRenderer();
        if (!gpu) throw new Error('Hero GPU context unavailable');
        // The library ignores deliberate device destruction. If its shared
        // device disappears while this field is still mounted, recover too.
        void gpu.device.lost.then(() => {
          if (disposed || failed || shader?.getFailureReason()) return;
          failed = true;
          generation++;
          cancelAnimationFrame(frame);
          host.dataset.gpuFailure = 'device-lost';
          particles?.cleanup();
          shader?.cleanup();
          setRenderer('canvas');
        });
        particles = await createHeroParticleLayer(gpu, particleCanvas);
        if (disposed || failed) {
          particles.cleanup();
          shader.cleanup();
          return;
        }
        syncTheme();
        resize();
      } catch (error) {
        failed = true;
        if (!disposed) {
          console.warn('Hero shader unavailable; using the Canvas field.', error);
          setRenderer('canvas');
        }
        particles?.cleanup();
        shader?.cleanup();
      }
    };
    void initialize();

    return () => {
      disposed = true;
      playbackRef.current = null;
      cancelAnimationFrame(frame);
      generation++;
      particles?.cleanup();
      shader?.cleanup();
      if (audit) host.removeEventListener('hero-particle-probe', onProbe);
      observer.disconnect();
      resizeObserver.disconnect();
      window.removeEventListener('resize', resize);
      themeObserver.disconnect();
      reduced.removeEventListener('change', syncPlayback);
      document.removeEventListener('visibilitychange', syncPlayback);
      window.removeEventListener('pointermove', onPointer);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
    };
  }, []);

  useEffect(() => {
    if (hostRef.current) {
      hostRef.current.dataset.intent = props.intent;
      hostRef.current.dataset.phase = props.phase;
    }
    playbackRef.current?.();
  }, [props.intent, props.phase, props.paused]);

  return (
    <div ref={hostRef} className="realtime-field" data-hero-renderer={renderer} aria-hidden="true">
      <canvas
        ref={canvasRef}
        data-hero-layer="medium"
        style={{ width: '100%', height: '100%' }}
        hidden={renderer !== 'webgpu'}
      />
      <canvas
        ref={particleCanvasRef}
        data-hero-layer="particles"
        style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
        hidden={renderer !== 'webgpu'}
      />
      {/* Nothing paints while WebGPU initialises, so there is never a
          Canvas-to-WebGPU change; Canvas mounts only as the fallback. */}
      {renderer === 'canvas' ? <CanvasRealtimeField {...props} /> : null}
    </div>
  );
}
