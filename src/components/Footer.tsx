
import { Link } from "react-router-dom";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="border-t border-terminal-comment/30 mt-auto pt-6">
      <div className="py-4">
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
          <div>
            <p className="text-sm text-terminal-comment">
              © {currentYear} Your Name | Built with <span className="text-terminal-red">♥</span> and React
            </p>
          </div>
          <nav className="flex flex-wrap gap-4 text-sm text-terminal-comment">
            <Link to="/" className="hover:text-terminal-cyan">
              cd ~
            </Link>
            <Link to="/blog" className="hover:text-terminal-cyan">
              cd ~/blog
            </Link>
            <Link to="/projects" className="hover:text-terminal-cyan">
              cd ~/projects
            </Link>
            <Link to="/about" className="hover:text-terminal-cyan">
              cd ~/about
            </Link>
            <Link to="/contact" className="hover:text-terminal-cyan">
              cd ~/contact
            </Link>
          </nav>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
