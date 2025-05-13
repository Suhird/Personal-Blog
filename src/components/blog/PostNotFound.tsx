import { Link } from "react-router-dom";

const PostNotFound = () => {
  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
      <p className="mb-6">
        Sorry, the blog post you're looking for doesn't exist.
      </p>
      <Link to="/blog" className="blog-link">
        Back to Blog
      </Link>
    </div>
  );
};

export default PostNotFound;
