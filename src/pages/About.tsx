import Layout from "@/components/Layout";
import myImage from "../images/Cartoonified-FaceShot.png";
import { FaDownload } from "react-icons/fa";
import Timeline from "@/components/Timeline";

const About = () => {
  return (
    <Layout>
      <div className="blog-container py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About Me</h1>
        <a
          href="/Personal-Blog/Resume.pdf"
          download
          className="flex items-center text-terminal-cyan hover:underline"
        >
          <FaDownload className="mr-2" />
          Download My Resume
        </a>
        <div className="prose prose-lg max-w-none">
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="md:w-1/3">
              <img
                src={myImage}
                alt="image host"
                className="rounded-lg w-full object-cover aspect-rectangle"
              />
            </div>
            <div className="md:w-2/3">
              <h2>Hi, I'm Suhird Singh</h2>
              <p className="text-muted-foreground">
                I'm a senior software engineer and technical writer passionate
                about backend technologies, open source, and teaching through
                writing. I currently work at Mastercard, where I build scalable
                and robust tools for Threat Intelligence and Security Analytics. I am also a certified
                <b className="text-terminal-cyan"> Scrum Master PSM 1 </b>by{" "}
                <a href="https://www.scrum.org/professional-scrum-certifications/professional-scrum-master-assessments" target="_blank" rel="noreferrer" className="text-terminal-cyan hover:underline">
                  scrum.org
                </a>
              </p>
              <p className="text-muted-foreground">
                This blog is my digital space where I share what I learn about
                software development, code optimization, and other technical
                topics. My goal is to explain complex concepts in a simple and
                approachable way.
              </p>
            </div>
          </div>

          <h2>My Journey</h2>
          <p>
            I started coding when I was 15 years old, creating Solar System
            models in C++ .My second most loved subject is Physics hence writing
            orbital equations in C++ and simulating the solar system really got
            me hooked to Computer programming. My interest in programming grew
            throughout high school, leading me to pursue a Computer Science
            degree. During my Masters at University of Windsor, I learned a lot about Statistics, Machine Learning and Neural Networks.
          </p>
          <p>
            In my personal time, I enjoy playing video games, reading books and working on my stealth startup idea. 
          </p>

          <h2>Professional Experience</h2>
          <Timeline />

          <h2>Skills & Technologies</h2>
          <div>
            <h3 className="text-xl font-semibold">Languages</h3>
            <p>Python, Rust, Golang, Java, Typescript</p>

            <h3 className="text-xl font-semibold">Frameworks & Libraries</h3>
            <p>Flask, Django, Angular</p>

            <h3 className="text-xl font-semibold">Tools & Platforms</h3>
            <p>Kafka, Docker, Kubernetes, AWS, GCP, Git, GitHub Actions</p>

            <h3 className="text-xl font-semibold">Databases</h3>
            <p>PostgreSQL, Redis</p>
          </div>

          <h2>Let's Connect</h2>
          <p>
            I'm always interested in new opportunities, collaborations, or just
            connecting with like-minded people. Feel free to reach out via email
            or social media!
          </p>
          <div className="flex gap-4">
            {/* <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noreferrer"
              className="blog-link"
            >
              Twitter
            </a> */}
            <a
              href="https://github.com/suhird"
              target="_blank"
              rel="noreferrer"
              className="blog-link"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/suhird-singh/"
              target="_blank"
              rel="noreferrer"
              className="blog-link"
            >
              LinkedIn
            </a>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default About;
