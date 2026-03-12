
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
  series?: {
    id: string;
    title: string;
    order: number;
  };
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

  // Convert full month name to 3-letter abbreviation
  const formatDate = (dateString: string) => {
    const months: { [key: string]: string } = {
      January: "Jan",
      February: "Feb",
      March: "Mar",
      April: "Apr",
      May: "May",
      June: "Jun",
      July: "Jul",
      August: "Aug",
      September: "Sep",
      October: "Oct",
      November: "Nov",
      December: "Dec",
    };

    return dateString.replace(
      new RegExp(`\\b(${Object.keys(months).join("|")})\\b`),
      (match) => months[match]
    );
  };

  return (
    <article className="mb-4 pb-4">
      <div>
        <div className="space-y-2 mb-3">
          <h2 className="text-lg font-semibold tracking-tight">
            {post.series && (
              <div className="flex items-center gap-2 mb-2 text-xs font-medium text-terminal-purple">
                <span className="bg-terminal-purple/10 px-2 py-0.5 rounded border border-terminal-purple/20">
                  Series: {post.series.title} — Part {post.series.order}
                </span>
              </div>
            )}
            <Link to={`/blog/${post.slug}`} className="hover:text-blog-accent">
              {post.date && <span className="text-terminal-comment mr-4">{formatDate(post.date)}:</span>}
              <span className="underline">{post.title}</span>
            </Link>
          </h2>
        </div>
        <div className="flex flex-wrap gap-2">
          {post.tags.map((tag, index) => (
            <Link
              key={tag}
              to={`/blog?tag=${tag}`}
              className={`tag ${getTagClass(index)} hover:opacity-80 transition-opacity text-xs`}
              onClick={(e) => e.stopPropagation()}
            >
              {tag}
            </Link>
          ))}
        </div>
      </div>
    </article>
  );
};

export default BlogCard;
