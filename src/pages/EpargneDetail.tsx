import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { ProductRequestForm } from "@/components/forms/ProductRequestForm";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useProducts } from "@/lib/content";
import { Check, Download, ArrowLeft, CheckCircle2 } from "lucide-react";
import { Link, useParams, useLocation, Navigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

// Page dédiée à un produit d'épargne (fiche détaillée) — ex. Épargne Expresse.
// Reprend l'ensemble des caractéristiques + formulaire de souscription.
const EpargneDetail = () => {
  const { t } = useTranslation();
  const { slug } = useParams<{ slug: string }>();
  const location = useLocation();
  const fromAdhesion = (location.state as { fromAdhesion?: boolean } | null)?.fromAdhesion;
  const { data: SAVINGS = [] } = useProducts("epargne");
  const product = SAVINGS.find((s) => s.id === slug) as any;

  // Slug inconnu (une fois les données chargées) → retour à la liste des épargnes.
  if (SAVINGS.length > 0 && !product) return <Navigate to="/produits/epargne" replace />;
  if (!product) return null;

  return (
    <Layout>
      <SEO title={`Épargne — ${product.name}`} description={product.desc} />
      <PageHero
        title={product.name}
        subtitle={t("products.savingsHeroSubtitle")}
        breadcrumb={[
          { label: t("nav.home"), href: "/" },
          { label: t("nav.products"), href: "/produits" },
          { label: t("nav.savings"), href: "/produits/epargne" },
          { label: product.name },
        ]}
      />

      <section className="py-12 md:py-16">
        <div className="container">
          <Link to="/produits/epargne" className="inline-flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-4 w-4" /> Retour aux formules d'épargne
          </Link>

          {fromAdhesion && (
            <div className="mt-6 flex items-start gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-5">
              <CheckCircle2 className="h-6 w-6 text-primary shrink-0" />
              <div>
                <p className="font-bold text-foreground">Adhésion enregistrée ✓</p>
                <p className="text-sm text-muted-foreground">Prochaine étape : ouvrez votre <strong>Épargne Expresse</strong>, obligatoire à l'adhésion. Renseignez le formulaire ci-dessous.</p>
              </div>
            </div>
          )}

          <div className="mt-8 grid lg:grid-cols-3 gap-10">
            <div className="lg:col-span-2">
              <h2 className="font-display text-3xl md:text-4xl font-bold">{product.name}</h2>
              <p className="mt-4 text-lg text-muted-foreground leading-relaxed whitespace-pre-line">{product.desc}</p>

              {product.image && (
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="w-full mt-8 rounded-2xl overflow-hidden border border-border/40 shadow-lg text-left cursor-zoom-in group focus:outline-none focus:ring-2 focus:ring-primary">
                      <img src={product.image} alt={`Fiche produit ${product.name}`} className="w-full h-auto object-cover group-hover:scale-[1.02] transition-transform duration-500" />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-4xl p-0 bg-transparent border-none shadow-none">
                    <img src={product.image} alt={`Fiche produit ${product.name} agrandie`} className="w-full h-auto max-h-[90vh] object-contain rounded-lg mx-auto" />
                  </DialogContent>
                </Dialog>
              )}

              {product.features?.length > 0 && (
                <>
                  <h3 className="mt-10 font-display text-xl font-bold">{t("products.features")}</h3>
                  <ul className="mt-4 grid sm:grid-cols-2 gap-3">
                    {product.features.map((f: string) => (
                      <li key={f} className="flex items-start gap-3 rounded-xl bg-card border border-border p-4">
                        <span className="mt-0.5 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shrink-0">
                          <Check className="h-3.5 w-3.5" />
                        </span>
                        <span className="font-medium">{f}</span>
                      </li>
                    ))}
                  </ul>
                </>
              )}

              {product.form && (
                <a href={product.form} download className="mt-8 inline-flex items-center gap-2 font-bold text-primary hover:underline">
                  <Download className="h-5 w-5" /> {t("products.savingsGuide")}
                </a>
              )}
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-28">
                <ProductRequestForm category="épargne" defaultProduct={product.id} />
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default EpargneDetail;
