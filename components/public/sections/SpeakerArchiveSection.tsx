import { SpeakerArchive } from "@/components/public/SpeakerFilters";
import { JsonLd } from "@/components/seo/JsonLd";
import { getSpeakers } from "@/lib/queries";
import { SITE, absoluteUrl, speakerSlug } from "@/lib/site";
import { parseHighlights } from "@/lib/speakers";

/** Every speaker with filters, profile pop-ups and career stories. Comes from Speakers in the admin. */
export async function SpeakerArchiveSection() {
  const speakers = await getSpeakers();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "CollectionPage",
          name: `Guest speakers | ${SITE.name}`,
          url: absoluteUrl("/speakers"),
          mainEntity: {
            "@type": "ItemList",
            itemListElement: speakers.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              url: absoluteUrl(`/speakers/${speakerSlug(s.firstName, s.lastName)}`),
              name: `${s.firstName} ${s.lastName}`,
            })),
          },
        }}
      />
      <section className="section">
        <div className="wrap">
          <SpeakerArchive
            speakers={speakers.map((speaker) => ({
              id: speaker.id,
              firstName: speaker.firstName,
              lastName: speaker.lastName,
              firm: speaker.firm,
              title: speaker.title,
              topic: speaker.topic,
              season: speaker.season,
              status: speaker.status,
              sessionDate: speaker.sessionDate?.toISOString() ?? null,
              linkedinUrl: speaker.linkedinUrl,
              photoUrl: speaker.photoUrl,
              bio: speaker.bio,
              industry: speaker.industry,
              highlights: parseHighlights(speaker.highlights),
            }))}
          />
        </div>
      </section>
    </>
  );
}
