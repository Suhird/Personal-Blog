import { Link } from "react-router-dom";
import { BlogPost } from "@/components/BlogCard";
import { ChevronLeft, ChevronRight, List } from "lucide-react";

interface SeriesNavigationProps {
  currentPost: BlogPost;
  allPosts: BlogPost[];
}

const SeriesNavigation = ({ currentPost, allPosts }: SeriesNavigationProps) => {
  if (!currentPost.series) return null;

  const seriesId = currentPost.series.id;
  const seriesPosts = allPosts
    .filter((post) => post.series?.id === seriesId)
    .sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0));

  if (seriesPosts.length <= 1) return null;

  const currentIndex = seriesPosts.findIndex((post) => post.id === currentPost.id);
  const prevPost = seriesPosts[currentIndex - 1];
  const nextPost = seriesPosts[currentIndex + 1];

  return (
    <div className="my-10 border border-terminal-comment/30 rounded-lg overflow-hidden">
      <div className="bg-terminal-card p-4 border-b border-terminal-comment/30 flex items-center gap-2">
        <List size={18} className="text-terminal-purple" />
        <span className="text-sm font-mono text-terminal-comment uppercase">Series</span>
        <h3 className="font-bold text-terminal-foreground">{currentPost.series.title}</h3>
      </div>
      
      <div className="bg-terminal-background p-4">
        {/* Navigation Links */}
        <div className="flex justify-between items-center mb-6">
          <div>
            {prevPost ? (
              <Link to={`/blog/${prevPost.slug}`} className="group flex items-center gap-2 text-sm text-terminal-comment hover:text-terminal-cyan transition-colors">
                <ChevronLeft size={16} />
                <div className="flex flex-col items-start">
                  <span className="text-xs text-terminal-comment/50 font-mono">Previous</span>
                  <span className="group-hover:underline decoration-terminal-cyan/30">{prevPost.title}</span>
                </div>
              </Link>
            ) : (
                <div className="opacity-30 flex items-center gap-2 text-sm text-terminal-comment cursor-not-allowed">
                    <ChevronLeft size={16} />
                    <span>Start</span>
                </div>
            )}
          </div>
          
          <div className="text-center">
            <span className="text-sm font-mono text-terminal-comment">
              Part <span className="text-terminal-yellow">{currentPost.series.order}</span> of {seriesPosts.length}
            </span>
          </div>

          <div className="text-right">
            {nextPost ? (
              <Link to={`/blog/${nextPost.slug}`} className="group flex items-center justify-end gap-2 text-sm text-terminal-comment hover:text-terminal-cyan transition-colors">
                <div className="flex flex-col items-end">
                  <span className="text-xs text-terminal-comment/50 font-mono">Next</span>
                  <span className="group-hover:underline decoration-terminal-cyan/30">{nextPost.title}</span>
                </div>
                <ChevronRight size={16} />
              </Link>
            ) : (
                 <div className="opacity-30 flex items-center gap-2 text-sm text-terminal-comment cursor-not-allowed">
                    <span>End</span>
                    <ChevronRight size={16} />
                </div>
            )}
          </div>
        </div>

        {/* Series List */}
        <div className="space-y-1">
          {seriesPosts.map((post) => (
            <Link 
              key={post.id} 
              to={`/blog/${post.slug}`}
              className={`block p-2 rounded text-sm transition-colors ${
                post.id === currentPost.id 
                  ? "bg-terminal-cyan/10 text-terminal-cyan font-medium border-l-2 border-terminal-cyan pl-2" 
                  : "text-terminal-comment hover:bg-terminal-comment/10 hover:text-terminal-foreground pl-2.5"
              }`}
            >
              <span className="mr-2 opacity-50 font-mono">{post.series?.order}.</span>
              {post.title}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default SeriesNavigation;
