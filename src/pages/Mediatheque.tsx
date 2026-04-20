import { useMemo, useState } from "react";
import { Download, FileText, Search } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { MEDIA, MEDIA_CATEGORIES, type MediaCategory } from "@/data/institutional";

const Mediatheque = () => {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<MediaCategory | "Tous">("Tous");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return MEDIA.filter((m) => {
      const okCat = category === "Tous" || m.category === category;
      const okQ = !q || m.title.toLowerCase().includes(q) || m.desc.toLowerCase().includes(q);
      return okCat && okQ;
    });
  }, [query, category]);

  return (
    <Layout>
      <PageHero
        title="Médiathèque"
        subtitle="Téléchargez nos formulaires, rapports annuels, statuts et brochures officielles."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Médiathèque" }]}
      />

      <section className="container py-16">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between mb-10">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Rechercher un document…"
              className="pl-11"
              aria-label="Rechercher un document"
            />
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              variant={category === "Tous" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategory("Tous")}
            >
              Tous
            </Button>
            {MEDIA_CATEGORIES.map((c) => (
              <Button
                key={c}
                variant={category === c ? "default" : "outline"}
                size="sm"
                onClick={() => setCategory(c)}
              >
                {c}
              </Button>
            ))}
          </div>
        </div>

        {filtered.length === 0 ? (
          <p className="text-center py-16 text-muted-foreground">Aucun document ne correspond à votre recherche.</p>
        ) : (
          <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            {filtered.map((m, i) => (
              <article
                key={i}
                className="group flex flex-col rounded-2xl border bg-card p-6 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-lg hover:border-primary/40"
              >
                <div className="mb-4 flex items-start justify-between">
                  <div className="grid h-12 w-12 place-items-center rounded-xl bg-primary/10 text-primary">
                    <FileText className="h-6 w-6" />
                  </div>
                  <span className="inline-flex items-center rounded-full bg-accent/15 px-2.5 py-0.5 text-xs font-medium text-accent-foreground">
                    {m.category}
                  </span>
                </div>
                <h3 className="font-display text-lg leading-snug">{m.title}</h3>
                <p className="mt-2 text-sm text-muted-foreground flex-1">{m.desc}</p>
                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                  <span>PDF · {m.size}</span>
                  <span>{m.year}</span>
                </div>
                <Button
                  variant="outline"
                  className="mt-5 w-full group-hover:bg-primary group-hover:text-primary-foreground group-hover:border-primary"
                  asChild
                >
                  <a href="#" aria-label={`Télécharger ${m.title}`}>
                    <Download className="mr-2 h-4 w-4" />
                    Télécharger
                  </a>
                </Button>
              </article>
            ))}
          </div>
        )}
      </section>
    </Layout>
  );
};

export default Mediatheque;
