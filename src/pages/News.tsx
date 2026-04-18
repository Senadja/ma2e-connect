import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { NEWS } from "@/data/site";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const FILTERS = ["Tous", "Événements", "Communiqués", "Offres"] as const;

const News = () => {
  const [filter, setFilter] = useState<typeof FILTERS[number]>("Tous");
  const filtered = filter === "Tous" ? NEWS : NEWS.filter((n) => n.category === filter);
  const [featured, ...rest] = filtered;

  return (
    <Layout>
      <PageHero
        title="Actualités & événements"
        subtitle="Suivez la vie de votre mutuelle, ses offres et ses temps forts."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Actualités" }]}
      />

      <section className="py-12">
        <div className="container">
          <div className="flex flex-wrap gap-2" role="tablist">
            {FILTERS.map((f) => (
              <button key={f} onClick={() => setFilter(f)}
                className={cn("px-5 py-2 rounded-full text-sm font-semibold transition-smooth border",
                  filter === f ? "bg-primary text-primary-foreground border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40")}>
                {f}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && (
        <section className="pb-12">
          <div className="container">
            <article className="grid lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden bg-card border border-border shadow-soft hover:shadow-elegant transition-smooth">
              <div className="aspect-[16/10] lg:aspect-auto relative overflow-hidden bg-gradient-primary">
                <img src="https://placehold.co/1200x800/1A6147/F5A623?text=MA2E&font=playfair" alt="" className="w-full h-full object-cover" />
              </div>
              <div className="p-8 md:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 text-xs">
                  <span className="rounded-full bg-accent/20 text-accent-foreground px-3 py-1 font-semibold">À la une</span>
                  <span className="rounded-full bg-primary/10 text-primary px-3 py-1 font-semibold">{featured.category}</span>
                  <span className="text-muted-foreground">{featured.date}</span>
                </div>
                <h2 className="mt-4 font-display text-3xl md:text-4xl font-bold leading-tight">{featured.title}</h2>
                <p className="mt-4 text-muted-foreground">{featured.excerpt}</p>
                <a href="#" className="mt-6 inline-flex items-center gap-2 text-primary font-semibold w-fit">
                  Lire l'article complet <ArrowRight className="h-4 w-4" />
                </a>
              </div>
            </article>
          </div>
        </section>
      )}

      {/* Grid */}
      <section className="pb-20">
        <div className="container">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {rest.map((n) => (
              <article key={n.id} className="group rounded-2xl bg-card border border-border overflow-hidden hover:shadow-elegant hover:-translate-y-1 transition-bounce">
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
                  <a href="#" className="mt-4 inline-flex items-center gap-1 text-primary text-sm font-semibold">
                    Lire la suite <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                </div>
              </article>
            ))}
          </div>

          {/* Pagination */}
          <nav aria-label="Pagination" className="mt-12 flex items-center justify-center gap-2">
            {[1, 2, 3].map((n) => (
              <button key={n} className={cn("h-10 w-10 rounded-full font-semibold transition-smooth", n === 1 ? "bg-primary text-primary-foreground" : "bg-card border border-border hover:border-primary/40")}>
                {n}
              </button>
            ))}
            <span className="text-muted-foreground px-2">…</span>
            <button className="h-10 px-4 rounded-full bg-card border border-border font-semibold text-sm hover:border-primary/40">Suivant →</button>
          </nav>
        </div>
      </section>
    </Layout>
  );
};

export default News;
