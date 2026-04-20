import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { ProductRequestForm } from "@/components/forms/ProductRequestForm";
import { SAVINGS } from "@/data/site";
import { Check, Download, Mail } from "lucide-react";
import { cn } from "@/lib/utils";

const Savings = () => {
  const [active, setActive] = useState(SAVINGS[0].id);
  const current = SAVINGS.find((s) => s.id === active)!;

  return (
    <Layout>
      <SEO title={`Épargne ${current.name}`} description={current.desc} />
      <PageHero
        title="Épargne rémunérée"
        subtitle="Cinq formules pour faire fructifier votre capital à votre rythme."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Produits", href: "/produits" }, { label: "Épargne" }]}
      />

      <section className="py-20">
        <div className="container">
          {/* Tabs */}
          <div className="flex flex-wrap gap-2 border-b border-border" role="tablist">
            {SAVINGS.map((s) => (
              <button
                key={s.id}
                role="tab"
                aria-selected={active === s.id}
                onClick={() => setActive(s.id)}
                className={cn(
                  "px-5 py-3 text-sm font-medium rounded-t-lg transition-smooth border-b-2",
                  active === s.id ? "border-primary text-primary bg-primary/5" : "border-transparent text-muted-foreground hover:text-foreground"
                )}
              >
                {s.name}
              </button>
            ))}
          </div>

          {/* Content */}
          <div key={current.id} className="mt-10 grid lg:grid-cols-3 gap-10 animate-fade-in">
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold">{current.name}</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed">{current.desc}</p>

              <h3 className="mt-10 font-display text-xl font-bold">Caractéristiques principales</h3>
              <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                {current.features.map((f) => (
                  <li key={f} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                    <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shrink-0">
                      <Check className="h-3.5 w-3.5" />
                    </span>
                    <span className="font-medium">{f}</span>
                  </li>
                ))}
              </ul>

              <h3 className="mt-10 font-display text-xl font-bold">Conditions d'accès</h3>
              <p className="mt-2 text-muted-foreground">
                Réservé aux agents adhérents à jour de leurs cotisations. Ouverture sous 48h après dépôt du dossier complet auprès de votre conseiller MA2E.
              </p>
              
              <div className="mt-12 p-8 rounded-2xl bg-secondary/40 border border-border">
                <h3 className="font-display text-2xl font-bold mb-4">Besoin d'aide ?</h3>
                <p className="text-muted-foreground mb-6">Nos conseillers sont à votre disposition pour vous guider dans le choix de votre formule d'épargne.</p>
                <div className="flex flex-wrap gap-4">
                  <a href="/contact" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">
                    <Mail className="h-5 w-5" /> Contacter un conseiller
                  </a>
                  <a href="#" className="inline-flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground">
                    <Download className="h-5 w-5" /> Guide de l'épargnant (PDF)
                  </a>
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <ProductRequestForm category="épargne" defaultProduct={current.id} />
                
                <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-6 shadow-elegant">
                  <h4 className="font-bold mb-2">Documents utiles</h4>
                  <p className="text-xs text-white/70 mb-4">Téléchargez les formulaires officiels pour gagner du temps en agence.</p>
                  <a href="#" className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold">
                    <span>Formulaire d'ouverture</span>
                    <Download className="h-4 w-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Savings;
