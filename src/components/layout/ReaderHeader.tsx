import { Link, useLocation } from "react-router-dom";
import ModeToggle from "@/components/ModeToggle";

const navItems = [
  { label: "Writing", href: "/tech-blog/" },
  { label: "Life", href: "/beyond-code/" },
  { label: "Series", href: "/series/" },
  { label: "Projects", href: "/projects/" },
  { label: "About", href: "/about/" },
  { label: "Contact", href: "/contact/" },
];

const isActive = (pathname: string, href: string) => {
  const cleanPath = pathname.replace(/\/$/, "") || "/";
  const cleanHref = href.replace(/\/$/, "") || "/";
  return cleanPath === cleanHref || cleanPath.startsWith(`${cleanHref}/`);
};

const ReaderHeader = () => {
  const { pathname } = useLocation();

  return (
    <header className="reader-header">
      <div className="reader-container">
        <div className="reader-header__top">
          <div className="reader-header__identity">
            <Link to="/" className="reader-brand">
              Suhird Singh
            </Link>
            <p className="reader-tagline">
              Software engineer. Notes on systems, code, and the life around them.
            </p>
          </div>
          <ModeToggle />
        </div>

        <nav className="reader-nav" aria-label="Primary">
          {navItems.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className={
                isActive(pathname, item.href)
                  ? "reader-nav__link is-active"
                  : "reader-nav__link"
              }
              aria-current={
                isActive(pathname, item.href) ? "page" : undefined
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
};

export default ReaderHeader;
