import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useArticles } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { ArrowRight, ArrowLeft, Search, X, Rss } from "lucide-react";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

const FILTERS = ["Tous", "Événements", "Communiqués", "Offres"] as const;
const PAGE_SIZE = 6;

const News = () => {
  const [filter, setFilter] = useState<typeof FILTERS[number]>("Tous");
  const [query, setQuery] = useState("");
  const [activeTag, setActiveTag] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const { data: NEWS = [] } = useArticles();
  const { t } = useTranslation();
  // Traduit le libellé d'une catégorie (repli sur la valeur d'origine si non mappée).
  const tCat = (c: string) => t(`newsPage.categories.${c}`, { defaultValue: c });

  const allTags = useMemo(() => {
    const set = new Set<string>();
    NEWS.forEach((n) => n.tags?.forEach((t) => set.add(t)));
    return Array.from(set).sort();
  }, [NEWS]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return NEWS.filter((n) => {
      const okCat = filter === "Tous" || n.category === filter;
      const okTag = !activeTag || n.tags?.includes(activeTag);
      const okQ =
        !q ||
        n.title.toLowerCase().includes(q) ||
        n.excerpt.toLowerCase().includes(q) ||
        n.tags?.some((t) => t.toLowerCase().includes(q));
      return okCat && okTag && okQ;
    });
  }, [filter, query, activeTag, NEWS]);

  // Reset page on filter/search changes
  useEffect(() => setPage(1), [filter, query, activeTag]);

  const [featured, ...rest] = filtered;
  const totalPages = Math.max(1, Math.ceil(rest.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const paged = rest.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  return (
    <Layout>
      <PageHero
        title={t("newsPage.heroTitle")}
        subtitle={t("newsPage.heroSubtitle")}
      />

      {/* Toolbar */}
      <section className="py-12">
        <div className="container space-y-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-2" role="tablist" aria-label={t("common.filterByCategory")}>
              {FILTERS.map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  role="tab"
                  aria-selected={filter === f}
                  className={cn(
                    "px-5 py-2 rounded-full text-sm font-semibold transition-smooth border",
                    filter === f
                      ? "bg-primary text-primary-foreground border-primary"
                      : "bg-card text-muted-foreground border-border hover:border-primary/40",
                  )}
                >
                  {f === "Tous" ? t("newsPage.all") : tCat(f)}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-3 lg:w-auto">
              <div className="relative flex-1 lg:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t("newsPage.search")}
                  className="pl-11 pr-10"
                  aria-label={t("newsPage.search")}
                />
                {query && (
                  <button
                    onClick={() => setQuery("")}
                    aria-label={t("newsPage.clear")}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <a
                href="/rss.xml"
                aria-label={t("common.rssFeed")}
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-accent hover:border-accent transition-smooth"
                title={t("common.rssFeed")}
              >
                <Rss className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Tags cloud */}
          {allTags.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground mr-2">{t("newsPage.tags")}</span>
              {allTags.map((t) => {
                const active = activeTag === t;
                return (
                  <button
                    key={t}
                    onClick={() => setActiveTag(active ? null : t)}
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-smooth border",
                      active
                        ? "bg-accent text-accent-foreground border-accent"
                        : "bg-card text-muted-foreground border-border hover:border-accent/50 hover:text-accent",
                    )}
                  >
                    #{t}
                  </button>
                );
              })}
              {activeTag && (
                <button
                  onClick={() => setActiveTag(null)}
                  className="ml-2 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3 w-3" /> {t("newsPage.clear")}
                </button>
              )}
            </div>
          )}

          <div className="text-sm text-muted-foreground">
            {filtered.length} {t("newsPage.resultsSuffix")}
          </div>
        </div>
      </section>

      {/* Empty state */}
      {filtered.length === 0 && (
        <section className="pb-20">
          <div className="container">
            <div className="rounded-2xl border border-dashed border-border bg-card p-12 text-center">
              <Search className="mx-auto h-10 w-10 text-muted-foreground/40 mb-4" />
              <p className="text-muted-foreground">{t("newsPage.noResult")}</p>
              <button
                onClick={() => {
                  setQuery("");
                  setFilter("Tous");
                  setActiveTag(null);
                }}
                className="mt-4 text-primary font-semibold hover:underline"
              >
                {t("newsPage.reset")}
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Featured (only on page 1, no search/tag filter) */}
      {featured && safePage === 1 && (
        <section className="pb-12">
          <div className="container">
            <article className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elegant transition-smooth">
              <Link
                to={`/actualites/${featured.slug}`}
                className="aspect-[16/10] lg:aspect-[4/3] relative overflow-hidden bg-gradient-primary group"
              >
                <img
                  src={featured.image || "https://placehold.co/1200x800/1A6147/F5A623?text=MA2E&font=playfair"}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-smooth"
                />
              </Link>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-accent/20 text-accent-foreground px-3 py-1 font-semibold">
                    {t("newsPage.featured")}
                  </span>
                  <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">
                    {tCat(featured.category)}
                  </span>
                  <span className="text-muted-foreground">{featured.date}</span>
                </div>
                <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold leading-tight">
                  <Link to={`/actualites/${featured.slug}`} className="hover:text-primary transition-smooth">
                    {featured.title}
                  </Link>
                </h2>
                <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
                {featured.tags && (
                  <div className="mt-4 flex flex-wrap gap-1.5">
                    {featured.tags.map((t) => (
                      <span key={t} className="text-xs text-muted-foreground">
                        #{t}
                      </span>
                    ))}
                  </div>
                )}
                <Link
                  to={`/actualites/${featured.slug}`}
                  className="mt-6 inline-flex items-center gap-2 text-primary font-semibold w-fit hover:gap-3 transition-all"
                >
                  {t("newsPage.readFull")} <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Grid */}
      {paged.length > 0 && (
        <section className="pb-20">
          <div className="container">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paged.map((n) => (
                <article
                  key={n.slug}
                  className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-bounce flex flex-col"
                >
                  <Link to={`/actualites/${n.slug}`} className="aspect-[16/10] bg-gradient-primary overflow-hidden block">
                    <img
                      src={n.image || "https://placehold.co/640x400/1A6147/F5A623?text=MA2E&font=playfair"}
                      alt=""
                      className="w-full h-full object-cover opacity-90 group-hover:scale-105 transition-smooth"
                    />
                  </Link>
                  <div className="p-6 flex flex-col flex-1">
                    <div className="flex items-center gap-3 text-xs">
                      <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">
                        {tCat(n.category)}
                      </span>
                      <span className="text-muted-foreground">{n.date}</span>
                    </div>
                    <h3 className="mt-4 font-display text-xl font-bold leading-snug group-hover:text-primary transition-smooth">
                      <Link to={`/actualites/${n.slug}`}>{n.title}</Link>
                    </h3>
                    <p className="mt-2 text-sm text-muted-foreground line-clamp-2">{n.excerpt}</p>
                    {n.tags && (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {n.tags.slice(0, 3).map((t) => (
                          <span key={t} className="text-[11px] text-muted-foreground">
                            #{t}
                          </span>
                        ))}
                      </div>
                    )}
                    <Link
                      to={`/actualites/${n.slug}`}
                      className="mt-auto pt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold hover:gap-2 transition-all"
                    >{t("newsPage.readMore")} <ArrowRight className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2 flex-wrap">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  className="h-10 px-4 rounded-full bg-card border border-border font-semibold text-sm hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> {t("newsPage.previous")}
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                  <button
                    key={n}
                    onClick={() => setPage(n)}
                    aria-current={n === safePage ? "page" : undefined}
                    className={cn(
                      "h-10 w-10 rounded-full font-semibold transition-smooth",
                      n === safePage
                        ? "bg-primary text-primary-foreground"
                        : "bg-card border border-border hover:border-primary/40",
                    )}
                  >
                    {n}
                  </button>
                ))}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  className="h-10 px-4 rounded-full bg-card border border-border font-semibold text-sm hover:border-primary/40 disabled:opacity-40 disabled:cursor-not-allowed inline-flex items-center gap-1"
                >
                  {t("newsPage.next")} <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </nav>
            )}
          </div>
        </section>
      )}
    </Layout>
  );
};

export default News;
