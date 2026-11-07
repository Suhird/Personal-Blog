import { experience } from "@/data/experience";
import type { FrameDef, Script, Tone } from "@/components/build/BuildCanvas";

const TONES: Tone[] = ["cyan", "purple", "green", "yellow"];
const NAMES = ["ada", "grace", "linus", "margaret"];

const shortCompany = (company: string) => company.split("|")[0].split(" - ")[0].trim();

/**
 * Hero: a cursor frames the portrait, another frames the bio column, and the
 * heading plus both paragraphs are typed at the same time by three cursors.
 */
export const HERO_FRAMES: FrameDef[] = [
  { id: "portrait", label: "frame / portrait", tone: "cyan", pad: 10 },
  { id: "bio", label: "frame / bio", tone: "purple", pad: 12 },
];

export const HERO_SCRIPTS: Script[] = [
  {
    id: "ada",
    name: "ada",
    tone: "cyan",
    start: [-12, 48],
    steps: [
      { move: { frame: "portrait", corner: "tl" }, dur: 520 },
      { trace: "portrait", dur: 720 },
      { move: { frame: "portrait", corner: "c" }, dur: 300 },
      { click: true },
    ],
  },
  {
    id: "grace",
    name: "grace",
    tone: "purple",
    start: [58, -12],
    steps: [
      { move: { frame: "bio", corner: "tl" }, dur: 460 },
      { trace: "bio", dur: 900 },
      { move: { type: "heading" }, dur: 260 },
      { type: "heading", cps: 24 },
      { wait: 260 },
    ],
  },
  {
    id: "linus",
    name: "linus",
    tone: "green",
    start: [108, 8],
    steps: [
      { move: { type: "p1" }, dur: 620 },
      { type: "p1", cps: 100 },
    ],
  },
  {
    id: "margaret",
    name: "margaret",
    tone: "yellow",
    start: [18, 112],
    steps: [
      { move: { type: "p2" }, dur: 700 },
      { type: "p2", cps: 100 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Professional Experience — one independent canvas per role, so each  */
/* frame is built when that role scrolls into view.                    */
/* ------------------------------------------------------------------ */

export const entryFrame = (i: number): FrameDef => ({
  id: `job-${i}`,
  label: `frame / ${shortCompany(experience[i].company).toLowerCase()}`,
  tone: TONES[i % TONES.length],
  pad: 10,
});

export const entryScripts = (i: number): Script[] => {
  const first = i % NAMES.length;
  const second = (i + 2) % NAMES.length;
  return [
    {
      id: `a-${i}`,
      name: NAMES[first],
      tone: TONES[i % TONES.length],
      start: [-8, 52],
      steps: [
        { move: { frame: `job-${i}`, corner: "tl" }, dur: 380 },
        { trace: `job-${i}`, dur: 560 },
        { move: { type: `job-${i}-title` }, dur: 170 },
        { type: `job-${i}-title`, cps: 55 },
        { wait: 140 },
      ],
    },
    {
      id: `b-${i}`,
      name: NAMES[second],
      tone: TONES[(i + 1) % TONES.length],
      start: [112, 26],
      steps: [
        { move: { type: `job-${i}-company` }, dur: 420 },
        { type: `job-${i}-company`, cps: 80 },
        { type: `job-${i}-period`, cps: 80 },
      ],
    },
  ];
};

/* ------------------------------------------------------------------ */
/* Skills — one frame around the whole block, four cursors typing it.   */
/* ------------------------------------------------------------------ */

export const SKILLS_FRAMES: FrameDef[] = [
  { id: "skills", label: "frame / skills", tone: "green", pad: 12 },
];

export const SKILLS_SCRIPTS: Script[] = [
  {
    id: "ada",
    name: "ada",
    tone: "green",
    start: [-12, 34],
    steps: [
      { move: { frame: "skills", corner: "tl" }, dur: 420 },
      { trace: "skills", dur: 940 },
      { wait: 120 },
    ],
  },
  {
    id: "grace",
    name: "grace",
    tone: "cyan",
    start: [52, -12],
    steps: [
      { move: { type: "skills-h1" }, dur: 520 },
      { type: "skills-h1", cps: 42 },
      { type: "skills-v1", cps: 90 },
      { type: "skills-h2", cps: 42 },
      { type: "skills-v2", cps: 90 },
    ],
  },
  {
    id: "linus",
    name: "linus",
    tone: "purple",
    start: [112, 44],
    steps: [
      { move: { type: "skills-h3" }, dur: 560 },
      { type: "skills-h3", cps: 42 },
      { type: "skills-v3", cps: 90 },
    ],
  },
  {
    id: "margaret",
    name: "margaret",
    tone: "yellow",
    start: [22, 112],
    steps: [
      { move: { type: "skills-h4" }, dur: 600 },
      { type: "skills-h4", cps: 42 },
      { type: "skills-v4", cps: 90 },
      { type: "skills-h5", cps: 42 },
      { type: "skills-v5", cps: 90 },
    ],
  },
];

/* ------------------------------------------------------------------ */
/* Let's connect — one frame, one cursor typing, links revealed.        */
/* ------------------------------------------------------------------ */

export const CONNECT_FRAMES: FrameDef[] = [
  { id: "connect", label: "frame / contact", tone: "purple", pad: 12 },
];

export const CONNECT_SCRIPTS: Script[] = [
  {
    id: "ada",
    name: "ada",
    tone: "purple",
    start: [-12, 44],
    steps: [
      { move: { frame: "connect", corner: "tl" }, dur: 420 },
      { trace: "connect", dur: 820 },
      { move: { frame: "connect", corner: "br" }, dur: 320 },
      { click: true },
    ],
  },
  {
    id: "grace",
    name: "grace",
    tone: "cyan",
    start: [64, -12],
    steps: [
      { move: { type: "connect-p" }, dur: 520 },
      { type: "connect-p", cps: 95 },
    ],
  },
];
