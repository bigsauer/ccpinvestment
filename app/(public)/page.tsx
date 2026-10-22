import Image from "next/image";
import Link from "next/link";
import { CountUp } from "@/components/public/CountUp";
import { PublicNav } from "@/components/public/Nav";
import { pageText } from "@/lib/copy";
import { getClubSettings, getLivePageBlocks, getNextMeeting } from "@/lib/queries";
import { JsonLd } from "@/components/seo/JsonLd";
import { SCHOOL_ADDRESS, SITE, absoluteUrl } from "@/lib/site";
import { formatShortDate } from "@/lib/utils";

export const revalidate = 60;

export default async function HomePage() {
  const [settings, next, blocks] = await Promise.all([
    getClubSettings(),
    getNextMeeting(),
    getLivePageBlocks("home"),
  ]);
  const nextLabel = next
    ? `NEXT SESSION · ${formatShortDate(next.date).toUpperCase()}`
    : "SCHEDULE TBA";

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
      <PublicNav showNextMeeting />
      <main>
      <header className="hero-photo">
        <div className="hero-photo-inner">
          <Image
            className="hero-bg"
            src="/photos/session-02.jpg"
            alt="A Chaminade Investment Club meeting in session"
            fill
            priority
            sizes="100vw"
          />
          <div className="hero-overlay" />
          <div className="hero-content wrap">
            <div className="eyebrow light">
              <span className="dot" />
              <span>{settings.seasonLabel.toUpperCase()}</span>
              <span className="div" />
              <span>{nextLabel}</span>
            </div>
            <h1 className="display light">
              {pageText(blocks, "headline", "") ? (
                <>
                  {pageText(blocks, "headline", "")}
                  {pageText(blocks, "serif", "") ? (
                    <>
                      {" "}
                      <span className="serif">{pageText(blocks, "serif", "")}</span>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  Where the next generation
                  <br />
                  of <span className="serif">investors</span> <span className="red-light">meets the market.</span>
                </>
              )}
            </h1>
            <p className="lede light">
              {pageText(
                blocks,
                "lede",
                "A student-run club at Chaminade College Preparatory School bringing working professionals — portfolio managers, bankers, founders — into the room with students who are serious about finance.",
              )}
            </p>
            <div className="hero-ctas">
              <Link href="/get-involved?tab=students" className="btn red lg">
                Apply to join <span className="arrow">→</span>
              </Link>
              <Link href="/meetings" className="btn ghost lg">
                View schedule
              </Link>
            </div>
          </div>
          <div className="hero-caption">
            <span className="mono">04/16/26 · Spring session, Little Theatre</span>
          </div>
        </div>
      </header>

      <section className="logo-band">
        <div className="wrap logo-band-inner">
          <div className="logo-band-item">
            <Image src="/brand/club-mark.png" alt="Chaminade Investment Club" width={44} height={44} />
            <div>
              <div className="t">Chaminade Investment Club</div>
              <div className="s">Est. {settings.foundedYear} · Student-led</div>
            </div>
          </div>
          <div className="logo-band-sep" />
          <div className="logo-band-item">
            <Image className="seal" src="/brand/school-seal.png" alt="Chaminade College Preparatory School" width={44} height={44} />
            <div>
              <div className="t">Chaminade College Preparatory</div>
              <div className="s">St. Louis, Missouri · Since 1910</div>
            </div>
          </div>
        </div>
      </section>

      <section className="stats">
        <div className="wrap stats-inner">
          <div className="stat">
            <div className="k">Members</div>
            <div className="v mono">
              <CountUp value="60+" />
            </div>
            <div className="d">Across all grades</div>
          </div>
          <div className="stat">
            <div className="k">Guest speakers</div>
            <div className="v mono">
              <CountUp value="12+" delay={140} />
            </div>
            <div className="d">Since founding</div>
          </div>
          <div className="stat">
            <div className="k">Sessions held</div>
            <div className="v mono">
              <CountUp value="24+" delay={280} />
            </div>
            <div className="d">2024 → present</div>
          </div>
          <div className="stat">
            <div className="k">Estab.</div>
            <div className="v">
              <CountUp value={settings.foundedYear} from={2000} delay={420} />
            </div>
            <div className="d">Fully student-run</div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap">
          <div className="section-head">
            <div>
              <div className="section-label">What we do</div>
              <h2>
                Not a finance class.
                <br />
                <span className="serif">A working room.</span>
              </h2>
            </div>
            <p>
              Every session runs like a real meeting: a guest speaker, a prepared discussion, student-led market
              commentary, and a mock portfolio members pitch into and track.
            </p>
          </div>
          <div className="features">
            <div className="feature">
              <div className="num">01 / GUESTS</div>
              <h3>Real professionals.</h3>
              <p>Portfolio managers, analysts, founders, and bankers walk members through how decisions actually get made.</p>
            </div>
            <div className="feature">
              <div className="num">02 / PORTFOLIO</div>
              <h3>A book you run.</h3>
              <p>Members pitch ideas into a paper portfolio, defend them, and track performance against the benchmark.</p>
            </div>
            <div className="feature">
              <div className="num">03 / NETWORK</div>
              <h3>People who return calls.</h3>
              <p>Chaminade alumni work across every major bank, fund, and consulting firm. The club is the fastest way in.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="section">
        <div className="wrap pitch">
          <div className="ph">
            <Image src="/photos/session-07.jpg" alt="A Chaminade Investment Club meeting in progress" fill sizes="(max-width: 900px) 100vw, 50vw" />
          </div>
          <div>
            <div className="section-label">Inside the club</div>
            <h2>
              Run by students, <span className="serif">built for real work.</span>
            </h2>
            <p>
              Officers manage outreach, programming, and the portfolio. Members come prepared — with reading done,
              questions ready, and pitches that can be defended.
            </p>
            <p>
              No busywork. The goal is reps: the kind of reps that make it obvious, five years from now, who took this
              seriously in high school.
            </p>
            <div style={{ marginTop: 24 }}>
              <Link href="/team" className="btn">
                Meet the team <span className="arrow">→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <section className="cta-band">
        <div className="wrap">
          <h2>Join us for the next session.</h2>
          <div style={{ display: "flex", gap: 10 }}>
            <Link href="/get-involved?tab=students" className="btn red lg">
              Apply <span className="arrow">→</span>
            </Link>
            <Link href="/meetings" className="btn lg">
              See schedule
            </Link>
          </div>
        </div>
      </section>
      </main>
    </>
  );
}
