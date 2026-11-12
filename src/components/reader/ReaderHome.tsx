import { Link } from "react-router-dom";
import { blogPosts } from "@/data/blogPosts";
import ReaderPostRow from "@/components/reader/ReaderPostRow";

interface SeriesSummary {
  id: string;
  title: string;
  count: number;
}

const LATEST_POST_COUNT = 6;

const summarizeSeries = (): SeriesSummary[] => {
  const groups = new Map<string, SeriesSummary>();

  blogPosts.forEach((post) => {
    if (!post.series) return;

    const existing = groups.get(post.series.id);
    if (existing) {
      existing.count += 1;
      return;
    }

    groups.set(post.series.id, {
      id: post.series.id,
      title: post.series.title,
      count: 1,
    });
  });

  return Array.from(groups.values()).sort((a, b) =>
    a.title.localeCompare(b.title),
  );
};

const series = summarizeSeries();

const ReaderHome = () => {
  const latestPosts = blogPosts.slice(0, LATEST_POST_COUNT);

  return (
    <div className="reader-container">
      <div className="reader-home">
        <header className="reader-home__hero">
          <p className="reader-eyebrow">Notes</p>
          <h1 className="reader-home__title">
            Writing about the systems we build, and the lives we live around
            them.
          </h1>
          <p className="reader-home__lede">
            Long-form essays on distributed systems, AI engineering, and the
            quieter parts of a working life.
          </p>
          <p className="reader-home__footnote">
            Suhird Singh · Software engineer in Canada · Long-form notes,
            published slowly.
          </p>
        </header>

        <section
          className="reader-home__section"
          aria-labelledby="reader-latest-writing-heading"
        >
          <div className="reader-home__section-head">
            <h2
              className="reader-section-title"
              id="reader-latest-writing-heading"
            >
              Latest writing
            </h2>
            <span className="reader-home__all">
              <Link to="/tech-blog/">Tech →</Link>
              <span aria-hidden="true"> · </span>
              <Link to="/beyond-code/">Life →</Link>
            </span>
          </div>

          <div className="reader-list">
            {latestPosts.map((post) => (
              <ReaderPostRow key={post.id} post={post} />
            ))}
          </div>
        </section>

        <section
          className="reader-home__section"
          aria-labelledby="reader-series-heading"
        >
          <div className="reader-home__section-head">
            <h2 className="reader-section-title" id="reader-series-heading">
              Series
            </h2>
            <Link to="/series/" className="reader-home__all">
              All series →
            </Link>
          </div>

          <ul className="reader-series-list">
            {series.map((item) => (
              <li key={item.id} className="reader-series">
                <div className="reader-home__section-head">
                  <h3 className="reader-item__title">
                    <Link to="/series/">{item.title}</Link>
                  </h3>
                  <span className="reader-series__count whitespace-nowrap">
                    {item.count} part{item.count === 1 ? "" : "s"}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </section>

        <section
          className="reader-home__section"
          aria-labelledby="reader-about-heading"
        >
          <div className="reader-home__section-head">
            <h2 className="reader-section-title" id="reader-about-heading">
              About
            </h2>
          </div>
          <p className="reader-item__desc">
            I write to think clearly about software and the life around it.{" "}
            <Link to="/about/" className="reader-link">
              More about me →
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
};

export default ReaderHome;
