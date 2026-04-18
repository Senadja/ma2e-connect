import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { FAQ_IMMO, REAL_ESTATE_TYPES } from "@/data/site";
import { Home, Building2, Castle, Hotel, Plus, Minus, X, ArrowRight, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = { Home, Building2, House: Home, Castle, Hotel, Building };

const RealEstate = () => {
  const [tranche, setTranche] = useState<"1" | "2">("1");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [modal, setModal] = useState(false);

  return (
    <Layout>
      <PageHero
        title="Projet immobilier MA2E"
        subtitle="Devenez propriétaire grâce à un programme pensé pour les agents."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Produits", href: "/produits" }, { label: "Immobilier" }]}
      >
        <button onClick={() => setModal(true)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold text-accent-foreground px-7 py-3.5 font-semibold shadow-gold hover:scale-[1.02] transition-bounce">
          Faire une demande <ArrowRight className="h-4 w-4" />
        </button>
      </PageHero>

      {/* Hero illustration band */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">Un programme structuré en plusieurs tranches</h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              Le programme immobilier MA2E permet à ses adhérents d'accéder à un logement de qualité, livré clés en main, avec un financement adapté et un accompagnement personnalisé tout au long du projet.
            </p>
            <div className="mt-8 inline-flex rounded-full bg-card border border-border p-1">
              {(["1", "2"] as const).map((t) => (
                <button key={t} onClick={() => setTranche(t)}
                  className={cn("px-6 py-2.5 rounded-full text-sm font-semibold transition-smooth",
                    tranche === t ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}>
                  {t === "1" ? "1ère Tranche" : "2ème Tranche"}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-secondary/40 border border-border p-6">
              <div className="font-display font-bold text-lg">{tranche === "1" ? "Tranche 1 — En cours de livraison" : "Tranche 2 — Souscriptions ouvertes"}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {tranche === "1"
                  ? "Premiers logements remis en 2024 à 12 familles d'adhérents. Programme entièrement financé via la MA2E."
                  : "Nouveau lot de logements. Inscriptions et dépôts de garantie ouverts pour les adhérents éligibles."}
              </p>
            </div>
          </div>
          <div className="rounded-3xl overflow-hidden bg-gradient-primary aspect-[4/3] relative shadow-elegant">
            <img src="https://placehold.co/800x600/1A6147/F5A623?text=Programme+immobilier+MA2E&font=playfair" alt="Programme immobilier" className="w-full h-full object-cover" />
          </div>
        </div>
      </section>

      {/* Property types */}
      <section className="py-16 bg-secondary/40">
        <div className="container">
          <h2 className="font-display text-3xl font-bold text-center">Types de logements</h2>
          <p className="text-center text-muted-foreground mt-2">Cinq formats pour répondre à toutes les compositions familiales.</p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            {REAL_ESTATE_TYPES.map((t) => {
              const Icon = iconMap[t.icon] || Home;
              return (
                <div key={t.name} className="rounded-2xl bg-card border border-border p-6 text-center hover:shadow-elegant hover:-translate-y-1 transition-bounce">
                  <div className="mx-auto inline-flex h-14 w-14 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="h-7 w-7" />
                  </div>
                  <div className="mt-4 font-semibold">{t.name}</div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-20">
        <div className="container max-w-3xl">
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center">Questions fréquentes</h2>
          <div className="mt-10 space-y-3">
            {FAQ_IMMO.map((f, i) => (
              <div key={i} className="rounded-xl border border-border bg-card overflow-hidden">
                <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between gap-4 p-5 text-left">
                  <span className="font-semibold">{f.q}</span>
                  {openFaq === i ? <Minus className="h-5 w-5 text-primary shrink-0" /> : <Plus className="h-5 w-5 text-muted-foreground shrink-0" />}
                </button>
                {openFaq === i && <div className="px-5 pb-5 text-muted-foreground animate-fade-in-fast">{f.a}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-[80] grid place-items-center bg-primary-dark/70 backdrop-blur-sm p-4 animate-fade-in-fast" onClick={() => setModal(false)}>
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-8 shadow-elegant animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(false)} aria-label="Fermer" className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg"><X className="h-5 w-5" /></button>
            <h3 className="font-display text-2xl font-bold">Demande d'information immobilier</h3>
            <p className="text-sm text-muted-foreground mt-1">Un conseiller MA2E vous recontactera sous 48h.</p>
            <form className="mt-6 space-y-4" onSubmit={(e) => { e.preventDefault(); setModal(false); }}>
              <input required placeholder="Nom complet" className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input required type="email" placeholder="Email" className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              <input placeholder="Téléphone" className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              <textarea rows={3} placeholder="Type de logement souhaité" className="w-full rounded-lg border border-input bg-background px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary" />
              <button className="w-full rounded-full bg-gradient-gold text-accent-foreground px-5 py-3 font-semibold shadow-gold hover:scale-[1.01] transition-bounce">Envoyer la demande</button>
            </form>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RealEstate;
