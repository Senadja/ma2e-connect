import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Check, ChevronLeft, ChevronRight, Clock, Copy, Facebook, Linkedin, Share2, Twitter, User, X } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { type NewsArticle, EBANKING_URL } from "@/data/site";
import { useArticle, useArticles, useSettings } from "@/lib/content";
import { toast } from "@/hooks/use-toast";
import { useTranslation } from "react-i18next";

// Galerie de photos avec visionneuse plein écran (lightbox).
const Gallery = ({ images }: { images: string[] }) => {
  const [active, setActive] = useState<number | null>(null);
  if (!images.length) return null;
  const close = () => setActive(null);
  const show = (i: number) => setActive((i + images.length) % images.length);
  return (
    <div className="my-8">
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {images.map((src, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setActive(i)}
            className="group relative aspect-square overflow-hidden rounded-xl bg-muted focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <img src={src} alt={`Photo ${i + 1}`} loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
          </button>
        ))}
      </div>

      {active !== null && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 p-4" onClick={close} role="dialog" aria-modal="true">
          <button onClick={close} className="absolute top-4 right-4 text-white/80 hover:text-white" aria-label="Fermer"><X className="h-8 w-8" /></button>
          <button onClick={(e) => { e.stopPropagation(); show(active - 1); }} className="absolute left-2 md:left-6 text-white/80 hover:text-white" aria-label="Précédente"><ChevronLeft className="h-10 w-10" /></button>
          <img src={images[active]} alt={`Photo ${active + 1}`} className="max-h-[88vh] max-w-[92vw] rounded-lg object-contain" onClick={(e) => e.stopPropagation()} />
          <button onClick={(e) => { e.stopPropagation(); show(active + 1); }} className="absolute right-2 md:right-6 text-white/80 hover:text-white" aria-label="Suivante"><ChevronRight className="h-10 w-10" /></button>
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-sm text-white/70">{active + 1} / {images.length}</span>
        </div>
      )}
    </div>
  );
};

// Rend cliquables les URLs (http/https) et adresses e-mail présentes dans un texte.
const linkify = (text: string) =>
  text.split(/(https?:\/\/[^\s]+|[\w.+-]+@[\w-]+\.[\w.-]+)/g).map((part, i) => {
    if (i % 2 === 0) return part; // segments hors-lien
    const trail = part.match(/[.,;:!?)]+$/)?.[0] ?? ""; // ne pas happer la ponctuation finale
    const value = trail ? part.slice(0, -trail.length) : part;
    const isEmail = value.includes("@") && !/^https?:/i.test(value);
    return (
      <span key={i}>
        <a
          href={isEmail ? `mailto:${value}` : value}
          target={isEmail ? undefined : "_blank"}
          rel={isEmail ? undefined : "noopener noreferrer"}
          className="text-primary underline underline-offset-2 hover:text-primary/80 break-words"
        >
          {value}
        </a>
        {trail}
      </span>
    );
  });

const ContentBlock = ({ block }: { block: NewsArticle["content"][number] }) => {
  switch (block.type) {
    case "gallery":
      return <Gallery images={block.items || []} />;
    case "h2":
      return <h2 className="font-display text-2xl md:text-3xl font-bold text-foreground mt-10 mb-4">{block.text}</h2>;
    case "quote":
      return (
        <blockquote className="my-8 border-l-4 border-accent bg-primary/5 rounded-r-2xl p-6 md:p-8">
          <p className="font-display italic text-xl md:text-2xl text-primary leading-relaxed">« {block.text} »</p>
        </blockquote>
      );
    case "list":
      return (
        <ul className="my-6 space-y-3">
          {block.items?.map((item, i) => (
            <li key={i} className="flex items-start gap-3 text-foreground/90">
              <span className="mt-2 h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
              <span>{linkify(item)}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return <p className="my-4 text-foreground/85 leading-relaxed text-lg">{linkify(block.text || "")}</p>;
  }
};

const NewsDetail = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const ebanking = settings?.links?.ebanking || EBANKING_URL;
  const tCat = (c: string) => t(`newsPage.categories.${c}`, { defaultValue: c });
  const { slug } = useParams<{ slug: string }>();
  const { data: article, isLoading } = useArticle(slug);
  const { data: allArticles = [] } = useArticles();
  const [copied, setCopied] = useState(false);

  if (isLoading)
    return (
      <Layout>
        <div className="container py-32 text-center text-muted-foreground">{t("newsDetail.loading")}</div>
      </Layout>
    );
  if (!article) return <Navigate to="/actualites" replace />;

  const related = allArticles.filter((n) => n.slug !== article.slug).slice(0, 3);

  const shareUrl = typeof window !== "undefined" ? window.location.href : "";
  const shareText = `${article.title} — MA2E`;
  const openShare = (url: string) => window.open(url, "_blank", "noopener,noreferrer,width=640,height=560");
  const handleFacebook = () =>
    openShare(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`);
  const handleTwitter = () =>
    openShare(
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`,
    );
  const handleLinkedIn = () =>
    openShare(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`);
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      toast({ title: "Lien copié", description: "Le lien de l'article a été copié dans le presse-papiers." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Impossible de copier", description: "Veuillez copier le lien manuellement.", variant: "destructive" });
    }
  };
  return (
    <Layout>
      {/* Hero image */}
      <section className="relative h-[55vh] min-h-[420px] w-full overflow-hidden bg-primary-dark">
        <img
          src={article.image || `https://placehold.co/1600x900/1A6147/F5A623?text=MA2E&font=playfair`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/70 to-primary-dark/30" />
        <div className="relative container h-full flex flex-col justify-end pb-12 text-white">
          <div className="flex items-center gap-3 text-xs mb-4">
            <span className="rounded-full bg-accent text-accent-foreground px-3 py-1 font-semibold">{tCat(article.category)}</span>
            <span className="inline-flex items-center gap-1.5 text-white/80"><Calendar className="h-3.5 w-3.5" /> {article.date}</span>
            {article.readTime && <span className="inline-flex items-center gap-1.5 text-white/80"><Clock className="h-3.5 w-3.5" /> {article.readTime} {t("newsDetail.readingTime")}</span>}
          </div>
          <h1 className="font-display text-3xl md:text-5xl lg:text-6xl font-bold max-w-4xl text-balance">{article.title}</h1>
        </div>
      </section>

      {/* Article body */}
      <section className="py-12 md:py-16">
        <div className="container grid lg:grid-cols-[1fr_280px] gap-12">
          <article className="max-w-3xl">
            <p className="text-xl text-muted-foreground leading-relaxed border-l-4 border-primary pl-5 italic">
              {article.excerpt}
            </p>

            <div className="mt-8">
              {article.content.map((block, i) => (
                <ContentBlock key={i} block={block} />
              ))}
            </div>

            {/* Footer actions */}
            <div className="mt-12 pt-8 border-t border-border flex flex-wrap items-center justify-between gap-4">
              <Link to="/actualites" className="inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all">
                <ArrowLeft className="h-4 w-4" /> {t("newsDetail.back")}
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5"><Share2 className="h-4 w-4" /> {t("newsDetail.share")}</span>
                <button onClick={handleFacebook} aria-label={`${t("common.shareOn")} Facebook`} className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth"><Facebook className="h-4 w-4" /></button>
                <button onClick={handleTwitter} aria-label={`${t("common.shareOn")} X (Twitter)`} className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth"><Twitter className="h-4 w-4" /></button>
                <button onClick={handleLinkedIn} aria-label={`${t("common.shareOn")} LinkedIn`} className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth"><Linkedin className="h-4 w-4" /></button>
                <button onClick={handleCopy} aria-label={t("common.copyLink")} className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth">{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}</button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="font-display text-lg font-bold mb-4">{t("newsDetail.about")}</h3>
              {article.author && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground inline-flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{article.author}</div>
                    <div className="text-xs text-muted-foreground">{t("newsDetail.author")}</div>
                  </div>
                </div>
              )}
              <dl className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between"><dt>{t("newsDetail.category")}</dt><dd className="text-foreground font-medium">{tCat(article.category)}</dd></div>
                <div className="flex justify-between"><dt>{t("newsDetail.publishedOn")}</dt><dd className="text-foreground font-medium">{article.date}</dd></div>
                {article.readTime && <div className="flex justify-between"><dt>{t("newsDetail.reading")}</dt><dd className="text-foreground font-medium">{article.readTime}</dd></div>}
              </dl>
            </div>

            <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-6">
              <h3 className="font-display text-lg font-bold">{t("common.espaceEma2e")}</h3>
              <p className="text-sm text-primary-foreground/80 mt-2">{t("newsDetail.ema2eText")}</p>
              <a href={ebanking} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:brightness-110 transition-smooth">
                {t("newsDetail.login")} <ArrowRight className="h-3.5 w-3.5" />
              </a>
            </div>
          </aside>
        </div>
      </section>

      {/* Related articles */}
      <section className="py-16 bg-muted/40 border-t border-border">
        <div className="container">
          <div className="flex items-end justify-between mb-8">
            <div>
              <span className="text-xs font-mono uppercase tracking-widest text-primary">{t("newsDetail.alsoRead")}</span>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">{t("newsDetail.related")}</h2>
            </div>
            <Link to="/actualites" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold">
              {t("newsDetail.allNews")} <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((n) => (
              <Link to={`/actualites/${n.slug}`} key={n.slug} className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-bounce block">
                <div className="aspect-[16/10] bg-gradient-primary overflow-hidden">
                  <img src={n.image || "https://placehold.co/640x400/1A6147/F5A623?text=MA2E&font=playfair"} alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-smooth" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">{tCat(n.category)}</span>
                    <span className="text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold leading-snug group-hover:text-primary transition-smooth">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold">
                    {t("newsPage.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default NewsDetail;
