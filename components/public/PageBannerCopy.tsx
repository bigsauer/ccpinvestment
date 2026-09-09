import { pageText } from "@/lib/copy";

export function PageBannerCopy({
  blocks,
  crumbs,
  lede,
  children,
}: {
  blocks: Record<string, string>;
  crumbs: string;
  lede: string;
  children: React.ReactNode;
}) {
  const headline = pageText(blocks, "headline", "");
  const serif = pageText(blocks, "serif", "");

  return (
    <>
      <div className="crumbs">{pageText(blocks, "crumbs", crumbs)}</div>
      <h1>
        {headline ? (
          <>
            {headline}
            {serif ? (
              <>
                {" "}
                <span className="serif">{serif}</span>
              </>
            ) : null}
          </>
        ) : (
          children
        )}
      </h1>
      <p className="lede">{pageText(blocks, "lede", lede)}</p>
    </>
  );
}
