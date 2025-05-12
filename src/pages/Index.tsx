import { Link } from "react-router-dom";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/blogPosts";

const Index = () => {
  // Get the latest 3 posts to feature
  const featuredPosts = blogPosts.slice(0, 3);

  return (
    <Layout>
      <section className="py-10">
        <div className="mb-12 space-y-4">
          <h1 className="text-3xl sm:text-2xl font-bold tracking-tight text-terminal-accent ">
            Suhird Singh
          </h1>
          <div className="text-terminal-foreground">
            <p className="mb-2 terminal-prompt">
              Software Engineer & Technical Writer
            </p>
            <p className="text-terminal-comment mb-4">
              # I write about Backend Development, Rust, Python, Gaming and much
              more
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 py-4 border-b">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-terminal-purple">
                $ what-i-do.sh
              </h2>
              <ul className="space-y-1 text-terminal-foreground">
                <li className="terminal-prompt">Full-Stack Development</li>
                <li className="terminal-prompt">Technical Writing</li>
                <li className="terminal-prompt">Cloud Architecture</li>
                <li className="terminal-prompt">Open Source Contributions</li>
              </ul>
            </div>

            <div className="space-y-2">
              <h2 className="text-xl font-bold text-terminal-purple">
                $ tech-stack.sh
              </h2>
              <div className="flex flex-wrap gap-2">
                <span className="tag tag-1">Python</span>
                <span className="tag tag-2">Rust</span>
                <span className="tag tag-3">Golang</span>
                <span className="tag tag-4">Docker</span>
                <span className="tag tag-2">Kubernetes</span>
                <span className="tag tag-3">AWS</span>
                <span className="tag tag-1">PostgreSQL</span>
                <span className="tag tag-4">Typescript</span>
              </div>
            </div>
          </div>
        </div>

        <div className="py-8">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-terminal-green">
              $ cat latest_articles.md
            </h2>
            <Link
              to="/blog"
              className="text-terminal-cyan hover:text-terminal-green"
            >
              view-all.sh --articles
            </Link>
          </div>
          <div className="space-y-8">
            {featuredPosts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        </div>

        <section className="py-8 mt-4 border-t border-terminal-comment/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-terminal-yellow mb-4">
              $ ./contact.sh
            </h2>
            <p className="text-terminal-comment mb-6">
              echo "I'm always open to new opportunities and interesting
              conversations!"
            </p>
            <div className="flex justify-center">
              <Link
                to="/contact"
                className="bg-terminal-background border border-terminal-green text-terminal-green hover:bg-terminal-green/10 font-mono py-2 px-6 rounded"
              >
                ./send_message.sh
              </Link>
            </div>
          </div>
        </section>
      </section>
    </Layout>
  );
};

export default Index;
