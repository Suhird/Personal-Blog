import { Link } from "react-router-dom";
import { useThemeMode } from "@/components/theme-mode-provider";

const PostNotFound = () => {
  const { isReader } = useThemeMode();

  if (isReader) {
    return (
      <div className="reader-notfound">
        <p className="reader-eyebrow">404</p>
        <h1 className="reader-title">That page isn't here.</h1>
        <p className="reader-lede">
          The essay you're looking for may have moved, been renamed, or never
          existed. The writing is still in the archive.
        </p>
        <p>
          <Link to="/tech-blog/" className="reader-link">
            ← All writing
          </Link>
        </p>
      </div>
    );
  }

  return (
    <div className="text-center">
      <h1 className="text-3xl font-bold mb-4">Post Not Found</h1>
      <p className="mb-6">
        Sorry, the blog post you're looking for doesn't exist.
      </p>
      <Link to="/tech-blog/" className="blog-link">
        Back to TechBlog
      </Link>
    </div>
  );
};

export default PostNotFound;
