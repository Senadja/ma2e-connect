import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SAVINGS } from "@/data/site";
import { Check, Download } from "lucide-react";
import { cn } from "@/lib/utils";

const Savings = () => {
  const [active, setActive] = useState(SAVINGS[0].id);
  const current = SAVINGS.find((s) => s.id === active)!;

  return (
    <Layout>
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
            </div>

            <aside className="rounded-3xl bg-gradient-primary text-primary-foreground p-8 shadow-elegant h-fit lg:sticky lg:top-28">
              <div className="text-xs uppercase tracking-wider text-white/70">Démarche</div>
              <div className="mt-2 font-display text-2xl font-bold">Téléchargez le formulaire</div>
              <p className="mt-3 text-sm text-white/80">Remplissez et déposez votre dossier en agence ou via votre espace E-MA2E.</p>
              <a href="#" className="mt-6 inline-flex items-center gap-2 rounded-full bg-gradient-gold text-accent-foreground px-5 py-3 font-semibold shadow-gold hover:scale-[1.02] transition-bounce w-full justify-center">
                <Download className="h-4 w-4" />
                Télécharger le formulaire
              </a>
              <div className="mt-4 text-xs text-white/60 text-center">PDF · 240 Ko</div>
            </aside>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Savings;
