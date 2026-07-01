import { useState } from "react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { ProductRequestForm } from "@/components/forms/ProductRequestForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useProducts } from "@/lib/content";
import { Check, Download, Mail, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

const Savings = () => {
  const { t } = useTranslation();
  const { data: SAVINGS = [] } = useProducts("epargne");
  const [active, setActive] = useState<string>("");
  const current = (SAVINGS.find((s) => s.id === active) ?? SAVINGS[0]) as any;

  if (!current) return null;

  return (
    <Layout>
      <SEO title={`Épargne ${current.name}`} description={current.desc} />
      <PageHero
        title={t("home.prodSavingsTitle")}
        subtitle={t("products.savingsHeroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.products"), href: "/produits" }, { label: t("nav.savings") }]}
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
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{current.desc}</p>

              {current.id === "expresse" && (
                <Link
                  to={`/produits/epargne/${current.id}`}
                  className="mt-6 inline-flex items-center gap-2 rounded-full bg-primary px-6 py-2.5 text-sm font-bold text-white shadow-sm hover:brightness-110 transition-smooth"
                >
                  Voir la fiche détaillée <ArrowRight className="h-4 w-4" />
                </Link>
              )}

              {(current as any).image && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full mt-8 rounded-2xl overflow-hidden border border-border/40 shadow-lg text-left cursor-zoom-in group focus:outline-none focus:ring-2 focus:ring-primary">
                      <img src={(current as any).image} alt={`Fiche produit ${current.name}`} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                    <img src={(current as any).image} alt={`Fiche produit ${current.name} agrandie`} className="w-full h-auto max-h-[90vh] object-contain rounded-lg mx-auto" />
                  </DialogContent>
                </Dialog>
              )}

              <h3 className="mt-10 font-display text-xl font-bold">{t("products.features")}</h3>
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

              <div className="mt-12 p-8 rounded-2xl bg-secondary/40 border border-border">
                <h3 className="font-display text-2xl font-bold mb-4">{t("products.needHelp")}</h3>
                <p className="text-muted-foreground mb-6">{t("products.needHelpText")}</p>
                <div className="flex flex-wrap gap-4">
                  <a href="/contact" className="inline-flex items-center gap-2 font-bold text-primary hover:underline">
                    <Mail className="h-5 w-5" /> {t("products.contactAdvisor")}
                  </a>
                  {(current as any).form && (
                    <a href={(current as any).form} download className="inline-flex items-center gap-2 font-bold text-muted-foreground hover:text-foreground">
                      <Download className="h-5 w-5" /> {t("products.savingsGuide")}
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28 space-y-6">
                <ProductRequestForm category="épargne" defaultProduct={current.id} />

                {(current as any).form && (
                  <div className="rounded-2xl bg-gradient-primary text-primary-foreground p-6 shadow-elegant">    
                    <h4 className="font-bold mb-2">{t("products.usefulDocs")}</h4>
                    <p className="text-xs text-white/70 mb-4">{t("products.usefulDocsText")}</p>
                    <a href={(current as any).form} download className="flex items-center justify-between p-3 rounded-xl bg-white/10 hover:bg-white/20 transition-colors text-sm font-bold">
                      <span>{t("products.openingForm")}</span>
                      <Download className="h-4 w-4" />
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Savings;
