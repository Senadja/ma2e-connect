import { Link } from "react-router-dom";
import { Wallet, Landmark, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useTranslation } from "react-i18next";

const Products = () => {
  const { t } = useTranslation();
  const products = [
    {
      icon: Wallet, title: t("home.prodSavingsTitle"), to: "/produits/epargne",
      desc: t("products.savingsDesc"),
      items: ["Épargne Expresse", "Épargne Ordinaire", "Épargne Logement", "Dépôt à terme simple", "DAT à versements progressifs"],
      gradient: "from-primary to-primary-glow",
    },
    {
      icon: Landmark, title: t("home.prodCreditTitle"), to: "/produits/credits",
      desc: t("products.creditDesc"),
      items: ["Crédit Ordinaire", "Crédit Expresse", "Crédit Scolaire", "Crédit Immobilier"],
      gradient: "from-primary-dark to-primary",
    },
  ];

  return (
    <Layout>
      <PageHero
        title={t("products.heroTitle")}
        subtitle={t("products.heroSubtitle")}
        breadcrumb={[{ label: t("nav.home"), href: "/" }, { label: t("nav.products") }]}
      />

      <section className="py-20">
        <div className="container grid gap-8 md:grid-cols-2 max-w-5xl">
          {products.map((p) => (
            <Link key={p.title} to={p.to} className="group relative rounded-3xl overflow-hidden border border-border bg-card hover:-translate-y-1 hover:shadow-elegant transition-bounce flex flex-col">
              <div className={`bg-gradient-to-br ${p.gradient} p-8 text-white relative overflow-hidden`}>
                <div className="absolute -top-12 -right-12 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
                <p.icon className="h-12 w-12 relative" />
                <h2 className="mt-6 font-display text-3xl font-bold relative">{p.title}</h2>
                <p className="mt-3 text-white/85 relative">{p.desc}</p>
              </div>
              <div className="p-8 flex-1 flex flex-col">
                <ul className="space-y-2 flex-1">
                  {p.items.map((it) => (
                    <li key={it} className="flex items-center gap-2 text-sm">
                      <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                      {it}
                    </li>
                  ))}
                </ul>
                <span className="mt-6 inline-flex items-center gap-2 font-semibold text-primary">
                  {t("products.discover")} <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </Layout>
  );
};

export default Products;
