import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import ReaderPageHeader from "@/components/reader/ReaderPageHeader";
import ReaderPostRow from "@/components/reader/ReaderPostRow";

interface ReaderPostListProps {
  category: "tech" | "life";
  pageTitle: string;
  pageDescription: string;
  canonicalPath: string;
}

const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const ReaderPostList = ({
  category,
  pageTitle,
  pageDescription,
  canonicalPath,
}: ReaderPostListProps) => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tagFilter = searchParams.get("tag");
  const yearFilter = searchParams.get("year");
  const monthFilter = searchParams.get("month");

  // Standalone posts in this section, plus the years that contain them.
  const { postsInCategory, years } = useMemo(() => {
    const categoryPosts = blogPosts.filter(
      (post) => !post.series && (post.category || "tech") === category,
    );

    const yearSet = new Set<string>();
    categoryPosts.forEach((post) => {
      yearSet.add(new Date(post.date).getFullYear().toString());
    });

    return {
      postsInCategory: categoryPosts,
      years: Array.from(yearSet).sort((a, b) => Number(b) - Number(a)),
    };
  }, [category]);

  // Months are only offered for the selected year and only when they
  // actually contain a standalone post in this section.
  const availableMonths = useMemo(() => {
    if (!yearFilter) return [];

    const monthSet = new Set<string>();
    postsInCategory.forEach((post) => {
      const date = new Date(post.date);
      if (date.getFullYear().toString() === yearFilter) {
        monthSet.add(date.toLocaleString("default", { month: "long" }));
      }
    });

    return MONTHS.filter((month) => monthSet.has(month));
  }, [postsInCategory, yearFilter]);

  // Filter posts by category, year, month, tag (same rules as the terminal listing).
  const filteredPosts = useMemo(() => {
    let posts = postsInCategory;

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
  }, [postsInCategory, tagFilter, yearFilter, monthFilter]);

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

  const hasActiveFilters = Boolean(tagFilter || yearFilter || monthFilter);
  const postCount = filteredPosts.length;

  return (
    <div className="reader-page">
      <div className="reader-container">
        <ReaderPageHeader
          eyebrow={category === "life" ? "Life" : "Writing"}
          title={pageTitle}
          lede={pageDescription}
          meta={`${postCount} ${postCount === 1 ? "post" : "posts"}`}
        />

        <details
          className="reader-filters"
          open={hasActiveFilters || undefined}
        >
          <summary>Archive &amp; filters</summary>

          <div className="reader-filters__body">
            {years.length > 0 ? (
              <div className="reader-filter-group">
                <span className="reader-filter-label">Year</span>
                {years.map((year) => (
                  <button
                    key={year}
                    type="button"
                    className={
                      yearFilter === year
                        ? "reader-filter-chip is-active"
                        : "reader-filter-chip"
                    }
                    aria-pressed={yearFilter === year}
                    onClick={() =>
                      updateFilter("year", yearFilter === year ? null : year)
                    }
                  >
                    {year}
                  </button>
                ))}
              </div>
            ) : null}

            {yearFilter && availableMonths.length > 0 ? (
              <div className="reader-filter-group">
                <span className="reader-filter-label">Month</span>
                {availableMonths.map((month) => (
                  <button
                    key={month}
                    type="button"
                    className={
                      monthFilter === month
                        ? "reader-filter-chip is-active"
                        : "reader-filter-chip"
                    }
                    aria-pressed={monthFilter === month}
                    onClick={() =>
                      updateFilter(
                        "month",
                        monthFilter === month ? null : month,
                      )
                    }
                  >
                    {month}
                  </button>
                ))}
              </div>
            ) : null}

            {tagFilter ? (
              <div className="reader-filter-group">
                <span className="reader-filter-label">Tag</span>
                <button
                  type="button"
                  className="reader-filter-chip is-active"
                  onClick={() => updateFilter("tag", null)}
                  aria-label={`Clear tag filter: ${tagFilter}`}
                >
                  #{tagFilter} <span aria-hidden="true">×</span>
                </button>
              </div>
            ) : null}

            {hasActiveFilters ? (
              <div>
                <button
                  type="button"
                  className="reader-filter-clear"
                  onClick={clearAllFilters}
                >
                  Clear all filters
                </button>
              </div>
            ) : null}
          </div>
        </details>

        {postCount > 0 ? (
          <div className="reader-list">
            {filteredPosts.map((post) => (
              <ReaderPostRow
                key={post.id}
                post={post}
                showTags
                onTagClick={(tag) => updateFilter("tag", tag)}
              />
            ))}
          </div>
        ) : (
          <div role="status">
            <p className="reader-item__desc">
              Nothing published under these filters.{" "}
              <Link to={canonicalPath} className="reader-link">
                See all {pageTitle} posts
              </Link>
            </p>
            <button
              type="button"
              className="reader-filter-clear"
              onClick={clearAllFilters}
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReaderPostList;
