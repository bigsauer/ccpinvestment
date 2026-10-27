import { SystemPage } from "@/components/public/SystemPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { SCHOOL_ADDRESS, SITE, absoluteUrl } from "@/lib/site";

export const revalidate = 60;

export default async function HomePage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": `${absoluteUrl("/")}#organization`,
              name: SITE.name,
              url: absoluteUrl("/"),
              logo: absoluteUrl("/brand/club-badge.png"),
              image: absoluteUrl("/brand/share.jpg"),
              description: SITE.description,
              foundingDate: SITE.foundedYear,
              parentOrganization: { "@type": "EducationalOrganization", name: SITE.school.name, url: SITE.school.url, address: SCHOOL_ADDRESS },
              areaServed: "St. Louis, MO",
            },
            {
              "@type": "WebSite",
              "@id": `${absoluteUrl("/")}#website`,
              url: absoluteUrl("/"),
              name: SITE.name,
              description: SITE.description,
              inLanguage: "en-US",
              publisher: { "@id": `${absoluteUrl("/")}#organization` },
            },
          ],
        }}
      />
      <SystemPage slug="home" showNextMeeting />
    </>
  );
}
