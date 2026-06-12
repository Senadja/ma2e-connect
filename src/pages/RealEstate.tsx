import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { ProductRequestForm } from "@/components/forms/ProductRequestForm";
import { FAQ_IMMO, REAL_ESTATE_TYPES } from "@/data/site";
import { useProducts } from "@/lib/content";
import { useTranslation } from "react-i18next";
import { Home, Building2, Castle, Hotel, Plus, Minus, X, ArrowRight, Building } from "lucide-react";
import { cn } from "@/lib/utils";

const iconMap: Record<string, any> = { Home, Building2, House: Home, Castle, Hotel, Building };

const RealEstate = () => {
  const { t } = useTranslation();
  const [tranche, setTranche] = useState<"1" | "2">("1");
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [modal, setModal] = useState(false);
  const { data: immo = [] } = useProducts("immobilier");
  // Types de logements : depuis l'API si disponible, sinon données statiques.
  const types = (immo as any[]).length
    ? (immo as any[]).map((p) => ({ name: p.name, icon: p.categorie === "Villa" ? "House" : "Building2" }))
    : REAL_ESTATE_TYPES;

  return (
    <Layout>
      <PageHero
        title={t("products.realEstateHeroTitle")}
        subtitle={t("products.realEstateHeroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.products"), href: "/produits" }, { label: t("nav.realEstate") }]}
      >
        <button onClick={() => setModal(true)} className="mt-8 inline-flex items-center gap-2 rounded-full bg-gradient-gold text-accent-foreground px-7 py-3.5 font-semibold shadow-gold hover:scale-[1.02] transition-bounce">
          {t("products.makeRequest")} <ArrowRight className="h-4 w-4" />
        </button>
      </PageHero>

      {/* Hero illustration band */}
      <section className="py-20">
        <div className="container grid lg:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-bold">{t("products.tranchesTitle")}</h2>
            <p className="mt-4 text-muted-foreground text-lg leading-relaxed">
              {t("products.tranchesText")}
            </p>
            <div className="mt-8 inline-flex rounded-full bg-card border border-border p-1">
              {(["1", "2"] as const).map((tr) => (
                <button key={tr} onClick={() => setTranche(tr)}
                  className={cn("px-6 py-2.5 rounded-full text-sm font-semibold transition-smooth",
                    tranche === tr ? "bg-primary text-primary-foreground shadow-soft" : "text-muted-foreground hover:text-foreground")}>
                  {tr === "1" ? t("products.tranche1") : t("products.tranche2")}
                </button>
              ))}
            </div>
            <div className="mt-6 rounded-2xl bg-secondary/40 border border-border p-6">
              <div className="font-display font-bold text-lg">{tranche === "1" ? t("products.tranche1Title") : t("products.tranche2Title")}</div>
              <p className="text-sm text-muted-foreground mt-2">
                {tranche === "1" ? t("products.tranche1Text") : t("products.tranche2Text")}
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
          <h2 className="font-display text-3xl font-bold text-center">{t("products.housingTypes")}</h2>
          <p className="text-center text-muted-foreground mt-2">{t("products.housingTypesSubtitle")}</p>
          <div className="mt-12 grid grid-cols-2 md:grid-cols-5 gap-4">
            {types.map((t) => {
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
          <h2 className="font-display text-3xl md:text-4xl font-bold text-center">{t("products.immoFaq")}</h2>
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
          <div className="relative w-full max-w-lg rounded-2xl bg-card p-2 shadow-elegant animate-scale-in" onClick={(e) => e.stopPropagation()}>
            <button onClick={() => setModal(false)} aria-label="Fermer" className="absolute top-4 right-4 p-2 hover:bg-secondary rounded-lg z-10"><X className="h-5 w-5" /></button>
            <ProductRequestForm category="immobilier" />
          </div>
        </div>
      )}
    </Layout>
  );
};

export default RealEstate;
