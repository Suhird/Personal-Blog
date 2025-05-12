
import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { blogPosts } from "@/data/blogPosts";
import { useEffect, useState } from "react";
import ReactMarkdown from "react-markdown";
import { loadMarkdownFile } from "@/utils/markdownLoader";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((post) => post.slug === slug);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
    
    // Load markdown content if post exists and has a markdown file reference
    const loadContent = async () => {
      if (post?.markdownFile) {
        setIsLoading(true);
        try {
          const content = await loadMarkdownFile(post.markdownFile);
          setMarkdownContent(content);
        } catch (error) {
          console.error("Failed to load markdown:", error);
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    loadContent();
  }, [slug, post]);
  
  // Helper function to assign tag classes
  const getTagClass = (index: number) => {
    const classes = ["tag-1", "tag-2", "tag-3", "tag-4"];
    return classes[index % classes.length];
  };

  if (!post) {
    return (
      <Layout>
        <div className="blog-container py-16">
          <div className="text-center">
            <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
            <p className="mb-6">Sorry, the blog post you're looking for doesn't exist.</p>
            <Link to="/blog" className="blog-link">
              Back to Blog
            </Link>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <article className="blog-container py-16">
        <Link to="/blog" className="blog-link mb-8 inline-block">
          ← Back to Blog
        </Link>
        
        <header className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
            {post.title}
          </h1>
          <div className="flex gap-3 text-sm text-muted-foreground mb-4">
            <time dateTime={post.date}>{post.date}</time>
            <span>•</span>
            <span>{post.readTime} read</span>
          </div>
          <div className="flex flex-wrap">
            {post.tags.map((tag, index) => (
              <span key={tag} className={`tag ${getTagClass(index)}`}>
                {tag}
              </span>
            ))}
          </div>
        </header>
        
        <div className="prose prose-lg prose-invert prose-code:text-terminal-yellow prose-pre:bg-terminal-background/50 prose-headings:text-terminal-accent max-w-none">
          {isLoading ? (
            <div className="text-center">
              <p className="terminal-prompt">Loading content...</p>
            </div>
          ) : markdownContent ? (
            <ReactMarkdown>
              {markdownContent}
            </ReactMarkdown>
          ) : post.content ? (
            <ReactMarkdown>
              {post.content}
            </ReactMarkdown>
          ) : (
            <>
              <p>
                {post.description}
              </p>
              <p>
                Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit. Donec et mollis dolor. Praesent et diam eget libero egestas mattis sit amet vitae augue. Nam tincidunt congue enim, ut porta lorem lacinia consectetur.
              </p>
              <h2>Introduction</h2>
              <p>
                Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean ut gravida lorem. Ut turpis felis, pulvinar a semper sed, adipiscing id dolor.
              </p>
              <pre><code>{`function example() {
  console.log("This is a code sample");
  return true;
}`}</code></pre>
              <p>
                Pelientesque auctor nisi id magna consequat sagittis. Curabitur dapibus, enim sit amet elit pharetra tincidunt feugiat nisl imperdiet. Ut convallis libero in urna ultrices accumsan. Donec sed odio eros.
              </p>
            </>
          )}
        </div>
        
        <div className="mt-12 pt-8 border-t border-border">
          <h3 className="text-lg font-semibold mb-4">Share this article</h3>
          <div className="flex gap-4">
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-twitter">
                <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-linkedin">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                <rect width="4" height="12" x="2" y="9"></rect>
                <circle cx="4" cy="4" r="2"></circle>
              </svg>
            </a>
            <a href="#" className="text-muted-foreground hover:text-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-facebook">
                <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
              </svg>
            </a>
          </div>
        </div>
      </article>
    </Layout>
  );
};

export default BlogPost;
