import { Terminal, Cpu, Database, Cloud, Code } from "lucide-react";

const TechStackPanel = () => {
  const categories = [
    {
      name: "Languages",
      icon: Code,
      items: ["Python", "Rust", "Golang", "TypeScript", "SQL"],
      color: "text-terminal-cyan"
    },
    {
      name: "Infrastructure",
      icon: Cloud,
      items: ["AWS", "Docker", "Kubernetes", "Terraform"],
      color: "text-terminal-purple"
    },
    {
      name: "Core Tech",
      icon: Cpu,
      items: ["React", "FastAPI", "Node.js", "PostgreSQL", "Redis"],
      color: "text-terminal-yellow"
    }
  ];

  return (
    <div className="bg-terminal-background border border-terminal-comment/30 rounded-lg p-6 h-full">
      <div className="flex items-center gap-2 mb-6 border-b border-terminal-comment/30 pb-2">
        <Terminal size={18} className="text-terminal-purple" />
        <h2 className="text-xl font-bold font-mono">$ cat tech-stack.json</h2>
      </div>
      
      <div className="space-y-6">
        {categories.map((category, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-terminal-comment mb-2">
              <category.icon size={14} />
              <span className="uppercase tracking-wider font-semibold">{category.name}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {category.items.map((item, itemIdx) => (
                <span 
                  key={itemIdx} 
                  className={`px-3 py-1 bg-opacity-10 border border-opacity-20 rounded text-sm font-mono transition-colors hover:bg-opacity-20 cursor-default ${
                    idx === 0 ? "bg-terminal-cyan border-terminal-cyan text-terminal-cyan" :
                    idx === 1 ? "bg-terminal-purple border-terminal-purple text-terminal-purple" :
                    "bg-terminal-yellow border-terminal-yellow text-terminal-yellow"
                  }`}
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TechStackPanel;
