import Layout from "@/components/Layout";
import { projects } from "@/data/projects";
import { AlertCircle } from "lucide-react";

const Projects = () => {
  return (
    <Layout>
      <div className="blog-container py-16 animate-in fade-in duration-500">
        <h1 className="text-4xl font-bold tracking-tight mb-3 text-terminal-accent terminal-prompt">
          Projects
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          A collection of my open source projects, experiments, and other work.
        </p>

        <div className="mb-10 p-4 bg-terminal-yellow/10 border border-terminal-yellow/30 rounded-lg flex items-start gap-3 text-terminal-yellow">
          <AlertCircle className="shrink-0 mt-0.5" size={20} />
          <p className="text-sm font-mono leading-relaxed">
            <strong>Warning:</strong> Some of my more advanced projects and current work exist in private repositories and are not displayed here. The projects below represent a selection of my public open-source portfolio.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {projects.map((project) => (
            <div
              key={project.id}
              className="border border-border rounded-lg overflow-hidden hover:shadow-md transition-shadow bg-terminal-background flex flex-col"
            >
              {project.image && (
                <div className="w-full h-48 overflow-hidden border-b border-border bg-black/40 flex items-center justify-center">
                  <img 
                    src={project.image} 
                    alt={project.name} 
                    className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity"
                  />
                </div>
              )}
              <div className="bg-secondary/20 p-4 border-b border-border">
                <h2 className="text-xl font-semibold mb-1">
                  <a 
                    href={project.github} 
                    target="_blank" 
                    rel="noreferrer" 
                    className="text-terminal-cyan hover:underline decoration-terminal-cyan/50 hover:text-terminal-green transition-colors"
                  >
                    {project.name}
                  </a>
                </h2>
                <div className="flex flex-wrap gap-2 mb-1">
                  {project.technologies.map((tech, index) => (
                    <span key={tech} className="text-xs font-mono px-2 py-0.5 rounded-full bg-terminal-purple/10 text-terminal-purple border border-terminal-purple/20">
                      {tech}
                    </span>
                  ))}
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1 justify-between">
                <p className="text-muted-foreground mb-6 text-sm flex-1">
                  {project.description}
                </p>

                <div className="flex justify-between items-center">
                  <div className="flex gap-2">
                    {project.live && (
                      <a
                        href={project.live}
                        target="_blank"
                        rel="noreferrer"
                        className="blog-link text-sm flex items-center gap-1"
                      >
                        <span>Live Demo</span>
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="lucide lucide-external-link"
                        >
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" x2="21" y1="14" y2="3"></line>
                        </svg>
                      </a>
                    )}
                  </div>

                  <a
                    href={project.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="20"
                      height="20"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-github"
                    >
                      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"></path>
                      <path d="M9 18c-4.51 2-5-2-7-2"></path>
                    </svg>
                    <span className="sr-only">GitHub</span>
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Projects;
