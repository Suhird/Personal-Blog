import { useEffect, useState } from "react";
import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip } from "recharts";
import { Activity, Cpu } from "lucide-react";

const SystemMonitor = () => {
  const [cpuData, setCpuData] = useState<{ time: string; value: number }[]>([]);
  const [memData, setMemData] = useState<{ time: string; value: number }[]>([]);

  // Simulate real-time monitoring
  useEffect(() => {
    // Fill initial data
    const initialData = Array.from({ length: 20 }, (_, i) => ({
      time: i.toString(),
      value: Math.floor(Math.random() * 30) + 10,
    }));
    setCpuData(initialData);
    setMemData(initialData.map(d => ({ ...d, value: Math.floor(Math.random() * 20) + 40 })));

    const interval = setInterval(() => {
      setCpuData(prev => {
        const newData = [...prev.slice(1), { time: "", value: Math.floor(Math.random() * 40) + 20 }];
        return newData;
      });
      setMemData(prev => {
        const newData = [...prev.slice(1), { time: "", value: Math.floor(Math.random() * 10) + 50 }];
        return newData;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-terminal-background border border-terminal-comment px-2 py-1 text-xs font-mono">
          {payload[0].value}%
        </div>
      );
    }
    return null;
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="bg-terminal-card border border-terminal-comment/30 rounded p-4 h-[180px] relative">
        <div className="flex items-center gap-2 mb-2 text-terminal-green text-sm font-mono absolute top-2 left-4 z-10">
          <Activity size={14} />
          <span>CPU_LOAD</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={cpuData}>
            <defs>
              <linearGradient id="colorCpu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#50fa7b" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#50fa7b" stopOpacity={0}/>
              </linearGradient>
            </defs>
             <YAxis hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6272a4', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="value" stroke="#50fa7b" fillOpacity={1} fill="url(#colorCpu)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-terminal-card border border-terminal-comment/30 rounded p-4 h-[180px] relative">
        <div className="flex items-center gap-2 mb-2 text-terminal-cyan text-sm font-mono absolute top-2 left-4 z-10">
          <Cpu size={14} />
          <span>MEM_USAGE</span>
        </div>
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={memData}>
            <defs>
              <linearGradient id="colorMem" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8be9fd" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#8be9fd" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <YAxis hide domain={[0, 100]} />
            <Tooltip content={<CustomTooltip />} cursor={{ stroke: '#6272a4', strokeWidth: 1 }} />
            <Area type="monotone" dataKey="value" stroke="#8be9fd" fillOpacity={1} fill="url(#colorMem)" strokeWidth={2} isAnimationActive={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default SystemMonitor;
