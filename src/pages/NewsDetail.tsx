import { useState } from "react";
import { Link, useParams, Navigate } from "react-router-dom";
import { ArrowLeft, ArrowRight, Calendar, Check, ChevronRight, Clock, Copy, Facebook, Linkedin, Share2, Twitter, User } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { NEWS, type NewsArticle } from "@/data/site";
import { toast } from "@/hooks/use-toast";

const ContentBlock = ({ block }: { block: NewsArticle["content"][number] }) => {
  switch (block.type) {
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
              <span>{item}</span>
            </li>
          ))}
        </ul>
      );
    default:
      return <p className="my-4 text-foreground/85 leading-relaxed text-lg">{block.text}</p>;
  }
};

const NewsDetail = () => {
  const { id } = useParams<{ id: string }>();
  const article = NEWS.find((n) => String(n.id) === id);
  const [copied, setCopied] = useState(false);

  if (!article) return <Navigate to="/actualites" replace />;

  const related = NEWS.filter((n) => n.id !== article.id).slice(0, 3);

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
          src={`https://placehold.co/1600x900/1A6147/F5A623?text=MA2E&font=playfair`}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-60"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-primary-dark via-primary-dark/70 to-primary-dark/30" />
        <div className="relative container h-full flex flex-col justify-end pb-12 text-white">
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-white/70 mb-4">
            <Link to="/" className="hover:text-accent">Accueil</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <Link to="/actualites" className="hover:text-accent">Actualités</Link>
            <ChevronRight className="h-3.5 w-3.5" />
            <span className="text-accent line-clamp-1">{article.title}</span>
          </nav>
          <div className="flex items-center gap-3 text-xs mb-4">
            <span className="rounded-full bg-accent text-accent-foreground px-3 py-1 font-semibold">{article.category}</span>
            <span className="inline-flex items-center gap-1.5 text-white/80"><Calendar className="h-3.5 w-3.5" /> {article.date}</span>
            {article.readTime && <span className="inline-flex items-center gap-1.5 text-white/80"><Clock className="h-3.5 w-3.5" /> {article.readTime} de lecture</span>}
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
                <ArrowLeft className="h-4 w-4" /> Retour aux actualités
              </Link>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground inline-flex items-center gap-1.5"><Share2 className="h-4 w-4" /> Partager</span>
                <button onClick={handleFacebook} aria-label="Partager sur Facebook" className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth"><Facebook className="h-4 w-4" /></button>
                <button onClick={handleTwitter} aria-label="Partager sur X (Twitter)" className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth"><Twitter className="h-4 w-4" /></button>
                <button onClick={handleLinkedIn} aria-label="Partager sur LinkedIn" className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth"><Linkedin className="h-4 w-4" /></button>
                <button onClick={handleCopy} aria-label="Copier le lien" className="h-9 w-9 rounded-full bg-card border border-border hover:border-primary hover:text-primary inline-flex items-center justify-center transition-smooth">{copied ? <Check className="h-4 w-4 text-primary" /> : <Copy className="h-4 w-4" />}</button>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="space-y-6 lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-2xl bg-card border border-border p-6">
              <h3 className="font-display text-lg font-bold mb-4">À propos</h3>
              {article.author && (
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-11 w-11 rounded-full bg-gradient-primary text-primary-foreground inline-flex items-center justify-center">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <div className="text-sm font-semibold">{article.author}</div>
                    <div className="text-xs text-muted-foreground">Auteur</div>
                  </div>
                </div>
              )}
              <dl className="text-sm space-y-2 text-muted-foreground">
                <div className="flex justify-between"><dt>Catégorie</dt><dd className="text-foreground font-medium">{article.category}</dd></div>
                <div className="flex justify-between"><dt>Publié le</dt><dd className="text-foreground font-medium">{article.date}</dd></div>
                {article.readTime && <div className="flex justify-between"><dt>Lecture</dt><dd className="text-foreground font-medium">{article.readTime}</dd></div>}
              </dl>
            </div>

            <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-6">
              <h3 className="font-display text-lg font-bold">Espace E-MA2E</h3>
              <p className="text-sm text-primary-foreground/80 mt-2">Accédez à votre compte adhérent en ligne 24h/24.</p>
              <a href="#" className="mt-4 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-4 py-2 text-sm font-semibold hover:brightness-110 transition-smooth">
                Se connecter <ArrowRight className="h-3.5 w-3.5" />
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
              <span className="text-xs font-mono uppercase tracking-widest text-primary">À lire aussi</span>
              <h2 className="mt-2 font-display text-3xl md:text-4xl font-bold">Articles liés</h2>
            </div>
            <Link to="/actualites" className="hidden md:inline-flex items-center gap-2 text-primary font-semibold">
              Toutes les actualités <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {related.map((n) => (
              <Link to={`/actualites/${n.id}`} key={n.id} className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-bounce block">
                <div className="aspect-[16/10] bg-gradient-primary overflow-hidden">
                  <img src="https://placehold.co/640x400/1A6147/F5A623?text=MA2E&font=playfair" alt="" className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-smooth" />
                </div>
                <div className="p-6">
                  <div className="flex items-center gap-3 text-xs">
                    <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">{n.category}</span>
                    <span className="text-muted-foreground">{n.date}</span>
                  </div>
                  <h3 className="mt-4 font-display text-xl font-bold leading-snug group-hover:text-primary transition-smooth">{n.title}</h3>
                  <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>
                  <span className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold">
                    Lire la suite <ArrowRight className="h-3.5 w-3.5" />
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
