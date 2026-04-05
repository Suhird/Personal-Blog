import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { blogPosts } from "@/data/blogPosts";
import { useEffect, useState } from "react";
import { loadMarkdownFile } from "@/utils/markdownLoader";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import PostHeader from "@/components/blog/PostHeader";
import ShareLinks from "@/components/blog/ShareLinks";
import PostNotFound from "@/components/blog/PostNotFound";
import TableOfContents from "@/components/blog/TableOfContents";
import SeriesNavigation from "@/components/blog/SeriesNavigation";
import { ArrowUp } from "lucide-react";

const BlogPost = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((post) => post.slug === slug);
  const [markdownContent, setMarkdownContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);
  const [showTopButton, setShowTopButton] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);

    const handleScroll = () => {
      setShowTopButton(window.scrollY > 400);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  useEffect(() => {
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
        <Helmet>
          <title>Post Not Found - Suhird's Blog</title>
          <meta name="robots" content="noindex, follow" />
        </Helmet>
        <div className="blog-container py-16">
          <PostNotFound />
        </div>
      </Layout>
    );
  }

  const contentToRender =
    markdownContent ||
    post.content ||
    `
# ${post.title}

${post.description}

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec a diam lectus. Sed sit amet ipsum mauris. Maecenas congue ligula ac quam viverra nec consectetur ante hendrerit.

## Introduction

Donec ut libero sed arcu vehicula ultricies a non tortor. Lorem ipsum dolor sit amet, consectetur adipiscing elit.

\`\`\`javascript
function example() {
  console.log("This is a code sample");
  return true;
}
\`\`\`

Pelientesque auctor nisi id magna consequat sagittis.
`;

  // Construct canonical URL
  const canonicalUrl = `https://suhird.me/blog/${post.slug}/`;

  // Create JSON-LD schema for blog post
  const jsonLdSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.description,
    "datePublished": post.date,
    "dateModified": post.date,
    "author": {
      "@type": "Person",
      "name": "Suhird Singh",
      "url": "https://suhird.me/"
    },
    "url": canonicalUrl,
    "keywords": post.tags.join(", "),
    "articleBody": contentToRender
  };

  return (
    <Layout>
      <Helmet>
        <title>{post.title} - Suhird's Blog</title>
        <meta name="description" content={post.description} />
        <meta name="keywords" content={post.tags.join(", ")} />
        <meta name="author" content="Suhird Singh" />
        <meta name="robots" content="index, follow" />
        
        {/* Open Graph Tags */}
        <meta property="og:type" content="article" />
        <meta property="og:title" content={post.title} />
        <meta property="og:description" content={post.description} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:site_name" content="Suhird's Blog" />
        
        {/* Twitter Card Tags */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={post.title} />
        <meta name="twitter:description" content={post.description} />
        
        {/* Canonical URL */}
        <link rel="canonical" href={canonicalUrl} />
        
        {/* JSON-LD Schema */}
        <script type="application/ld+json">
          {JSON.stringify(jsonLdSchema)}
        </script>
      </Helmet>
      <article className="blog-container py-16">
        <Link to="/blog" className="blog-link mb-8 inline-block">
          ← Back to Blog
        </Link>

        <PostHeader post={post} getTagClass={getTagClass} />

        {!isLoading && contentToRender && (
          <TableOfContents content={contentToRender} />
        )}

        <div className="post-content">
          {isLoading ? (
            <div className="text-center">
              <p className="terminal-prompt">Loading content...</p>
            </div>
          ) : (
            <MarkdownRenderer content={contentToRender} />
          )}
        </div>

        <SeriesNavigation 
          currentPost={post} 
          allPosts={blogPosts} 
          className="mt-8 pt-8 border-t border-terminal-comment/30"
        />
        <ShareLinks title={post.title} url={canonicalUrl} />

        {showTopButton && (
          <button
            onClick={scrollToTop}
            className="fixed bottom-8 right-8 p-3 rounded-full bg-terminal-cyan/20 border border-terminal-cyan/50 text-terminal-cyan hover:bg-terminal-cyan/30 transition-all shadow-[0_0_12px_rgba(6,182,212,0.3)]"
            aria-label="Go to top"
          >
            <ArrowUp size={20} />
          </button>
        )}
      </article>
    </Layout>
  );
};

export default BlogPost;
