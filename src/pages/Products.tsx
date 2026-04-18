import { Link } from "react-router-dom";
import { Wallet, Landmark, Home, ArrowRight } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";

const Products = () => {
  const products = [
    {
      icon: Wallet, title: "Épargne rémunérée", to: "/produits/epargne",
      desc: "Cinq formules d'épargne pour faire fructifier votre capital à votre rythme.",
      items: ["Épargne Expresse", "Épargne Ordinaire", "Épargne Logement", "Dépôt à terme simple", "DAT à versements progressifs"],
      gradient: "from-primary to-primary-glow",
    },
    {
      icon: Landmark, title: "Formules de crédit", to: "/produits/credits",
      desc: "Quatre formules pour financer chaque type de projet, à taux préférentiel.",
      items: ["Crédit Ordinaire", "Crédit Expresse", "Crédit Immobilier", "Crédit Immobilier Différé"],
      gradient: "from-primary-dark to-primary",
    },
    {
      icon: Home, title: "Projet immobilier", to: "/produits/immobilier",
      desc: "Devenez propriétaire grâce à notre programme de logements clés en main.",
      items: ["Duplex 4 & 5 pièces", "Villas 3, 4 & 5 pièces", "Tranches successives", "Accompagnement complet"],
      gradient: "from-accent to-accent-glow",
    },
  ];

  return (
    <Layout>
      <PageHero
        title="Nos produits & services"
        subtitle="Des solutions financières pensées pour les agents, par les agents."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Produits" }]}
      />

      <section className="py-20">
        <div className="container grid md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                  Découvrir <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
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
