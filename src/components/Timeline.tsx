import { experience } from "@/data/experience";
import { Briefcase, Calendar } from "lucide-react";
import { cn } from "@/lib/utils";

const Timeline = () => {
  return (
    <div className="relative border-l-2 border-terminal-comment/30 ml-3 md:ml-6 space-y-12 my-10">
      {experience.map((job, index) => (
        <div key={index} className="relative pl-8 md:pl-12">
          {/* Timeline Dot */}
          <div className="absolute -left-[9px] top-0 h-5 w-5 rounded-full border-4 border-terminal-background bg-terminal-cyan shadow-[0_0_10px_rgba(0,215,215,0.5)]" />

          {/* Content Card */}
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
            <h3 className="text-xl font-bold text-terminal-foreground">
              {job.title}
            </h3>
            <div className="flex items-center text-sm text-terminal-cyan mt-1 sm:mt-0 font-medium font-mono">
              <Calendar className="w-4 h-4 mr-2" />
              {job.period}
            </div>
          </div>

          <div className="flex items-center text-terminal-comment mb-4 font-medium">
            <Briefcase className="w-4 h-4 mr-2" />
            {job.company}
          </div>

          <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground">
            {job.description.map((desc, i) => (
              <li key={i} className="pl-1">
                {desc}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
