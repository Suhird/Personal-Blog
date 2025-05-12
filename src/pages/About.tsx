import Layout from "@/components/Layout";
import myImage from "../images/Cartoonified-FaceShot.png";

const About = () => {
  return (
    <Layout>
      <div className="blog-container py-16">
        <h1 className="text-4xl font-bold tracking-tight mb-8">About Me</h1>

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
                I'm a software engineer and technical writer passionate about
                web technologies, open source, and teaching through writing. I
                currently work at Company Name, where I build scalable cloud
                applications.
              </p>
              <p className="text-muted-foreground">
                This blog is my digital garden where I share what I learn about
                software development, cloud computing, and other technical
                topics. My goal is to explain complex concepts in a simple and
                approachable way.
              </p>
            </div>
          </div>

          <h2>My Journey</h2>
          <p>
            I started coding when I was 15 years old, creating simple websites
            with HTML and CSS. My interest in programming grew throughout high
            school, leading me to pursue a Computer Science degree. During
            university, I interned at several tech companies and contributed to
            open-source projects.
          </p>
          <p>
            After graduation, I joined a startup where I worked on building web
            applications using modern JavaScript frameworks. This experience
            taught me a lot about the full software development lifecycle and
            working in agile teams.
          </p>

          <h2>Professional Experience</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-xl font-semibold">
                Senior Software Engineer
              </h3>
              <p className="text-muted-foreground">
                Company Name • 2021 - Present
              </p>
              <ul>
                <li>Lead the development of cloud-native applications</li>
                <li>
                  Implemented CI/CD pipelines for automated testing and
                  deployment
                </li>
                <li>Mentored junior developers and conducted code reviews</li>
              </ul>
            </div>

            <div>
              <h3 className="text-xl font-semibold">Software Engineer</h3>
              <p className="text-muted-foreground">
                Previous Company • 2018 - 2021
              </p>
              <ul>
                <li>Developed RESTful APIs and microservices</li>
                <li>Built responsive web interfaces using React</li>
                <li>Optimized database queries and application performance</li>
              </ul>
            </div>
          </div>

          <h2>Skills & Technologies</h2>
          <div>
            <h3 className="text-xl font-semibold">Languages</h3>
            <p>JavaScript, TypeScript, Python, Go, SQL</p>

            <h3 className="text-xl font-semibold">Frameworks & Libraries</h3>
            <p>React, Node.js, Express, Next.js, Django</p>

            <h3 className="text-xl font-semibold">Tools & Platforms</h3>
            <p>Docker, Kubernetes, AWS, GCP, Git, GitHub Actions</p>

            <h3 className="text-xl font-semibold">Databases</h3>
            <p>PostgreSQL, MongoDB, Redis</p>
          </div>

          <h2>Let's Connect</h2>
          <p>
            I'm always interested in new opportunities, collaborations, or just
            connecting with like-minded people. Feel free to reach out via email
            or social media!
          </p>
          <div className="flex gap-4">
            <a
              href="https://twitter.com/yourusername"
              target="_blank"
              rel="noreferrer"
              className="blog-link"
            >
              Twitter
            </a>
            <a
              href="https://github.com/yourusername"
              target="_blank"
              rel="noreferrer"
              className="blog-link"
            >
              GitHub
            </a>
            <a
              href="https://linkedin.com/in/yourusername"
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
