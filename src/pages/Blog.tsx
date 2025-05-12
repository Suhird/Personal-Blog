import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/blogPosts";

const Blog = () => {
  return (
    <Layout>
      <div className="py-8">
        <div className="mb-10">
          <h1 className="text-2xl font-bold tracking-tight mb-3 text-terminal-accent terminal-prompt">
            Blog Posts
          </h1>
          <p className="text-terminal-comment">
            ls -la ~/thoughts | grep "interesting"
          </p>
        </div>
        <div className="space-y-8">
          {blogPosts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
