import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from "recharts";

const COLORS = {
  red: "#e63946",
  orange: "#f4a261",
  green: "#2ecc71",
  blue: "#3498db",
  gold: "#f0c060",
  purple: "#8b5cf6",
  darkRed: "#c0392b",
  muted: "#8892a0",
};

const ChartTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1f2b] border border-[#3e4a5e] rounded-lg px-4 py-3 text-sm shadow-xl">
        <p className="text-[#e8ecf2] font-semibold mb-1">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-[#c8ccd4]" style={{ color: entry.color }}>
            {entry.name}: {entry.value?.toLocaleString?.() ?? entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const SectionCard = ({
  title,
  children,
  className = "",
}: {
  title: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`bg-muted/50 border border-border rounded-xl p-6 md:p-8 mb-7 shadow-lg transition-all hover:border-[#3e4a5e] ${className}`}
  >
    {title}
    {children}
  </div>
);

const SectionHeader = ({
  icon,
  title,
  subtitle,
  id,
}: {
  icon: string;
  title: string;
  subtitle: string;
  id?: string;
}) => (
  <div className="flex items-center gap-3 mb-6 flex-wrap">
    <div className="w-11 h-11 rounded-xl bg-terminal-red/20 flex items-center justify-center text-xl shrink-0">
      {icon}
    </div>
    <div>
      <h2 id={id} className="text-xl md:text-2xl font-bold text-foreground">{title}</h2>
      <p className="text-sm text-terminal-comment">{subtitle}</p>
    </div>
  </div>
);

const InfoCard = ({
  title,
  value,
  note,
  color = "default",
}: {
  title: string;
  value: React.ReactNode;
  note: React.ReactNode;
  color?: "default" | "red" | "green" | "gold";
}) => {
  const colorClasses = {
    default: "text-foreground",
    red: "text-terminal-red",
    green: "text-terminal-green",
    gold: "text-[#f0c060]",
  };
  return (
    <div className="bg-card border border-border rounded-xl p-5 transition-all hover:border-[#4a5568] hover:shadow-md hover:-translate-y-0.5">
      <div className="text-xs font-bold uppercase tracking-wider text-terminal-comment mb-2">
        {title}
      </div>
      <div className={`text-2xl md:text-3xl font-extrabold tracking-tight ${colorClasses[color]}`}>
        {value}
      </div>
      <div className="text-xs text-terminal-comment/80 mt-1 leading-relaxed">{note}</div>
    </div>
  );
};

const QuoteBlock = ({
  children,
  borderColor = "border-terminal-red",
}: {
  children: React.ReactNode;
  borderColor?: string;
}) => (
  <div
    className={`border-l-4 ${borderColor} rounded-r-xl px-5 py-4 my-5 text-foreground/90 text-base italic bg-gradient-to-r from-terminal-red/5 to-transparent`}
  >
    {children}
  </div>
);

const Tag = ({
  children,
  color = "red",
}: {
  children: React.ReactNode;
  color?: "red" | "green" | "orange";
}) => {
  const styles = {
    red: "bg-terminal-red/20 text-terminal-red",
    green: "bg-terminal-green/20 text-terminal-green",
    orange: "bg-[#f4a261]/20 text-[#f4a261]",
  };
  return (
    <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${styles[color]}`}>
      {children}
    </span>
  );
};

/* ─────────────── Chart Data ─────────────── */

const affordabilityData = [
  { name: "Median\n$43,100", maxPrice: 0, cheapest: 20789, avg: 63264 },
  { name: "Average\n$67,467", maxPrice: 6200, cheapest: 20789, avg: 63264 },
  { name: "Top 15.5%\n$100,000", maxPrice: 20437, cheapest: 20789, avg: 63264 },
  { name: "Comfortable\n$140,000", maxPrice: 37990, cheapest: 20789, avg: 63264 },
];

const incomeData = [
  { bucket: "<$30k", pct: 12 },
  { bucket: "$30k-$40k", pct: 18 },
  { bucket: "$40k-$43k", pct: 20 },
  { bucket: "$43k-$50k", pct: 14 },
  { bucket: "$50k-$60k", pct: 11 },
  { bucket: "$60k-$67k", pct: 10 },
  { bucket: "$67k-$80k", pct: 6 },
  { bucket: "$80k-$100k", pct: 3.5 },
  { bucket: "$100k-$120k", pct: 9 },
  { bucket: "$120k+", pct: 6.5 },
];

const costPieData = [
  { name: "Loan Payment", value: 955, color: COLORS.red },
  { name: "Depreciation", value: 1313, color: COLORS.darkRed },
  { name: "Insurance", value: 177, color: COLORS.orange },
  { name: "Fuel", value: 275, color: COLORS.blue },
  { name: "Maintenance", value: 125, color: COLORS.purple },
];

const costBarData = [
  { name: "Loan", cost: 955 },
  { name: "Insurance", cost: 177 },
  { name: "Fuel", cost: 275 },
  { name: "Maintenance", cost: 125 },
  { name: "Depreciation", cost: 1313 },
];

const negativeEquityData = [
  { year: "Year 0", value: 45000, loan: 45000 },
  { year: "Year 1", value: 33750, loan: 40500 },
  { year: "Year 2", value: 28688, loan: 35800 },
  { year: "Year 3", value: 24384, loan: 30800 },
  { year: "Year 4", value: 20726, loan: 25500 },
  { year: "Year 5", value: 17617, loan: 19800 },
  { year: "Year 6", value: 14975, loan: 13700 },
  { year: "Year 7", value: 12729, loan: 7000 },
];

const opportunityData = [
  { year: "Year 0", invested: 0, contributed: 0 },
  { year: "Year 5", invested: 42900, contributed: 36000 },
  { year: "Year 10", invested: 103800, contributed: 72000 },
  { year: "Year 15", invested: 186500, contributed: 108000 },
  { year: "Year 20", invested: 312800, contributed: 144000 },
  { year: "Year 25", invested: 485000, contributed: 180000 },
  { year: "Year 30", invested: 735000, contributed: 216000 },
];

const comparisonData = [
  { horizon: "10 Years", financer: 0, investor: 103800 },
  { horizon: "20 Years", financer: 0, investor: 312800 },
  { horizon: "30 Years", financer: 0, investor: 735000 },
];

const forecastData = [
  { year: "2020", price: 48000, income: 38000, affordable: 4000 },
  { year: "2022", price: 55000, income: 40000, affordable: 3000 },
  { year: "2024", price: 61000, income: 42000, affordable: 1500 },
  { year: "2026", price: 63264, income: 43100, affordable: 0 },
  { year: "2028", price: 71000, income: 44500, affordable: 0 },
  { year: "2030", price: 76000, income: 46000, affordable: 0 },
];

/* ─────────────── Main Component ─────────────── */

const CanadianCarOwnership = () => {
  return (
    <div className="space-y-2">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#0d1117] via-[#131820] to-[#1a1025] p-8 md:p-12 text-center mb-8">
        <div className="absolute top-[-120px] left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle,rgba(230,57,70,0.12)_0%,transparent_70%)] pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-block bg-terminal-red/15 text-terminal-red font-bold text-xs uppercase tracking-widest px-5 py-2 rounded-full border border-terminal-red/30 mb-5">
            ⚠️ Financial Warning • 2026 Analysis
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground leading-tight mb-4">
            The New Car Smell That Costs Canadians<br />
            Their <span className="text-terminal-red">Retirement</span>
          </h1>
          <p className="text-base md:text-lg text-terminal-comment max-w-2xl mx-auto mb-8">
            Cold, hard mathematics on what Canadians can <em>actually</em> afford — using the <strong>20/4/10 rule</strong>, real income data, and the brutal truth about 84-month loans.
          </p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl mx-auto">
            <div className="bg-card/80 border border-border rounded-xl p-4">
              <div className="text-2xl font-extrabold text-terminal-red">$71,488</div>
              <div className="text-xs text-terminal-comment uppercase tracking-wider">Avg New Car (Ontario)</div>
            </div>
            <div className="bg-card/80 border border-border rounded-xl p-4">
              <div className="text-2xl font-extrabold text-foreground">$955<span className="text-sm">/mo</span></div>
              <div className="text-xs text-terminal-comment uppercase tracking-wider">Avg Loan Payment</div>
            </div>
            <div className="bg-card/80 border border-border rounded-xl p-4">
              <div className="text-2xl font-extrabold text-terminal-red">84<span className="text-sm"> months</span></div>
              <div className="text-xs text-terminal-comment uppercase tracking-wider">Typical Loan Term</div>
            </div>
            <div className="bg-card/80 border border-border rounded-xl p-4">
              <div className="text-2xl font-extrabold text-terminal-green">$735K</div>
              <div className="text-xs text-terminal-comment uppercase tracking-wider">Opportunity Cost</div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: 20/4/10 Rule */}
      <SectionCard
        title={<SectionHeader icon="📐" title="The 20/4/10 Rule — The Gold Standard" subtitle="The benchmark financial planners have used for decades" id="the-20410-rule-the-gold-standard" />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <InfoCard
            title="💰 20% Down Payment"
            value="Cash"
            note={
              <>
                Real money from your bank account. No trade-in rollovers, no dealer rebates. If you can't put 20% down in cash, you can't afford it.
              </>
            }
          />
          <InfoCard
            title="📅 4-Year Loan Term"
            value="48 Months Max"
            color="red"
            note={
              <>
                Beyond 4 years, you pay interest on a depreciating asset worth less than what you owe — <strong>negative equity</strong>.
              </>
            }
          />
          <InfoCard
            title="📊 10% of Gross Income"
            value="Total Transport"
            color="green"
            note={
              <>
                Loan + Insurance + Fuel + Maintenance + Parking. All-in, under 10% of pre-tax earnings.
              </>
            }
          />
        </div>
      </SectionCard>

      {/* Section 2: Income vs Affordability */}
      <SectionCard
        title={
          <SectionHeader
            icon="💸"
            title="Canadian Salaries vs. What You Can Actually Afford"
            subtitle="Applying the 20/4/10 rule to real Statistics Canada income data (late 2025)"
            id="canadian-salaries-vs-what-you-can-actually-afford"
          />
        }
      >
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Income Level vs. Maximum Affordable Vehicle Price</h3>
          <ResponsiveContainer width="100%" height={320}>
            <ComposedChart data={affordabilityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
              <XAxis dataKey="name" tick={{ fill: "#c8ccd4", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} />
              <YAxis
                tick={{ fill: "#8892a0", fontSize: 12 }}
                axisLine={{ stroke: "#2a3040" }}
                tickFormatter={(v) => `$${v.toLocaleString()}`}
                domain={[0, 75000]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Bar dataKey="maxPrice" name="Max Vehicle Price (20/4/10 Rule)" fill={COLORS.red} radius={[6, 6, 0, 0]} />
              <Line
                type="monotone"
                dataKey="cheapest"
                name="Cheapest New Car (Nissan Versa S ~$20,789)"
                stroke={COLORS.purple}
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="avg"
                name="Avg New Vehicle (~$63,264)"
                stroke={COLORS.red}
                strokeDasharray="6 4"
                strokeWidth={2}
                dot={false}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Canadian Full-Time Worker Income Distribution</h3>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={incomeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
              <XAxis
                dataKey="bucket"
                tick={{ fill: "#c8ccd4", fontSize: 11 }}
                axisLine={{ stroke: "#2a3040" }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis
                tick={{ fill: "#8892a0", fontSize: 12 }}
                axisLine={{ stroke: "#2a3040" }}
                tickFormatter={(v) => `${v}%`}
                domain={[0, 25]}
              />
              <Tooltip content={<ChartTooltip />} />
              <Bar dataKey="pct" name="% of Full-Time Workers" fill="#5dade2" />
              <ReferenceLine x="$43k-$50k" stroke={COLORS.gold} strokeDasharray="6 4" strokeWidth={2} label={{ value: "Median: $43,100", fill: COLORS.gold, fontSize: 12, position: "top" }} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Income Level</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Gross Annual</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">10% Transport Budget</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Max Monthly Loan Payment*</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Max Vehicle Price (all-in)</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Status</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-semibold">Median Earner</td>
                <td className="px-4 py-3">$43,100</td>
                <td className="px-4 py-3">$4,310/yr</td>
                <td className="px-4 py-3 text-terminal-red font-bold">$0 — Budget Exhausted</td>
                <td className="px-4 py-3 text-terminal-red font-bold">$0</td>
                <td className="px-4 py-3"><Tag color="red">Cannot Afford</Tag></td>
              </tr>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-semibold">Average Earner</td>
                <td className="px-4 py-3">$67,467</td>
                <td className="px-4 py-3">$6,747/yr</td>
                <td className="px-4 py-3">~$118/mo</td>
                <td className="px-4 py-3 text-terminal-red font-bold">~$6,200</td>
                <td className="px-4 py-3"><Tag color="red">Cannot Afford New</Tag></td>
              </tr>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-semibold">Top 15.5% Earner</td>
                <td className="px-4 py-3">$100,000</td>
                <td className="px-4 py-3">$10,000/yr</td>
                <td className="px-4 py-3">~$389/mo</td>
                <td className="px-4 py-3">~$20,437</td>
                <td className="px-4 py-3"><Tag color="orange">Barely Used</Tag></td>
              </tr>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3 font-semibold">Comfortable Earner</td>
                <td className="px-4 py-3">$140,000</td>
                <td className="px-4 py-3">$14,000/yr</td>
                <td className="px-4 py-3">~$723/mo</td>
                <td className="px-4 py-3">~$37,990</td>
                <td className="px-4 py-3"><Tag color="green">Affordable Used/Entry New</Tag></td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-terminal-comment mt-3">
          *After subtracting insurance (~$2,120/yr), fuel (~$2,000/yr), and maintenance (~$1,200/yr). Loan rate: 6.5% APR, 48 months. Cheapest new car in Canada (Nissan Versa S): ~$20,789 before tax.
        </p>
      </SectionCard>

      {/* Section 3: True Monthly Cost */}
      <SectionCard
        title={
          <SectionHeader
            icon="🔍"
            title="The True Monthly Cost of Ownership"
            subtitle="RateHub 2026 data: Average Canadian car owner spends ~$1,373/month all-in"
            id="the-true-monthly-cost-of-ownership"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">True Monthly Cost Breakdown (Avg New Car ~$63k)</h3>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Tooltip
                  content={({ active, payload }: any) => {
                    if (active && payload && payload.length) {
                      const p = payload[0];
                      return (
                        <div className="bg-[#1a1f2b] border border-[#3e4a5e] rounded-lg px-3 py-2 text-sm shadow-xl">
                          <p style={{ color: p.payload.color }} className="font-semibold">
                            {p.name}: ${p.value}/mo
                          </p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Pie data={costPieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} stroke="#131820" strokeWidth={2}>
                  {costPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Monthly Ownership Costs — Cash vs. Hidden</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={costBarData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis dataKey="name" tick={{ fill: "#c8ccd4", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} />
                <YAxis tick={{ fill: "#8892a0", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} tickFormatter={(v) => `$${v}`} />
                <Tooltip content={<ChartTooltip />} />
                <Bar dataKey="cost" name="Monthly Cost (CAD)" fill={COLORS.red} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <QuoteBlock>
          <strong className="text-[#f4a261] not-italic">🔑 Key Insight:</strong> Depreciation is the <em>silent killer</em> — it doesn't appear on your monthly budget but is the single largest cost. On a $63,000 vehicle, <strong>$28,000–$41,000 evaporates in 5 years</strong>.
        </QuoteBlock>
      </SectionCard>

      {/* Section 4: Negative Equity */}
      <SectionCard
        title={
          <SectionHeader
            icon="🪤"
            title="The Negative Equity Debt Treadmill"
            subtitle="84-month loan on a $45,000 truck at 6.5% APR — depreciation vs. loan balance"
            id="the-negative-equity-debt-treadmill"
          />
        }
      >
        <div className="bg-card border border-border rounded-xl p-4 mb-4">
          <h3 className="text-sm font-semibold text-foreground mb-2 text-center">The Negative Equity Trap: Depreciation vs. Loan Balance ($45,000 Truck)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={negativeEquityData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
              <XAxis dataKey="year" tick={{ fill: "#c8ccd4", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} />
              <YAxis tick={{ fill: "#8892a0", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} domain={[0, 50000]} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="value" name="Vehicle Value" stroke={COLORS.green} strokeWidth={3} fill="rgba(46,204,113,0.1)" dot={{ fill: COLORS.green, stroke: "#131820", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="loan" name="Loan Balance (84-mo @ 6.5%)" stroke={COLORS.red} strokeWidth={3} fill="rgba(230,57,70,0.08)" dot={{ fill: COLORS.red, stroke: "#131820", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm min-w-[500px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Year</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Vehicle Value</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Loan Balance</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Equity Position</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { year: "0", value: "$45,000", loan: "$45,000", equity: "$0", status: "Break-even", tag: "orange" },
                { year: "1", value: "$33,750", loan: "$40,500", equity: "-$6,750", status: "Underwater", tag: "red" },
                { year: "2", value: "$28,688", loan: "$35,800", equity: "-$7,112", status: "Underwater", tag: "red" },
                { year: "3", value: "$24,384", loan: "$30,800", equity: "-$6,416", status: "Underwater", tag: "red" },
                { year: "4", value: "$20,726", loan: "$25,500", equity: "-$4,774", status: "Underwater", tag: "red" },
                { year: "5", value: "$17,617", loan: "$19,800", equity: "-$2,183", status: "Underwater", tag: "red" },
                { year: "6", value: "$14,975", loan: "$13,700", equity: "+$1,275", status: "Finally Positive", tag: "green" },
                { year: "7", value: "$12,729", loan: "$7,000", equity: "+$5,729", status: "Positive Equity", tag: "green" },
              ].map((row) => (
                <tr key={row.year} className="border-t border-border hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">{row.year}</td>
                  <td className="px-4 py-3">{row.value}</td>
                  <td className="px-4 py-3">{row.loan}</td>
                  <td className={`px-4 py-3 font-bold ${row.equity.startsWith("-") ? "text-terminal-red" : "text-terminal-green"}`}>{row.equity}</td>
                  <td className="px-4 py-3">
                    <Tag color={row.tag as any}>{row.status}</Tag>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <QuoteBlock>
          <strong className="text-[#f4a261] not-italic">⚠️ The Trap:</strong> Most Canadians trade in at Year 3–4, rolling <strong>negative equity into the next loan</strong>. This is how people end up financing <strong>115%+ of a vehicle's value</strong> — the debt treadmill never stops.
        </QuoteBlock>
      </SectionCard>

      {/* Section 5: Opportunity Cost */}
      <SectionCard
        title={
          <SectionHeader
            icon="📈"
            title="The $735,000 Opportunity Cost"
            subtitle="$600/month invested vs. $600/month on a perpetually depreciating car loan"
            id="the-735000-opportunity-cost"
          />
        }
      >
        <div className="bg-[#f0c060]/10 border border-[#f0c060]/30 rounded-xl p-6 text-center mb-6">
          <div className="text-4xl md:text-5xl font-extrabold text-[#f0c060] tracking-tight">$735,000</div>
          <p className="text-foreground mt-2">
            What $600/month becomes after 30 years at 7% real return
            <br />
            <span className="text-sm text-terminal-comment">(diversified equity index fund, inflation-adjusted)</span>
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Investing $600/Month Instead of a Car Payment</h3>
            <ResponsiveContainer width="100%" height={280}>
              <LineChart data={opportunityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis dataKey="year" tick={{ fill: "#c8ccd4", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} />
                <YAxis tick={{ fill: "#8892a0", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Line type="monotone" dataKey="invested" name="Investment Value (7% real return)" stroke={COLORS.green} strokeWidth={3} fill="rgba(46,204,113,0.12)" dot={{ fill: COLORS.green, stroke: "#131820", strokeWidth: 2, r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="contributed" name="Total Contributions ($600/mo)" stroke={COLORS.orange} strokeWidth={2} strokeDasharray="8 5" dot={{ fill: COLORS.orange, stroke: "#131820", strokeWidth: 2, r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-card border border-border rounded-xl p-4">
            <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Net Worth Impact: Financer vs. Investor</h3>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={comparisonData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
                <XAxis dataKey="horizon" tick={{ fill: "#c8ccd4", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} />
                <YAxis tick={{ fill: "#8892a0", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip content={<ChartTooltip />} />
                <Legend />
                <Bar dataKey="financer" name="Car Financer (Net Auto Equity)" fill={COLORS.red} radius={[6, 6, 0, 0]} />
                <Bar dataKey="investor" name="Used Car + Investor" fill={COLORS.green} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full text-sm min-w-[400px]">
            <thead className="bg-muted">
              <tr>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Horizon</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Total Contributions</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Future Value (7% real)</th>
                <th className="text-left px-4 py-3 text-xs font-bold uppercase tracking-wider text-terminal-comment">Total Growth</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">10 Years</td>
                <td className="px-4 py-3">$72,000</td>
                <td className="px-4 py-3 font-bold">$103,800</td>
                <td className="px-4 py-3 text-terminal-green font-bold">+$31,800</td>
              </tr>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">20 Years</td>
                <td className="px-4 py-3">$144,000</td>
                <td className="px-4 py-3 font-bold">$312,800</td>
                <td className="px-4 py-3 text-terminal-green font-bold">+$168,800</td>
              </tr>
              <tr className="border-t border-border hover:bg-white/[0.02] transition-colors">
                <td className="px-4 py-3">30 Years</td>
                <td className="px-4 py-3">$216,000</td>
                <td className="px-4 py-3 font-bold">$735,000</td>
                <td className="px-4 py-3 text-terminal-green font-bold">+$519,000</td>
              </tr>
            </tbody>
          </table>
        </div>

        <QuoteBlock borderColor="border-terminal-green">
          <strong className="text-[#f4a261] not-italic">💡 The Wealth Gap:</strong> It's not between rich and poor — it's between the person who treats a car as a <strong>tool</strong> and the person who treats it as a <strong>trophy</strong>. The wealthy drive used cars and own index funds. That's how they became wealthy.
        </QuoteBlock>
      </SectionCard>

      {/* Section 6: Forecast */}
      <SectionCard
        title={
          <SectionHeader
            icon="🔮"
            title="Predictive Outlook: 2026–2031"
            subtitle="Projected trends in vehicle prices, wages, and affordability"
            id="predictive-outlook-20262031"
          />
        }
      >
        <div className="bg-card border border-border rounded-xl p-4 mb-6">
          <h3 className="text-sm font-semibold text-foreground mb-2 text-center">Forecast: Vehicle Prices vs. Wages vs. Affordability (2020–2030)</h3>
          <ResponsiveContainer width="100%" height={320}>
            <LineChart data={forecastData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e2532" />
              <XAxis dataKey="year" tick={{ fill: "#c8ccd4", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} />
              <YAxis tick={{ fill: "#8892a0", fontSize: 12 }} axisLine={{ stroke: "#2a3040" }} tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
              <Tooltip content={<ChartTooltip />} />
              <Legend />
              <Line type="monotone" dataKey="price" name="Avg New Vehicle Price (CAD)" stroke={COLORS.red} strokeWidth={3} fill="rgba(230,57,70,0.08)" dot={{ fill: COLORS.red, r: 4 }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="income" name="Median Full-Time Income" stroke={COLORS.orange} strokeWidth={3} strokeDasharray="8 5" dot={{ fill: COLORS.orange, r: 4 }} />
              <Line type="monotone" dataKey="affordable" name="Max Affordable Vehicle (20/4/10 Rule, Median Earner)" stroke={COLORS.purple} strokeWidth={2} strokeDasharray="3 3" dot={{ fill: COLORS.purple, r: 3 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <InfoCard title="🚗 Vehicle Prices" value="$70K–$75K" color="red" note="Projected average new vehicle price by 2028. Entry-level new cars may vanish entirely." />
          <InfoCard title="📉 Real Wage Growth" value="<1.5%/yr" color="default" note="Median real wage growth will remain sluggish. Income-to-vehicle-price ratio worsens." />
          <InfoCard title="📆 Loan Terms" value="120 Months" color="red" note="10-year auto loans may emerge for high-priced trucks/SUVs. Negative equity risk explodes." />
          <InfoCard title="🛡️ Insurance Costs" value="+20–30%" color="default" note="Ontario premiums projected to rise further by 2030 — theft claims up 500% since 2018." />
        </div>
      </SectionCard>

      {/* Section 7: Final Recommendation */}
      <SectionCard
        title={
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <div className="w-11 h-11 rounded-xl bg-terminal-green/20 flex items-center justify-center text-xl shrink-0">✅</div>
            <div>
              <h2 id="the-path-forward-summary-of-recommendations" className="text-xl md:text-2xl font-bold text-foreground">The Path Forward: Summary of Recommendations</h2>
            </div>
          </div>
        }
        className="border-l-4 border-l-terminal-green"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-terminal-comment mb-2">👤 For Individuals</div>
            <p className="text-foreground text-sm leading-relaxed">
              Follow the <strong>20/4/10 rule</strong> strictly. Buy used (3–5 years old, ~$18,000 cash or 48-month max loan). Redirect freed cash flow to a low-cost index fund. Drive a tool, not a trophy.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-terminal-comment mb-2">📋 For Financial Advisors</div>
            <p className="text-foreground text-sm leading-relaxed">
              Educate clients on <strong>negative equity traps</strong> and opportunity cost. Use total-cost-of-ownership calculators — never just the monthly payment.
            </p>
          </div>
          <div className="bg-card border border-border rounded-xl p-5">
            <div className="text-xs font-bold uppercase tracking-wider text-terminal-comment mb-2">🏛️ For Policymakers</div>
            <p className="text-foreground text-sm leading-relaxed">
              Mandate clear disclosure of <strong>total interest payable</strong>, negative equity risk, and 20/4/10 rule comparison on all auto loan documents.
            </p>
          </div>
        </div>

        <QuoteBlock borderColor="border-terminal-green">
          <strong className="text-[#f4a261] not-italic">🏁 The Bottom Line:</strong> Drive a used Honda Civic, invest the difference, and in 30 years — when your friends are still making car payments at age 65 — you'll be retired with <strong>three-quarters of a million dollars</strong> and the quietest, most beautiful sound in the world: <em>the sound of a paid-off car.</em>
        </QuoteBlock>
      </SectionCard>

      {/* Section 8: Sources */}
      <SectionCard
        title={
          <SectionHeader
            icon="📚"
            title="Sources & References"
            subtitle="The data and analysis in this report are drawn from the following sources"
            id="sources-references"
          />
        }
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-card border border-border rounded-xl p-5 transition-all hover:border-[#f4a261] hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-3">
            <span className="inline-flex items-center gap-1 bg-terminal-blue/15 text-terminal-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit">📊 Data Source</span>
            <h4 className="text-lg font-bold text-foreground leading-snug">Statistics Canada — Income and Wage Data</h4>
            <p className="text-sm text-terminal-comment">Government of Canada, Late 2025</p>
            <p className="text-sm text-terminal-comment/80 leading-relaxed">
              Primary source for Canadian income statistics including median full-time earnings ($43,100), average earnings ($67,467), and income distribution percentiles used throughout this analysis.
            </p>
            <a href="https://www.statcan.gc.ca/" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-terminal-blue font-semibold text-sm hover:underline mt-auto w-fit">
              🔗 Visit Statistics Canada
            </a>
          </div>

          <div className="bg-card border border-border rounded-xl p-5 transition-all hover:border-[#f4a261] hover:shadow-md hover:-translate-y-0.5 flex flex-col gap-3">
            <span className="inline-flex items-center gap-1 bg-terminal-blue/15 text-terminal-blue text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full w-fit">🎥 YouTube Video</span>
            <a href="https://www.youtube.com/watch?v=yhXL-XIlnpA" target="_blank" rel="noopener noreferrer" className="relative block rounded-lg overflow-hidden border border-border hover:border-[#f4a261]">
              <img
                src="https://i.ytimg.com/vi/yhXL-XIlnpA/hqdefault.jpg"
                alt="How Much Car Can You Actually Afford in Canada?"
                className="w-full aspect-video object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-12 h-12 bg-black/70 rounded-full flex items-center justify-center">
                  <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[14px] border-l-white border-b-[8px] border-b-transparent ml-1" />
                </div>
              </div>
            </a>
            <h4 className="text-lg font-bold text-foreground leading-snug">How Much Car Can You Actually Afford in Canada? (By Salary)</h4>
            <p className="text-sm text-terminal-comment">Canadian Finance with David</p>
            <p className="text-sm text-terminal-comment/80 leading-relaxed">
              Covers the <strong>20/4/10 rule</strong>, the psychological trap of the new car smell, why $100,000 isn't enough for luxury, how 84-month loans destroy wealth, and the $750,000 opportunity cost.
            </p>
            <a href="https://www.youtube.com/watch?v=yhXL-XIlnpA" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-terminal-blue font-semibold text-sm hover:underline mt-auto w-fit">
              ▶ Watch on YouTube
            </a>
          </div>
        </div>

        <p className="text-xs text-terminal-comment/70 mt-5 text-center">
          The analysis above validates the 20/4/10 rule methodology and paints a sobering picture: <strong>the average Canadian cannot afford the average new car.</strong> Data points are consistent with Statistics Canada (late 2025), RateHub (2026), and Bank of Canada figures.
        </p>
      </SectionCard>

      {/* Footer */}
      <div className="text-center py-6 text-xs text-terminal-comment/60 border-t border-border mt-8">
        <p>Data Sources: Statistics Canada (Late 2025), RateHub 2026, Bank of Canada | Analysis based on the 20/4/10 rule | Prepared May 2026</p>
        <p className="mt-1">⚠️ This is an educational financial analysis. Not personal financial advice. Consult a certified financial planner.</p>
      </div>
    </div>
  );
};

export default CanadianCarOwnership;
