import { useCallback, useEffect, useRef, useState } from "react";
import "./BuildScene.css";

/**
 * "Build scene" — a multi-cursor construction animation for the About page.
 *
 * Several named cursors fly in over a small design canvas, trace the outline of
 * a frame, then type its contents in parallel. When the last frame lands, a
 * marquee selects the whole group and the scene settles.
 *
 * Everything is driven by one requestAnimationFrame loop that writes transforms
 * and text straight to the DOM. React renders the static structure once.
 */

type Tone = "cyan" | "purple" | "green" | "yellow";
type SizeKey = "xl" | "lg" | "md" | "sm";

interface LineDef {
  text: string;
  size: SizeKey;
  dim?: boolean;
}

interface BoxDef {
  id: string;
  /** x, y, width, height as % of the stage */
  rect: [number, number, number, number];
  label: string;
  tone: Tone;
  lines: LineDef[];
}

interface SceneDef {
  boxes: BoxDef[];
  marquee: [number, number, number, number];
}

const DESKTOP_SCENE: SceneDef = {
  boxes: [
    {
      id: "identity",
      rect: [5, 25, 46, 31],
      label: "frame / identity",
      tone: "cyan",
      lines: [
        { text: "Suhird Singh", size: "xl" },
        { text: "senior software engineer", size: "md", dim: true },
      ],
    },
    {
      id: "dayjob",
      rect: [56, 17, 39, 17],
      label: "frame / day job",
      tone: "purple",
      lines: [
        { text: "Mastercard", size: "lg" },
        { text: "threat intelligence · security analytics", size: "sm", dim: true },
      ],
    },
    {
      id: "venture",
      rect: [56, 37, 39, 17],
      label: "frame / venture",
      tone: "green",
      lines: [
        { text: "Founder @ NordHird", size: "lg" },
        { text: "sovereign software for sovereign canada", size: "sm", dim: true },
      ],
    },
    {
      id: "located",
      rect: [5, 61, 27, 12],
      label: "frame / located",
      tone: "yellow",
      lines: [{ text: "Toronto, Canada", size: "md" }],
    },
  ],
  marquee: [2.5, 12, 95, 64],
};

const COMPACT_SCENE: SceneDef = {
  boxes: [
    {
      id: "identity",
      rect: [6, 14, 88, 20],
      label: "frame / identity",
      tone: "cyan",
      lines: [
        { text: "Suhird Singh", size: "xl" },
        { text: "senior software engineer", size: "sm", dim: true },
      ],
    },
    {
      id: "dayjob",
      rect: [6, 39, 88, 13],
      label: "frame / day job",
      tone: "purple",
      lines: [
        { text: "Mastercard", size: "lg" },
        { text: "threat intelligence", size: "sm", dim: true },
      ],
    },
    {
      id: "venture",
      rect: [6, 57, 88, 13],
      label: "frame / venture",
      tone: "green",
      lines: [
        { text: "Founder @ NordHird", size: "lg" },
        { text: "sovereign software", size: "sm", dim: true },
      ],
    },
    {
      id: "located",
      rect: [6, 75, 88, 10],
      label: "frame / located",
      tone: "yellow",
      lines: [{ text: "Toronto, Canada", size: "md" }],
    },
  ],
  marquee: [3, 10, 94, 79],
};

/* ------------------------------------------------------------------ */
/* Cursor choreography                                                 */
/* ------------------------------------------------------------------ */

type Target = { box: string; corner: "tl" | "tr" | "br" | "bl" } | { at: [number, number] };

type Step =
  | { kind: "move"; to: Target; dur: number }
  | { kind: "trace"; box: string; dur: number }
  | { kind: "type"; box: string; line: number; cps: number }
  | { kind: "drag"; dur: number }
  | { kind: "wait"; dur: number }
  | { kind: "click" };

interface CursorDef {
  id: string;
  name: string;
  tone: Tone;
  /** start position as % of the stage */
  start: [number, number];
  steps: Step[];
}

const CURSOR_DEFS: CursorDef[] = [
  {
    id: "ada",
    name: "ada",
    tone: "cyan",
    start: [-14, 62],
    steps: [
      { kind: "move", to: { box: "identity", corner: "tl" }, dur: 640 },
      { kind: "trace", box: "identity", dur: 860 },
      { kind: "type", box: "identity", line: 0, cps: 15 },
      { kind: "type", box: "identity", line: 1, cps: 36 },
    ],
  },
  {
    id: "grace",
    name: "grace",
    tone: "purple",
    start: [48, -18],
    steps: [
      { kind: "move", to: { box: "dayjob", corner: "tl" }, dur: 580 },
      { kind: "trace", box: "dayjob", dur: 600 },
      { kind: "type", box: "dayjob", line: 0, cps: 26 },
      { kind: "type", box: "dayjob", line: 1, cps: 58 },
      { kind: "move", to: { at: [3, 11] }, dur: 480 },
      { kind: "drag", dur: 780 },
      { kind: "wait", dur: 220 },
      { kind: "click" },
    ],
  },
  {
    id: "linus",
    name: "linus",
    tone: "green",
    start: [116, 24],
    steps: [
      { kind: "move", to: { box: "venture", corner: "tl" }, dur: 560 },
      { kind: "trace", box: "venture", dur: 640 },
      { kind: "type", box: "venture", line: 0, cps: 24 },
      { kind: "type", box: "venture", line: 1, cps: 56 },
    ],
  },
  {
    id: "margaret",
    name: "margaret",
    tone: "yellow",
    start: [24, 120],
    steps: [
      { kind: "move", to: { box: "located", corner: "tl" }, dur: 700 },
      { kind: "trace", box: "located", dur: 540 },
      { kind: "type", box: "located", line: 0, cps: 28 },
      { kind: "wait", dur: 380 },
      { kind: "move", to: { at: [73, 70] }, dur: 620 },
      { kind: "wait", dur: 260 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Small math helpers                                                  */
/* ------------------------------------------------------------------ */

interface Pt {
  x: number;
  y: number;
}

const clamp = (v: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, v));
const clamp01 = (v: number) => clamp(v, 0, 1);
const easeInOut = (p: number) => (p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2);
const lerp = (a: number, b: number, p: number) => a + (b - a) * p;

/* ------------------------------------------------------------------ */
/* Runtime model                                                       */
/* ------------------------------------------------------------------ */

interface LineRT {
  el: HTMLElement;
  typed: HTMLElement;
  caret: HTMLElement;
  text: string;
  font: string;
  size: number;
  cps: number;
  typeStart: number;
  typeDur: number;
  lastChars: number;
  left: number;
  top: number;
}

interface BoxRT {
  def: BoxDef;
  el: HTMLElement;
  x: number;
  y: number;
  w: number;
  h: number;
  lines: LineRT[];
  edges: HTMLElement[];
  fill: HTMLElement;
  label: HTMLElement;
  drawStart: number;
  drawDur: number;
}

type Seg =
  | { kind: "move"; t0: number; t1: number; from: Pt; to: Pt }
  | { kind: "trace"; t0: number; t1: number; box: BoxRT }
  | { kind: "type"; t0: number; t1: number; box: BoxRT; line: number; from: Pt }
  | { kind: "drag"; t0: number; t1: number; from: Pt; to: Pt };

interface CursorRT {
  def: CursorDef;
  el: HTMLElement;
  segs: Seg[];
  endAt: number;
  endPos: Pt;
  phase: number;
}

interface Model {
  width: number;
  height: number;
  boxes: BoxRT[];
  cursors: CursorRT[];
  total: number;
  marquee: { el: HTMLElement; label: HTMLElement };
  dragSeg: Extract<Seg, { kind: "drag" }> | null;
  events: { t: number; x: number; y: number }[];
  rippleLayer: HTMLElement;
}

const SIZES = {
  desktop: { xl: 40, lg: 22, md: 16, sm: 12.5 },
  compact: { xl: 30, lg: 19, md: 15, sm: 12 },
};

const pointOnRect = (b: BoxRT, p: number): Pt => {
  const perimeter = 2 * (b.w + b.h);
  const d = clamp01(p) * perimeter;
  if (d <= b.w) return { x: b.x + d, y: b.y };
  if (d <= b.w + b.h) return { x: b.x + b.w, y: b.y + (d - b.w) };
  if (d <= 2 * b.w + b.h) return { x: b.x + b.w - (d - b.w - b.h), y: b.y + b.h };
  return { x: b.x, y: b.y + b.h - (d - 2 * b.w - b.h) };
};

function buildModel(stage: HTMLElement): Model {
  const W = stage.clientWidth;
  const H = stage.clientHeight;
  const compact = W < 640;
  const scene = compact ? COMPACT_SCENE : DESKTOP_SCENE;
  const base = compact ? SIZES.compact : SIZES.desktop;
  const u = compact ? clamp(W / 390, 0.86, 1.08) : clamp(W / 1100, 0.74, 1);
  const sizes = {
    xl: base.xl * u,
    lg: base.lg * u,
    md: base.md * u,
    sm: base.sm * u,
  };

  const family = getComputedStyle(stage).fontFamily || "monospace";
  const ctx = document.createElement("canvas").getContext("2d")!;
  const measure = (text: string, font: string) => {
    ctx.font = font;
    return ctx.measureText(text).width;
  };

  const boxes: BoxRT[] = scene.boxes.map((def) => {
    const el = stage.querySelector<HTMLElement>(`[data-box="${def.id}"]`)!;
    const x = (def.rect[0] / 100) * W;
    const y = (def.rect[1] / 100) * H;
    const w = (def.rect[2] / 100) * W;
    const h = (def.rect[3] / 100) * H;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
    el.style.width = `${w}px`;
    el.style.height = `${h}px`;

    const padX = clamp(w * 0.045, 10, 18);
    const padY = clamp(h * 0.11, 7, 14);
    const textEl = el.querySelector<HTMLElement>("[data-text]")!;
    textEl.style.padding = `${padY}px ${padX}px`;

    const lines: LineRT[] = def.lines.map((lineDef, i) => {
      const lineEl = el.querySelector<HTMLElement>(`[data-line="${i}"]`)!;
      const typed = lineEl.querySelector<HTMLElement>("[data-typed]")!;
      const caret = lineEl.querySelector<HTMLElement>("[data-caret]")!;
      const weight = lineDef.size === "xl" ? 700 : lineDef.size === "lg" ? 600 : 400;
      let size = sizes[lineDef.size];
      let font = `${weight} ${size}px ${family}`;
      const avail = w - padX * 2;
      let guard = 0;
      while (measure(lineDef.text, font) > avail && size > 9.5 && guard < 60) {
        size -= 0.5;
        font = `${weight} ${size}px ${family}`;
        guard += 1;
      }
      lineEl.style.fontSize = `${size}px`;
      lineEl.style.fontWeight = String(weight);
      return {
        el: lineEl,
        typed,
        caret,
        text: lineDef.text,
        font,
        size,
        cps: 30,
        typeStart: -1,
        typeDur: 0,
        lastChars: -1,
        left: 0,
        top: 0,
      };
    });

    const boxRect = el.getBoundingClientRect();
    lines.forEach((line) => {
      const r = line.el.getBoundingClientRect();
      line.left = r.left - boxRect.left;
      line.top = r.top - boxRect.top;
      line.caret.style.height = `${line.size * 1.08}px`;
      line.caret.style.top = `${(r.height - line.size * 1.08) / 2}px`;
    });

    return {
      def,
      el,
      x,
      y,
      w,
      h,
      lines,
      edges: Array.from(el.querySelectorAll<HTMLElement>("[data-edge]")),
      fill: el.querySelector<HTMLElement>("[data-fill]")!,
      label: el.querySelector<HTMLElement>("[data-label]")!,
      drawStart: -1,
      drawDur: 1,
    };
  });

  const byId = new Map(boxes.map((b) => [b.def.id, b]));
  const marqueeRect = {
    x: (scene.marquee[0] / 100) * W,
    y: (scene.marquee[1] / 100) * H,
    w: (scene.marquee[2] / 100) * W,
    h: (scene.marquee[3] / 100) * H,
  };

  const resolve = (target: Target): Pt => {
    if ("box" in target) {
      const b = byId.get(target.box)!;
      switch (target.corner) {
        case "tr":
          return { x: b.x + b.w, y: b.y };
        case "br":
          return { x: b.x + b.w, y: b.y + b.h };
        case "bl":
          return { x: b.x, y: b.y + b.h };
        default:
          return { x: b.x, y: b.y };
      }
    }
    return { x: (target.at[0] / 100) * W, y: (target.at[1] / 100) * H };
  };

  const caretPos = (b: BoxRT, lineIdx: number, chars: number): Pt => {
    const line = b.lines[lineIdx];
    return {
      x: b.x + line.left + measure(line.text.slice(0, chars), line.font),
      y: b.y + line.top + line.size * 0.52,
    };
  };

  const events: { t: number; x: number; y: number }[] = [];
  let dragSeg: Extract<Seg, { kind: "drag" }> | null = null;
  let total = 0;

  const cursors: CursorRT[] = CURSOR_DEFS.map((def, index) => {
    let t = 0;
    let pos: Pt = { x: (def.start[0] / 100) * W, y: (def.start[1] / 100) * H };
    const segs: Seg[] = [];

    for (const step of def.steps) {
      if (step.kind === "move") {
        const to = resolve(step.to);
        segs.push({ kind: "move", t0: t, t1: t + step.dur, from: pos, to });
        t += step.dur;
        pos = to;
      } else if (step.kind === "trace") {
        const b = byId.get(step.box);
        if (!b) continue;
        b.drawStart = t;
        b.drawDur = step.dur;
        segs.push({ kind: "trace", t0: t, t1: t + step.dur, box: b });
        t += step.dur;
        pos = { x: b.x, y: b.y };
      } else if (step.kind === "type") {
        const b = byId.get(step.box);
        const line = b?.lines[step.line];
        if (!b || !line) continue;
        const dur = (line.text.length / step.cps) * 1000;
        line.cps = step.cps;
        line.typeStart = t;
        line.typeDur = dur;
        segs.push({ kind: "type", t0: t, t1: t + dur, box: b, line: step.line, from: pos });
        t += dur;
        pos = caretPos(b, step.line, line.text.length);
      } else if (step.kind === "drag") {
        const to = { x: marqueeRect.x + marqueeRect.w, y: marqueeRect.y + marqueeRect.h };
        const seg: Extract<Seg, { kind: "drag" }> = {
          kind: "drag",
          t0: t,
          t1: t + step.dur,
          from: pos,
          to,
        };
        dragSeg = seg;
        segs.push(seg);
        t += step.dur;
        pos = to;
      } else if (step.kind === "click") {
        events.push({ t, x: pos.x, y: pos.y });
        t += 160;
      } else {
        t += step.dur;
      }
    }

    total = Math.max(total, t);
    return { def, el: stage.querySelector<HTMLElement>(`[data-cursor="${def.id}"]`)!, segs, endAt: t, endPos: pos, phase: index * 1.7 };
  });

  return {
    width: W,
    height: H,
    boxes,
    cursors,
    total: total + 700,
    marquee: {
      el: stage.querySelector<HTMLElement>("[data-marquee]")!,
      label: stage.querySelector<HTMLElement>("[data-mlabel]")!,
    },
    dragSeg,
    events,
    rippleLayer: stage.querySelector<HTMLElement>("[data-ripples]")!,
  };
}

/* ------------------------------------------------------------------ */
/* Component                                                           */
/* ------------------------------------------------------------------ */

const BuildScene = () => {
  const stageRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLSpanElement>(null);
  const modelRef = useRef<Model | null>(null);
  const timeRef = useRef(0);
  const controlsRef = useRef<{ skip: () => void; replay: () => void } | null>(null);
  const [phase, setPhase] = useState<"playing" | "done">("playing");
  const [compact, setCompact] = useState(
    () => typeof window !== "undefined" && window.innerWidth < 640,
  );

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 639px)");
    const onChange = () => setCompact(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  const scene = compact ? COMPACT_SCENE : DESKTOP_SCENE;

  const handleClick = useCallback(() => {
    if (phase === "playing") {
      controlsRef.current?.skip();
    } else {
      controlsRef.current?.replay();
    }
  }, [phase]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const status = statusRef.current;
    const reduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = 0;
    let visible = true;
    let fired = new Set<number>();

    const ctxCache = new Map<string, CanvasRenderingContext2D>();
    const measureCache = (text: string, font: string) => {
      let ctx = ctxCache.get(font);
      if (!ctx) {
        ctx = document.createElement("canvas").getContext("2d")!;
        ctx.font = font;
        ctxCache.set(font, ctx);
      }
      return ctx.measureText(text).width;
    };

    const drawBox = (b: BoxRT, p: number) => {
      const q = p * 4;
      const seq = [clamp01(q), clamp01(q - 1), clamp01(q - 2), clamp01(q - 3)];
      b.edges.forEach((edge, i) => {
        edge.style.transform = i % 2 === 0 ? `scaleX(${seq[i]})` : `scaleY(${seq[i]})`;
        edge.style.opacity = seq[i] > 0 ? "1" : "0";
      });
      b.fill.style.opacity = String(p * 0.55);
      b.label.style.opacity = String(clamp01((p - 0.78) / 0.22) * 0.8);
      b.el.classList.toggle("is-drawn", p >= 1);
    };

    const drawText = (b: BoxRT, t: number) => {
      b.lines.forEach((line) => {
        const chars =
          line.typeStart < 0
            ? 0
            : Math.min(line.text.length, Math.floor(((t - line.typeStart) / 1000) * line.cps));
        const safe = Math.max(0, chars);
        if (safe !== line.lastChars) {
          line.typed.textContent = line.text.slice(0, safe);
          line.lastChars = safe;
          const wpx = safe > 0 ? measureCache(line.text.slice(0, safe), line.font) : 0;
          line.caret.style.transform = `translateX(${wpx}px)`;
        }
        const typing =
          line.typeStart >= 0 && t >= line.typeStart && safe < line.text.length;
        line.caret.style.opacity = typing ? "1" : "0";
      });
    };

    const cursorState = (c: CursorRT, t: number) => {
      let shape: "arrow" | "ibeam" = "arrow";
      if (c.segs.length === 0) return { pos: c.endPos, shape };

      const first = c.segs[0];
      let pos: Pt = first.kind === "move" ? first.from : c.endPos;

      for (const seg of c.segs) {
        if (t < seg.t0) break;
        const span = Math.max(1, seg.t1 - seg.t0);
        const p = clamp01((t - seg.t0) / span);

        if (seg.kind === "move") {
          shape = "arrow";
          pos = { x: lerp(seg.from.x, seg.to.x, easeInOut(p)), y: lerp(seg.from.y, seg.to.y, easeInOut(p)) };
        } else if (seg.kind === "trace") {
          shape = "arrow";
          pos = pointOnRect(seg.box, p);
        } else if (seg.kind === "drag") {
          shape = "arrow";
          pos = { x: lerp(seg.from.x, seg.to.x, easeInOut(p)), y: lerp(seg.from.y, seg.to.y, easeInOut(p)) };
        } else {
          shape = "ibeam";
          const line = seg.box.lines[seg.line];
          const chars =
            t >= seg.t1
              ? line.text.length
              : Math.max(0, Math.floor(((t - seg.t0) / 1000) * line.cps));
          const target = {
            x: seg.box.x + line.left + measureCache(line.text.slice(0, chars), line.font),
            y: seg.box.y + line.top + line.size * 0.52,
          };
          const enter = 170;
          const k = clamp01((t - seg.t0) / enter);
          pos = {
            x: lerp(seg.from.x, target.x, easeInOut(k)),
            y: lerp(seg.from.y, target.y, easeInOut(k)),
          };
        }
        if (t < seg.t1) break;
      }

      // Gentle idle drift once a cursor has finished its script.
      if (t > c.endAt + 250) {
        const s = t * 0.0012 + c.phase;
        pos = {
          x: pos.x + Math.sin(s) * 7,
          y: pos.y + Math.cos(s * 1.27) * 5,
        };
      }
      return { pos, shape };
    };

    const render = (t: number) => {
      const m = modelRef.current;
      if (!m) return;

      for (const b of m.boxes) {
        const p = b.drawStart < 0 ? 0 : clamp01((t - b.drawStart) / b.drawDur);
        drawBox(b, p);
        drawText(b, t);
      }

      for (const c of m.cursors) {
        const { pos, shape } = cursorState(c, t);
        c.el.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0)`;
        if (c.el.dataset.shape !== shape) c.el.dataset.shape = shape;
        const flip = pos.x > m.width * 0.8 ? "1" : "0";
        if (c.el.dataset.flip !== flip) c.el.dataset.flip = flip;
      }

      const d = m.dragSeg;
      if (d) {
        const p = clamp01((t - d.t0) / Math.max(1, d.t1 - d.t0));
        const cur = {
          x: lerp(d.from.x, d.to.x, easeInOut(p)),
          y: lerp(d.from.y, d.to.y, easeInOut(p)),
        };
        m.marquee.el.style.left = `${Math.min(d.from.x, cur.x)}px`;
        m.marquee.el.style.top = `${Math.min(d.from.y, cur.y)}px`;
        m.marquee.el.style.width = `${Math.abs(cur.x - d.from.x)}px`;
        m.marquee.el.style.height = `${Math.abs(cur.y - d.from.y)}px`;
        const fade = clamp01((t - (d.t1 + 1600)) / 700);
        m.marquee.el.style.opacity = t >= d.t0 ? String(1 - fade * 0.88) : "0";
        m.marquee.label.style.opacity = t >= d.t1 ? String(1 - fade) : "0";
      }

      // click ripples
      m.events.forEach((ev, i) => {
        if (t >= ev.t && !fired.has(i)) {
          fired.add(i);
          const dot = document.createElement("span");
          dot.className = "bs-ripple";
          dot.style.left = `${ev.x}px`;
          dot.style.top = `${ev.y}px`;
          m.rippleLayer.appendChild(dot);
          window.setTimeout(() => dot.remove(), 900);
        }
      });

      if (status) {
        const pct = Math.min(99, Math.round((t / m.total) * 100));
        const label = t >= m.total ? `build ok · ${m.boxes.length} frames` : `building ${pct}%`;
        if (status.textContent !== label) {
          status.textContent = label;
          status.dataset.state = t >= m.total ? "done" : "busy";
        }
      }
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

      const active = visible && document.visibilityState !== "hidden";
      if (active) {
        if (timeRef.current < m.total) {
          timeRef.current = Math.min(m.total, timeRef.current + dt);
          render(timeRef.current);
        }
        if (timeRef.current >= m.total) setPhase("done");
        else setPhase("playing");
      }
      raf = requestAnimationFrame(tick);
    };

    const measureAndReload = () => {
      if (!stage.clientWidth) return;
      modelRef.current = buildModel(stage);
      stage.classList.add("is-live");
      render(timeRef.current);
    };

    const startLoop = () => {
      cancelAnimationFrame(raf);
      last = 0;
      raf = requestAnimationFrame(tick);
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries[0]?.isIntersecting ?? true;
      },
      { threshold: 0.05 },
    );

    const boot = () => {
      measureAndReload();
      if (reduced) {
        timeRef.current = modelRef.current?.total ?? 0;
        render(timeRef.current);
        setPhase("done");
        return;
      }
      startLoop();
      io.observe(stage);
    };

    if (document.fonts?.ready) {
      document.fonts.ready.then(boot).catch(boot);
    } else {
      boot();
    }

    controlsRef.current = {
      skip: () => {
        const m = modelRef.current;
        if (!m) return;
        timeRef.current = m.total;
        fired = new Set(m.events.map((_, i) => i));
        render(m.total);
        window.setTimeout(() => {
          const st = statusRef.current;
          if (st) {
            st.textContent = `build ok · ${m.boxes.length} frames`;
            st.dataset.state = "done";
          }
        }, 0);
      },
      replay: () => {
        const m = modelRef.current;
        if (!m) return;
        fired = new Set();
        m.rippleLayer.replaceChildren();
        timeRef.current = 0;
        render(0);
        startLoop();
      },
    };

    let resizeTimer = 0;
    const onResize = () => {
      window.clearTimeout(resizeTimer);
      resizeTimer = window.setTimeout(() => {
        fired = new Set();
        measureAndReload();
        if (modelRef.current) {
          timeRef.current = Math.min(timeRef.current, modelRef.current.total);
        }
        render(timeRef.current);
      }, 160);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(raf);
      io.disconnect();
      window.removeEventListener("resize", onResize);
      window.clearTimeout(resizeTimer);
    };
  }, []);

  return (
    <div className="bs-wrap">
      <div className="bs-stage" ref={stageRef} aria-hidden="true">
        <div className="bs-grid" />
        <div className="bs-glow" />

        <div className="bs-topbar">
          <span className="bs-cmd">
            <span className="bs-prompt">$</span> ./build --about
          </span>
          <span className="bs-status" ref={statusRef} data-state="busy">
            queued
          </span>
        </div>

        {scene.boxes.map((box) => (
          <div className="bs-box" data-box={box.id} data-tone={box.tone} key={box.id}>
            <span className="bs-fill" data-fill />
            <span className="bs-edge" data-edge="top" />
            <span className="bs-edge" data-edge="right" />
            <span className="bs-edge" data-edge="bottom" />
            <span className="bs-edge" data-edge="left" />
            <span className="bs-boxlabel" data-label>
              {box.label}
            </span>
            <div className="bs-text" data-text>
              {box.lines.map((line, i) => (
                <div
                  className="bs-line"
                  data-line={i}
                  data-dim={line.dim ? "1" : "0"}
                  key={`${box.id}-${i}`}
                >
                  <span data-typed />
                  <span className="bs-caret" data-caret />
                </div>
              ))}
            </div>
            {["tl", "tr", "br", "bl"].map((h) => (
              <span className="bs-handle" data-handle={h} key={h} />
            ))}
          </div>
        ))}

        <div className="bs-marquee" data-marquee>
          <span className="bs-mlabel" data-mlabel>
            {scene.boxes.length} frames selected
          </span>
        </div>

        <span className="bs-hint">// drag to pan · scroll to zoom</span>

        <div className="bs-ripples" data-ripples />

        {CURSOR_DEFS.map((c) => (
          <div className="bs-cursor" data-cursor={c.id} data-tone={c.tone} data-shape="arrow" key={c.id}>
            <svg className="bs-arrow" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M3.6 2.1 3.6 21.3 8.5 16.6 11.9 23.4 15.5 21.7 12.1 15.1 19.2 14.9Z" />
            </svg>
            <svg className="bs-ibeam" viewBox="0 0 16 24" aria-hidden="true">
              <path d="M4 3.2h8M4 20.8h8M8 3.2v17.6" />
            </svg>
            <span className="bs-pill">{c.name}</span>
          </div>
        ))}
      </div>

      <div className="bs-meta">
        <span className="bs-meta-note">fig. 01 — four cursors build this page</span>
        <button type="button" className="bs-btn" onClick={handleClick}>
          {phase === "done" ? "↻ replay" : "skip"}
        </button>
      </div>
    </div>
  );
};

export default BuildScene;
