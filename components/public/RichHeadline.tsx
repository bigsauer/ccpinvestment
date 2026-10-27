import { Fragment, type ReactNode } from "react";

/**
 * Headline text with light markup: a new line starts a new row, *word* becomes italic serif,
 * **word** becomes a red highlight. Everything else is plain text, so nothing can inject HTML.
 */
export function RichHeadline({ text }: { text: string }) {
  const lines = text.split("\n");
  return (
    <>
      {lines.map((line, li) => (
        <Fragment key={li}>
          {li > 0 ? <br /> : null}
          {pieces(line, `l${li}`)}
        </Fragment>
      ))}
    </>
  );
}

function pieces(line: string, key: string): ReactNode[] {
  const out: ReactNode[] = [];
  const pattern = /\*\*([^*]+)\*\*|\*([^*]+)\*/g;
  let last = 0;
  let n = 0;
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(line))) {
    if (match.index > last) out.push(line.slice(last, match.index));
    if (match[1] !== undefined) out.push(<span key={`${key}-${n++}`} className="red-light">{match[1]}</span>);
    else out.push(<span key={`${key}-${n++}`} className="serif">{match[2]}</span>);
    last = match.index + match[0].length;
  }
  if (last < line.length) out.push(line.slice(last));
  return out;
}
