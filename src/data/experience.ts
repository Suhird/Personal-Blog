export interface Experience {
  title: string;
  company: string;
  period: string;
  description: string[];
}

export const experience: Experience[] = [
  {
    title: "Senior Software Engineer",
    company: "Mastercard",
    period: "September 2025 - Present",
    description: [
      "Building tools for Threat Intelligence and Security Analytics at Mastercard.",
      "Working with Python, async and multiprocessing.",
      "Mentoring junior developers and conducting code reviews.",
    ],
  },
  {
    title: "Senior Software Engineer",
    company: "GE Vernova",
    period: "May 2022 - July 2025",
    description: [
      "Developed scalable backend APIs for DERMS Grid software using Python and Flask.",
      "Integrated Kafka for real-time data streaming between modules.",
      "Optimized CSV and XML parsing by rewriting components in Rust (via PyO3), reducing processing time by 50%.",
      "Mentored junior developers and conducted code reviews.",
    ],
  },
  {
    title: "Full Stack Developer",
    company: "FieldEffect",
    period: "Jan 2021 - Apr 2022",
    description: [
      "Developed backend APIs and React-based frontend for a network security platform.",
      "Built new microservices for graph rendering and PDF generation.",
      "Integrated Twilio, CIRA, and ConnectWise APIs.",
    ],
  },
  {
    title: "Developer Intern",
    company: "Royal Bank of Canada - Internship",
    period: "Sep 2019 - Apr 2020",
    description: [
      "Built two internal web applications using Django and Material Design UI.",
      "Helped RBC reduce software licensing and training costs by up to $50K.",
    ],
  },
  {
    title: "Senior Systems Engineer",
    company: "Infosys",
    period: "Oct 2013 - Jul 2018",
    description: [
      "Led feature development for Adidas’s customizable product experience including 3D view.",
      "Helped increase Adidas’s revenue in the customized Teamwear clothing domain by $20M annually.",
    ],
  },
];
