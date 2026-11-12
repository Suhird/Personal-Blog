import { useEffect, useRef, useState, type ReactNode } from "react";
import { useThemeMode } from "@/components/theme-mode-provider";
import "./BuildCanvas.css";

/**
 * BuildCanvas — lets a small swarm of cursors "construct" real page content.
 *
 * Elements tagged with `data-build="<frameId>"` get a frame drawn around them;
 * elements tagged with `data-type="<textId>"` are typed out character by
 * character (markup, links and wrapping all preserved). Typing runs over the
 * live DOM text nodes, so the caret is measured with a Range and always lands
 * exactly where the next character will appear.
 *
 * Everything is driven by one requestAnimationFrame loop; React renders the
 * structure once.
 */

export type Tone = "cyan" | "purple" | "green" | "yellow";
type Corner = "tl" | "tr" | "br" | "bl" | "c";

export type Target =
  | { frame: string; corner?: Corner }
  | { type: string; edge?: "start" | "end" }
  | { x: number; y: number };

export type Step =
  | { move: Target; dur?: number }
  | { trace: string; dur?: number }
  | { type: string; cps?: number }
  | { click: true }
  | { wait: number };

export interface FrameDef {
  id: string;
  label: string;
  tone: Tone;
  pad?: number;
}

export interface Script {
  id: string;
  name: string;
  tone: Tone;
  /** start position as % of the canvas */
  start: [number, number];
  steps: Step[];
}

interface Props {
  frames: FrameDef[];
  scripts: Script[];
  children: ReactNode;
  variant?: "canvas" | "panel" | "bare";
  caption?: string;
  showMeta?: boolean;
  className?: string;
}

/* ------------------------------- maths ---------------------------- */

interface Pt {
  x: number;
  y: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);

/* ------------------------------- model ---------------------------- */

interface FrameRT {
  def: FrameDef;
  target: HTMLElement;
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  edges: HTMLElement[];
  label: HTMLElement;
  handles: HTMLElement[];
  drawStart: number;
  drawDur: number;
}

interface TextNodeRT {
  node: Text;
  start: number;
  len: number;
  full: string;
}

interface TypeRT {
  id: string;
  el: HTMLElement;
  nodes: TextNodeRT[];
  total: number;
  naturalH: number;
  cps: number;
  typeStart: number;
  typeDur: number;
  applied: number;
}

type Seg =
  | { k: "move"; t0: number; t1: number; from: Pt; to: Pt }
  | { k: "trace"; t0: number; t1: number; frame: FrameRT }
  | { k: "type"; t0: number; t1: number; tt: TypeRT; from: Pt };

interface CursorRT {
  def: Script;
  el: HTMLElement;
  caret: HTMLElement;
  segs: Seg[];
  endAt: number;
  endPos: Pt;
  phase: number;
}

interface Model {
  stage: HTMLElement;
  width: number;
  height: number;
  frames: FrameRT[];
  types: TypeRT[];
  cursors: CursorRT[];
  total: number;
  events: { t: number; x: number; y: number }[];
  rippleLayer: HTMLElement;
  started: boolean;
}

const collectTextNodes = (el: HTMLElement): TextNodeRT[] => {
  const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
  const out: TextNodeRT[] = [];
  let offset = 0;
  let n = walker.nextNode();
  while (n) {
    const node = n as Text;
    const full = node.nodeValue ?? "";
    out.push({ node, start: offset, len: full.length, full });
    offset += full.length;
    n = walker.nextNode();
  }
  return out;
};

const applyTyped = (tt: TypeRT, count: number) => {
  if (count === tt.applied) return;
  tt.applied = count;
  for (const t of tt.nodes) {
    const k = clamp(count - t.start, 0, t.len);
    const value = t.full.slice(0, k);
    if (t.node.nodeValue !== value) t.node.nodeValue = value;
  }
};

const caretAt = (
  stage: HTMLElement,
  range: Range,
  tt: TypeRT,
  count: number,
): Pt => {
  let pick = tt.nodes[0];
  for (const t of tt.nodes) if (count >= t.start) pick = t;
  if (!pick) return { x: 0, y: 0 };
  const offset = clamp(count - pick.start, 0, pick.len);
  const stageRect = stage.getBoundingClientRect();
  try {
    range.setStart(pick.node, offset);
    range.setEnd(pick.node, offset);
    const r = range.getBoundingClientRect();
    return { x: r.left - stageRect.left, y: r.top - stageRect.top };
  } catch {
    const r = (pick.node.parentElement ?? tt.el).getBoundingClientRect();
    return { x: r.left - stageRect.left, y: r.top - stageRect.top };
  }
};

const buildModel = (
  stage: HTMLElement,
  frameDefs: FrameDef[],
  scripts: Script[],
): Model => {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const range = document.createRange();

  /* ---- text targets -------------------------------------------------- */
  const types: TypeRT[] = [];
  stage.querySelectorAll<HTMLElement>("[data-type]").forEach((el) => {
    const id = el.dataset.type ?? "";
    el.style.minHeight = "";
    const nodes = collectTextNodes(el);
    const tt: TypeRT = {
      id,
      el,
      nodes,
      total: nodes.reduce((sum, n) => sum + n.len, 0),
      naturalH: 0,
      cps: 40,
      typeStart: -1,
      typeDur: 0,
      applied: -1,
    };
    applyTyped(tt, tt.total);
    types.push(tt);
  });

  /* ---- frame targets (measured with full text so nothing reflows) ----- */
  const frames: FrameRT[] = frameDefs.map((def) => {
    const target = stage.querySelector<HTMLElement>(`[data-build="${def.id}"]`);
    if (!target) throw new Error(`BuildCanvas: no element tagged data-build="${def.id}"`);
    target.classList.remove("is-built");
    const pad = def.pad ?? 10;
    const r = target.getBoundingClientRect();
    const s = stage.getBoundingClientRect();
    const frameEl = stage.querySelector<HTMLElement>(`[data-frame="${def.id}"]`)!;
    const rt: FrameRT = {
      def,
      target,
      el: frameEl,
      x: r.left - s.left - pad,
      y: r.top - s.top - pad,
      w: r.width + pad * 2,
      h: r.height + pad * 2,
      edges: Array.from(frameEl.querySelectorAll<HTMLElement>("[data-edge]")),
      label: frameEl.querySelector<HTMLElement>("[data-frame-label]")!,
      handles: Array.from(frameEl.querySelectorAll<HTMLElement>("[data-handle]")),
      drawStart: -1,
      drawDur: 1,
    };
    frameEl.style.left = `${rt.x}px`;
    frameEl.style.top = `${rt.y}px`;
    frameEl.style.width = `${rt.w}px`;
    frameEl.style.height = `${rt.h}px`;
    return rt;
  });

  const frameById = new Map(frames.map((f) => [f.def.id, f]));
  const typeById = new Map(types.map((t) => [t.id, t]));

  /* ---- freeze natural heights, then rewind the text ------------------- */
  types.forEach((tt) => {
    tt.naturalH = tt.el.getBoundingClientRect().height;
    tt.el.style.minHeight = `${tt.naturalH}px`;
    applyTyped(tt, 0);
  });

  const caretStart = new Map<string, Pt>();
  types.forEach((tt) => {
    const s = caretAt(stage, range, tt, 0);
    caretStart.set(tt.id, s);
  });

  /* ---- compile the script into timed segments ------------------------- */
  const resolve = (target: Target): Pt => {
    if ("frame" in target) {
      const f = frameById.get(target.frame)!;
      switch (target.corner) {
        case "tr":
          return { x: f.x + f.w, y: f.y };
        case "br":
          return { x: f.x + f.w, y: f.y + f.h };
        case "bl":
          return { x: f.x, y: f.y + f.h };
        case "c":
          return { x: f.x + f.w / 2, y: f.y + f.h / 2 };
        default:
          return { x: f.x, y: f.y };
      }
    }
    if ("type" in target) {
      const tt = typeById.get(target.type)!;
      return caretStart.get(tt.id) ?? { x: 0, y: 0 };
    }
    return { x: (target.x / 100) * W, y: (target.y / 100) * H };
  };

  const events: { t: number; x: number; y: number }[] = [];
  let total = 0;

  const cursors: CursorRT[] = scripts.map((def, index) => {
    let t = 0;
    let pos: Pt = { x: (def.start[0] / 100) * W, y: (def.start[1] / 100) * H };
    const segs: Seg[] = [];

    for (const step of def.steps) {
      if ("move" in step) {
        const to = resolve(step.move);
        const dist = Math.hypot(to.x - pos.x, to.y - pos.y);
        const dur = step.dur ?? clamp(dist / 0.85, 240, 900);
        segs.push({ k: "move", t0: t, t1: t + dur, from: pos, to });
        t += dur;
        pos = to;
      } else if ("trace" in step) {
        const f = frameById.get(step.trace);
        if (!f) continue;
        const dur = step.dur ?? clamp((f.w + f.h) / 1.6, 420, 1100);
        f.drawStart = t;
        f.drawDur = dur;
        segs.push({ k: "trace", t0: t, t1: t + dur, frame: f });
        t += dur;
        pos = { x: f.x, y: f.y };
      } else if ("type" in step) {
        const tt = typeById.get(step.type);
        if (!tt) continue;
        const cps = step.cps ?? 45;
        const dur = Math.max(320, (tt.total / cps) * 1000);
        tt.cps = cps;
        tt.typeStart = t;
        tt.typeDur = dur;
        segs.push({ k: "type", t0: t, t1: t + dur, tt, from: pos });
        t += dur;
        pos = caretAt(stage, range, tt, tt.total);
      } else if ("click" in step) {
        events.push({ t, x: pos.x + 4, y: pos.y + 4 });
        t += 160;
      } else {
        t += step.wait;
      }
    }

    total = Math.max(total, t);
    return {
      def,
      el: stage.querySelector<HTMLElement>(`[data-cursor="${def.id}"]`)!,
      caret: stage.querySelector<HTMLElement>(`[data-caret="${def.id}"]`)!,
      segs,
      endAt: t,
      endPos: pos,
      phase: index * 1.7,
    };
  });

  return {
    stage,
    width: W,
    height: H,
    frames,
    types,
    cursors,
    total: total + 900,
    events,
    rippleLayer: stage.querySelector<HTMLElement>("[data-ripples]")!,
    started: false,
  };
};

/* ------------------------------ component ------------------------- */

const BuildCanvas = ({
  frames,
  scripts,
  children,
  variant = "canvas",
  caption,
  showMeta,
  className,
}: Props) => {
  const stageRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<Model | null>(null);
  const timeRef = useRef(0);
  const controlsRef = useRef<{ skip: () => void; replay: () => void } | null>(null);
  const [phase, setPhase] = useState<"idle" | "playing" | "done">("idle");
  const cfg = useRef({ frames, scripts });
  const { isReader } = useThemeMode();

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    let raf = 0;
    let last = 0;
    let visible = false;
    let started = false;
    let fired = new Set<number>();
    let range = document.createRange();
    let cancelled = false;

    const setStatus = (t: number, m: Model) => {
      const status = statusRef.current;
      if (!status) return;
      const pct = Math.min(99, Math.round((t / m.total) * 100));
      const label = t >= m.total ? "build ok" : `building ${pct}%`;
      if (status.textContent !== label) {
        status.textContent = label;
        status.dataset.state = t >= m.total ? "done" : "busy";
      }
    };

    const render = (t: number) => {
      const m = modelRef.current;
      if (!m) return;

      for (const f of m.frames) {
        const p = f.drawStart < 0 ? 0 : clamp01((t - f.drawStart) / f.drawDur);
        const q = p * 4;
        const seq = [clamp01(q), clamp01(q - 1), clamp01(q - 2), clamp01(q - 3)];
        f.edges.forEach((edge, i) => {
          edge.style.transform = i % 2 === 0 ? `scaleX(${seq[i]})` : `scaleY(${seq[i]})`;
          edge.style.opacity = seq[i] > 0 ? "1" : "0";
        });
        f.label.style.opacity = String(clamp01((p - 0.72) / 0.28) * 0.85);
        f.el.classList.toggle("is-drawn", p >= 1);
        if (p >= 1 && !f.target.classList.contains("is-built")) {
          f.target.classList.add("is-built");
        }
      }

      for (const tt of m.types) {
        if (tt.typeStart < 0) {
          applyTyped(tt, 0);
          continue;
        }
        const chars = Math.min(tt.total, Math.floor(((t - tt.typeStart) / 1000) * tt.cps));
        applyTyped(tt, Math.max(0, chars));
        if (chars >= tt.total) tt.el.style.minHeight = "";
      }

      for (const c of m.cursors) {
        let shape: "arrow" | "ibeam" = "arrow";
        let pos: Pt = c.endPos;
        let typingNow: TypeRT | null = null;

        if (c.segs.length > 0) {
          const first = c.segs[0];
          pos = first.k === "move" ? first.from : c.endPos;
          for (const seg of c.segs) {
            if (t < seg.t0) break;
            const span = Math.max(1, seg.t1 - seg.t0);
            const p = clamp01((t - seg.t0) / span);
            if (seg.k === "move") {
              shape = "arrow";
              pos = { x: lerp(seg.from.x, seg.to.x, easeInOut(p)), y: lerp(seg.from.y, seg.to.y, easeInOut(p)) };
            } else if (seg.k === "trace") {
              shape = "arrow";
              pos = pointOnFrame(seg.frame, p);
            } else if (seg.k === "type") {
              shape = "ibeam";
              typingNow = seg.tt;
              const chars = Math.floor(((t - seg.t0) / 1000) * seg.tt.cps);
              const caret = caretAt(stage, range, seg.tt, Math.max(0, Math.min(chars, seg.tt.total)));
              const k = clamp01((t - seg.t0) / 170);
              pos = {
                x: lerp(seg.from.x, caret.x, easeInOut(k)),
                y: lerp(seg.from.y, caret.y, easeInOut(k)),
              };
            }
            if (t < seg.t1) break;
            if (seg.k === "type") typingNow = null;
          }
        }

        if (t > c.endAt + 250) {
          const s = t * 0.0011 + c.phase;
          pos = { x: pos.x + Math.sin(s) * 6, y: pos.y + Math.cos(s * 1.27) * 4 };
        }

        c.el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        // hidden until the canvas starts; they leave again once the build is done
        c.el.style.opacity =
          !m.started || t >= m.total - 700 || t < 30 ? "0" : "1";
        if (c.el.dataset.shape !== shape) c.el.dataset.shape = shape;
        const flip = pos.x > m.width * 0.82 ? "1" : "0";
        if (c.el.dataset.flip !== flip) c.el.dataset.flip = flip;

        // caret sits on the pointer while this cursor types
        if (typingNow) {
          const chars = Math.floor(((t - (typingNow.typeStart ?? 0)) / 1000) * typingNow.cps);
          const caret = caretAt(stage, range, typingNow, Math.max(0, Math.min(chars, typingNow.total)));
          const size = parseFloat(getComputedStyle(typingNow.el).fontSize) || 14;
          c.caret.style.transform = `translate3d(${caret.x}px, ${caret.y + size * 0.12}px, 0)`;
          c.caret.style.height = `${size * 1.15}px`;
          c.caret.dataset.on = "1";
        } else {
          c.caret.dataset.on = "0";
        }
      }

      m.events.forEach((ev, i) => {
        if (t >= ev.t && !fired.has(i)) {
          fired.add(i);
          const dot = document.createElement("span");
          dot.className = "bc-ripple";
          dot.style.left = `${ev.x}px`;
          dot.style.top = `${ev.y}px`;
          m.rippleLayer.appendChild(dot);
          window.setTimeout(() => dot.remove(), 900);
        }
      });

      setStatus(t, m);
    };

    const finish = (m: Model, restoreAll = false) => {
      timeRef.current = m.total;
      fired = new Set(m.events.map((_, i) => i));
      render(m.total);
      if (restoreAll) {
        // Reader mode shows the finished page: make sure even targets that no
        // script touches end up built, fully typed, and sized naturally.
        m.frames.forEach((f) => {
          f.el.classList.add("is-drawn");
          f.target.classList.add("is-built");
        });
        m.types.forEach((tt) => {
          applyTyped(tt, tt.total);
          tt.el.style.minHeight = "";
        });
        m.rippleLayer.replaceChildren();
      }
      setPhase("done");
    };

    const tick = (now: number) => {
      if (!last) last = now;
      const dt = Math.min(50, now - last);
      last = now;
      const m = modelRef.current;
      if (!m) {
        raf = requestAnimationFrame(tick);
        return;
      }
      if (visible && document.visibilityState !== "hidden" && timeRef.current < m.total) {
        timeRef.current = Math.min(m.total, timeRef.current + dt);
        render(timeRef.current);
        if (timeRef.current >= m.total) setPhase("done");
      }
      raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (started) return;
      started = true;
      if (modelRef.current) modelRef.current.started = true;
      cancelAnimationFrame(raf);
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const measure = (reset: boolean, live = true) => {
      if (!stage.clientWidth) return null;
      range = document.createRange();
      const m = buildModel(stage, cfg.current.frames, cfg.current.scripts);
      modelRef.current = m;
      if (live) {
        stage.classList.add("is-live");
      } else {
        stage.classList.remove("is-live");
      }
      if (reset) {
        timeRef.current = 0;
        fired = new Set();
        m.rippleLayer.replaceChildren();
        render(0);
      } else {
        timeRef.current = Math.min(timeRef.current, m.total);
        render(timeRef.current);
      }
      return m;
    };

    // Reader mode: build the model once, show the finished result immediately,
    // and never start the rAF loop or an IntersectionObserver. Because
    // `isReader` is an effect dependency, toggling skins re-runs this effect —
    // a mid-flight terminal build is cancelled by the cleanup above and snaps
    // to its completed state here.
    if (isReader) {
      const m = measure(true, false);
      if (m) finish(m, true);

      controlsRef.current = {
        skip: () => {
          const current = modelRef.current;
          if (current) finish(current, true);
        },
        replay: () => {
          const next = measure(true, false);
          if (next) finish(next, true);
        },
      };

      return () => {
        cancelled = true;
        cancelAnimationFrame(raf);
        stage.classList.remove("is-live");
      };
    }

    const boot = () => {
      if (cancelled) return;
      const m = measure(true);
      if (!m) return;
      if (reduced) {
        finish(m);
        return;
      }
      setPhase("playing");
      const io = new IntersectionObserver(
        (entries) => {
          const entry = entries[0];
          visible = entry?.isIntersecting ?? false;
          if (visible) {
            start();
          } else if (!started && (entry?.boundingClientRect.top ?? 0) < 0) {
            // the visitor scrolled past before this section was ever built:
            // show the finished result instead of leaving an empty frame
            const m = modelRef.current;
            if (m) finish(m);
          }
        },
        { threshold: 0.12 },
      );
      io.observe(stage);
      observers.push(io);
    };

    const observers: IntersectionObserver[] = [];
    if (document.fonts?.ready) {
      document.fonts.ready.then(boot).catch(boot);
    } else {
      boot();
    }

    controlsRef.current = {
      skip: () => {
        const m = modelRef.current;
        if (m) finish(m);
      },
      replay: () => {
        const m = measure(true);
        if (!m) return;
        visible = true;
        setPhase("playing");
        started = false;
        start();
      },
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        const m = measure(false);
        if (m && timeRef.current >= m.total) finish(m);
      }, 180);
    };
    window.addEventListener("resize", onResize);

    // A jump (deep link, restored scroll, fast flick) can move a section past
    // the viewport without the observer ever seeing it. In that case, render
    // the finished result instead of leaving an empty frame behind.
    let scrollTimer = 0;
    const onScroll = () => {
      if (scrollTimer || started) return;
      scrollTimer = window.setTimeout(() => {
        scrollTimer = 0;
        const m = modelRef.current;
        if (!m || started || timeRef.current >= m.total) return;
        if (stage.getBoundingClientRect().bottom < 0) finish(m);
      }, 180);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      cancelled = true;
      cancelAnimationFrame(raf);
      observers.forEach((o) => o.disconnect());
      window.removeEventListener("resize", onResize);
      window.removeEventListener("scroll", onScroll);
      window.clearTimeout(resizeTimer);
      window.clearTimeout(scrollTimer);
    };
  }, [isReader]);

  const isCanvas = variant === "canvas";
  const isPanel = variant === "panel";
  const withMeta = showMeta ?? variant !== "bare";

  return (
    <div className={`bc-wrap bc-${variant} ${className ?? ""}`}>
      <div className="bc-stage" ref={stageRef}>
        {(isCanvas || isPanel) && <div className="bc-grid" aria-hidden="true" />}

        {isCanvas && (
          <div className="bc-topbar" aria-hidden="true">
            <span className="bc-cmd">
              <span className="bc-prompt">$</span> ./build --about
            </span>
            <span className="bc-status" ref={statusRef} data-state="busy">
              queued
            </span>
          </div>
        )}

        {frames.map((f) => (
          <div className="bc-frame" data-frame={f.id} data-tone={f.tone} key={f.id} aria-hidden="true">
            <span className="bc-edge" data-edge="top" />
            <span className="bc-edge" data-edge="right" />
            <span className="bc-edge" data-edge="bottom" />
            <span className="bc-edge" data-edge="left" />
            <span className="bc-frame-label" data-frame-label>
              {f.label}
            </span>
            {["tl", "tr", "br", "bl"].map((h) => (
              <span className="bc-handle" data-handle={h} key={h} />
            ))}
          </div>
        ))}

        <div className="bc-content">{children}</div>

        <div className="bc-ripples" data-ripples aria-hidden="true" />

        {scripts.map((c) => (
          <div className="bc-cursor" data-cursor={c.id} data-tone={c.tone} data-shape="arrow" key={c.id} aria-hidden="true">
            <svg className="bc-arrow" viewBox="0 0 24 24">
              <path d="M3.6 2.1 3.6 21.3 8.5 16.6 11.9 23.4 15.5 21.7 12.1 15.1 19.2 14.9Z" />
            </svg>
            <svg className="bc-ibeam" viewBox="0 0 16 24">
              <path d="M4 3.2h8M4 20.8h8M8 3.2v17.6" />
            </svg>
            <span className="bc-pill">{c.name}</span>
          </div>
        ))}

        {scripts.map((c) => (
          <span className="bc-caret" data-caret={c.id} data-tone={c.tone} data-on="0" key={`caret-${c.id}`} aria-hidden="true" />
        ))}
      </div>

      {withMeta && (
        <div className={`bc-meta ${caption ? "" : "bc-meta--end"}`}>
          {caption && <span className="bc-meta-note">{caption}</span>}
          <button
            type="button"
            className="bc-btn"
            onClick={() => (phase === "done" ? controlsRef.current?.replay() : controlsRef.current?.skip())}
          >
            {phase === "done" ? "↻ replay" : phase === "idle" ? "↻ replay" : "skip"}
          </button>
        </div>
      )}
    </div>
  );
};

/**
 * A bordered section that hosts several independent canvases and can replay
 * all of them at once by remounting its children.
 */
export const BuildPanel = ({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) => {
  const [token, setToken] = useState(0);
  return (
    <div className={`bc-wrap bc-panel bc-panel--plain ${className ?? ""}`}>
      <div className="bc-stage bc-panel-body" key={token}>
        {children}
      </div>
      <div className="bc-meta bc-meta--end">
        <button type="button" className="bc-btn" onClick={() => setToken((t) => t + 1)}>
          ↻ replay
        </button>
      </div>
    </div>
  );
};

const pointOnFrame = (f: FrameRT, p: number): Pt => {
  const perimeter = 2 * (f.w + f.h);
  const d = clamp01(p) * perimeter;
  if (d <= f.w) return { x: f.x + d, y: f.y };
  if (d <= f.w + f.h) return { x: f.x + f.w, y: f.y + (d - f.w) };
  if (d <= 2 * f.w + f.h) return { x: f.x + f.w - (d - f.w - f.h), y: f.y + f.h };
  return { x: f.x, y: f.y + f.h - (d - 2 * f.w - f.h) };
};

export default BuildCanvas;
