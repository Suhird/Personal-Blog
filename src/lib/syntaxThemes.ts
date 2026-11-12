import type { CSSProperties } from "react";

/**
 * Syntax highlighting themes.
 *
 * `catppuccinMocha` is the terminal skin's original palette (kept byte-for-byte
 * so the terminal code blocks look exactly as they did before).
 *
 * `paperCodeTheme` is the Reader skin's light, earthy palette: dark warm ink
 * for text, muted brown-grey for comments/punctuation, plum for keywords, sage
 * for strings, rust for numbers, and slate blue for functions/builtins. It is
 * designed to sit on the raised paper surface (#f0e7d6).
 */
type SyntaxTheme = { [key: string]: CSSProperties };

const terminalMono =
  "'JetBrains Mono', 'SFMono-Regular', Consolas, Menlo, monospace";

const paperMono =
  "var(--reader-mono), ui-monospace, SFMono-Regular, Menlo, Consolas, monospace";

export const catppuccinMocha: SyntaxTheme = {
  'pre[class*="language-"]': {
    color: "#CDD6F4",
    background: "#1E1E2E",
    fontFamily: terminalMono,
    fontSize: "0.95rem",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    tabSize: 4,
    hyphens: "none",
    margin: 0,
    padding: "20px",
    overflow: "auto",
  },
  'code[class*="language-"]': {
    color: "#CDD6F4",
    background: "#1E1E2E",
    fontFamily: terminalMono,
    fontSize: "0.95rem",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.5",
    tabSize: 4,
    hyphens: "none",
  },
  comment: {
    color: "#6C7086",
    fontStyle: "italic",
  },
  prolog: {
    color: "#6C7086",
  },
  doctype: {
    color: "#6C7086",
  },
  cdata: {
    color: "#6C7086",
  },
  punctuation: {
    color: "#9399B2",
  },
  property: {
    color: "#89B4FA",
  },
  tag: {
    color: "#89B4FA",
  },
  boolean: {
    color: "#FAB387",
  },
  number: {
    color: "#FAB387",
  },
  constant: {
    color: "#FAB387",
  },
  symbol: {
    color: "#FAB387",
  },
  deleted: {
    color: "#F38BA8",
  },
  selector: {
    color: "#A6E3A1",
  },
  "attr-name": {
    color: "#A6E3A1",
  },
  string: {
    color: "#A6E3A1",
  },
  char: {
    color: "#A6E3A1",
  },
  builtin: {
    color: "#89B4FA",
  },
  inserted: {
    color: "#A6E3A1",
  },
  operator: {
    color: "#94E2D5",
  },
  entity: {
    color: "#F9E2AF",
    cursor: "help",
  },
  url: {
    color: "#89DCEB",
  },
  variable: {
    color: "#CDD6F4",
  },
  atrule: {
    color: "#CBA6F7",
  },
  "attr-value": {
    color: "#A6E3A1",
  },
  function: {
    color: "#89B4FA",
  },
  "class-name": {
    color: "#F9E2AF",
  },
  keyword: {
    color: "#CBA6F7",
    fontStyle: "italic",
  },
  regex: {
    color: "#F9E2AF",
  },
  important: {
    color: "#CBA6F7",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
};

export const paperCodeTheme: SyntaxTheme = {
  'pre[class*="language-"]': {
    color: "#3a322a",
    background: "transparent",
    fontFamily: paperMono,
    fontSize: "0.84rem",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 2,
    hyphens: "none",
    margin: 0,
    padding: 0,
    overflow: "auto",
  },
  'code[class*="language-"]': {
    color: "#3a322a",
    background: "transparent",
    fontFamily: paperMono,
    fontSize: "0.84rem",
    textAlign: "left",
    whiteSpace: "pre",
    wordSpacing: "normal",
    wordBreak: "normal",
    wordWrap: "normal",
    lineHeight: "1.6",
    tabSize: 2,
    hyphens: "none",
  },
  comment: {
    color: "#8a7f70",
    fontStyle: "italic",
  },
  prolog: {
    color: "#8a7f70",
  },
  doctype: {
    color: "#8a7f70",
  },
  cdata: {
    color: "#8a7f70",
  },
  punctuation: {
    color: "#6b5f52",
  },
  property: {
    color: "#3f5f7a",
  },
  tag: {
    color: "#7a4a2a",
  },
  boolean: {
    color: "#9c4a24",
  },
  number: {
    color: "#9c4a24",
  },
  constant: {
    color: "#9c4a24",
  },
  symbol: {
    color: "#9c4a24",
  },
  deleted: {
    color: "#a43d2c",
  },
  selector: {
    color: "#4e6743",
  },
  "attr-name": {
    color: "#7a4a2a",
  },
  string: {
    color: "#4e6743",
  },
  char: {
    color: "#4e6743",
  },
  builtin: {
    color: "#3f5f7a",
  },
  inserted: {
    color: "#4e6743",
  },
  operator: {
    color: "#6b5f52",
  },
  entity: {
    color: "#9c4a24",
    cursor: "help",
  },
  url: {
    color: "#3f5f7a",
  },
  variable: {
    color: "#3a322a",
  },
  atrule: {
    color: "#8b3a62",
  },
  "attr-value": {
    color: "#4e6743",
  },
  function: {
    color: "#3f5f7a",
  },
  "class-name": {
    color: "#3f5f7a",
  },
  keyword: {
    color: "#8b3a62",
    fontStyle: "italic",
  },
  regex: {
    color: "#9c4a24",
  },
  important: {
    color: "#8b3a62",
    fontWeight: "bold",
  },
  bold: {
    fontWeight: "bold",
  },
  italic: {
    fontStyle: "italic",
  },
};
