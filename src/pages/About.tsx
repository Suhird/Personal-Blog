import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import myImage from "../images/Cartoonified-FaceShot.png";
import { FaDownload } from "react-icons/fa";
import Timeline from "@/components/Timeline";
import BuildCanvas, { BuildPanel } from "@/components/build/BuildCanvas";
import { useThemeMode } from "@/components/theme-mode-provider";
import {
  HERO_FRAMES,
  HERO_SCRIPTS,
  SKILLS_FRAMES,
  SKILLS_SCRIPTS,
  CONNECT_FRAMES,
  CONNECT_SCRIPTS,
} from "@/components/build/aboutScenes";

const About = () => {
  const { isReader } = useThemeMode();

  return (
    <Layout>
      <Helmet>
        <title>About - Suhird Singh | Software Engineer</title>
        <meta name="description" content="Learn about Suhird Singh, a software engineer passionate about backend systems, microservices, and cloud architecture." />
        <meta name="keywords" content="Suhird Singh, software engineer, about, experience, skills" />
        <meta property="og:title" content="About - Suhird Singh" />
        <meta property="og:description" content="Learn about Suhird Singh, a software engineer with expertise in backend systems and microservices." />
        <meta property="og:type" content="profile" />
        <meta property="og:url" content="https://suhird.me/about/" />
        <link rel="canonical" href="https://suhird.me/about/" />
      </Helmet>
      <div className={isReader ? "reader-container reader-page" : "blog-container py-16"}>
        {isReader ? <p className="reader-eyebrow">About</p> : null}
        <h1
          className={
            isReader
              ? "reader-title"
              : "text-4xl font-bold tracking-tight mb-8"
          }
        >
          About Me
        </h1>

        <a
          href="/Personal-Blog/Resume.pdf"
          download
          className={
            isReader
              ? "reader-about__download"
              : "flex items-center text-terminal-cyan hover:underline"
          }
        >
          <FaDownload className={isReader ? undefined : "mr-2"} />
          Download My Resume
        </a>
        <div
          className={
            isReader
              ? "prose max-w-none reader-prose"
              : "prose prose-lg max-w-none"
          }
        >
          <BuildCanvas frames={HERO_FRAMES} scripts={HERO_SCRIPTS}>
          <div className="flex flex-col md:flex-row gap-8 mb-10">
            <div className="md:w-1/3">
              <img
                src={myImage}
                alt="Suhird Singh"
                data-build="portrait"
                data-media
                className={
                  isReader
                    ? "reader-about__portrait w-full object-cover aspect-rectangle"
                    : "rounded-lg w-full object-cover aspect-rectangle"
                }
              />
            </div>
            <div className="md:w-2/3" data-build="bio">
              <h2 data-type="heading">Hi, I'm Suhird Singh</h2>
              <p className="text-muted-foreground" data-type="p1">
                I'm a senior software engineer and technical writer passionate
                about backend technologies, open source, and teaching through
                writing. I currently work at Mastercard, where I build scalable
                and robust tools for Threat Intelligence and Security Analytics. I am also a certified
                <b className="text-terminal-cyan"> Scrum Master PSM 1 </b>by{" "}
                <a href="https://www.scrum.org/professional-scrum-certifications/professional-scrum-master-assessments" target="_blank" rel="noreferrer" className="text-terminal-cyan hover:underline">
                  scrum.org
                </a>
              </p>
              <p className="text-muted-foreground" data-type="p2">
                This blog is my digital space where I share what I learn about
                software development, code optimization, and other technical
                topics. My goal is to explain complex concepts in a simple and approachable way.
                Sometimes I also write about stuff which is "Beyond Code".
              </p>
            </div>
          </div>
          </BuildCanvas>

          <h2>Professional Experience</h2>
          <BuildPanel>
            <Timeline />
          </BuildPanel>

          <h2>Skills & Technologies</h2>
          <BuildCanvas variant="panel" frames={SKILLS_FRAMES} scripts={SKILLS_SCRIPTS}>
            <div data-build="skills">
              <h3 className="text-xl font-semibold" data-type="skills-h1">
                Languages
              </h3>
              <p data-type="skills-v1">Python, Rust, Golang, Java, Typescript</p>

              <h3 className="text-xl font-semibold" data-type="skills-h2">
                AI & LLM
              </h3>
              <p data-type="skills-v2">
                Retrieval-Augmented Generation (hybrid retrieval, reranking), inference
                optimization (quantization, KV cache, vLLM), prompt-injection defence,
                LLM evals, embeddings & vector search, agents & tool calling
              </p>

              <h3 className="text-xl font-semibold" data-type="skills-h3">
                Frameworks & Libraries
              </h3>
              <p data-type="skills-v3">Flask, Django, Angular</p>

              <h3 className="text-xl font-semibold" data-type="skills-h4">
                Tools & Platforms
              </h3>
              <p data-type="skills-v4">Kafka, Docker, Kubernetes, AWS, GCP, Git, GitHub Actions</p>

              <h3 className="text-xl font-semibold" data-type="skills-h5">
                Databases
              </h3>
              <p data-type="skills-v5">PostgreSQL, Redis</p>
            </div>
          </BuildCanvas>

          <h2>Let's Connect</h2>
          <BuildCanvas variant="panel" frames={CONNECT_FRAMES} scripts={CONNECT_SCRIPTS}>
            <div data-build="connect">
              <p data-type="connect-p">
                I'm always interested in new opportunities, collaborations, or just
                connecting with like-minded people. Feel free to reach out via email
                or social media!
              </p>
              <div className="flex gap-4" data-reveal>
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
          </BuildCanvas>
        </div>
      </div>
    </Layout>
  );
};

export default About;
