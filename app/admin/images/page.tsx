import Link from "next/link";
import { Topbar } from "@/components/admin/Topbar";
import { getSiteImages } from "@/lib/queries";
import { SITE_IMAGE_SLOTS } from "@/lib/site-images";

export default async function SiteImagesPage() {
  const images = await getSiteImages();

  return (
    <>
      <Topbar crumbs={["Admin", "Site images"]} />
      <div className="admin-page">
        <div className="admin-head">
          <div className="l">
            <h1>
              Photos on the site, <span className="serif">your call.</span>
            </h1>
            <p className="sub">
              Swap the big photos on the home page and page banners, set how they are cropped, and preview them on a computer and a phone before publishing.
              Speaker, member and officer photos are changed from their own pages.
            </p>
          </div>
        </div>
        <div className="img-grid">
          {SITE_IMAGE_SLOTS.map((def) => {
            const image = images[def.slot];
            return (
              <Link key={def.slot} href={`/admin/images/${def.slot}`} className="img-tile">
                <div className="thumb">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image.src} alt="" style={image.style} />
                </div>
                <div className="meta">
                  <div className="n">{def.label}</div>
                  <div className="admin-note" style={{ marginBottom: 8 }}>{def.where}</div>
                  <span className={`pill ${image.custom ? "green" : "gray"}`}>{image.custom ? "Custom photo" : "Original photo"}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
