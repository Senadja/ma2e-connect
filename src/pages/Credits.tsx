import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { ProductRequestForm } from "@/components/forms/ProductRequestForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useProducts } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { Download, Clock, Percent, Coins, ShieldCheck, Info } from "lucide-react";

const Credits = () => {
  const { data: CREDITS = [] } = useProducts("credit");
  const { t } = useTranslation();
  return (
  <Layout>
    <SEO title="Formules de Crédit" description="Découvrez nos solutions de financement à taux préférentiel pour les agents de l'eau et de l'électricité : crédit scolaire, immobilier, ordinaire et expresse." />
    <PageHero
      title={t("home.prodCreditTitle")}
      subtitle={t("products.creditHeroSubtitle")}
      breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.products"), href: "/produits" }, { label: t("nav.credits") }]}
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
                    <div><dt className="flex items-center gap-1 text-muted-foreground"><Clock className="h-3.5 w-3.5" />{t("products.duration")}</dt><dd className="mt-1 font-bold">{c.duree}</dd></div>
                    <div><dt className="flex items-center gap-1 text-muted-foreground"><Coins className="h-3.5 w-3.5" />{t("products.amount")}</dt><dd className="mt-1 font-bold">{c.montant}</dd></div>
                    <div><dt className="flex items-center gap-1 text-muted-foreground"><Percent className="h-3.5 w-3.5" />{t("products.rate")}</dt><dd className="mt-1 font-bold">{c.taux}</dd></div>
                  </dl>
                  <div className="mt-6 rounded-xl bg-secondary/50 p-4 text-xs flex gap-3">
                    <ShieldCheck className="h-4 w-4 text-primary shrink-0" />
                    <span><strong>{t("products.conditions")} :</strong> {c.conditions}</span>
                  </div>
                  {(c as any).image && (
                    <Dialog>
                      <DialogTrigger asChild>
                        <button className="w-full mt-6 rounded-xl overflow-hidden border border-border/20 shadow-sm relative group-hover:shadow-md transition-all cursor-zoom-in focus:outline-none focus:ring-2 focus:ring-primary">
                          <img src={(c as any).image} alt={`Fiche ${c.name}`} className="w-full h-32 object-cover hover:scale-105 transition-transform duration-500" />
                        </button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                        <img src={(c as any).image} alt={`Fiche ${c.name} agrandie`} className="w-full h-auto max-h-[90vh] object-contain rounded-lg mx-auto" />
                      </DialogContent>
                    </Dialog>
                  )}
                  {(c as any).form && (
                    <Button variant="outline" className="w-full mt-4 rounded-xl text-xs gap-2" asChild>
                      <a href={(c as any).form} download>
                        <Download className="h-3 w-3" /> {t("products.requestForm")}
                      </a>
                    </Button>
                  )}
                </article>
              ))}
            </div>

            {/* Comparison table */}
            <div className="pt-10">
              <h2 className="font-display text-3xl font-bold mb-6 flex items-center gap-3">
                <Info className="h-6 w-6 text-primary" /> {t("products.quickCompare")}
              </h2>
              <div className="overflow-x-auto rounded-2xl border border-border bg-card shadow-sm">
                <table className="w-full text-sm">
                  <thead className="bg-secondary/60">
                    <tr>
                      <th className="text-left p-4 font-bold">{t("products.product")}</th>
                      <th className="text-left p-4 font-bold">{t("products.duration")}</th>
                      <th className="text-left p-4 font-bold">{t("products.rate")}</th>
                      <th className="text-left p-4 font-bold">{t("products.maxAmount")}</th>
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
                <h4 className="font-bold text-primary mb-2 text-sm uppercase">{t("products.creditSimulator")}</h4>
                <p className="text-xs text-muted-foreground mb-4">{t("products.creditSimulatorText")}</p>
                <Button variant="outline" className="w-full rounded-full text-xs font-bold" asChild>
                  <a href="/espace-ema2e">{t("products.accessEma2e")}</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </Layout>
  );
};

import { Button } from "@/components/ui/button";

export default Credits;
