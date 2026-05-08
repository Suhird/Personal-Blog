import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import BlogCard from "@/components/BlogCard";
import { blogPosts } from "@/data/blogPosts";
import { X, Calendar } from "lucide-react";

interface BlogListingProps {
  category: "tech" | "life";
  pageTitle: string;
  pageDescription: string;
  canonicalPath: string;
}

const BlogListing = ({ category, pageTitle, pageDescription, canonicalPath }: BlogListingProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const yearFilter = searchParams.get("year");
  const monthFilter = searchParams.get("month");

  // Extract unique years and months from standalone posts in this category
  const { years, months } = useMemo(() => {
    const yearSet = new Set<string>();
    const monthSet = new Set<string>();

    blogPosts
      .filter((p) => !p.series && (p.category || "tech") === category)
      .forEach((post) => {
        const date = new Date(post.date);
        yearSet.add(date.getFullYear().toString());
        monthSet.add(date.toLocaleString("default", { month: "long" }));
      });

    return {
      years: Array.from(yearSet).sort((a, b) => Number(b) - Number(a)),
      months: [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ],
    };
  }, [category]);

  // Filter posts by category, year, month, tag
  const filteredPosts = useMemo(() => {
    let posts = blogPosts.filter(
      (post) => !post.series && (post.category || "tech") === category
    );

    if (tagFilter) {
      posts = posts.filter((post) => post.tags.includes(tagFilter));
    }

    if (yearFilter) {
      posts = posts.filter((post) => {
        const date = new Date(post.date);
        return date.getFullYear().toString() === yearFilter;
      });
    }

    if (monthFilter) {
      posts = posts.filter((post) => {
        const date = new Date(post.date);
        return date.toLocaleString("default", { month: "long" }) === monthFilter;
      });
    }

    return posts;
  }, [tagFilter, yearFilter, monthFilter, category]);

  const updateFilter = (key: string, value: string | null) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    setSearchParams(newParams);
  };

  const clearAllFilters = () => {
    setSearchParams(new URLSearchParams());
  };

  const hasActiveFilters = tagFilter || yearFilter || monthFilter;

  const canonicalUrl = `https://suhird.me${canonicalPath}`;

  return (
    <Layout>
      <Helmet>
        <title>{pageTitle}</title>
        <meta name="description" content={pageDescription} />
        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={pageDescription} />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <link rel="canonical" href={canonicalUrl} />
      </Helmet>
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-[var(--heading-color)]">
            {pageTitle}
          </h1>
          <p className="text-terminal-comment text-sm">
            {filteredPosts.length} {filteredPosts.length === 1 ? "post" : "posts"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Archive */}
          <aside className="lg:w-48 shrink-0">
            <div className="bg-terminal-background border border-terminal-comment/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-4 pb-2 border-b border-terminal-comment/20">
                <Calendar size={14} className="text-terminal-cyan" />
                <span className="text-sm font-mono text-terminal-foreground">Archive</span>
              </div>

              {/* Years */}
              <div className="mb-4">
                <h3 className="text-xs font-mono text-terminal-comment uppercase tracking-wider mb-2">Years</h3>
                <div className="space-y-1">
                  {years.map((year) => (
                    <button
                      key={year}
                      onClick={() => updateFilter("year", yearFilter === year ? null : year)}
                      className={`block w-full text-left px-2 py-1 text-sm font-mono rounded transition-colors ${
                        yearFilter === year
                          ? "bg-terminal-cyan/20 text-terminal-cyan"
                          : "text-terminal-foreground hover:bg-terminal-comment/10"
                      }`}
                    >
                      {year}
                    </button>
                  ))}
                </div>
              </div>

              {/* Months */}
              {yearFilter && (
                <div>
                  <h3 className="text-xs font-mono text-terminal-comment uppercase tracking-wider mb-2">Months</h3>
                  <div className="space-y-1">
                    {months.map((month) => {
                      const hasPostsInMonth = blogPosts
                        .filter((p) => !p.series && (p.category || "tech") === category)
                        .some((post) => {
                          const date = new Date(post.date);
                          return (
                            date.getFullYear().toString() === yearFilter &&
                            date.toLocaleString("default", { month: "long" }) === month
                          );
                        });

                      if (!hasPostsInMonth) return null;

                      return (
                        <button
                          key={month}
                          onClick={() => updateFilter("month", monthFilter === month ? null : month)}
                          className={`block w-full text-left px-2 py-1 text-sm font-mono rounded transition-colors ${
                            monthFilter === month
                              ? "bg-terminal-cyan/20 text-terminal-cyan"
                              : "text-terminal-foreground hover:bg-terminal-comment/10"
                          }`}
                        >
                          {month}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Clear Filters */}
              {hasActiveFilters && (
                <button
                  onClick={clearAllFilters}
                  className="mt-4 w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-mono text-terminal-red border border-terminal-red/30 rounded hover:bg-terminal-red/10 transition-colors"
                >
                  <X size={12} />
                  Clear Filters
                </button>
              )}
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="mb-6 flex flex-wrap items-center gap-2">
                {yearFilter && (
                  <span className="px-3 py-1 text-xs font-mono bg-terminal-cyan/10 border border-terminal-cyan/30 text-terminal-cyan rounded">
                    Year: {yearFilter}
                    <button
                      onClick={() => updateFilter("year", null)}
                      className="ml-2 hover:text-terminal-red"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {monthFilter && (
                  <span className="px-3 py-1 text-xs font-mono bg-terminal-cyan/10 border border-terminal-cyan/30 text-terminal-cyan rounded">
                    Month: {monthFilter}
                    <button
                      onClick={() => updateFilter("month", null)}
                      className="ml-2 hover:text-terminal-red"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
                {tagFilter && (
                  <span className="px-3 py-1 text-xs font-mono bg-terminal-purple/10 border border-terminal-purple/30 text-terminal-purple rounded">
                    Tag: {tagFilter}
                    <Link
                      to={canonicalPath}
                      className="ml-2 hover:text-terminal-red"
                    >
                      <X size={12} />
                    </Link>
                  </span>
                )}
              </div>
            )}

            <div className="space-y-4">
              {filteredPosts.length > 0 ? (
                filteredPosts.map((post, i) => (
                  <BlogCard key={post.id} post={post} index={i} basePath={canonicalPath} />
                ))
              ) : (
                <div className="text-center py-10 text-terminal-comment">
                  <p>No posts found</p>
                  <button
                    onClick={clearAllFilters}
                    className="text-terminal-cyan hover:underline mt-2 inline-block"
                  >
                    Clear filters
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default BlogListing;
