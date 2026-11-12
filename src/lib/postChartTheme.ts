import type { CSSProperties } from "react";

/**
 * Inline style map of CSS custom properties used by the bespoke, data-rich
 * post components (CanadaBudget2026, CanadianCarOwnership).
 *
 * The chart palette constants in those components read these variables with
 * the original Catppuccin hex values as fallbacks, so the terminal skin renders
 * exactly as before (the variables are simply undefined), while the reader skin
 * overrides them with warm-paper friendly ink and accent tones.
 */
export type PostChartVars = CSSProperties;

export const readerChartVars: PostChartVars = {
  /* Chart series / accents ------------------------------------------------ */
  "--pc-red": "#a43d2c",
  "--pc-peach": "#a05a2c",
  "--pc-orange": "#a05a2c",
  "--pc-yellow": "#8a6a1f",
  "--pc-gold": "#8a6a1f",
  "--pc-green": "#4e6743",
  "--pc-cyan": "#2f6f6a",
  "--pc-blue": "#3f5f7a",
  "--pc-purple": "#6b4a6e",
  "--pc-dark-red": "#8f3222",
  "--pc-muted": "#8a7f70",

  /* Chart chrome ---------------------------------------------------------- */
  "--pc-grid": "#e3d8c3",
  "--pc-axis": "#d6c9b2",
  "--pc-tick": "#675c4f",
  "--pc-tick-muted": "#8a7f70",
  "--pc-hover": "#c9bda8",

  /* Tooltips and separators ----------------------------------------------- */
  "--pc-tooltip-bg": "#f0e7d6",
  "--pc-tooltip-border": "#e3d8c3",
  "--pc-tooltip-text": "#2d2620",
  "--pc-pie-stroke": "#f8f2e6",

  /* Translucent chart fills ----------------------------------------------- */
  "--pc-cursor": "rgba(164, 61, 44, 0.07)",
  "--pc-green-fill": "rgba(78, 103, 67, 0.10)",
  "--pc-red-fill": "rgba(164, 61, 44, 0.08)",
} as unknown as PostChartVars;
