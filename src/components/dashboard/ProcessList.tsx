import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";

const ProcessList = () => {
  const featuredPosts = blogPosts.slice(0, 5);

  return (
    <div className="bg-terminal-background border border-terminal-comment/30 rounded-lg p-4 font-mono text-sm overflow-x-auto">
      <div className="flex items-center justify-between mb-4 border-b border-terminal-comment/30 pb-2">
        <div className="text-terminal-foreground font-bold">root@server:~$ top -bn1 | grep "article"</div>
      </div>
      
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="text-terminal-comment border-b border-terminal-comment/20">
            <th className="pb-2 pr-4 font-normal">PID</th>
            <th className="pb-2 pr-4 font-normal">USER</th>
            <th className="pb-2 pr-4 font-normal">PR</th>
            <th className="pb-2 pr-4 font-normal">NI</th>
            <th className="pb-2 pr-4 font-normal">VIRT</th>
            <th className="pb-2 pr-4 font-normal">%CPU</th>
            <th className="pb-2 pr-4 font-normal">%MEM</th>
            <th className="pb-2 pr-4 font-normal">TIME+</th>
            <th className="pb-2 font-normal">COMMAND</th>
          </tr>
        </thead>
        <tbody className="text-terminal-foreground">
          {featuredPosts.map((post, index) => {
            const pid = parseInt(post.id) + 1000;
            const cpu = (Math.random() * 5 + 1).toFixed(1);
            const mem = (Math.random() * 2 + 0.1).toFixed(1);
            const time = `${Math.floor(Math.random() * 10)}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
            
            return (
              <tr key={post.id} className="hover:bg-terminal-comment/10 group transition-colors">
                <td className="py-2 pr-4 text-terminal-purple">{pid}</td>
                <td className="py-2 pr-4">suhird</td>
                <td className="py-2 pr-4">20</td>
                <td className="py-2 pr-4">0</td>
                <td className="py-2 pr-4">1024M</td>
                <td className="py-2 pr-4 text-terminal-green">{cpu}</td>
                <td className="py-2 pr-4 text-terminal-cyan">{mem}</td>
                <td className="py-2 pr-4">{time}</td>
                <td className="py-2">
                  <Link 
                    to={`/blog/${post.slug}`}
                    className="text-terminal-yellow hover:underline decoration-terminal-yellow/50 underline-offset-4"
                  >
                    ./{post.slug.substring(0, 30)}... --read
                  </Link>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div className="mt-4 text-xs text-terminal-comment">
        Tasks: {blogPosts.length} total, 1 running, {blogPosts.length - 1} sleeping, 0 stopped, 0 zombie
      </div>
    </div>
  );
};

export default ProcessList;
