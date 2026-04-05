import { BlogPost } from "@/components/BlogCard";

interface PostHeaderProps {
  post: BlogPost;
  getTagClass: (index: number) => string;
}

const PostHeader = ({ post, getTagClass }: PostHeaderProps) => {
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