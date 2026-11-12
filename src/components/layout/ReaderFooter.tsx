import { Link } from "react-router-dom";

const ReaderFooter = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="reader-footer">
      <div className="reader-container">
        <div className="reader-footer__rule" />
        <div className="reader-footer__inner">
          <p className="reader-footer__note">
            © {currentYear} Suhird Singh. Set in Newsreader and Inter, with
            JetBrains Mono for code.
          </p>
          <nav className="reader-footer__nav" aria-label="Footer">
            <Link to="/tech-blog/">Writing</Link>
            <Link to="/series/">Series</Link>
            <Link to="/projects/">Projects</Link>
            <Link to="/about/">About</Link>
            <a href="https://github.com/suhird" target="_blank" rel="noreferrer">
              GitHub
            </a>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default ReaderFooter;
