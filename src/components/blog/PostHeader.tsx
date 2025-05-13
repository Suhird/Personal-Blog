import { BlogPost } from "@/components/BlogCard";

interface PostHeaderProps {
  post: BlogPost;
  getTagClass: (index: number) => string;
}

const PostHeader = ({ post, getTagClass }: PostHeaderProps) => {
  return (
    <header className="mb-10">
      <h1 className="text-3xl sm:text-4xl font-bold tracking-tight mb-3">
        {post.title}
      </h1>
      <div className="flex gap-3 text-sm text-muted-foreground mb-4">
        <time dateTime={post.date}>{post.date}</time>
        <span>•</span>
        <span>{post.readTime} read</span>
      </div>
      <div className="flex flex-wrap">
        {post.tags.map((tag, index) => (
          <span key={tag} className={`tag ${getTagClass(index)}`}>
            {tag}
          </span>
        ))}
      </div>
    </header>
  );
};

export default PostHeader;
