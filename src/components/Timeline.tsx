import type { CSSProperties } from "react";
import { experience } from "@/data/experience";
import { Briefcase, Calendar } from "lucide-react";
import BuildCanvas from "@/components/build/BuildCanvas";
import { entryFrame, entryScripts } from "@/components/build/aboutScenes";
import { useThemeMode } from "@/components/theme-mode-provider";

const Timeline = () => {
  const { isReader } = useThemeMode();

  return (
    <div className="relative border-l-2 border-terminal-comment/30 ml-3 md:ml-6 space-y-10 my-10">
      {experience.map((job, index) => (
        <div key={index} className="relative pl-8 md:pl-12">
          {/* Timeline Dot */}
          <div className="absolute -left-[9px] top-0 h-5 w-5 rounded-full border-4 border-terminal-background bg-terminal-cyan shadow-[0_0_10px_rgba(0,215,215,0.5)]" />

          {/* Each role is its own canvas: it is built when it scrolls into view */}
          <BuildCanvas
            variant="bare"
            frames={[entryFrame(index)]}
            scripts={entryScripts(index)}
          >
            <div data-build={`job-${index}`}>
              <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between mb-2">
                <h3
                  className={
                    isReader
                      ? "reader-item__title"
                      : "text-xl font-bold text-terminal-foreground"
                  }
                  data-type={`job-${index}-title`}
                >
                  {job.title}
                </h3>
                <div
                  className={
                    isReader
                      ? "flex items-center reader-meta mt-1 sm:mt-0"
                      : "flex items-center text-sm text-terminal-cyan mt-1 sm:mt-0 font-medium font-mono"
                  }
                  data-type={`job-${index}-period`}
                >
                  <Calendar className="w-4 h-4 mr-2" />
                  {job.period}
                </div>
              </div>

              <div
                className={
                  isReader
                    ? "flex items-center reader-item__desc"
                    : "flex items-center text-terminal-comment mb-4 font-medium"
                }
                data-type={`job-${index}-company`}
              >
                <Briefcase className="w-4 h-4 mr-2" />
                {job.company}
              </div>

              <ul className="list-disc list-outside ml-4 space-y-2 text-muted-foreground">
                {job.description.map((desc, i) => (
                  <li
                    key={i}
                    className="pl-1"
                    data-reveal
                    style={{ "--i": i } as CSSProperties}
                  >
                    {desc}
                  </li>
                ))}
              </ul>
            </div>
          </BuildCanvas>
        </div>
      ))}
    </div>
  );
};

export default Timeline;
