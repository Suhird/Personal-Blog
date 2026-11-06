import { Navigate, useParams } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import { getPostPath } from "@/utils/postPaths";

/**
 * The site used to serve every article from /blog/<slug>/.
 * Those links are still in the wild (bookmarks, old posts, search results),
 * so resolve the slug and send the reader to its canonical section URL.
 */
const LegacyPostRedirect = () => {
  const { slug } = useParams<{ slug: string }>();
  const post = blogPosts.find((candidate) => candidate.slug === slug);

  return <Navigate to={post ? getPostPath(post) : "/tech-blog/"} replace />;
};

export default LegacyPostRedirect;
