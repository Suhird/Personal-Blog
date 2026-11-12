import { Link } from "react-router-dom";
import type { BlogPost } from "@/components/BlogCard";
import { getPostPath } from "@/utils/postPaths";
import { categoryLabel, formatPostDate } from "@/lib/postDisplay";

interface ReaderPostRowProps {
  post: BlogPost;
  showDescription?: boolean;
  showTags?: boolean;
  onTagClick?: (tag: string) => void;
}

const ReaderPostRow = ({
  post,
  showDescription = true,
  showTags = false,
  onTagClick,
}: ReaderPostRowProps) => (
  <article className="reader-item">
    {post.series ? (
      <p className="reader-item__series">
        {post.series.title} · Part {post.series.order}
      </p>
    ) : null}

    <h2 className="reader-item__title">
      <Link to={getPostPath(post)}>{post.title}</Link>
    </h2>

    {showDescription ? (
      <p className="reader-item__desc">{post.description}</p>
    ) : null}

    <div className="reader-item__meta">
      <time dateTime={post.date}>{formatPostDate(post.date)}</time>
      <span className="reader-dot" aria-hidden="true">
        ·
      </span>
      <span>{post.readTime} read</span>
      <span className="reader-dot" aria-hidden="true">
        ·
      </span>
      <span>{categoryLabel(post.category)}</span>
    </div>

    {showTags && post.tags.length > 0 ? (
      <div className="reader-item__tags">
        {post.tags.map((tag) =>
          onTagClick ? (
            <button key={tag} type="button" onClick={() => onTagClick(tag)}>
              #{tag}
            </button>
          ) : (
            <span key={tag}>#{tag}</span>
          ),
        )}
      </div>
    ) : null}
  </article>
);

export default ReaderPostRow;
