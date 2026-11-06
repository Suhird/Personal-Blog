import BlogListing from "@/components/blog/BlogListing";

const TechBlog = () => {
  return (
    <BlogListing
      category="tech"
      pageTitle="TechBlog"
      pageDescription="Technical deep dives into AI, security, distributed systems, Python, Rust, and the architecture behind modern software."
      canonicalPath="/tech-blog/"
    />
  );
};

export default TechBlog;
