import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Wallet, Landmark, Home, Quote, TrendingUp, Users, Award, Coins, CheckCircle2 } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { useReveal, useCounter } from "@/hooks/useReveal";
import { STATS, MILESTONES, NEWS } from "@/data/site";

const StatItem = ({ stat, icon: Icon }: { stat: typeof STATS[number]; icon: any }) => {
  const { ref, value } = useCounter<HTMLDivElement>(stat.value);
  const isDecimal = stat.value % 1 !== 0;
  const display = isDecimal
    ? value.toFixed(1).replace(".", ",")
    : Math.round(value).toLocaleString("fr-FR");
  return (
    <div className="text-center">
      <Icon className="mx-auto h-8 w-8 mb-3 text-accent-foreground/80" />
      <div className="font-display text-4xl md:text-5xl font-bold text-accent-foreground" ref={ref}>
        <span>{display}</span>
      </div>
      <div className="mt-1 text-sm font-medium text-accent-foreground/80">{stat.label}</div>
    </div>
  );
};

const HeroIllustration = () => (
  <div className="relative w-full min-h-[400px] lg:h-[600px] flex items-center justify-center">
    {/* High-end decorative elements */}
    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[110%] h-[110%] bg-primary/30 rounded-full blur-[100px] -z-10 opacity-60" />
    <div className="absolute -top-10 -right-10 w-48 h-48 bg-accent/30 rounded-full blur-[60px] -z-10 animate-pulse" />
    
    {/* Main Composition */}
    <div className="relative w-full max-w-2xl transform hover:scale-[1.02] transition-all duration-700">
      <div className="relative rounded-[3rem] overflow-hidden shadow-[0_32px_64px_-12px_rgba(0,0,0,0.4)] border-[1px] border-white/30 group">
        <img 
          src="https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&q=90&w=1200" 
          alt="Succès professionnel et familial" 
          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-primary-dark/80 via-transparent to-transparent mix-blend-multiply" />
        
        {/* Subtle Overlay text */}
        <div className="absolute bottom-8 left-8 right-8">
          <div className="h-px w-12 bg-accent mb-4" />
          <p className="text-white/90 text-sm font-medium italic">« Nous avons enfin les clés de notre futur. »</p>
        </div>
      </div>

      {/* Floating UI Badges (Senior UX) */}
      <div className="absolute -bottom-8 -left-8 bg-white p-5 rounded-3xl shadow-elegant border border-primary/10 flex items-center gap-4 animate-bounce-soft">
        <div className="h-14 w-14 rounded-2xl bg-emerald-500 flex items-center justify-center text-white shadow-lg shadow-emerald-200">
          <CheckCircle2 className="h-8 w-8" />
        </div>
        <div>
          <div className="text-[11px] uppercase font-black text-muted-foreground tracking-widest mb-0.5">Financement</div>
          <div className="text-lg font-display font-bold text-primary-dark leading-none">Accordé en 48h</div>
        </div>
      </div>
    </div>
  </div>
);

const Index = () => {
  const aboutRef = useReveal();
  const productsRef = useReveal();
  const newsRef = useReveal();
  const quoteRef = useReveal();

  const products = [
    { icon: Wallet, title: "Épargne rémunérée", desc: "Faites fructifier votre argent avec nos 5 formules d'épargne adaptées à chaque projet.", to: "/produits/epargne" },
    { icon: Landmark, title: "Formules de crédit", desc: "Financez vos projets à taux préférentiel réservé aux agents adhérents.", to: "/produits/credits" },
    { icon: Home, title: "Projet immobilier", desc: "Accédez à la propriété grâce à notre programme de logements clés en main.", to: "/produits/immobilier" },
  ];

  const statIcons = [Users, Award, TrendingUp, Coins];

  return (
    <Layout>
      <SEO />
      {/* HERO */}
      <section className="relative bg-gradient-hero text-white overflow-hidden min-h-[calc(100vh-5rem)] flex items-center">
        <div className="absolute inset-0 grid-pattern-light opacity-60" aria-hidden />
        <div className="absolute -top-40 -right-40 h-[500px] w-[500px] rounded-full bg-primary/40 blur-3xl animate-drift" aria-hidden />
        <div className="absolute -bottom-40 -left-40 h-96 w-96 rounded-full bg-accent/10 blur-3xl" aria-hidden />

        <div className="relative container grid lg:grid-cols-2 gap-12 items-center py-12 md:py-20 lg:py-24">
          <div className="animate-fade-in text-center lg:text-left">
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] md:text-xs font-bold text-white/90 backdrop-blur uppercase tracking-widest">
              Microfinance mutualiste · 2006
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl xl:text-7xl font-bold leading-[1.1] text-balance">
              Votre mutuelle,<br />
              <em className="not-italic font-bold text-accent italic">votre avenir.</em>
            </h1>
            <p className="mt-6 mx-auto lg:mx-0 max-w-xl text-base md:text-lg text-white/80 leading-relaxed">
              La MA2E accompagne <strong className="text-white font-bold">7 335 adhérents</strong> dans leurs projets d'épargne, de crédit et d'accession à la propriété.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/produits"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-8 py-4 font-bold text-accent-foreground shadow-gold hover:scale-[1.02] active:scale-95 transition-all"
              >
                Découvrir nos produits <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/adhesion"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 px-8 py-4 font-bold text-white hover:bg-white hover:text-primary-dark active:scale-95 transition-all"
              >
                Devenir adhérent
              </Link>
            </div>
          </div>

          <div className="hidden lg:block animate-scale-in">
            <HeroIllustration />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce-soft" aria-hidden>
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* STATS */}
      <section className="bg-gradient-gold">
        <div className="container py-12 md:py-16 grid grid-cols-2 md:grid-cols-4 gap-8">
          {STATS.map((s, i) => <StatItem key={s.label} stat={s} icon={statIcons[i]} />)}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div ref={productsRef} className="reveal max-w-2xl">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">Nos solutions</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Nos solutions pour vous</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              Trois familles de produits pensés pour accompagner chaque étape de votre vie d'agent.
            </p>
          </div>

          <div className="mt-12 grid md:grid-cols-3 gap-6">
            {products.map((p, i) => (
              <Link
                key={p.title}
                to={p.to}
                className="group relative rounded-2xl bg-card border border-border p-8 shadow-sm hover:shadow-elegant hover:-translate-y-1 transition-bounce border-l-4 border-l-primary overflow-hidden"
                style={{ animationDelay: `${i * 80}ms` }}
              >
                <div className="absolute top-0 right-0 h-32 w-32 bg-gradient-primary opacity-5 rounded-full blur-2xl group-hover:opacity-20 transition-smooth" />
                <div className="relative">
                  <div className="inline-flex h-14 w-14 items-center justify-center rounded-xl bg-gradient-primary text-white">
                    <p.icon className="h-7 w-7" />
                  </div>
                  <h3 className="mt-6 font-display text-2xl font-bold">{p.title}</h3>
                  <p className="mt-3 text-muted-foreground">{p.desc}</p>
                  <span className="mt-6 inline-flex items-center gap-1 text-primary font-semibold">
                    Explorer <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ABOUT STRIP */}
      <section className="py-20 md:py-28 bg-secondary/40">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div ref={aboutRef} className="reveal">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">À propos</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold text-balance">
              14 ans au service des agents de l'eau et de l'électricité
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>Créée en 2006 à l'initiative des agents, la MA2E est une institution de microfinance mutualiste agréée par les autorités ivoiriennes.</p>
              <p>Notre mission : offrir à nos adhérents des solutions financières accessibles, transparentes et adaptées à leurs besoins de développement personnel et familial.</p>
              <p>Nous accompagnons aujourd'hui plus de 7 000 adhérents dans la réalisation de leurs projets, avec un encours de crédits de plus de 2,4 milliards de FCFA.</p>
            </div>
            <Link to="/a-propos" className="mt-8 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              En savoir plus sur la MA2E <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <ol className="relative space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
              {MILESTONES.map((m, i) => (
                <li key={m.year} className="relative pl-8 lg:pl-0 lg:pt-10">
                  <div className="absolute left-0 top-1 lg:left-auto lg:top-0 lg:right-auto h-3 w-3 rounded-full bg-accent ring-4 ring-accent/20" />
                  <div className="absolute left-1.5 top-4 bottom-0 w-px bg-border lg:hidden" />
                  <div className="hidden lg:block absolute left-0 right-0 top-1.5 h-px bg-border -z-0" />
                  <div className="font-mono text-accent font-bold text-lg">{m.year}</div>
                  <div className="font-display font-bold mt-1">{m.title}</div>
                  <div className="text-sm text-muted-foreground mt-1">{m.desc}</div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      {/* PCA QUOTE */}
      <section ref={quoteRef} className="reveal relative py-20 md:py-28 bg-primary-dark text-white overflow-hidden">
        <div className="absolute inset-0 grid-pattern-light opacity-40" aria-hidden />
        <div className="absolute top-10 left-10 text-accent opacity-30" aria-hidden>
          <Quote className="h-32 w-32 -scale-x-100" />
        </div>
        <div className="relative container max-w-4xl text-center">
          <Quote className="mx-auto h-10 w-10 text-accent" />
          <blockquote className="mt-6 font-display text-3xl md:text-4xl xl:text-5xl font-bold italic leading-tight text-balance">
            « Notre mutuelle doit continuer d'être un modèle inspirant de développement de projets personnels et collectifs. »
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-gold text-accent-foreground font-bold">AB</div>
            <div className="text-left">
              <div className="font-semibold text-white">Ahmadou BAKAYOKO</div>
              <div className="text-sm text-white/70">Président du Conseil d'Administration</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section ref={newsRef} className="reveal py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-sm font-mono uppercase tracking-wider text-primary">Actualités</span>
              <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">Dernières actualités</h2>
            </div>
            <Link to="/actualites" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              Voir toutes les actualités <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {NEWS.slice(0, 3).map((n) => (
              <article key={n.id} className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-bounce">
                <div className="aspect-[16/10] bg-gradient-primary relative overflow-hidden">
                  <img src={`https://placehold.co/640x400/1A6147/F5A623?text=MA2E&font=playfair`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">{n.category}</span>
                    <span className="text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold leading-snug group-hover:text-primary transition-smooth">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>
                  <Link to={`/actualites/${n.id}`} className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all">
                    Lire la suite <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Index;
