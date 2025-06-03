import { useParams, Link } from "react-router-dom";
import Layout from "@/components/Layout";
import { blogPosts } from "@/data/blogPosts";
import { useEffect, useState } from "react";
import { loadMarkdownFile } from "@/utils/markdownLoader";
import MarkdownRenderer from "@/components/blog/MarkdownRenderer";
import PostHeader from "@/components/blog/PostHeader";
import ShareLinks from "@/components/blog/ShareLinks";
import PostNotFound from "@/components/blog/PostNotFound";
import TableOfContents from "@/components/blog/TableOfContents";

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

  return (
    <Layout>
      <article className="blog-container py-16">
        <Link to="/blog" className="blog-link mb-8 inline-block">
          ← Back to Blog
        </Link>

        <PostHeader post={post} getTagClass={getTagClass} />

        {!isLoading && contentToRender && (
          <TableOfContents content={contentToRender} />
        )}

        <div className="prose prose-sm prose-invert prose-code:text-terminal-yellow prose-pre:bg-terminal-background/50 prose-headings:text-terminal-accent max-w-none space-y-4">
          {isLoading ? (
            <div className="text-center">
              <p className="terminal-prompt">Loading content...</p>
            </div>
          ) : (
            <MarkdownRenderer content={contentToRender} />
          )}
        </div>

        <ShareLinks />
      </article>
    </Layout>
  );
};

export default BlogPost;
