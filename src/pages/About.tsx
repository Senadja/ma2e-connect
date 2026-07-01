import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useReveal, useCounter } from "@/hooks/useReveal";
import { MILESTONES, STATS } from "@/data/site";
import { useSettings, DEFAULT_PERSONNEL, DEFAULT_ORG_UNITS } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { Quote, ShieldCheck, Wallet, Briefcase, Users, Award, TrendingUp, Coins, Download } from "lucide-react";
import { OrgChartSvg } from "@/components/OrgChartSvg";

// Organigramme officiel — version vectorielle (disposition du PDF) + lien de téléchargement du PDF.
const ORG_PDF = "/documents/institutionnel/Organigramme de la MA2E - MISE A JOUR LE 22-05-2026.pdf";

const StatItem = ({ stat, icon: Icon }: { stat: typeof STATS[number]; icon: any }) => {
  const { ref, value } = useCounter<HTMLDivElement>(stat.value);
  const isDecimal = stat.value % 1 !== 0;
  const display = isDecimal ? value.toFixed(1).replace(".", ",") : Math.round(value).toLocaleString("fr-FR");
  return (
    <div className="text-center">
      <Icon className="mx-auto h-8 w-8 mb-3 text-primary" />
      <div ref={ref} className="font-display text-4xl md:text-5xl font-bold text-foreground">{display}</div>
      <div className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</div>
    </div>
  );
};





const About = () => {
  const { t } = useTranslation();
  const r1 = useReveal(); const r2 = useReveal(); const r3 = useReveal(); const r4 = useReveal();
  const { data: settings } = useSettings();
  const about = settings?.aboutContent;
  const founderName = about?.founderName || "Marcel ZADI KESSY";
  const founderInitials = founderName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const milestones = settings?.milestones?.length
    ? settings.milestones
    : MILESTONES.map((m) => ({ year: m.year, title: t(`about.milestones.${m.year}.title`, { defaultValue: m.title }), desc: t(`about.milestones.${m.year}.desc`, { defaultValue: m.desc }) }));
  const statIcons = [Users, Award, TrendingUp, Coins];

  const missions = [
    { icon: Wallet, title: about?.mission1Title || t("about.mission1Title"), desc: about?.mission1Desc || t("about.mission1Desc") },
    { icon: Briefcase, title: about?.mission2Title || t("about.mission2Title"), desc: about?.mission2Desc || t("about.mission2Desc") },
    { icon: ShieldCheck, title: about?.mission3Title || t("about.mission3Title"), desc: about?.mission3Desc || t("about.mission3Desc") },
  ];

  // Organes de gouvernance (CA/CC/CS/CED) — composition officielle (CR 26/06/2026), éditable au CMS.
  const orgUnits = settings?.orgUnits?.length ? settings.orgUnits : DEFAULT_ORG_UNITS;
  // Personnel de la MA2E — cartes avec photo, éditable au CMS.
  const personnel = settings?.personnel?.length ? settings.personnel : DEFAULT_PERSONNEL;

  return (
    <Layout>
      <PageHero
        title={t("about.heroTitle")}
        subtitle={t("about.heroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.about") }]}
      />
      {/* Vision du fondateur — texte à gauche, photo à droite (empilé sur mobile) */}
      <section className="py-12 md:py-20">
        <div className="container max-w-6xl px-4 md:px-6">
          <div ref={r1} className="reveal grid md:grid-cols-5 items-center gap-8 md:gap-12 rounded-2xl md:rounded-3xl bg-gradient-primary text-primary-foreground p-8 md:p-12 shadow-elegant relative overflow-hidden">
            <Quote className="absolute top-4 right-4 md:top-6 md:right-6 h-12 w-12 md:h-20 md:w-20 text-white/10" />
            <div className="relative order-2 md:order-1 md:col-span-3 text-center md:text-left">
              <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-accent">{about?.founderVision || t("about.founderVision")}</span>
              <blockquote className="mt-4 font-display text-xl md:text-3xl lg:text-4xl italic leading-tight text-balance">
                « {about?.founderQuote || t("about.founderQuote")} »
              </blockquote>
              <div className="mt-6 text-sm md:text-base font-semibold">{founderName} <span className="font-normal text-white/70 block md:inline">— {about?.founderRole || t("about.founder")}</span></div>
            </div>
            <div className="order-1 md:order-2 md:col-span-2">
              {about?.founderPhoto ? (
                <img src={about.founderPhoto} alt={founderName} style={{ objectPosition: about?.founderPhotoPos || "50% 20%" }} className="mx-auto w-full max-w-[16rem] md:max-w-none aspect-[3/4] rounded-2xl object-cover ring-4 ring-white/15 shadow-lg" />
              ) : (
                <div className="mx-auto w-full max-w-[16rem] md:max-w-none aspect-[3/4] rounded-2xl bg-white/10 ring-4 ring-white/15 grid place-items-center" aria-hidden>
                  <span className="font-display text-6xl font-bold text-white/80">{founderInitials}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* History timeline */}
      <section id="histoire" className="scroll-mt-28 py-16 md:py-24 bg-secondary/40">
        <div className="container px-4 md:px-6">
          <div ref={r2} className="reveal max-w-2xl mb-12 text-center md:text-left">
            <span className="text-xs md:text-sm font-mono uppercase tracking-wider text-primary">{t("about.historyKicker")}</span>
            <h2 className="mt-2 font-display text-3xl md:text-5xl font-bold">{t("about.historyTitle")}</h2>
          </div>
          <ol className="relative border-l-2 border-accent/30 ml-4 md:ml-3 space-y-10">
            {milestones.map((m) => (
              <li key={m.year} className="pl-6 md:pl-8 relative">
                <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-accent ring-4 ring-accent/20" />
                <div className="font-mono text-accent font-bold text-lg">{m.year}</div>
                <h3 className="font-display text-xl md:text-2xl font-bold mt-1">{m.title}</h3>
                <p className="text-muted-foreground mt-2 max-w-xl text-sm md:text-base leading-relaxed">{m.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="scroll-mt-28 py-20">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("about.missionKicker")}</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">{t("about.missionTitle")}</h2>
          </div>
          <div ref={r3} className="reveal grid md:grid-cols-3 gap-6">
            {missions.map((m) => (
              <div key={m.title} className="rounded-2xl bg-card border border-border p-8 hover:shadow-elegant hover:-translate-y-1 transition-bounce">
                <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-accent/15 text-accent">
                  <m.icon className="h-7 w-7" />
                </div>
                <h3 className="mt-6 font-display text-xl font-bold">{m.title}</h3>
                <p className="mt-2 text-muted-foreground">{m.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-secondary/40">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-center mb-10">{t("about.statsTitle")}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => <StatItem key={s.label} stat={{ ...s, label: t(`about.statLabels.${i}`, { defaultValue: s.label }) }} icon={statIcons[i]} />)}
          </div>
        </div>
      </section>

      {/* Org chart */}
      <section id="organisation" className="scroll-mt-28 py-20 bg-gradient-to-b from-background to-secondary/30">
        <div className="container max-w-6xl">
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("about.orgKicker")}</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">{t("about.orgTitle")}</h2>
          </div>

          <figure>
            <div className="rounded-2xl border border-border bg-white p-4 shadow-sm md:p-6">
              {settings?.orgImage ? (
                <img src={settings.orgImage} alt="Organigramme officiel de la MA2E" className="mx-auto h-auto w-full" />
              ) : (
                <OrgChartSvg />
              )}
            </div>
            <figcaption className="mt-4">
              <a
                href={ORG_PDF}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
              >
                <Download className="h-4 w-4" /> Télécharger l'organigramme (PDF)
              </a>
            </figcaption>
          </figure>
        </div>
      </section>

      {/* Organes de gouvernance — tableaux */}
      <section className="py-20 bg-secondary/40">
        <div className="container">
          <div className="mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("about.govKicker")}</span>
            <h2 className="mt-2 font-display font-bold whitespace-nowrap text-[clamp(0.95rem,4.2vw,3rem)]">{t("about.govTitle")}</h2>
          </div>
          <div ref={r4} className="reveal space-y-12">
            {orgUnits.map((unit) => (
              <div key={unit.name}>
                <div className="mb-4 flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
                  <h3 className="font-display text-2xl font-bold text-primary-dark">{unit.name}</h3>
                  {unit.note && <span className="text-sm font-semibold text-muted-foreground">{unit.note}</span>}
                </div>
                {unit.members?.length ? (
                  <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-border bg-secondary/40 text-left text-xs uppercase tracking-wider text-muted-foreground">
                          <th className="px-4 py-3 font-semibold">Nom et prénoms</th>
                          <th className="px-4 py-3 font-semibold">Fonction</th>
                          <th className="px-4 py-3 font-semibold">Société</th>
                        </tr>
                      </thead>
                      <tbody>
                        {unit.members.map((m, i) => (
                          <tr key={i} className="border-b border-border/40 last:border-0 hover:bg-secondary/20">
                            <td className="px-4 py-2.5 font-medium">{m.name}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{m.role}</td>
                            <td className="px-4 py-2.5 text-muted-foreground">{m.company}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Composition à venir.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Personnel de la MA2E — cartes photo */}
      <section className="py-20">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">Notre équipe</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Personnel de la MA2E</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
            {personnel.map((p) => {
              const initials = p.name.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
              return (
                <div key={p.name} className="rounded-2xl bg-card border border-border p-5 text-center hover:shadow-elegant transition-smooth">
                  {p.photo ? (
                    <img src={p.photo} alt={p.name} loading="lazy" style={{ objectPosition: p.pos || "50% 25%" }} className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-primary/10" />
                  ) : (
                    <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-white font-display text-2xl font-bold">{initials}</div>
                  )}
                  <div className="mt-4 font-display text-base font-bold leading-tight">{p.name}</div>
                  <div className="mt-1 text-xs text-muted-foreground">{p.role}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
