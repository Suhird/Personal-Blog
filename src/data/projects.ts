export interface Project {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  github: string;
  live?: string;
  image?: string;
}

export const projects: Project[] = [
  {
    id: "1",
    name: "ReviewLens",
    description: "AI-powered consumer review intelligence running entirely locally. Scrapes multi-source data and synthesizes real verdicts.",
    technologies: ["Python", "FastAPI", "React", "LLM"],
    github: "https://github.com/suhird/review-lens",
    image: "/projects/review_lens.png"
  },
  {
    id: "2",
    name: "Financial-Portfolio-Analysis-TUI",
    description: "Terminal User Interface for analyzing financial portfolios with real-time candlestick charts and tracking.",
    technologies: ["Python", "Textual", "Finance"],
    github: "https://github.com/suhird/Financial-Portfolio-Analysis-TUI",
    image: "/projects/finance_tui.png"
  },
  {
    id: "3",
    name: "HuffmanEncoding",
    description: "A data compression utility implementing Huffman Encoding algorithms to shrink data efficiently.",
    technologies: ["Python", "Algorithms", "Compression"],
    github: "https://github.com/suhird/HuffmanEncoding",
    image: "/projects/huffman.png"
  },
  {
    id: "4",
    name: "Dota2GameAutoAccept",
    description: "Script to automatically accept Dota 2 match queues to avoid missing matches after long waits.",
    technologies: ["Python", "OpenCV", "Automation"],
    github: "https://github.com/suhird/Dota2GameAutoAccept",
    image: "/projects/dota2.png"
  },
  {
    id: "5",
    name: "RSNAPneumoniaDetection",
    description: "A machine learning pipeline for detecting pneumonia from lung X-ray scans, built for the RSNA challenge.",
    technologies: ["Python", "PyTorch", "Computer Vision", "Medical Imaging"],
    github: "https://github.com/suhird/RSNAPneumoniaDetection",
    image: "/projects/rsna.png"
  },
  {
    id: "6",
    name: "AirbusShipDetection",
    description: "Satellite imagery analysis model for detecting and segmenting ships from Kaggle's Airbus dataset.",
    technologies: ["Python", "TensorFlow", "Keras", "Image Segmentation"],
    github: "https://github.com/suhird/AirbusShipDetection",
    image: "/projects/airbus.png"
  }
];
