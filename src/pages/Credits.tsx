import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { CREDITS } from "@/data/site";
import { Download, Clock, Percent, Coins, ShieldCheck } from "lucide-react";

const Credits = () => (
  <Layout>
    <PageHero
      title="Formules de crédit"
      subtitle="Quatre solutions de financement à taux préférentiel pour réaliser vos projets."
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Produits", href: "/produits" }, { label: "Crédits" }]}
    />

    {/* Cards */}
    <section className="py-20">
      <div className="container">
        <div className="grid md:grid-cols-2 gap-6">
          {CREDITS.map((c) => (
            <article key={c.id} className="rounded-2xl bg-card border border-border p-8 hover:shadow-elegant hover:-translate-y-1 transition-bounce">
              <div className="flex items-start justify-between gap-4">
                <h2 className="font-display text-2xl font-bold">{c.name}</h2>
                <span className="rounded-full bg-accent/15 text-accent-foreground px-3 py-1 text-xs font-semibold">{c.taux}</span>
              </div>
              <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
                <div><dt className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />Durée</dt><dd className="mt-1 font-semibold">{c.duree}</dd></div>
                <div><dt className="flex items-center gap-1 text-muted-foreground"><Coins className="h-3.5 w-3.5" />Montant</dt><dd className="mt-1 font-semibold">{c.montant}</dd></div>
                <div><dt className="flex items-center gap-1 text-muted-foreground"><Percent className="h-3.5 w-3.5" />Taux</dt><dd className="mt-1 font-semibold">{c.taux}</dd></div>
              </dl>
              <div className="mt-6 rounded-lg bg-secondary/60 p-4 text-sm flex gap-2">
                <ShieldCheck className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                <span><strong>Conditions :</strong> {c.conditions}</span>
              </div>
              <a href="#" className="mt-6 inline-flex items-center gap-2 rounded-full bg-accent text-accent-foreground px-5 py-2.5 font-semibold hover:shadow-gold transition-smooth">
                <Download className="h-4 w-4" /> Télécharger le formulaire
              </a>
            </article>
          ))}
        </div>

        {/* Comparison table */}
        <div className="mt-16">
          <h2 className="font-display text-3xl font-bold mb-6">Comparatif rapide</h2>
          <div className="overflow-x-auto rounded-2xl border border-border bg-card">
            <table className="w-full text-sm">
              <thead className="bg-secondary/60">
                <tr>
                  <th className="text-left p-4 font-semibold">Produit</th>
                  <th className="text-left p-4 font-semibold">Durée</th>
                  <th className="text-left p-4 font-semibold">Taux</th>
                  <th className="text-left p-4 font-semibold">Montant max</th>
                  <th className="text-left p-4 font-semibold">Conditions</th>
                </tr>
              </thead>
              <tbody>
                {CREDITS.map((c) => (
                  <tr key={c.id} className="border-t border-border hover:bg-secondary/30">
                    <td className="p-4 font-semibold text-primary">{c.name}</td>
                    <td className="p-4">{c.duree}</td>
                    <td className="p-4">{c.taux}</td>
                    <td className="p-4">{c.montant}</td>
                    <td className="p-4 text-muted-foreground">{c.conditions}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

export default Credits;
