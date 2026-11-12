import { BlogPost } from "@/components/BlogCard";
import { useThemeMode } from "@/components/theme-mode-provider";
import { formatPostDate } from "@/lib/postDisplay";

interface PostHeaderProps {
  post: BlogPost;
  getTagClass: (index: number) => string;
}

const PostHeader = ({ post, getTagClass }: PostHeaderProps) => {
  const { isReader } = useThemeMode();

  if (isReader) {
    return (
      <header className="reader-post-header">
        <h1 className="reader-post-title">{post.title}</h1>
        <p className="reader-post-lede">{post.description}</p>
        <div className="reader-post-meta">
          <time dateTime={post.date}>{formatPostDate(post.date)}</time>
          <span aria-hidden="true">·</span>
          <span>{post.readTime} read</span>
        </div>
        <div className="reader-post-tags">
          {post.tags.map((tag) => (
            <span key={tag}>#{tag}</span>
          ))}
        </div>
      </header>
    );
  }

  return (
    <header className="mb-10 post-header">
      <h1 className="post-title font-bold">
        {post.title}
      </h1>
      <div className="flex gap-3 text-sm text-[var(--accent-alpha-70)] mb-4">
        <time dateTime={post.date}>{post.date}</time>
        <span>•</span>
        <span>{post.readTime} read</span>
      </div>
      <div className="flex flex-wrap gap-2 post-tags">
        {post.tags.map((tag, index) => (
          <span key={tag} className={`tag ${getTagClass(index)}`}>
            #{tag}
          </span>
        ))}
      </div>
    </header>
  );
};

export default PostHeader;
