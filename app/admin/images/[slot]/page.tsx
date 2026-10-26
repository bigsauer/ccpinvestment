import Link from "next/link";
import { notFound } from "next/navigation";
import { AdminForm } from "@/components/admin/AdminForm";
import { ConfirmAction } from "@/components/admin/ConfirmAction";
import { ImageEditor } from "@/components/admin/ImageEditor";
import { Topbar } from "@/components/admin/Topbar";
import { resetSiteImage, saveSiteImage } from "@/lib/actions/admin";
import { getSiteImages } from "@/lib/queries";
import { slotDef } from "@/lib/site-images";

export default async function SiteImageEditPage({ params }: { params: Promise<{ slot: string }> }) {
  const { slot } = await params;
  const def = slotDef(slot);
  if (!def) notFound();
  const images = await getSiteImages();
  const image = images[def.slot];

  return (
    <>
      <Topbar crumbs={["Admin", "Site images", def.label]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              {def.label.split(":")[0]}: <span className="serif">{def.label.split(":")[1]?.trim() ?? "photo"}</span>
            </h1>
            <p className="sub">{def.where} Nothing goes live until you press Publish.</p>
          </div>
          <div className="r">
            <Link href="/admin/images" className="btn">
              ← All photos
            </Link>
            <Link href={def.path} target="_blank" className="btn">
              View the page
            </Link>
          </div>
        </div>
        <div className="card" style={{ padding: 22, maxWidth: 980 }}>
          <AdminForm action={saveSiteImage} submitLabel="Publish to the site" pendingLabel="Publishing…">
            <input type="hidden" name="slot" value={def.slot} />
            <ImageEditor
              kind={def.kind}
              sample={def.sample}
              current={{ src: image.src, x: image.x, y: image.y, alt: image.alt }}
              original={{ src: def.defaultSrc, x: def.defaultFocus.x, y: def.defaultFocus.y }}
            />
          </AdminForm>
          {image.custom ? (
            <div style={{ marginTop: 18, paddingTop: 16, borderTop: "1px solid var(--line)" }}>
              <ConfirmAction action={resetSiteImage.bind(null, def.slot)} confirm="Put the original photo back on the site?" className="btn danger" redirectTo="/admin/images">
                Put the original photo back
              </ConfirmAction>
            </div>
          ) : null}
        </div>
      </div>
    </>
  );
}
