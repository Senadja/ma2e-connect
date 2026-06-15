import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useReveal, useCounter } from "@/hooks/useReveal";
import { MILESTONES, STATS } from "@/data/site";
import { useTeam, useSettings } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { Quote, ShieldCheck, Wallet, Briefcase, Users, Award, TrendingUp, Coins, Landmark, Building2, Settings2 } from "lucide-react";

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
  const { data: TEAM = [] } = useTeam();
  const { data: settings } = useSettings();
  const about = settings?.aboutContent;
  const milestones = settings?.milestones?.length
    ? settings.milestones
    : MILESTONES.map((m) => ({ year: m.year, title: t(`about.milestones.${m.year}.title`, { defaultValue: m.title }), desc: t(`about.milestones.${m.year}.desc`, { defaultValue: m.desc }) }));
  const statIcons = [Users, Award, TrendingUp, Coins];

  // Organigramme : valeurs du CMS si présentes, sinon repli sur les libellés i18n.
  const org = settings?.orgChart;
  const level1Name = org?.level1Name || t("about.level1Name");
  const level2Name = org?.level2Name || t("about.level2Name");
  const deptNames =
    org?.departments && org.departments.length > 0
      ? org.departments
      : [t("about.dept1"), t("about.dept2"), t("about.dept3")];
  const deptIcons = [Settings2, Wallet, ShieldCheck, Briefcase, Coins, Users];
  const orgDepts = deptNames.map((name, i) => ({ icon: deptIcons[i % deptIcons.length], name }));
  const missions = [
    { icon: Wallet, title: about?.mission1Title || t("about.mission1Title"), desc: about?.mission1Desc || t("about.mission1Desc") },
    { icon: Briefcase, title: about?.mission2Title || t("about.mission2Title"), desc: about?.mission2Desc || t("about.mission2Desc") },
    { icon: ShieldCheck, title: about?.mission3Title || t("about.mission3Title"), desc: about?.mission3Desc || t("about.mission3Desc") },
  ];

  // Organes (CA/CC/CS/CED) éditables via le CMS — repli sur la composition officielle.
  const DEFAULT_ORG_UNITS = [
    { name: "Conseil d'Administration", note: "Président · 2 vice-présidents · 13 administrateurs" },
    { name: "Comité de Crédit", note: "Président · 1 vice-président · 1 secrétaire · 10 membres" },
    { name: "Conseil de Surveillance", note: "Président · 1 vice-président · 1 secrétaire · 6 membres" },
    { name: "Comité Éthique et Déontologie", note: "Président · 2 membres" },
  ];
  const orgUnits = settings?.orgUnits?.length ? settings.orgUnits : DEFAULT_ORG_UNITS;
  const orgUnitNames = orgUnits.map((u) => u.name);
  const catOf = (m: { category?: string }) => m.category || "Gouvernance";
  const extraCats = Array.from(new Set(TEAM.map(catOf))).filter((c) => !orgUnitNames.includes(c));
  const orgGroups = [
    ...orgUnits.map((u) => ({ name: u.name, note: u.note, members: TEAM.filter((m) => catOf(m) === u.name) })),
    ...extraCats.map((cat) => ({ name: cat, note: undefined as string | undefined, members: TEAM.filter((m) => catOf(m) === cat) })),
  ];

  return (
    <Layout>
      <PageHero
        title={t("about.heroTitle")}
        subtitle={t("about.heroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.about") }]}
      />
      {/* Founder quote */}
      <section className="py-12 md:py-20">
        <div className="container max-w-4xl px-4 md:px-6">
          <div ref={r1} className="reveal rounded-2xl md:rounded-3xl bg-gradient-primary text-primary-foreground p-8 md:p-14 shadow-elegant relative overflow-hidden text-center md:text-left">
            <Quote className="absolute top-4 right-4 md:top-6 md:right-6 h-12 w-12 md:h-20 md:w-20 text-white/10" />
            <span className="text-[10px] md:text-xs font-mono uppercase tracking-widest text-accent">{about?.founderVision || t("about.founderVision")}</span>
            <blockquote className="mt-4 font-display text-xl md:text-3xl italic leading-tight text-balance">
              « {about?.founderQuote || t("about.founderQuote")} »
            </blockquote>
            <div className="mt-6 text-sm md:text-base font-semibold">{about?.founderName || "Marcel ZADI KESSY"} <span className="font-normal text-white/70 block md:inline">— {about?.founderRole || t("about.founder")}</span></div>
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
        <div className="container max-w-5xl">
          <div className="max-w-2xl mb-14">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("about.orgKicker")}</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">{t("about.orgTitle")}</h2>
          </div>

          <div className="flex flex-col items-center">
            {/* Niveau 1 — Conseil d'Administration */}
            <div className="w-full max-w-sm">
              <div className="group relative overflow-hidden rounded-2xl bg-gradient-primary text-primary-foreground p-7 text-center shadow-elegant transition-transform hover:-translate-y-1">
                <div className="absolute inset-0 grid-pattern-light opacity-40" aria-hidden />
                <div className="relative">
                  <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-white/15 backdrop-blur-sm ring-1 ring-white/20">
                    <Landmark className="h-8 w-8" />
                  </div>
                  <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-white/70">{t("about.level1")}</div>
                  <div className="mt-1 font-display text-xl font-bold">{level1Name}</div>
                </div>
              </div>
            </div>

            {/* connecteur vertical */}
            <div className="h-12 w-px bg-gradient-to-b from-primary/50 to-border" />

            {/* Niveau 2 — Direction Générale */}
            <div className="w-full max-w-sm">
              <div className="group relative rounded-2xl bg-card border-2 border-primary/20 p-7 text-center shadow-sm transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-2xl bg-primary/10 text-primary">
                  <Building2 className="h-8 w-8" />
                </div>
                <div className="text-[11px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{t("about.level2")}</div>
                <div className="mt-1 font-display text-xl font-bold">{level2Name}</div>
              </div>
            </div>

            {/* connecteur vers les directions */}
            <div className="h-12 w-px bg-border" />

            {/* Niveau 3 — Directions opérationnelles */}
            <div className="relative w-full">
              {/* tronc horizontal reliant les 3 directions (desktop) */}
              <div className="hidden sm:block absolute left-1/2 top-0 h-px w-2/3 -translate-x-1/2 bg-border" />
              <div className="grid sm:grid-cols-3 gap-5 sm:pt-10">
                {orgDepts.map(({ icon: Icon, name }) => (
                  <div key={name} className="relative">
                    {/* tige verticale reliant chaque direction au tronc (desktop) */}
                    <div className="hidden sm:block absolute left-1/2 -top-10 h-10 w-px -translate-x-1/2 bg-border" />
                    <div className="group h-full rounded-2xl bg-card border border-border p-6 text-center transition-all hover:-translate-y-1 hover:border-primary/40 hover:shadow-elegant">
                      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-xl bg-secondary text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground mb-1">{t("about.deptLabel")}</div>
                      <div className="font-display font-bold">{name}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("about.govKicker")}</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">{t("about.govTitle")}</h2>
          </div>
          <div ref={r4} className="reveal space-y-12">
            {orgGroups.map((group) => (
              <div key={group.name}>
                <div className="mb-6 flex flex-wrap items-baseline justify-between gap-2 border-b border-border/60 pb-3">
                  <h3 className="font-display text-2xl font-bold text-primary-dark">{group.name}</h3>
                  {group.note && <span className="text-sm font-semibold text-muted-foreground">{group.note}</span>}
                </div>
                {group.members.length > 0 ? (
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {group.members.map((member) => (
                      <div key={member.name} className="rounded-2xl bg-card border border-border p-6 text-center hover:shadow-elegant transition-smooth">
                        {member.photo ? (
                          <img src={member.photo} alt={member.name} className="mx-auto h-24 w-24 rounded-full object-cover ring-2 ring-primary/10" />
                        ) : (
                          <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-white font-display text-2xl font-bold">
                            {member.initials}
                          </div>
                        )}
                        <div className="mt-5 font-display text-lg font-bold">{member.name}</div>
                        <div className="text-sm text-muted-foreground">{member.role}</div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm italic text-muted-foreground">Composition à venir.</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
