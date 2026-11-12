import { Link } from "react-router-dom";
import { BlogPost } from "@/components/BlogCard";
import { ChevronLeft, ChevronRight, List } from "lucide-react";
import { getPostPath } from "@/utils/postPaths";
import { useThemeMode } from "@/components/theme-mode-provider";

interface SeriesNavigationProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
  className?: string;
}

const SeriesNavigation = ({ currentPost, allPosts, className = "" }: SeriesNavigationProps) => {
  const { isReader } = useThemeMode();

  if (!currentPost.series) return null;

  const seriesId = currentPost.series.id;
  const seriesPosts = allPosts
    .filter((post) => post.series?.id === seriesId)
    .sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0));

  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((post) => post.id === currentPost.id);
  const prevPost = seriesPosts[currentIndex - 1];
  const nextPost = seriesPosts[currentIndex + 1];

  if (isReader) {
    return (
      <div className="reader-series-nav">
        {prevPost ? (
          <Link to={getPostPath(prevPost)}>
            <span className="reader-series-nav__label">Previous</span>
            {prevPost.title}
          </Link>
        ) : (
          <div aria-hidden="true" />
        )}

        {nextPost ? (
          <Link to={getPostPath(nextPost)} className="reader-series-nav__next">
            <span className="reader-series-nav__label">Next</span>
            {nextPost.title}
          </Link>
        ) : (
          <div aria-hidden="true" />
        )}
      </div>
    );
  }

  return (
    <div className={`flex justify-between items-center ${className}`}>
      {prevPost ? (
        <Link 
          to={getPostPath(prevPost)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-terminal-comment border border-terminal-comment/30 rounded hover:bg-terminal-comment/10 hover:text-terminal-foreground hover:border-terminal-cyan transition-all"
        >
          <ChevronLeft size={16} />
          <span>Previous</span>
        </Link>
      ) : (
        <div /> // Empty div to maintain spacing if no previous post
      )}

      {nextPost && (
        <Link 
          to={getPostPath(nextPost)}
          className="flex items-center gap-2 px-4 py-2 text-sm font-mono text-terminal-comment border border-terminal-comment/30 rounded hover:bg-terminal-comment/10 hover:text-terminal-foreground hover:border-terminal-cyan transition-all"
        >
          <span>Next</span>
          <ChevronRight size={16} />
        </Link>
      )}
    </div>
  );
};

export default SeriesNavigation;
