import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/blogPosts";
import { X } from "lucide-react";

const Blog = () => {
  const [searchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const [isGrouped, setIsGrouped] = useState(false);

  const filteredPosts = tagFilter
    ? blogPosts.filter((post) => post.tags.includes(tagFilter))
    : blogPosts;

  // Grouping Logic
  const groupedPosts = (() => {
    if (!isGrouped) return { groups: {}, standalone: filteredPosts };

    const groups: { [key: string]: typeof blogPosts } = {};
    const standalone: typeof blogPosts = [];

    // First pass: organize into series or standalone
    filteredPosts.forEach(post => {
      if (post.series) {
        if (!groups[post.series.id]) {
          groups[post.series.id] = [];
        }
        groups[post.series.id].push(post);
      } else {
        standalone.push(post);
      }
    });

    // Sort posts within series by order
    Object.values(groups).forEach(group => {
      group.sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0));
    });

    return { groups, standalone };
  })();

  return (
    <Layout>
      <div className="py-8">
        <div className="mb-10 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-3 text-terminal-accent terminal-prompt">
              Blog Posts
            </h1>
            <p className="text-terminal-comment">
              ls -la ~/thoughts | grep "{tagFilter || "interesting"}"
            </p>
          </div>
          
          <button 
            onClick={() => setIsGrouped(!isGrouped)}
            className={`px-3 py-1.5 text-xs font-mono border rounded transition-colors ${
              isGrouped 
                ? "bg-terminal-purple/20 border-terminal-purple text-terminal-purple" 
                : "bg-terminal-comment/10 border-terminal-comment/30 text-terminal-comment hover:bg-terminal-comment/20"
            }`}
          >
            {isGrouped ? "[x] Group by Series" : "[ ] Group by Series"}
          </button>
        </div>

        {tagFilter && (
          <div className="mb-8 flex items-center gap-2 bg-terminal-cyan/10 border border-terminal-cyan/30 text-terminal-cyan px-4 py-2 rounded-md w-fit">
            <span className="text-sm font-mono">
              Filtered by: <span className="font-bold">{tagFilter}</span>
            </span>
            <Link
              to="/blog"
              className="hover:bg-terminal-cyan/20 rounded p-0.5 transition-colors"
              aria-label="Clear filter"
            >
              <X size={16} />
            </Link>
          </div>
        )}

        <div className="space-y-8">
          {filteredPosts.length > 0 ? (
            isGrouped ? (
              <div className="space-y-12">
                {/* Render Series Groups First */}
                {Object.values(groupedPosts.groups).map((group: any) => (
                  <div key={group[0].series.id} className="border border-terminal-purple/30 rounded-lg p-6 bg-terminal-purple/5">
                    <h3 className="text-lg font-bold text-terminal-purple mb-4 flex items-center gap-2">
                       <span className="text-2xl">📚</span> {group[0].series.title} Series
                    </h3>
                    <div className="space-y-6 pl-4 border-l-2 border-terminal-purple/20">
                      {group.map((post: any) => (
                        <div key={post.id} className="relative">
                          <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-terminal-purple border-4 border-terminal-background"></div>
                          <BlogCard post={post} />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
                
                {/* Render Standalone Posts */}
                {groupedPosts.standalone.length > 0 && (
                   <div className="space-y-8">
                      {Object.keys(groupedPosts.groups).length > 0 && (
                        <div className="flex items-center gap-2 text-terminal-comment pb-2 border-b border-terminal-comment/20 mt-8">
                          <span className="text-xl">📝</span> <span className="font-mono text-sm uppercase tracking-wider">Independent Posts</span>
                        </div>
                      )}
                      {groupedPosts.standalone.map((post: any) => (
                        <BlogCard key={post.id} post={post} />
                      ))}
                   </div>
                )}
              </div>
            ) : (
              filteredPosts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))
            )
          ) : (
            <div className="text-center py-10 text-terminal-comment">
              <p>No posts found with tag "{tagFilter}"</p>
              <Link to="/blog" className="text-terminal-cyan hover:underline mt-2 inline-block">
                View all posts
              </Link>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default Blog;
