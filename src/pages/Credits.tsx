import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { ProductRequestForm } from "@/components/forms/ProductRequestForm";
import { CREDITS } from "@/data/site";
import { Download, Clock, Percent, Coins, ShieldCheck, Info } from "lucide-react";

const Credits = () => (
  <Layout>
    <SEO title="Formules de Crédit" description="Découvrez nos solutions de financement à taux préférentiel pour les agents de l'eau et de l'électricité : crédit scolaire, fêtes, ordinaire et expresse." />
    <PageHero
      title="Formules de crédit"
      subtitle="Quatre solutions de financement à taux préférentiel pour réaliser vos projets."
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Produits", href: "/produits" }, { label: "Crédits" }]}
    />

    <section className="py-20">
      <div className="container">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-10">
            <div className="grid md:grid-cols-2 gap-6">
              {CREDITS.map((c) => (
                <article key={c.id} className="rounded-2xl bg-card border border-border p-8 hover:shadow-elegant transition-bounce relative overflow-hidden group">
                  <div className="absolute top-0 right-0 h-24 w-24 bg-primary/5 rounded-bl-full -mr-12 -mt-12 group-hover:bg-primary/10 transition-colors" />
                  <div className="flex items-start justify-between gap-4">
                    <h2 className="font-display text-2xl font-bold">{c.name}</h2>
                    <span className="rounded-full bg-accent/15 text-accent-foreground px-3 py-1 text-xs font-bold">{c.taux}</span>
                  </div>
                  <dl className="mt-6 grid grid-cols-3 gap-4 text-sm">
                    <div><dt className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />Durée</dt><dd className="mt-1 font-bold">{c.duree}</dd></div>
                    <div><dt className="flex items-center gap-1 text-muted-foreground"><Coins className="h-3.5 w-3.5" />Montant</dt><dd className="mt-1 font-bold">{c.montant}</dd></div>
                    <div><dt className="flex items-center gap-1 text-muted-foreground"><Percent className="h-3.5 w-3.5" />Taux</dt><dd className="mt-1 font-bold">{c.taux}</dd></div>
                  </dl>
                  <div className="mt-6 rounded-xl bg-secondary/50 p-4 text-xs flex gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>Conditions :</strong> {c.conditions}</span>
                  </div>
                </article>
              ))}
            </div>

            {/* Comparison table */}
            <div className="pt-10">
              <h2 className="font-display text-3xl font-bold mb-6 flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" /> Comparatif rapide
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="text-left p-4 font-bold">Produit</th>
                      <th className="text-left p-4 font-bold">Durée</th>
                      <th className="text-left p-4 font-bold">Taux</th>
                      <th className="text-left p-4 font-bold">Montant max</th>
                    </tr>
                  </thead>
                  <tbody>
                    {CREDITS.map((c) => (
                      <tr key={c.id} className="border-t border-border hover:bg-secondary/30 transition-colors">
                        <td className="p-4 font-bold text-primary">{c.name}</td>
                        <td className="p-4">{c.duree}</td>
                        <td className="p-4 font-bold">{c.taux}</td>
                        <td className="p-4">{c.montant}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          <div className="lg:col-span-1">
            <div className="sticky top-28 space-y-6">
              <ProductRequestForm category="crédit" />
              
              <div className="rounded-2xl border border-dashed border-primary/30 p-6 text-center">
                <h4 className="font-bold text-primary mb-2 text-sm uppercase">Simulateur de crédit</h4>
                <p className="text-xs text-muted-foreground mb-4">Calculez vos mensualités en quelques clics via notre plateforme E-MA2E.</p>
                <Button variant="outline" className="w-full rounded-full text-xs font-bold" asChild>
                  <a href="#">Accéder à E-MA2E</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
);

import { Button } from "@/components/ui/button";

export default Credits;
