import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, ChevronDown, Wallet, Landmark, Home, Quote, TrendingUp, Users, Award, Coins, CheckCircle2, ShieldCheck } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { useReveal, useCounter } from "@/hooks/useReveal";
import { cn } from "@/lib/utils";
import { STATS as DEFAULT_STATS, MILESTONES } from "@/data/site";
import { useArticles, useSettings } from "@/lib/content";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

const StatItem = ({ stat, icon: Icon }: { stat: typeof DEFAULT_STATS[number]; icon: any }) => {
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
  <div className="flex items-center justify-center relative w-full h-[500px]">
    <svg viewBox="0 0 480 480" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full max-w-[440px] h-auto z-10 animate-fade-in" style={{ animationDelay: '0.2s' }}>
      {/* Dashed outer ring */}
      <circle cx="240" cy="240" r="208" stroke="rgba(237,177,42,.08)" strokeWidth="1" strokeDasharray="6 14"/>

      {/* Mid ring */}
      <circle cx="240" cy="240" r="162" stroke="rgba(237,177,42,.14)" strokeWidth="1.5"/>

      {/* Dashed inner ring animated */}
      <circle cx="240" cy="240" r="120" stroke="rgba(237,177,42,.1)" strokeWidth="1"
              strokeDasharray="40 20" className="animate-spin-slow-reverse" style={{ animationDuration: '40s' }}/>

      {/* Inner fill */}
      <circle cx="240" cy="240" r="104" fill="rgba(22,51,35,.85)"
              stroke="rgba(237,177,42,.22)" strokeWidth="1.5"/>

      {/* HOUSE GROUP */}
      <g transform="translate(240,240)">
        {/* Roof */}
        <polygon points="-54,-58 0,-104 54,-58" fill="rgba(237,177,42,.88)"/>
        {/* Chimney */}
        <rect x="26" y="-96" width="14" height="28" rx="2" fill="rgba(237,177,42,.6)"/>
        {/* Body */}
        <rect x="-50" y="-60" width="100" height="84" rx="5" fill="rgba(31,77,52,.95)"/>
        {/* Door */}
        <rect x="-15" y="-12" width="30" height="56" rx="5" fill="rgba(237,177,42,.75)"/>
        {/* Door handle */}
        <circle cx="11" cy="17" r="2.5" fill="rgba(8,15,11,.6)"/>
        {/* Leaf sprout in door */}
        <line x1="0" y1="44" x2="0" y2="14" stroke="rgba(8,15,11,.5)" strokeWidth="1.5"/>
        <ellipse cx="-6" cy="16" rx="6" ry="8" fill="rgba(8,15,11,.4)" transform="rotate(-15,-6,16)"/>
        <ellipse cx="6" cy="20" rx="5" ry="7" fill="rgba(8,15,11,.4)" transform="rotate(20,6,20)"/>
        {/* Left window */}
        <rect x="-44" y="-40" width="22" height="18" rx="3" fill="rgba(221,216,204,.15)" stroke="rgba(221,216,204,.1)" strokeWidth=".5"/>
        {/* Right window */}
        <rect x="22" y="-40" width="22" height="18" rx="3" fill="rgba(221,216,204,.15)" stroke="rgba(221,216,204,.1)" strokeWidth=".5"/>
        {/* Window crosses */}
        <line x1="-33" y1="-40" x2="-33" y2="-22" stroke="rgba(221,216,204,.15)" strokeWidth=".8"/>
        <line x1="-44" y1="-31" x2="-22" y2="-31" stroke="rgba(221,216,204,.15)" strokeWidth=".8"/>
        <line x1="33" y1="-40" x2="33" y2="-22" stroke="rgba(221,216,204,.15)" strokeWidth=".8"/>
        <line x1="22" y1="-31" x2="44" y2="-31" stroke="rgba(221,216,204,.15)" strokeWidth=".8"/>
      </g>

      {/* Orbiting dot top */}
      <g className="animate-spin-slow" style={{ transformOrigin: '240px 240px', animationDuration: '14s' }}>
        <circle cx="240" cy="78" r="9" fill="rgba(237,177,42,.85)"/>
      </g>

      {/* Orbiting dots sides */}
      <g className="animate-spin-slow-reverse" style={{ transformOrigin: '240px 240px', animationDuration: '22s' }}>
        <circle cx="78" cy="240" r="6" fill="rgba(221,216,204,.22)"/>
        <circle cx="402" cy="240" r="6" fill="rgba(221,216,204,.22)"/>
      </g>

      {/* Coin — top right float */}
      <g className="animate-float" style={{ transformOrigin: '372px 108px', animationDuration: '3.5s' }}>
        <circle cx="372" cy="108" r="30" fill="rgba(237,177,42,.1)" stroke="rgba(237,177,42,.4)" strokeWidth="1.5"/>
        <circle cx="372" cy="108" r="22" fill="rgba(237,177,42,.07)" stroke="rgba(237,177,42,.25)" strokeWidth=".8"/>
        <text x="372" y="115" textAnchor="middle" fill="rgba(237,177,42,.9)"
              fontSize="20" fontWeight="700" fontFamily="Georgia, serif">₣</text>
      </g>

      {/* Small coin — lower left float */}
      <g className="animate-float" style={{ transformOrigin: '90px 330px', animationDuration: '4.8s', animationDelay: '1.2s' }}>
        <circle cx="90" cy="330" r="20" fill="rgba(237,177,42,.08)" stroke="rgba(237,177,42,.28)" strokeWidth="1"/>
        <circle cx="90" cy="330" r="12" fill="rgba(237,177,42,.06)"/>
        <text x="90" y="336" textAnchor="middle" fill="rgba(237,177,42,.65)"
              fontSize="13" fontWeight="700" fontFamily="Georgia, serif">₣</text>
      </g>

      {/* Growth trend line */}
      <polyline points="108,370 165,335 218,302 278,268 345,224 400,188"
                stroke="rgba(237,177,42,.35)" strokeWidth="2"
                strokeDasharray="7 9" strokeLinecap="round" fill="none"/>

      {/* Accent dots */}
      <circle cx="398" cy="188" r="5" fill="rgba(237,177,42,.6)"/>
      <circle cx="108" cy="140" r="7" fill="rgba(31,77,52,.7)" stroke="rgba(237,177,42,.3)" strokeWidth="1"/>
      <circle cx="388" cy="354" r="5" fill="rgba(237,177,42,.35)"/>
      <circle cx="130" cy="88" r="4" fill="rgba(221,216,204,.2)"/>

      {/* Arc accent */}
      <path d="M 240 36 A 204 204 0 0 1 424 340"
            stroke="rgba(237,177,42,.2)" strokeWidth="1.5" fill="none" strokeLinecap="round"/>
    </svg>
  </div>
);

const Index = () => {
  const aboutRef = useReveal();
  const productsRef = useReveal();
  const newsRef = useReveal();
  const quoteRef = useReveal();

  const [stats, setStats] = useState(DEFAULT_STATS);
  const { data: NEWS = [] } = useArticles();
  const { t } = useTranslation();
  const tCat = (c: string) => t(`newsPage.categories.${c}`, { defaultValue: c });
  const { data: settings } = useSettings();
  const why = settings?.whyUs;
  const hero = settings?.homeHero;
  const milestones = settings?.milestones?.length
    ? settings.milestones
    : MILESTONES.map((m) => ({ year: m.year, title: t(`about.milestones.${m.year}.title`, { defaultValue: m.title }), desc: t(`about.milestones.${m.year}.desc`, { defaultValue: m.desc }) }));
  const pca = settings?.presidentQuote;
  const pcaName = pca?.name || "Ahmadou BAKAYOKO";
  const pcaInitials = pcaName.split(" ").filter(Boolean).map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  const pcaBgStyle = pca?.bgImage
    ? { backgroundImage: `url(${pca.bgImage})`, backgroundSize: "cover", backgroundPosition: "center" }
    : pca?.bgColor
    ? { backgroundColor: pca.bgColor }
    : undefined;

  useEffect(() => {
    // Utilise le client API centralisé (URL configurable, compatible prod).
    api<typeof DEFAULT_STATS>(`/stats?t=${Date.now()}`)
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) setStats(data);
      })
      .catch((err) => {
        console.error("Could not fetch stats:", err);
        // Conserve DEFAULT_STATS en cas d'erreur.
      });
  }, []);

  const products = [
    { icon: Wallet, title: t("home.prodSavingsTitle"), desc: t("home.prodSavingsDesc"), to: "/produits/epargne" },
    { icon: Landmark, title: t("home.prodCreditTitle"), desc: t("home.prodCreditDesc"), to: "/produits/credits" },
    { icon: Home, title: t("home.prodRealEstateTitle"), desc: t("home.prodRealEstateDesc"), to: "/produits/immobilier" },
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
          <div className="animate-fade-in text-center lg:text-left z-10">
            <span className="inline-block rounded-full bg-white/10 border border-white/20 px-4 py-1.5 text-[10px] md:text-xs font-bold text-white/90 backdrop-blur uppercase tracking-widest">
              {hero?.badge || t("home.heroBadge")}
            </span>
            <h1 className="mt-6 font-display text-4xl md:text-6xl xl:text-7xl font-bold leading-[1.1] text-balance">
              {hero?.title1 || t("home.heroTitle1")}<br />
              <em className="not-italic font-bold text-accent italic">{hero?.title2 || t("home.heroTitle2")}</em>
            </h1>
            <p className="mt-6 mx-auto lg:mx-0 max-w-xl text-base md:text-lg text-white/80 leading-relaxed">
              {hero?.leadPre || t("home.heroLeadPre")} <strong className="text-white font-bold">{stats[0]?.value.toLocaleString("fr-FR")} {hero?.leadMembers || t("home.heroLeadMembers")}</strong> {hero?.leadPost || t("home.heroLeadPost")}
            </p>
            <div className="mt-10 flex flex-col sm:flex-row justify-center lg:justify-start gap-4">
              <Link
                to="/produits"
                className="inline-flex items-center justify-center gap-2 rounded-full bg-gradient-gold px-8 py-4 font-bold text-accent-foreground shadow-gold hover:scale-[1.02] active:scale-95 transition-all"
              >
                {hero?.ctaProducts || t("home.ctaProducts")} <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/adhesion"
                className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-white/40 px-8 py-4 font-bold text-white hover:bg-white hover:text-primary-dark active:scale-95 transition-all"
              >
                {hero?.ctaJoin || t("home.ctaJoin")}
              </Link>
            </div>
          </div>

          <div className="hidden lg:block animate-scale-in relative">
            <HeroIllustration />
          </div>
        </div>

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 text-white/60 animate-bounce-soft" aria-hidden>
          <ChevronDown className="h-6 w-6" />
        </div>
      </section>

      {/* STATS TICKER */}
      <section className="bg-primary-dark border-t border-b border-white/10 relative z-10">
        <div className="container py-8 md:py-12 grid grid-cols-2 md:grid-cols-4 gap-0">
          {stats.map((s, i) => (
            <div key={s.label} className={cn(
              "px-6 text-center border-white/10 transition-all duration-500 hover:bg-white/5 group",
              i < stats.length - 1 && "md:border-r"
            )}>
              <div className="font-display text-4xl md:text-5xl font-bold text-white tracking-tight group-hover:text-accent transition-colors">
                {s.value.toLocaleString("fr-FR")}<span>{s.suffix || (i === 1 || i === 2 ? "+" : "")}</span>
              </div>
              <div className="mt-2 text-xs md:text-sm font-bold uppercase tracking-[0.2em] text-white/40 group-hover:text-white/60 transition-colors">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* PRODUCTS */}
      <section className="py-20 md:py-28">
        <div className="container">
          <div ref={productsRef} className="reveal max-w-2xl">
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("home.solutionsKicker")}</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">{t("home.solutionsTitle")}</h2>
            <p className="mt-4 text-muted-foreground text-lg">
              {t("home.solutionsLead")}
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
                    {t("home.explore")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
            <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("home.aboutKicker")}</span>
            <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold text-balance">
              {t("home.aboutTitle")}
            </h2>
            <div className="mt-6 space-y-4 text-muted-foreground leading-relaxed">
              <p>{t("home.aboutP1")}</p>
              <p>{t("home.aboutP2")}</p>
              <p>{t("home.aboutP3")}</p>
            </div>
            <Link to="/a-propos" className="mt-8 inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              {t("home.aboutMore")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="relative">
            <ol className="relative space-y-6 lg:space-y-0 lg:grid lg:grid-cols-4 lg:gap-4">
              {milestones.map((m, i) => (
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

      {/* WHY MA2E / TRUST DATA VIZ */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <div>
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-accent">{why?.kicker || t("home.whyKicker")}</span>
              <div className="h-1 w-12 bg-accent mt-4 mb-8" />
              <h2 className="font-display text-5xl md:text-6xl font-bold leading-tight mb-8">
                {why?.titleStart || t("home.whyTitle1")}<em className="text-primary italic not-italic">{why?.titleEm || t("home.whyTitleEm")}</em>
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed mb-12 max-w-lg">
                {why?.lead || t("home.whyLead")}
              </p>

              <div className="space-y-10">
                <div className="flex gap-6 group">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{why?.feat1Title || t("home.whyFeat1Title")}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{why?.feat1Desc || t("home.whyFeat1Desc")}</p>
                  </div>
                </div>
                <div className="flex gap-6 group">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center shrink-0 group-hover:bg-primary group-hover:text-white transition-all duration-300">
                    <TrendingUp className="h-6 w-6" />
                  </div>
                  <div>
                    <h4 className="font-bold text-lg mb-2">{why?.feat2Title || t("home.whyFeat2Title")}</h4>
                    <p className="text-muted-foreground text-sm leading-relaxed">{why?.feat2Desc || t("home.whyFeat2Desc")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute inset-0 bg-primary/5 rounded-[3rem] -rotate-3 scale-105" />
              <div className="relative bg-card border border-border p-10 rounded-[3rem] shadow-elegant overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Landmark className="h-32 w-32" />
                </div>

                <div className="grid grid-cols-2 gap-6 mb-10">
                  <div className="p-6 rounded-3xl bg-primary/5 border border-primary/10">
                    <div className="text-3xl font-display font-bold text-primary mb-1">{why?.stat1Value || "7 335"}</div>
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground">{why?.stat1Label || t("home.whyActiveMembers")}</div>
                  </div>
                  <div className="p-6 rounded-3xl bg-accent/5 border border-accent/10 text-right">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-1">{why?.stat2Label || t("home.whyFoundedIn")}</div>
                    <div className="text-3xl font-display font-bold text-accent">{why?.stat2Value || "2006"}</div>
                  </div>
                </div>

                <div className="space-y-6">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{why?.growthLabel || t("home.whyFundsGrowth")}</span>
                    <span className="text-primary font-bold">{why?.growthValue || t("home.whyPerYear")}</span>
                  </div>
                  <div className="flex items-end gap-3 h-48 pt-10">
                    {[30, 45, 60, 55, 75, 90, 85, 100].map((h, i) => (
                      <div
                        key={i}
                        className="flex-1 bg-gradient-to-t from-primary to-primary-light rounded-t-lg transition-all duration-1000 delay-500 hover:scale-x-110"
                        style={{ height: `${h}%` }}
                      />
                    ))}
                  </div>
                  <div className="h-px bg-border w-full mt-4" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PCA QUOTE */}
      <section ref={quoteRef} className="reveal relative py-20 md:py-28 bg-primary-dark text-white overflow-hidden" style={pcaBgStyle}>
        {pca?.bgImage && <div className="absolute inset-0 bg-primary-dark/70" aria-hidden />}
        <div className="absolute inset-0 grid-pattern-light opacity-40" aria-hidden />
        <div className="absolute top-10 left-10 text-accent opacity-30" aria-hidden>
          <Quote className="h-32 w-32 -scale-x-100" />
        </div>
        <div className="relative container max-w-4xl text-center">
          <Quote className="mx-auto h-10 w-10 text-accent" />
          <blockquote className="mt-6 font-display text-3xl md:text-4xl xl:text-5xl font-bold italic leading-tight text-balance">
            « {pca?.quote || t("home.quote")} »
          </blockquote>
          <div className="mt-10 flex items-center justify-center gap-4">
            <div className="grid h-14 w-14 place-items-center rounded-full bg-gradient-gold text-accent-foreground font-bold">{pcaInitials}</div>
            <div className="text-left">
              <div className="font-semibold text-white">{pcaName}</div>
              <div className="text-sm text-white/70">{pca?.role || t("home.quoteRole")}</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWS */}
      <section ref={newsRef} className="reveal py-20 md:py-28">
        <div className="container">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
            <div>
              <span className="text-sm font-mono uppercase tracking-wider text-primary">{t("home.newsKicker")}</span>
              <h2 className="mt-2 font-display text-4xl md:text-5xl font-bold">{t("home.newsTitle")}</h2>
            </div>
            <Link to="/actualites" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
              {t("home.newsAll")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {NEWS.slice(0, 3).map((n) => (
              <article key={n.slug} className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-bounce">
                <div className="aspect-[16/10] bg-gradient-primary relative overflow-hidden">
                  <img src={n.image || `https://placehold.co/640x400/1A6147/F5A623?text=MA2E&font=playfair`} alt="" className="absolute inset-0 w-full h-full object-cover opacity-90" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">{tCat(n.category)}</span>
                    <span className="text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold leading-snug group-hover:text-primary transition-smooth">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>
                  <Link to={`/actualites/${n.slug}`} className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all">
                    {t("home.readMore")} <ArrowRight className="h-3.5 w-3.5" />
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
