
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
  markdownFile?: string;
  series?: {
    id: string;
    title: string;
    order: number;
  };
}

interface BlogCardProps {
  post: BlogPost;
  index?: number;
}

const BlogCard = ({ post, index }: BlogCardProps) => {
  const getTagClass = (index: number) => {
    const classes = ["tag-1", "tag-2", "tag-3", "tag-4"];
    return classes[index % classes.length];
  };

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
    <article className="pb-2 mb-2">
      {post.series && (
        <div className="flex items-center gap-2 mb-1 text-xs font-medium text-terminal-purple">
          <span className="bg-terminal-purple/10 px-2 py-0.5 rounded border border-terminal-purple/20">
            Series: {post.series.title} — Part {post.series.order}
          </span>
        </div>
      )}
      <h2 className="post-title text-lg">
        {index !== undefined && <span className="text-terminal-comment mr-1">{index + 1}.</span>}
        <Link to={`/blog/${post.slug}`} className="hover:underline">
          {post.title}
        </Link>
      </h2>
      <div className="text-sm text-terminal-comment mb-1">
        {post.date && formatDate(post.date)}
      </div>
      <div className="flex flex-wrap gap-2">
        {post.tags.map((tag, index) => (
          <Link
            key={tag}
            to={`/blog?tag=${tag}`}
            className={`tag ${getTagClass(index)} hover:opacity-80 transition-opacity`}
            onClick={(e) => e.stopPropagation()}
          >
            #{tag}
          </Link>
        ))}
      </div>
    </article>
  );
};

export default BlogCard;