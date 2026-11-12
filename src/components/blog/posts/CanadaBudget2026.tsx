import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useRef } from "react";
import { useThemeMode } from "@/components/theme-mode-provider";
import { readerChartVars } from "@/lib/postChartTheme";

/* ─────────────────────────── Theme ─────────────────────────── */

// Each value is a CSS variable with the original Catppuccin colour as the
// fallback. Terminal mode never defines the variables, so it renders exactly
// as before; reader mode sets them on the post root (see readerChartVars).
const C = {
  red: "var(--pc-red, #f38ba8)",
  peach: "var(--pc-peach, #fab387)",
  yellow: "var(--pc-yellow, #f9e2af)",
  green: "var(--pc-green, #a6e3a1)",
  cyan: "var(--pc-cyan, #89dceb)",
  blue: "var(--pc-blue, #89b4fa)",
  purple: "var(--pc-purple, #cba6f7)",
  muted: "var(--pc-muted, #6c7086)",
  grid: "var(--pc-grid, #313244)",
  axis: "var(--pc-axis, #45475a)",
};

const tickColor = "var(--pc-tick, #a6adc8)";
const cursorFill = "var(--pc-cursor, rgba(203,166,247,0.06))";
const pieStroke = "var(--pc-pie-stroke, #11111b)";

const tick = { fill: tickColor, fontSize: 11, fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace" };
const axisLine = { stroke: C.axis };

/* ─────────────────────────── Data ─────────────────────────── */

const deficitData = [
  { year: "2025–26", deficit: 39.3, deficitPct: 1.2, debtPct: 40.2 },
  { year: "2026–27", deficit: 62.3, deficitPct: 1.8, debtPct: 39.9 },
  { year: "2027–28", deficit: 62.5, deficitPct: 1.8, debtPct: 40.2 },
  { year: "2028–29", deficit: 57.6, deficitPct: 1.6, debtPct: 40.4 },
  { year: "2029–30", deficit: 53.4, deficitPct: 1.4, debtPct: 40.3 },
  { year: "2030–31", deficit: 52.9, deficitPct: 1.3, debtPct: 40.1 },
];

const debtChargeData = [
  { year: "2025–26", charges: 53.5 },
  { year: "2026–27", charges: 60.2 },
  { year: "2027–28", charges: 67.3 },
  { year: "2028–29", charges: 73.8 },
  { year: "2029–30", charges: 78.4 },
  { year: "2030–31", charges: 85.5 },
];

const revenueData = [
  { name: "Personal income tax", value: 258.7, color: C.blue },
  { name: "Corporate income tax", value: 102.7, color: C.purple },
  { name: "GST", value: 51.5, color: C.green },
  { name: "EI premiums", value: 34.3, color: C.cyan },
  { name: "Other", value: 93.2, color: C.muted },
];

const measureData = [
  { short: "Investment", amount: 51.9, color: C.purple },
  { short: "Competitive", amount: 15.1, color: C.cyan },
  { short: "Affordable life", amount: 30.6, color: C.green },
  { short: "Strong & united", amount: 34.6, color: C.yellow },
  { short: "Safe & sovereign", amount: 6.5, color: C.red },
  { short: "Efficient gov't", amount: 3.1, color: C.muted },
];

const cashData = [
  { label: "Cumulative deficit", value: 288.7, color: C.blue },
  { label: "Cash requirement", value: 764.7, color: C.red },
];

const scores = [
  { label: "Business investment", score: 8, color: C.green, note: "METR falls to 6.4%; permanent expensing; $15M capital-gains exemption." },
  { label: "Energy & infrastructure", score: 8, color: C.green, note: "$50B grid strategy, nuclear, critical minerals, defence industrial base." },
  { label: "Tax simplification", score: 7, color: C.green, note: "Real relief for filers, but the $30K GST threshold is untouched." },
  { label: "Affordability", score: 6, color: C.yellow, note: "Well-targeted, but temporary and deficit-financed." },
  { label: "Long-term sustainability", score: 5, color: C.yellow, note: "Debt charges reach 13.6 cents of every revenue dollar by 2031." },
  { label: "Transparency", score: 4, color: C.red, note: "The $765B cash requirement sits in an annex table." },
  { label: "Fiscal discipline", score: 3, color: C.red, note: "A $27.5B windfall became $142B of new measures." },
];

/* ─────────────────────────── Primitives ─────────────────────────── */

type TipEntry = {
  name?: string | number;
  value?: string | number;
  color?: string;
  payload?: { color?: string };
};

type TipProps = {
  active?: boolean;
  label?: string | number;
  payload?: TipEntry[];
};

const tipShell = {
  background: "var(--pc-tooltip-bg, #1e1e2e)",
  borderColor: "var(--pc-tooltip-border, #45475a)",
  color: "var(--pc-tooltip-text, #cdd6f4)",
};

const ChartTip = ({ active, payload, label }: TipProps) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl" style={tipShell}>
      {label ? <div className="mb-1 font-bold">{label}</div> : null}
      {payload.map((entry, i) => (
        <div key={i} className="flex items-center gap-2" style={{ color: entry.color || entry.payload?.color }}>
          <span>{entry.name}:</span>
          <span className="font-bold">
            {typeof entry.value === "number" ? entry.value.toLocaleString() : entry.value}
          </span>
        </div>
      ))}
    </div>
  );
};

const PieTip = ({ active, payload }: TipProps) => {
  if (!active || !payload?.length) return null;
  const p = payload[0];
  return (
    <div className="rounded-lg border px-3 py-2 text-xs shadow-xl" style={tipShell}>
      <span style={{ color: p.payload?.color }} className="font-bold">
        {p.name}: ${Number(p.value ?? 0).toFixed(1)}B
      </span>
    </div>
  );
};

const Panel = ({
  title,
  kicker,
  children,
  className = "",
}: {
  title: string;
  kicker?: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <section className={`rounded-xl border border-border bg-card/40 p-5 md:p-6 ${className}`}>
    <div className="mb-4">
      {kicker ? (
        <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-terminal-comment">{kicker}</div>
      ) : null}
      <h3 className="mt-1 block text-base font-bold text-foreground md:text-lg">{title}</h3>
    </div>
    {children}
  </section>
);

const Stat = ({
  label,
  value,
  note,
  tone = "default",
}: {
  label: string;
  value: string;
  note?: string;
  tone?: "default" | "purple" | "red" | "yellow" | "green" | "cyan";
}) => {
  const tones: Record<string, string> = {
    default: "text-foreground",
    purple: "text-terminal-purple",
    red: "text-terminal-red",
    yellow: "text-terminal-yellow",
    green: "text-terminal-green",
    cyan: "text-terminal-cyan",
  };
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-terminal-comment">{label}</div>
      <div className={`mt-1 text-xl font-extrabold tracking-tight md:text-2xl ${tones[tone]}`}>{value}</div>
      {note ? <div className="mt-1 text-[11px] leading-snug text-terminal-comment">{note}</div> : null}
    </div>
  );
};

const Callout = ({
  title,
  tone = "purple",
  children,
}: {
  title: string;
  tone?: "purple" | "red" | "green" | "yellow" | "cyan";
  children: React.ReactNode;
}) => {
  const tones: Record<string, { border: string; bg: string; text: string }> = {
    purple: { border: "border-terminal-purple", bg: "bg-terminal-purple/5", text: "text-terminal-purple" },
    red: { border: "border-terminal-red", bg: "bg-terminal-red/5", text: "text-terminal-red" },
    green: { border: "border-terminal-green", bg: "bg-terminal-green/5", text: "text-terminal-green" },
    yellow: { border: "border-terminal-yellow", bg: "bg-terminal-yellow/5", text: "text-terminal-yellow" },
    cyan: { border: "border-terminal-cyan", bg: "bg-terminal-cyan/5", text: "text-terminal-cyan" },
  };
  const t = tones[tone];
  return (
    <div className={`my-5 rounded-r-lg border-l-4 ${t.border} ${t.bg} px-4 py-4 md:px-5`}>
      <div className={`mb-1 text-[11px] font-bold uppercase tracking-[0.18em] ${t.text}`}>{title}</div>
      <div className="space-y-2 text-sm leading-relaxed text-terminal-foreground/85">{children}</div>
    </div>
  );
};

const Chip = ({ children, tone = "green" }: { children: React.ReactNode; tone?: "green" | "red" | "yellow" | "cyan" }) => {
  const tones = {
    green: "border-terminal-green/30 bg-terminal-green/10 text-terminal-green",
    red: "border-terminal-red/30 bg-terminal-red/10 text-terminal-red",
    yellow: "border-terminal-yellow/30 bg-terminal-yellow/10 text-terminal-yellow",
    cyan: "border-terminal-cyan/30 bg-terminal-cyan/10 text-terminal-cyan",
  };
  return (
    <span className={`inline-block rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-wider ${tones[tone]}`}>
      {children}
    </span>
  );
};

const Th = ({ children, right = false }: { children: React.ReactNode; right?: boolean }) => (
  <th
    className={`border-b border-border px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-terminal-comment ${
      right ? "text-right" : "text-left"
    }`}
  >
    {children}
  </th>
);

const Td = ({ children, className = "", right = false }: { children: React.ReactNode; className?: string; right?: boolean }) => (
  <td className={`border-b border-border/70 px-3 py-2 align-top ${right ? "text-right" : ""} ${className}`}>{children}</td>
);

/* ─────────────────────────── Post ─────────────────────────── */

const CanadaBudget2026 = () => {
  const { isReader } = useThemeMode();
  const tabsBarRef = useRef<HTMLDivElement>(null);
  const tabsRootRef = useRef<HTMLDivElement>(null);

  const handleTabChange = () => {
    const el = tabsRootRef.current;
    if (!el) return;
    const target = Math.max(0, el.getBoundingClientRect().top + window.scrollY - 8);
    if (Math.abs(window.scrollY - target) > 4) {
      window.scrollTo({ top: target, behavior: isReader ? "auto" : "smooth" });
    }
  };

  return (
    <div className="space-y-6" style={isReader ? readerChartVars : undefined}>
      {/* Hero */}
      <div
        className={`relative mb-2 overflow-hidden rounded-2xl border border-border p-6 md:p-8 ${
          isReader ? "" : "bg-gradient-to-br from-[#11111b] via-[#181825] to-[#1e1e2e]"
        }`}
        style={isReader ? { background: "var(--reader-paper-raised)", borderColor: "var(--reader-rule)" } : undefined}
      >
        {isReader ? null : (
          <div className="pointer-events-none absolute -right-24 -top-24 h-72 w-72 rounded-full bg-[radial-gradient(circle,rgba(203,166,247,0.14)_0%,transparent_70%)]" />
        )}
        <div className="relative">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <Chip tone="cyan">🍁 Federal Budget 2026</Chip>
            <Chip tone="yellow">Tabled November 5, 2026</Chip>
            <Chip tone="green">Second Carney budget</Chip>
          </div>
          <p className="max-w-3xl text-lg font-bold leading-snug text-foreground md:text-2xl">
            The government called it <span className="text-terminal-purple">“Masters of our destiny.”</span> The ledger
            calls it a $62.3 billion deficit and a $765 billion cash requirement.
          </p>
          <p className="mt-3 max-w-3xl text-sm leading-relaxed text-terminal-comment">
            A data-first reading of Ottawa&apos;s second Carney budget: what it spends, what it taxes, what the headline
            leaves out, and what it actually changes for households and founders.
          </p>

          <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Deficit, 2026–27" value="$62.3B" note="Up from $39.3B; 1.8% of GDP" tone="red" />
            <Stat label="New measures, 5 years" value="$142.1B" note="$141.8B net cost in the fiscal table" tone="purple" />
            <Stat label="Cash requirement, 5 years" value="$764.7B" note="2.6× the cumulative deficit" tone="red" />
            <Stat label="Debt charges, 2030–31" value="$85.5B" note="13.6 cents per revenue dollar" tone="red" />
          </div>

          <p className="mt-4 text-[10px] leading-relaxed text-terminal-comment/70">
            Source: Budget 2026, Tables A1.4, A1.8, A1.9 and A1.11. Nominal Canadian dollars. Totals may not add due to
            rounding.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div ref={tabsRootRef}>
      <Tabs defaultValue="overview" className="w-full" onValueChange={handleTabChange}>
        <div
          ref={tabsBarRef}
          className="z-20 -mx-2 mb-5 overflow-x-auto border-y border-border bg-terminal-background/95 px-2 py-2 backdrop-blur md:sticky md:top-0"
        >
          <TabsList className="h-auto w-max gap-1 rounded-none bg-transparent p-0">
            {[
              ["overview", "01 · Overview"],
              ["deficit", "02 · Deficit"],
              ["spending", "03 · Spending"],
              ["revenue", "04 · Revenue & debt"],
              ["taxes", "05 · Taxes"],
              ["verdict", "06 · Verdict"],
            ].map(([value, label]) => (
              <TabsTrigger
                key={value}
                value={value}
                className="rounded-md border border-transparent px-3 py-2 text-[10px] font-bold uppercase tracking-wider text-terminal-comment transition-colors hover:text-terminal-foreground data-[state=active]:border-terminal-purple/40 data-[state=active]:bg-terminal-purple/10 data-[state=active]:text-terminal-purple data-[state=active]:shadow-none"
              >
                {label}
              </TabsTrigger>
            ))}
          </TabsList>
        </div>

        {/* ── 01 Overview ── */}
        <TabsContent value="overview" className="mt-0 space-y-5">
          <Panel kicker="The short version" title="A windfall budget, not a crisis budget">
            <div className="space-y-3 text-sm leading-relaxed text-terminal-foreground/85">
              <p className="m-0">
                The 2025–26 deficit landed at <strong className="text-terminal-green">$39.3 billion</strong>, $27.5
                billion better than the Spring Economic Update forecast. For 2026–27 the underlying forecast improved by
                another $21.5 billion. Ottawa spent most of that improvement: $15.2 billion in new measures next year, and
                $141.8 billion over five years — $142.1 billion on the government&apos;s headline count. Across the full
                five-year horizon, better forecasts added $158.3 billion to the bottom line. The measures cost $141.8
                billion. That leaves about $16.5 billion of fiscal room — roughly a dime of every dollar of improvement.
              </p>
              <p className="m-0">
                The deficit rises from $39.3 billion to <strong className="text-terminal-red">$62.3 billion</strong>. It
                stays near $62 billion for two years, then falls slowly to $52.9 billion by 2030–31. The deficit-to-GDP
                ratio declines from 1.8% to 1.3%. The federal debt-to-GDP ratio does not: it dips to 39.9% next year, then
                climbs back above 40% and ends at 40.1%, roughly where it started.
              </p>
              <p className="m-0">
                That is the budget in two paragraphs: a better forecast, spent rather than banked.
              </p>
            </div>
          </Panel>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            <Stat label="Revenue, 2026–27" value="$540.3B" note="16.2% → 15.8% of GDP" tone="cyan" />
            <Stat label="Program spending" value="$542.7B" note="Before actuarial losses" tone="purple" />
            <Stat label="Public debt charges" value="$60.2B" note="11.1% of revenue" tone="red" />
            <Stat label="Budgetary deficit" value="$62.3B" note="1.8% of GDP" tone="red" />
          </div>

          <Panel kicker="Chart 1" title="The deficit never gets back below $50 billion">
            <div aria-label="Bar chart of the federal deficit from 2025-26 to 2030-31">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={deficitData} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="year" tick={tick} axisLine={axisLine} tickLine={false} />
                  <YAxis
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}B`}
                    domain={[0, 70]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: cursorFill }} />
                  <Bar dataKey="deficit" name="Deficit ($B)" radius={[4, 4, 0, 0]} maxBarSize={40}>
                    {deficitData.map((d, i) => (
                      <Cell key={i} fill={d.deficit > 55 ? C.red : d.deficit > 45 ? C.peach : C.green} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-terminal-comment">
              The 2025–26 figure is the preliminary result. Everything after it is the budget projection. The green bar is
              the only year in the window below $50 billion.
            </p>
          </Panel>

          <Panel kicker="The math" title="How a $3 billion improvement became a $62.3 billion deficit">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="my-0 w-full text-sm" style={{ tableLayout: "auto" }}>
                <thead className="bg-muted/60">
                  <tr>
                    <Th>Line</Th>
                    <Th right>2026–27 ($B)</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td>Spring Economic Update deficit</Td>
                    <Td right className="font-bold text-terminal-comment">−65.3</Td>
                  </tr>
                  <tr>
                    <Td>Economic and fiscal developments</Td>
                    <Td right className="font-bold text-terminal-green">+21.5</Td>
                  </tr>
                  <tr>
                    <Td>Deficit before new policy</Td>
                    <Td right className="font-bold text-terminal-cyan">−43.8</Td>
                  </tr>
                  <tr>
                    <Td>Policy actions since the spring update</Td>
                    <Td right className="font-bold text-terminal-red">−3.2</Td>
                  </tr>
                  <tr>
                    <Td>Budget 2026 measures</Td>
                    <Td right className="font-bold text-terminal-red">−15.2</Td>
                  </tr>
                  <tr>
                    <Td className="font-bold text-foreground">Budget 2026 deficit</Td>
                    <Td right className="font-bold text-terminal-red">−62.3</Td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-terminal-comment">
              Source: Budget 2026, Table A1.4. A negative number is a deficit. Components may not add exactly because of
              rounding.
            </p>
          </Panel>

          <Callout title="The $3 billion headline" tone="yellow">
            <p className="m-0">
              The government can say the 2026–27 deficit is $3 billion lower than the spring update. That is true. It is
              also true that the economy improved by $21.5 billion and the government spent $18.4 billion of it. Without
              the new measures, the deficit would have been <strong>$43.8 billion</strong>.
            </p>
            <p className="m-0">
              A lower deficit and a large new spending plan are not contradictions. They are the same decision, viewed
              from different baselines.
            </p>
          </Callout>
        </TabsContent>

        {/* ── 02 Deficit ── */}
        <TabsContent value="deficit" className="mt-0 space-y-5">
          <Panel kicker="Chart 2" title="The deficit falls. The debt ratio barely moves.">
            <div aria-label="Combined chart of deficit in billions and federal debt as a share of GDP">
              <ResponsiveContainer width="100%" height={330}>
                <ComposedChart data={deficitData} margin={{ top: 8, right: 0, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="year" tick={tick} axisLine={axisLine} tickLine={false} />
                  <YAxis
                    yAxisId="left"
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}B`}
                    domain={[0, 70]}
                    ticks={[0, 10, 20, 30, 40, 50, 60, 70]}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${v}%`}
                    domain={[38, 42]}
                    ticks={[38, 39, 40, 41, 42]}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: cursorFill }} />
                  <Legend wrapperStyle={{ fontSize: 11, color: tickColor }} />
                  <Bar yAxisId="left" dataKey="deficit" name="Deficit ($B)" radius={[4, 4, 0, 0]} maxBarSize={36}>
                    {deficitData.map((d, i) => (
                      <Cell key={i} fill={d.deficit > 55 ? C.red : d.deficit > 45 ? C.peach : C.green} />
                    ))}
                  </Bar>
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="debtPct"
                    name="Federal debt (% of GDP)"
                    stroke={C.purple}
                    strokeWidth={2}
                    dot={{ r: 3, fill: C.purple }}
                    activeDot={{ r: 5 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </Panel>

          <Panel kicker="Table A1.8" title="The fiscal path, year by year">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="my-0 w-full min-w-[620px] text-sm" style={{ tableLayout: "auto" }}>
                <thead className="bg-muted/60">
                  <tr>
                    <Th>Fiscal year</Th>
                    <Th right>Deficit ($B)</Th>
                    <Th right>Deficit (% GDP)</Th>
                    <Th right>Federal debt (% GDP)</Th>
                  </tr>
                </thead>
                <tbody>
                  {deficitData.map((row) => (
                    <tr key={row.year}>
                      <Td className="font-bold text-foreground">{row.year}</Td>
                      <Td right className={row.deficit > 55 ? "font-bold text-terminal-red" : "text-terminal-foreground/80"}>
                        {row.deficit.toFixed(1)}
                      </Td>
                      <Td right className="text-terminal-foreground/80">−{row.deficitPct.toFixed(1)}%</Td>
                      <Td right className="text-terminal-foreground/80">{row.debtPct.toFixed(1)}%</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-terminal-comment">
              2025–26 is preliminary; the rest are projections. Net debt rises from $1.45 trillion to $1.92 trillion over
              the same period — an increase of $465.8 billion.
            </p>
          </Panel>

          <Callout title="The anchor problem" tone="red">
            <p className="m-0">
              The government&apos;s anchor is a declining <strong>deficit-to-GDP ratio</strong>. The IMF and several
              independent analysts would rather see a declining <strong>debt-to-GDP ratio</strong>. The difference
              matters. A deficit ratio can fall because GDP grows faster than the deficit, even while the debt stock rises.
            </p>
            <p className="m-0">
              Over this horizon the debt ratio ends at 40.1%, just 0.1 points below where it started, after spending three
              years at or above it. The debt stock still grows by $465.8 billion. Both statements are true; only one of
              them is an anchor.
            </p>
            <p className="m-0">
              One more distinction: the budget says day-to-day operating spending will be balanced with revenue by 2027–28.
              That is not a balanced budget. It depends on the operating/capital split, which the PBO has criticised as
              unclear. The headline table does not show it.
            </p>
          </Callout>

          <Panel kicker="Outside the document" title="What independent analysts see">
            <div className="grid gap-3 md:grid-cols-2">
              {[
                {
                  who: "Parliamentary Budget Officer",
                  what: "October 2026 outlook",
                  text: "Before the budget, it projected $333 billion in cumulative deficits and $733 billion in federal borrowing over five years. It warned that the accounting obscures the scale of cash debt.",
                },
                {
                  who: "International Monetary Fund",
                  what: "2026 Article IV review",
                  text: "Recommended that Ottawa reinstate a declining debt-to-GDP ratio as its primary anchor to strengthen discipline, transparency and credibility.",
                },
                {
                  who: "C.D. Howe Institute",
                  what: "Budget 2026 review",
                  text: "“Ottawa spent the windfall and left Canadians with the deficit.” Says the anchors have imposed limited fiscal discipline.",
                },
                {
                  who: "RBC Economics",
                  what: "Budget analysis",
                  text: "“Windfall fuels spending, not savings.” Notes the deficit path is roughly flat versus the spring update from 2026–27 onward.",
                },
              ].map((item) => (
                <div key={item.who} className="rounded-lg border border-border bg-card/60 p-4">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-terminal-cyan">{item.what}</div>
                  <div className="mt-1 text-sm font-bold text-foreground">{item.who}</div>
                  <p className="mt-2 text-xs leading-relaxed text-terminal-comment">{item.text}</p>
                </div>
              ))}
            </div>
          </Panel>
        </TabsContent>

        {/* ── 03 Spending ── */}
        <TabsContent value="spending" className="mt-0 space-y-5">
          <Panel kicker="Chart 3" title="Where the $142 billion goes, by budget chapter">
            <div aria-label="Horizontal bar chart of five-year measure costs by budget chapter">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={measureData} layout="vertical" margin={{ top: 0, right: 30, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                  <XAxis type="number" tick={tick} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}B`} />
                  <YAxis
                    type="category"
                    dataKey="short"
                    width={104}
                    tick={{ fill: tickColor, fontSize: 10, fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: cursorFill }} />
                  <Bar dataKey="amount" name="Five-year cost ($B)" radius={[0, 4, 4, 0]} maxBarSize={22}>
                    {measureData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-terminal-comment">
              Sum of Budget 2026 measures in Table A1.4: $141.8 billion. The government&apos;s headline count is $142.1
              billion. The largest chapter is the investment supercycle, at $51.9 billion over five years.
            </p>
          </Panel>

          <Panel kicker="The decoder" title="Four numbers, four different horizons">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="my-0 w-full min-w-[640px] text-sm" style={{ tableLayout: "auto" }}>
                <thead className="bg-muted/60">
                  <tr>
                    <Th>Number</Th>
                    <Th>What it is</Th>
                    <Th>Horizon</Th>
                    <Th>Basis</Th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <Td className="font-bold text-terminal-purple">$142.1B</Td>
                    <Td>New spending and tax measures</Td>
                    <Td>5 years</Td>
                    <Td>Net fiscal cost</Td>
                  </tr>
                  <tr>
                    <Td className="font-bold text-terminal-red">$700B+</Td>
                    <Td>Defence investments</Td>
                    <Td>5 years</Td>
                    <Td>Cash basis</Td>
                  </tr>
                  <tr>
                    <Td className="font-bold text-terminal-green">$32B</Td>
                    <Td>First Nations housing and infrastructure</Td>
                    <Td>10 years</Td>
                    <Td>Envelope</Td>
                  </tr>
                  <tr>
                    <Td className="font-bold text-terminal-cyan">$50B</Td>
                    <Td>National Electricity Strategy</Td>
                    <Td>To 2050</Td>
                    <Td>Strategy target</Td>
                  </tr>
                </tbody>
              </table>
            </div>
            <Callout title="The number is not a number" tone="yellow">
              <p className="m-0">
                Adding these figures produces a headline, not a fiscal cost. The $142.1 billion is a five-year net cost.
                The $700 billion is five years of defence spending on a cash basis. The $32 billion is a ten-year envelope.
                The $50 billion is an electricity strategy running to 2050. They are not peers, and they should not be
                compared without the horizon attached.
              </p>
            </Callout>
          </Panel>

          <Panel kicker="Selected measures" title="What the money actually buys">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="my-0 w-full min-w-[760px] text-sm" style={{ tableLayout: "auto" }}>
                <thead className="bg-muted/60">
                  <tr>
                    <Th>Measure</Th>
                    <Th>Headline</Th>
                    <Th>Horizon</Th>
                    <Th>What it does</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Productivity Mega Deduction", "$36B", "5 years", "Permanent 100% expensing for more than 65% of business investment. METR falls from 13% to 6.4%."],
                    ["Canada Growth Incentive", "$715M", "4 years", "Up to $15M in tax-free capital gains on eligible Canadian investments; enhanced small-business rollover."],
                    ["Housing", "$45B", "Multi-year", "Build Canada Homes, non-market supply, modern construction; includes $2B for one million heat pumps."],
                    ["National Electricity Strategy", "$50B", "To 2050", "Double grid capacity; extend clean electricity investment tax credits to 2040."],
                    ["Defence", "$700B+", "5 years", "Cash-basis investments toward 4% of GDP this decade and 5% by 2035."],
                    ["First Nations housing & infrastructure", "$32B", "10 years", "$18.5B infrastructure, $11B housing, $226.7M for the Atlantic First Nations Water Authority."],
                    ["Groceries & Essentials Supplement", "$4.1B", "1 year", "One-time 50% top-up in early 2027; up to $679 for a couple with two children."],
                    ["Build Canada Workers Benefit", "—", "Ongoing", "Maximum rises to $1,859 for individuals and $3,143 for families; 240,000 people lifted out of poverty."],
                    ["SR&ED expansion", "$930M", "5 years", "Certain commercialisation expenses become eligible; $235M ongoing."],
                    ["Culture & media", "$900M", "Mixed", "$600M immediate content support plus a $300M increase for CBC/Radio-Canada."],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <Td className="font-bold text-foreground">{row[0]}</Td>
                      <Td className="whitespace-nowrap text-terminal-cyan">{row[1]}</Td>
                      <Td className="whitespace-nowrap text-terminal-comment">{row[2]}</Td>
                      <Td className="text-terminal-foreground/80">{row[3]}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-terminal-comment">
              Sources: Budget 2026 chapters 1, 3, 4 and 5; Global News budget-by-the-numbers. Dashes indicate no single
              headline figure is published in the form used here.
            </p>
          </Panel>
        </TabsContent>

        {/* ── 04 Revenue & debt ── */}
        <TabsContent value="revenue" className="mt-0 space-y-5">
          <div className="grid gap-5 lg:grid-cols-2">
            <Panel kicker="Chart 4" title="Where the revenue comes from">
              <div aria-label="Doughnut chart of 2026-27 revenue by source">
                <ResponsiveContainer width="100%" height={280}>
                  <PieChart>
                    <Tooltip content={<PieTip />} />
                    <Legend
                      verticalAlign="bottom"
                      wrapperStyle={{ fontSize: 10, color: tickColor }}
                      formatter={(value) => <span style={{ color: tickColor }}>{value}</span>}
                    />
                    <Pie
                      data={revenueData}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={52}
                      outerRadius={88}
                      paddingAngle={2}
                      stroke={pieStroke}
                      strokeWidth={2}
                    >
                      {revenueData.map((entry, i) => (
                        <Cell key={i} fill={entry.color} />
                      ))}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Panel>

            <Panel kicker="Table A1.9" title="Revenue by source, 2026–27">
              <div className="overflow-x-auto rounded-lg border border-border">
                <table className="my-0 w-full text-sm" style={{ tableLayout: "auto" }}>
                  <thead className="bg-muted/60">
                    <tr>
                      <Th>Source</Th>
                      <Th right>$B</Th>
                      <Th right>Share</Th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenueData.map((row) => (
                      <tr key={row.name}>
                        <Td className="text-foreground/85">{row.name}</Td>
                        <Td right className="font-bold">{row.value.toFixed(1)}</Td>
                        <Td right className="text-terminal-comment">{((row.value / 540.3) * 100).toFixed(1)}%</Td>
                      </tr>
                    ))}
                    <tr>
                      <Td className="font-bold text-foreground">Total</Td>
                      <Td right className="font-bold text-terminal-cyan">540.3</Td>
                      <Td right className="font-bold text-terminal-cyan">100%</Td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <p className="mt-3 text-[11px] leading-relaxed text-terminal-comment">
                Personal income tax is 47.9% of revenue. The corporate share falls in 2026–27 as the Productivity Mega
                Deduction shifts deductions forward.
              </p>
            </Panel>
          </div>

          <Panel kicker="Chart 5" title="Public debt charges: the fastest-growing line">
            <div aria-label="Line chart of public debt charges from 2025-26 to 2030-31">
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={debtChargeData} margin={{ top: 8, right: 16, left: -12, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} vertical={false} />
                  <XAxis dataKey="year" tick={tick} axisLine={axisLine} tickLine={false} />
                  <YAxis
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}B`}
                    domain={[40, 90]}
                    ticks={[40, 50, 60, 70, 80, 90]}
                  />
                  <Tooltip content={<ChartTip />} />
                  <Line
                    type="monotone"
                    dataKey="charges"
                    name="Public debt charges ($B)"
                    stroke={C.red}
                    strokeWidth={3}
                    dot={{ r: 4, fill: C.red }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Stat label="2026–27" value="$60.2B" note="11.1% of revenue" tone="red" />
              <Stat label="2028–29" value="$73.8B" note="12.7% of revenue" tone="red" />
              <Stat label="2030–31" value="$85.5B" note="13.6% of revenue" tone="red" />
              <Stat label="Increase, 5 years" value="+60%" note="$53.5B → $85.5B" tone="yellow" />
            </div>
          </Panel>

          <Panel kicker="Chart 6" title="The number that should be on the cover">
            <div aria-label="Bar chart comparing cumulative deficit with cumulative cash requirement">
              <ResponsiveContainer width="100%" height={220}>
                <BarChart data={cashData} layout="vertical" margin={{ top: 0, right: 40, left: 8, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={C.grid} horizontal={false} />
                  <XAxis
                    type="number"
                    tick={tick}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `$${v}B`}
                    domain={[0, 900]}
                    ticks={[0, 200, 400, 600, 800]}
                  />
                  <YAxis
                    type="category"
                    dataKey="label"
                    width={130}
                    tick={{ fill: tickColor, fontSize: 10, fontFamily: "'JetBrains Mono', 'DejaVu Sans Mono', monospace" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<ChartTip />} cursor={{ fill: cursorFill }} />
                  <Bar dataKey="value" name="Five-year total ($B)" radius={[0, 4, 4, 0]} maxBarSize={34}>
                    {cashData.map((d, i) => (
                      <Cell key={i} fill={d.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <Callout title="Accrual is not a trick, but it is a choice" tone="red">
              <p className="m-0">
                Over five years the budgetary deficits sum to <strong>$288.7 billion</strong>. The financial requirement —
                the cash the government actually needs — sums to <strong>$764.7 billion</strong>. The $476 billion
                difference is mostly loans, capital assets and Crown corporation investments. None of it is imaginary. All
                of it has to be raised.
              </p>
              <p className="m-0">
                Neither number is a lie. They answer different questions. The deficit asks how much the government&apos;s
                books deteriorated this year. The financial requirement asks how much cash it needed. For a household, the
                second is closer to the credit-card bill.
              </p>
            </Callout>
          </Panel>

          <Panel kicker="Table A1.11" title="Where the $87 billion gap comes from in 2026–27">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="my-0 w-full min-w-[560px] text-sm" style={{ tableLayout: "auto" }}>
                <thead className="bg-muted/60">
                  <tr>
                    <Th>Line</Th>
                    <Th right>2026–27 ($B)</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Budgetary balance", "−62.3", "text-terminal-red"],
                    ["Pensions and other accounts", "+7.9", "text-terminal-green"],
                    ["Non-financial assets", "−26.1", "text-terminal-red"],
                    ["Loans, investments and advances", "−72.5", "text-terminal-red"],
                    ["Other transactions", "+3.5", "text-terminal-green"],
                    ["Total non-budgetary transactions", "−87.2", "text-terminal-yellow"],
                    ["Financial requirement", "−149.5", "text-terminal-red"],
                  ].map(([label, value, color], i) => (
                    <tr key={label} className={i === 6 ? "bg-terminal-red/5" : ""}>
                      <Td className={i === 6 ? "font-bold text-foreground" : "text-foreground/85"}>{label}</Td>
                      <Td right className={`font-bold ${color}`}>{value}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-terminal-comment">
              The financial requirement is not the same as gross borrowing: it excludes debt refinancing. It is the cash
              gap the government has to fund before it rolls over existing debt.
            </p>
          </Panel>
        </TabsContent>

        {/* ── 05 Taxes ── */}
        <TabsContent value="taxes" className="mt-0 space-y-5">
          <Panel kicker="The rate question" title="What did not change">
            <div className="mb-4 flex flex-wrap gap-2">
              <Chip tone="green">Personal income tax rates</Chip>
              <Chip tone="green">Corporate rate — 15%</Chip>
              <Chip tone="green">GST — 5%</Chip>
              <Chip tone="green">Capital gains inclusion — 50%</Chip>
            </div>
            <p className="m-0 text-sm leading-relaxed text-terminal-foreground/85">
              The budget leaves the four big rate levers alone. Its tax changes are about compliance, timing and targeted
              credits. That is not a criticism of the direction — it is a correction to the coverage. If you were waiting
              for a rate cut or bracing for a rate increase, this budget did not deliver either.
            </p>
          </Panel>

          <Panel kicker="The changes" title="What did change, and when">
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="my-0 w-full min-w-[760px] text-sm" style={{ tableLayout: "auto" }}>
                <thead className="bg-muted/60">
                  <tr>
                    <Th>Change</Th>
                    <Th>Detail</Th>
                    <Th>Effective</Th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["Single filing deadline", "May 15 for filing and paying, including self-employed filers.", "2027 tax year"],
                    ["Instalment threshold", "$3,000 → $7,500, indexed to inflation; 1.1M individuals and 185K small businesses out of instalments.", "2028"],
                    ["T1135 foreign property", "$100K → $200K; simplified reporting $250K → $500K.", "Years ending after 2026"],
                    ["Objection window", "90 days → one year; individuals get the later of that and two years after filing.", "—"],
                    ["Flat-rate claims", "$1,000 moving; $1,000 home accessibility; $1,200 adoption; $2,000 service dog; $1,000 celiac.", "2027"],
                    ["RRSP-for-life", "No forced RRIF conversion at 71; surviving spouse can be a successor holder.", "Proposed"],
                    ["Caregiver credit", "Fully refundable; up to $1,260 per year; 585,000 caregivers.", "2027"],
                    ["Build Canada Workers Benefit", "Maximum $1,859 individual / $3,143 family; minimum earnings threshold $3,000 → $500.", "2027"],
                    ["Groceries supplement", "One-time 50% top-up; up to $679 for a couple with two children.", "Early 2027"],
                    ["Fuel excise", "Full relief to Jan 31, 2027; 50% relief Feb–Mar; standard rates from April 1.", "2027"],
                    ["Canada Growth Incentive", "Up to $15M tax-free capital gains; $715M in relief over four years.", "Shares from Nov 5, 2026"],
                  ].map((row) => (
                    <tr key={row[0]}>
                      <Td className="font-bold text-foreground">{row[0]}</Td>
                      <Td className="text-terminal-foreground/85">{row[1]}</Td>
                      <Td className="whitespace-nowrap text-terminal-cyan">{row[2]}</Td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-[11px] leading-relaxed text-terminal-comment">
              Source: Budget 2026, chapter 6 and the Canada Growth Incentive chapter. Dates are as stated in the budget;
              several measures still require legislation.
            </p>
          </Panel>

          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            {[
              { label: "For filers", value: "1.1M", note: "individuals out of the instalment system; 185K small businesses." },
              { label: "For low-income workers", value: "1.9M", note: "workers get more; 240K lifted out of poverty." },
              { label: "For caregivers", value: "585K", note: "receive support; 180K are new to the credit." },
              { label: "For founders", value: "96%", note: "retained on a $15M gain, up from 71% before the CGI." },
            ].map((item) => (
              <Stat key={item.label} label={item.label} value={item.value} note={item.note} tone="green" />
            ))}
          </div>

          <Callout title="The threshold nobody indexed" tone="yellow">
            <p className="m-0">
              The budget simplifies the filing experience but leaves one important cliff untouched: the{" "}
              <strong>$30,000 GST/HST small-supplier threshold</strong>. It has been $30,000 since the tax was introduced
              in 1991. For a small software company, crossing it triggers registration, quarterly filing, input tax
              credits and a new compliance surface. That is exactly the kind of small-business friction the budget says it
              wants to remove.
            </p>
          </Callout>
        </TabsContent>

        {/* ── 06 Verdict ── */}
        <TabsContent value="verdict" className="mt-0 space-y-5">
          <Panel kicker="My scorecard" title="Good policy, bad arithmetic">
            <div className="space-y-4">
              {scores.map((row) => (
                <div key={row.label}>
                  <div className="flex items-baseline justify-between gap-3">
                    <div className="text-sm font-bold text-foreground">{row.label}</div>
                    <div className="text-sm font-bold" style={{ color: row.color }}>
                      {row.score}/10
                    </div>
                  </div>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted">
                    <div className="h-full rounded-full" style={{ width: `${row.score * 10}%`, background: row.color }} />
                  </div>
                  <p className="mt-1 text-[11px] leading-relaxed text-terminal-comment">{row.note}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-[11px] leading-relaxed text-terminal-comment">
              These scores are judgment, not data. They weight fiscal sustainability and transparency heavily because
              those are the parts of a budget that compound.
            </p>
          </Panel>

          <div className="grid gap-4 md:grid-cols-2">
            <Panel kicker="The good" title="What works">
              <div className="space-y-3 text-sm">
                {[
                  "The Productivity Mega Deduction is a genuine structural change: permanent, broad, and it puts Canada's METR below the United States.",
                  "The Canada Growth Incentive materially changes founder outcomes: 96% retention on a $15M gain instead of 71%.",
                  "The simplification package is unglamorous and useful: fewer instalments, a single deadline, flat-rate claims.",
                  "Energy and defence spending is aimed at capacity, not just cheques: grid, nuclear, critical minerals, industrial base.",
                  "The groceries and workers benefits are well-targeted within their constraints.",
                ].map((text) => (
                  <div key={text} className="flex gap-2">
                    <span className="mt-0.5 text-terminal-green">✓</span>
                    <span className="text-terminal-foreground/85">{text}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel kicker="The bad" title="What doesn't">
              <div className="space-y-3 text-sm">
                {[
                  "Spending a temporary, largely oil-driven windfall on permanent programs.",
                  "$50 billion-plus deficits through 2030–31 with no path to balance.",
                  "Debt charges rising to $85.5 billion, or 13.6 cents of every revenue dollar.",
                  "Using a deficit-to-GDP anchor while the debt ratio stays flat.",
                  "Burying the $765 billion cash requirement in an annex table.",
                ].map((text) => (
                  <div key={text} className="flex gap-2">
                    <span className="mt-0.5 text-terminal-red">✕</span>
                    <span className="text-terminal-foreground/85">{text}</span>
                  </div>
                ))}
              </div>
            </Panel>

            <Panel kicker="The unclear" title="What depends" className="md:col-span-2">
              <div className="space-y-3 text-sm">
                {[
                  "Whether the Productivity Mega Deduction produces the investment the government models.",
                  "Whether the housing envelope arrives fast enough to affect prices this decade.",
                  "Whether the oil windfall persists once prices normalize.",
                  "Whether 'operating balance' remains meaningful with the capital/operating split.",
                  "Whether the defence cash-basis spending shows up in the deficit on the timeline promised.",
                ].map((text) => (
                  <div key={text} className="flex gap-2">
                    <span className="mt-0.5 text-terminal-yellow">?</span>
                    <span className="text-terminal-foreground/85">{text}</span>
                  </div>
                ))}
              </div>
            </Panel>
          </div>

          <Callout title="Bottom line" tone="purple">
            <p className="m-0 text-base">
              Budget 2026 is a growth budget financed with borrowed money at a moment when borrowing looked cheap. The
              micro measures are often good. The macro arithmetic is not. A government can invest in productivity and
              still be fiscally undisciplined; this one is both.
            </p>
          </Callout>
        </TabsContent>
      </Tabs>
      </div>

      {/* ── Long-form ── */}
      <div className="mt-10 space-y-6 text-[0.95rem] leading-relaxed text-terminal-foreground/90">
        <h2
          id="reading-the-budget-like-a-system-design-review"
          className="block border-b border-border pb-2 text-xl font-bold text-[var(--heading-color)]"
        >
          Reading the budget like a system design review
        </h2>
        <p>
          A budget is a specification, and like any specification it is easier to review when you know which question each
          number answers. Most of the confusion in the coverage comes from comparing numbers that measure different
          things. Three checks fix most of it.
        </p>

        <h3 id="1-baseline-not-headline" className="block text-lg font-bold text-[var(--heading-color)]">
          1. Baseline, not headline
        </h3>
        <p>
          A budget is a diff. The headline deficit is the output of two inputs: the forecast and the policy. If you only
          read the output, you cannot tell whether the government tightened or loosened. Always ask what the deficit would
          have been without the new measures. Here the answer is $43.8 billion. The budget adds $18.4 billion, and the
          forecast improvement absorbs it. That is not restraint; it is a good hand played at full size.
        </p>

        <h3 id="2-accrual-not-cash" className="block text-lg font-bold text-[var(--heading-color)]">
          2. Accrual, not cash
        </h3>
        <p>
          The deficit is an accrual number. It records revenue when earned and expenses when incurred. Borrowing is a cash
          number. Table A1.11 reconciles the two. In 2026–27 the budgetary deficit is $62.3 billion, but the financial
          requirement is $149.5 billion. Over five years the deficits sum to $288.7 billion; the financial requirements
          sum to $764.7 billion. The $476 billion difference is loans, capital assets and Crown corporation investments.
          None of it is imaginary. All of it is cash that has to be raised.
        </p>
        <p>
          Neither number is a lie. They answer different questions. The deficit asks how much the government&apos;s books
          deteriorated this year. The financial requirement asks how much cash the government needed. For a household, the
          second is closer to the credit-card bill.
        </p>

        <h3 id="3-stock-not-flow" className="block text-lg font-bold text-[var(--heading-color)]">
          3. Stock, not flow
        </h3>
        <p>
          A deficit is a flow. Debt is a stock. Debt charges are the price of the stock. In 2026–27 Ottawa will spend
          $60.2 billion on interest, or 11.1 cents of every revenue dollar. By 2030–31 that becomes $85.5 billion, or
          13.6 cents. The flow can decline while the stock grows; that is exactly what happens here. Net debt rises by
          $465.8 billion even as the deficit ratio falls.
        </p>
        <p>
          Watch the stock, the interest rate and the maturity profile. A government that refinances at higher rates can
          see its interest bill rise even if it stops adding new debt. Canada is not there yet, but the direction is
          visible.
        </p>

        <h2
          id="what-it-means-for-a-household"
          className="block border-b border-border pb-2 text-xl font-bold text-[var(--heading-color)]"
        >
          What it means for a household
        </h2>
        <p>
          For most households, this is a cash-flow budget, not a tax-rate budget. The rates are unchanged. The changes are
          deadlines, thresholds and credits. The larger household effect is indirect: a government that spends 13.6 cents
          of every revenue dollar on interest has less room for everything else, including the transfers households rely
          on.
        </p>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="my-0 w-full min-w-[720px] text-sm" style={{ tableLayout: "auto" }}>
            <thead className="bg-muted/60">
              <tr>
                <Th>If you are…</Th>
                <Th>What changes</Th>
                <Th>What to do</Th>
              </tr>
            </thead>
            <tbody>
              {[
                ["A salaried filer", "May 15 deadline, higher instalment threshold, flat-rate claims.", "File later; no action needed."],
                ["A low-income worker", "BCWB maximum rises; advance payments end by 2028.", "Check eligibility in 2027."],
                ["A caregiver", "Caregiver Credit becomes refundable, up to $1,260.", "Claim it on the 2027 return."],
                ["A first-time buyer", "GST relief up to $50,000 is already in place; $45B supply money is slower.", "Factor the delivery timeline into your plans."],
                ["A homeowner heating with oil or propane", "$2B for one million heat pumps, over $1B a year in savings.", "Watch provincial delivery details."],
                ["A retiree", "RRSP-for-life removes forced RRIF conversion at 71; minimum withdrawals still apply.", "Review the successor-holder rules."],
                ["An investor", "Capital gains inclusion rate unchanged; CGI applies to eligible shares issued from Nov 5, 2026.", "Check issuance dates before restructuring."],
              ].map((row) => (
                <tr key={row[0]}>
                  <Td className="font-bold text-foreground">{row[0]}</Td>
                  <Td className="text-terminal-foreground/85">{row[1]}</Td>
                  <Td className="text-terminal-comment">{row[2]}</Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Two more timing items: the 2027 groceries top-up lands in early 2027, and the fuel excise relief ends in stages —
          full relief to January 31, 50% through March, standard rates from April 1. Neither changes a tax rate; both
          change a cash flow.
        </p>

        <h2
          id="what-it-means-if-youre-building-a-company"
          className="block border-b border-border pb-2 text-xl font-bold text-[var(--heading-color)]"
        >
          What it means if you&apos;re building a company
        </h2>
        <p>
          For a Canadian software company, the two headline measures are the ones to model. The Productivity Mega
          Deduction allows 100% immediate expensing for a broad asset base, permanently. If you are buying servers, GPUs,
          network gear or office equipment, the after-tax cost falls sharply: the marginal effective tax rate on new
          investment goes from 13% to 6.4%. Model it before you sign a lease.
        </p>
        <p>
          The Canada Growth Incentive is the exit-side counterpart. Up to $15 million in capital gains from eligible
          Canadian investments is exempt, and the small-business rollover is enhanced. A founder with a $15 million gain
          keeps roughly 96% instead of 71%. The measure applies to shares issued on or after November 5, 2026 and
          before 2037, so the issuance date is now a tax-planning decision.
        </p>
        <div className="my-4 space-y-2">
          {[
            ["SR&ED", "$930 million over five years to cover certain commercialisation expenses. If your R&D dies at the prototype stage, this is aimed at you. Document the commercialisation trail."],
            ["Procurement", "Buy Canadian, Digital Transformation Canada, the $7.7 billion Defence Industrial Strategy, $2.3 billion for critical minerals and the $50 billion electricity strategy all create potential demand. A budget line is not a contract; watch for actual procurements."],
            ["Rates and tariffs", "The debt path keeps upward pressure on borrowing costs, and the trade environment remains uncertain. Stress-test both."],
            ["The GST cliff", "The $30,000 small-supplier threshold is unchanged. If you are near it, plan for the compliance step before you cross it."],
          ].map(([label, text]) => (
            <div key={label} className="flex flex-col gap-1 rounded-lg border border-border bg-card/40 p-4 md:flex-row md:gap-4">
              <div className="w-32 shrink-0 text-xs font-bold uppercase tracking-wider text-terminal-cyan">{label}</div>
              <div className="text-sm text-terminal-foreground/85">{text}</div>
            </div>
          ))}
        </div>
        <p>
          I run a small Canadian software company. The strategic alignment here is obvious: sovereign hosting,
          Canadian-built platforms and AI infrastructure are all adjacent to lines in this budget. The discipline is to
          treat that as a pipeline signal, not revenue. Budgets announce intent; procurement officers sign cheques.
        </p>

        <h2 id="what-i-would-change" className="block border-b border-border pb-2 text-xl font-bold text-[var(--heading-color)]">
          What I would change
        </h2>
        <ol className="my-4 space-y-3">
          <li>
            <strong>Anchor on debt-to-GDP.</strong> A declining deficit ratio is compatible with a rising debt stock. If
            the goal is sustainability, anchor the stock.
          </li>
          <li>
            <strong>Put the cash table on the cover.</strong> Table A1.11 is the most important table in the budget and it
            is on page 335. Publish the financial requirement next to the deficit in the headline table.
          </li>
          <li>
            <strong>Treat the windfall as temporary.</strong> Oil revenue is not a structural base. Bank a defined share
            of any upside above forecast, and spend the rest only after it persists for two years.
          </li>
          <li>
            <strong>Index the GST threshold.</strong> Raise the $30,000 small-supplier threshold and index it. It has been
            frozen since 1991.
          </li>
          <li>
            <strong>Cap debt charges as a share of revenue.</strong> A hard ceiling — say 12% — with a mandatory review
            trigger. It is blunter than debt-to-GDP, but harder to redefine.
          </li>
          <li>
            <strong>Sunset-review permanent programs launched with temporary revenue.</strong> Every such program should
            have a statutory review date and a published cost-per-outcome metric.
          </li>
        </ol>

        <h2 id="sources-and-method" className="block border-b border-border pb-2 text-xl font-bold text-[var(--heading-color)]">
          Sources and method
        </h2>
        <p>
          The primary source is the budget document itself. All fiscal figures are from Budget 2026, Tables A1.4, A1.8,
          A1.9 and A1.11, unless a chart or sentence says otherwise. Independent commentary is used for interpretation,
          not for arithmetic.
        </p>
        <div className="space-y-2 text-sm">
          {[
            ["Budget 2026 — “Masters of our destiny” (PDF)", "https://budget.canada.ca/2026/report-rapport/pdf/budget-2026.pdf"],
            ["Parliamentary Budget Officer — Economic and Fiscal Outlook, October 2026", "https://www.pbo-dpb.ca/en/publications/RP-2627-011-S--economic-fiscal-outlook-october-2026--perspectives-economiques-financieres-octobre-2026"],
            ["CBC — IMF says Canada should recommit to debt-to-GDP anchor", "https://www.cbc.ca/9.7004484"],
            ["C.D. Howe Institute — Budget 2026 review", "https://cdhowe.org/publication/ottawa-spent-the-windfall-and-left-canadians-with-the-deficit-budget-2026-review/"],
            ["RBC Economics — Windfall fuels spending, not savings", "https://www.rbc.com/en/economics/canadian-analysis/provincial-and-fiscal-outlooks/budget-analysis/canadian-budget-2026-windfall-fuels-spending-not-savings/"],
            ["The Globe and Mail — PBO says accounting obscures borrowing", "https://www.theglobeandmail.com/politics/article-parliamentary-budget-office-federal-debt-annette-ryan/"],
            ["Global News — Budget 2026 by the numbers", "https://globalnews.ca/news/12138810/budget-2026-by-the-numbers/"],
            ["KPMG — 2026 federal budget highlights", "https://kpmg.com/ca/en/insights/2026/11/canadian-federal-budget.html"],
          ].map(([label, href]) => (
            <div key={href} className="flex flex-col gap-0.5 border-b border-border/60 pb-2 md:flex-row md:justify-between">
              <span className="text-terminal-foreground/85">{label}</span>
              <a href={href} target="_blank" rel="noopener noreferrer" className="text-terminal-cyan hover:underline">
                link
              </a>
            </div>
          ))}
        </div>
        <p className="text-xs leading-relaxed text-terminal-comment">
          Method notes: figures are nominal Canadian dollars. “Cash requirement” means the federal financial requirement
          in Table A1.11, which excludes debt refinancing. Cumulative figures cover 2026–27 through 2030–31. Components
          may not sum exactly because of rounding. The scorecard is a judgment, not a measurement. This is an analysis,
          not financial or tax advice.
        </p>
      </div>
    </div>
  );
};

export default CanadaBudget2026;
