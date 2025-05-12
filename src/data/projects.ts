
export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  github: string;
  live?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "Personal Blog",
    description: "A clean and minimalist personal blog built with React, TypeScript, and Tailwind CSS. Features a responsive design and markdown support.",
    technologies: ["React", "TypeScript", "Tailwind CSS"],
    github: "https://github.com/yourusername/personal-blog",
    live: "https://your-blog-url.com"
  },
  {
    id: "2",
    name: "Go CLI Tool",
    description: "A command-line interface tool built with Go for automating common development tasks like project scaffolding and code generation.",
    technologies: ["Go", "Cobra", "Viper"],
    github: "https://github.com/yourusername/go-cli-tool"
  },
  {
    id: "3",
    name: "Kubernetes Monitoring Dashboard",
    description: "A real-time dashboard for monitoring Kubernetes clusters. Visualizes resource usage, pod status, and cluster health.",
    technologies: ["React", "Node.js", "Kubernetes API"],
    github: "https://github.com/yourusername/k8s-dashboard",
    live: "https://k8s-dashboard-demo.com"
  },
  {
    id: "4",
    name: "E-commerce API",
    description: "A RESTful API for e-commerce applications. Handles product catalog, user authentication, and order management.",
    technologies: ["Express.js", "MongoDB", "JWT"],
    github: "https://github.com/yourusername/ecommerce-api"
  }
];
