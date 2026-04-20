import { Building2, Handshake } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { PARTNERS } from "@/data/institutional";

const Partners = () => {
  const grouped = PARTNERS.reduce<Record<string, typeof PARTNERS>>((acc, p) => {
    (acc[p.type] ||= []).push(p);
    return acc;
  }, {});

  return (
    <Layout>
      <PageHero
        title="Partenaires & tutelles"
        subtitle="La MA2E s'appuie sur un réseau d'institutions et de partenaires de confiance pour servir ses adhérents."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Partenaires" }]}
      />

      <section className="container py-16 space-y-16">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <div className="flex items-center gap-3 mb-8">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl">{type}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => (
                <article
                  key={p.name}
                  className="rounded-2xl border bg-card p-6 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-lg hover:border-accent/40"
                >
                  <div className="flex h-24 items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 mb-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Building2 className="h-6 w-6" />
                      <span className="font-display text-xl font-semibold">{p.name}</span>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </article>
              ))}
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default Partners;
