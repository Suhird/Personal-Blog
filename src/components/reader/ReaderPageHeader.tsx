import type { ReactNode } from "react";

interface ReaderPageHeaderProps {
  eyebrow?: string;
  title: string;
  lede?: string;
  meta?: ReactNode;
}

const ReaderPageHeader = ({
  eyebrow,
  title,
  lede,
  meta,
}: ReaderPageHeaderProps) => (
  <header className="reader-page__header">
    {eyebrow ? <p className="reader-eyebrow">{eyebrow}</p> : null}
    <h1 className="reader-title">{title}</h1>
    {lede ? <p className="reader-lede">{lede}</p> : null}
    {meta ? <div className="reader-page__meta">{meta}</div> : null}
  </header>
);

export default ReaderPageHeader;
