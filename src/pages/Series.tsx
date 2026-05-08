import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import Layout from "@/components/Layout";
import { blogPosts } from "@/data/blogPosts";
import { Calendar, X } from "lucide-react";

interface SeriesGroup {
  id: string;
  title: string;
  posts: typeof blogPosts;
}

const Series = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const yearFilter = searchParams.get("year");
  const monthFilter = searchParams.get("month");
  const tagFilter = searchParams.get("tag");
  const [isExpanded, setIsExpanded] = useState<{ [key: string]: boolean }>({});

  // Extract unique years and months from series posts
  const { years, months } = useMemo(() => {
    const yearSet = new Set<string>();
    const monthSet = new Set<string>();

    blogPosts.filter(p => p.series).forEach(post => {
      const date = new Date(post.date);
      yearSet.add(date.getFullYear().toString());
      monthSet.add(date.toLocaleString("default", { month: "long" }));
    });

    return {
      years: Array.from(yearSet).sort((a, b) => Number(b) - Number(a)),
      months: ["January", "February", "March", "April", "May", "June", 
               "July", "August", "September", "October", "November", "December"]
    };
  }, []);

  // Get series groups filtered by year/month/tag
  const seriesGroups = useMemo(() => {
    let allPosts = blogPosts.filter((post) => post.series);

    if (tagFilter) {
      allPosts = allPosts.filter((post) => post.tags.includes(tagFilter));
    }

    if (yearFilter) {
      allPosts = allPosts.filter((post) => {
        const date = new Date(post.date);
        return date.getFullYear().toString() === yearFilter;
      });
    }

    if (monthFilter) {
      allPosts = allPosts.filter((post) => {
        const date = new Date(post.date);
        return date.toLocaleString("default", { month: "long" }) === monthFilter;
      });
    }

    const groupsMap: { [key: string]: SeriesGroup } = {};

    allPosts.forEach(post => {
      if (post.series) {
        if (!groupsMap[post.series.id]) {
          groupsMap[post.series.id] = {
            id: post.series.id,
            title: post.series.title,
            posts: [],
          };
        }
        groupsMap[post.series.id].posts.push(post);
      }
    });

    const groupsArray = Object.values(groupsMap);
    
    groupsArray.forEach(group => {
      group.posts.sort((a, b) => (a.series?.order || 0) - (b.series?.order || 0));
    });

    groupsArray.sort((a, b) => {
      const dateA = new Date(a.posts[0]?.date || 0);
      const dateB = new Date(b.posts[0]?.date || 0);
      return dateB.getTime() - dateA.getTime();
    });

    return groupsArray;
  }, [yearFilter, monthFilter, tagFilter]);

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

  const hasActiveFilters = yearFilter || monthFilter || tagFilter;

  const toggleSeries = (seriesId: string) => {
    setIsExpanded(prev => ({ ...prev, [seriesId]: !prev[seriesId] }));
  };

  return (
    <Layout>
      <Helmet>
        <title>Series - Suhird Singh | Technical Blog</title>
        <meta name="description" content="Browse blog post series on gRPC, GraphQL, Python, Rust, microservices, and cloud architecture." />
        <meta property="og:title" content="Series - Suhird Singh" />
        <meta property="og:description" content="Browse blog post series on gRPC, GraphQL, Python, Rust, microservices, and cloud architecture." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://suhird.me/series/" />
        <link rel="canonical" href="https://suhird.me/series/" />
      </Helmet>
      <div className="py-8">
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-2 text-[var(--heading-color)]">
            Series
          </h1>
          <p className="text-terminal-comment text-sm">
            {seriesGroups.length} {seriesGroups.length === 1 ? "series" : "series"}
          </p>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar - Archive Filter */}
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
                  {years.map(year => (
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
                    {months.map(month => {
                      const hasPostsInMonth = blogPosts.filter(p => p.series).some(post => {
                        const date = new Date(post.date);
                        return date.getFullYear().toString() === yearFilter && 
                               date.toLocaleString("default", { month: "long" }) === month;
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
                    <button 
                      onClick={() => updateFilter("tag", null)}
                      className="ml-2 hover:text-terminal-red"
                    >
                      <X size={12} />
                    </button>
                  </span>
                )}
              </div>
            )}

            <div className="space-y-4">
              {seriesGroups.length > 0 ? (
                seriesGroups.map((series) => (
                  <div 
                    key={series.id} 
                    className="border border-terminal-purple/30 rounded-lg p-4 bg-terminal-purple/5"
                  >
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-bold text-terminal-purple flex items-center gap-2">
                        <span className="text-xl">📚</span> {series.title} Series
                        <span className="text-sm font-normal text-terminal-comment ml-2">
                          ({series.posts.length} posts)
                        </span>
                      </h2>
                      <button
                        onClick={() => toggleSeries(series.id)}
                        className="text-terminal-comment hover:text-terminal-cyan text-sm"
                      >
                        {isExpanded[series.id] ? "[-] Collapse" : "[+] Expand"}
                      </button>
                    </div>
                    
                    {isExpanded[series.id] === true && (
                      <div className="space-y-4 pl-4 border-l-2 border-terminal-purple/20">
                        {series.posts.map((post, idx) => (
                          <div key={post.id} className="relative">
                            <div className="absolute -left-[21px] top-3 w-3 h-3 rounded-full bg-terminal-purple border-4 border-terminal-background"></div>
                            <div className="flex items-center gap-2 mb-1">
                              <span className="text-xs text-terminal-comment font-mono">
                                {idx + 1}.
                              </span>
                              <h3 className="post-title">
                                <Link to={`/blog/${post.slug}/`} className="hover:underline">
                                  {post.title}
                                </Link>
                              </h3>
                            </div>
                            <div className="flex items-center gap-4 ml-5">
                              <span className="text-sm text-terminal-comment">
                                {post.date}
                              </span>
                              <span className="text-terminal-comment/50">•</span>
                              <span className="text-sm text-terminal-comment">
                                {post.readTime} read
                              </span>
                            </div>
                            <p className="text-terminal-comment/70 text-sm mt-1 ml-5 mb-2">
                              {post.description}
                            </p>
                            <div className="flex flex-wrap gap-2 ml-5">
                              {post.tags.map((tag) => (
                                <button
                                  key={tag}
                                  onClick={() => updateFilter("tag", tag)}
                                  className="tag hover:opacity-80"
                                >
                                  #{tag}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center py-10 text-terminal-comment">
                  <p>No series found</p>
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

export default Series;
