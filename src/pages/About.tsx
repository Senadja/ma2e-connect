import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useReveal, useCounter } from "@/hooks/useReveal";
import { MILESTONES, STATS, TEAM } from "@/data/site";
import { Quote, ShieldCheck, Heart, Briefcase, Users, Award, TrendingUp, Coins } from "lucide-react";

const StatItem = ({ stat, icon: Icon }: { stat: typeof STATS[number]; icon: any }) => {
  const { ref, value } = useCounter(stat.value);
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
  const r1 = useReveal(); const r2 = useReveal(); const r3 = useReveal(); const r4 = useReveal();
  const statIcons = [Users, Award, TrendingUp, Coins];
  const missions = [
    { icon: Heart, title: "Accessibilité financière", desc: "Permettre à chaque agent d'accéder à des services financiers adaptés et abordables." },
    { icon: Briefcase, title: "Professionnalisme", desc: "Offrir un service de qualité, transparent, conforme aux standards de la microfinance." },
    { icon: ShieldCheck, title: "Amélioration sociale", desc: "Contribuer concrètement à l'amélioration des conditions de vie de nos adhérents." },
  ];

  return (
    <Layout>
      <PageHero
        title="À propos de la MA2E"
        subtitle="Découvrez l'histoire, la mission et l'organisation de votre mutuelle."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "À propos" }]}
      />

      {/* Founder quote */}
      <section className="py-20">
        <div className="container max-w-4xl">
          <div ref={r1} className="reveal rounded-3xl bg-gradient-primary text-primary-foreground p-10 md:p-14 shadow-elegant relative overflow-hidden">
            <Quote className="absolute top-6 right-6 h-20 w-20 text-white/10" />
            <span className="text-xs font-mono uppercase tracking-widest text-accent">Vision du fondateur</span>
            <blockquote className="mt-4 font-display text-2xl md:text-3xl italic leading-tight text-balance">
              « Donner aux agents les moyens de bâtir leur autonomie financière, c'est bâtir une société plus juste. »
            </blockquote>
            <div className="mt-6 font-semibold">Marcel ZADI KESSY <span className="font-normal text-white/70">— Fondateur</span></div>
          </div>
        </div>
      </section>

      {/* History timeline */}
      <section id="histoire" className="py-20 bg-secondary/40">
        <div className="container">
          <div ref={r2} className="reveal max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">Notre histoire</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Une trajectoire de confiance</h2>
          </div>
          <ol className="relative border-l-2 border-accent/30 ml-3 space-y-10">
            {MILESTONES.map((m) => (
              <li key={m.year} className="pl-8 relative">
                <span className="absolute -left-[11px] top-1 h-5 w-5 rounded-full bg-accent ring-4 ring-accent/20" />
                <div className="font-mono text-accent font-bold">{m.year}</div>
                <h3 className="font-display text-2xl font-bold mt-1">{m.title}</h3>
                <p className="text-muted-foreground mt-1 max-w-xl">{m.desc}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Mission */}
      <section id="mission" className="py-20">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">Notre mission</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Trois engagements fondateurs</h2>
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
          <h2 className="font-display text-3xl font-bold text-center mb-10">Nos résultats en chiffres</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {STATS.map((s, i) => <StatItem key={s.label} stat={s} icon={statIcons[i]} />)}
          </div>
        </div>
      </section>

      {/* Org chart */}
      <section id="organisation" className="py-20">
        <div className="container max-w-4xl">
          <div className="max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">Organisation</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Une gouvernance structurée</h2>
          </div>
          <div className="space-y-6">
            <div className="mx-auto w-fit rounded-xl bg-gradient-primary text-primary-foreground px-8 py-4 text-center shadow-elegant">
              <div className="text-xs uppercase tracking-wider text-white/70">Niveau 1</div>
              <div className="font-display text-xl font-bold">Conseil d'Administration (PCA)</div>
            </div>
            <div className="mx-auto w-px h-8 bg-border" />
            <div className="mx-auto w-fit rounded-xl bg-card border border-border px-8 py-4 text-center">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Niveau 2</div>
              <div className="font-display text-xl font-bold">Direction Générale</div>
            </div>
            <div className="mx-auto w-px h-8 bg-border" />
            <div className="grid sm:grid-cols-3 gap-4">
              {["Opérations", "Finances", "Crédit & Risque"].map((d) => (
                <div key={d} className="rounded-xl bg-card border border-border p-4 text-center">
                  <div className="font-semibold">{d}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-secondary/40">
        <div className="container">
          <div className="max-w-2xl mb-12">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">Équipe dirigeante</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Les femmes et hommes de la MA2E</h2>
          </div>
          <div ref={r4} className="reveal grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TEAM.map((t) => (
              <div key={t.name} className="rounded-2xl bg-card border border-border p-6 text-center hover:shadow-elegant transition-smooth">
                <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-gradient-primary text-white font-display text-2xl font-bold">
                  {t.initials}
                </div>
                <div className="mt-5 font-display text-lg font-bold">{t.name}</div>
                <div className="text-sm text-muted-foreground">{t.role}</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default About;
