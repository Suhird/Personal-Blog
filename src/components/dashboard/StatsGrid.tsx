import { blogPosts } from "@/data/blogPosts";
import { FileText, Code2, Zap, Calendar } from "lucide-react";

const StatsGrid = () => {
  const totalPosts = blogPosts.length;
  // Calculate unique tags
  const allTags = blogPosts.flatMap(post => post.tags);
  const uniqueTags = new Set(allTags).size;
  const latestPostDate = new Date(blogPosts[0].date).toLocaleDateString();

  const stats = [
    {
      label: "Total Articles",
      value: totalPosts,
      icon: FileText,
      color: "text-terminal-cyan",
      bg: "bg-terminal-cyan/10",
      border: "border-terminal-cyan/20"
    },
    {
      label: "Years of Experience",
      value: "8+", // Hardcoded or calculated
      icon: Code2,
      color: "text-terminal-purple",
      bg: "bg-terminal-purple/10",
      border: "border-terminal-purple/20"
    },
    {
      label: "Latest Article",
      value: latestPostDate,
      icon: Calendar,
      color: "text-terminal-yellow",
      bg: "bg-terminal-yellow/10",
      border: "border-terminal-yellow/20"
    },
    {
      label: "System Status",
      value: "100%",
      icon: Zap,
      color: "text-terminal-green",
      bg: "bg-terminal-green/10",
      border: "border-terminal-green/20"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {stats.map((stat, index) => (
        <div 
          key={index} 
          className={`bg-terminal-card border ${stat.border} p-4 rounded-lg hover:bg-opacity-50 transition-all duration-300 group`}
        >
          <div className="flex justify-between items-start mb-2">
            <div className={`p-2 rounded-md ${stat.bg}`}>
              <stat.icon size={20} className={stat.color} />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-terminal-foreground mb-1">
            {stat.value}
          </div>
          <div className="text-xs text-terminal-comment uppercase tracking-wider">
            {stat.label}
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsGrid;
