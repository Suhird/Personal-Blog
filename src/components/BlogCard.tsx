
import { Link } from "react-router-dom";

export interface BlogPost {
  id: string;
  title: string;
  description: string;
  date: string;
  tags: string[];
  readTime: string;
  slug: string;
  content?: string;
  markdownFile?: string; // New property to store markdown file name
}

interface BlogCardProps {
  post: BlogPost;
}

const BlogCard = ({ post }: BlogCardProps) => {
  // Helper function to assign tag classes
  const getTagClass = (index: number) => {
    const classes = ["tag-1", "tag-2", "tag-3", "tag-4"];
    return classes[index % classes.length];
  };

  return (
    <article className="mb-8 border-b border-border pb-8">
      <div>
        <div className="space-y-2 mb-2">
          <h2 className="text-2xl font-bold tracking-tight">
            <Link to={`/blog/${post.slug}`} className="hover:text-blog-accent">
              {post.title}
            </Link>
          </h2>
        </div>
        <div className="flex gap-3 text-sm text-muted-foreground mb-4">
          <time dateTime={post.date}>{post.date}</time>
          <span>•</span>
          <span>{post.readTime} read</span>
        </div>
        <div className="mb-4 text-base text-muted-foreground">
          {post.description}
        </div>
        <div className="flex flex-wrap">
          {post.tags.map((tag, index) => (
            <span key={tag} className={`tag ${getTagClass(index)}`}>
              {tag}
            </span>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
