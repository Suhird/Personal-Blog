import BlogListing from "@/components/blog/BlogListing";

const TechBlog = () => {
  return (
    <BlogListing
      category="tech"
      pageTitle="TechBlog"
      pageDescription="Technical deep dives into gRPC, GraphQL, Python, Go, Rust, microservices, and cloud architecture."
      canonicalPath="/tech-blog/"
    />
  );
};

export default TechBlog;
