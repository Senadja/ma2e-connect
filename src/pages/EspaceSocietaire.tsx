import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Smartphone, Lock, Rocket, ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

const EspaceSocietaire = () => {
  return (
    <Layout>
      <SEO title="Espace E-MA2E" description="L'espace sociétaire sécurisé de la MA2E est en cours de déploiement." />
      <div className="container min-h-[70vh] flex flex-col items-center justify-center py-20 text-center">
        <div className="relative mb-8">
          <div className="h-24 w-24 rounded-3xl bg-primary/10 flex items-center justify-center text-primary animate-pulse">
            <Smartphone className="h-12 w-12" />
          </div>
          <div className="absolute -top-2 -right-2 h-8 w-8 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-lg">
            <Lock className="h-4 w-4" />
          </div>
        </div>
        
        <h1 className="font-display text-4xl md:text-5xl font-bold text-primary-dark">Espace E-MA2E</h1>
        <p className="mt-4 text-xl font-medium text-accent italic">Bientôt disponible</p>
        
        <div className="mt-8 max-w-lg p-8 rounded-3xl border border-border bg-card shadow-sm">
          <Rocket className="mx-auto h-8 w-8 text-primary mb-4" />
          <p className="text-muted-foreground leading-relaxed">
            Nous finalisons actuellement votre nouvel espace sécurisé. <br />
            <strong>Très prochainement</strong>, vous pourrez consulter vos soldes, effectuer des demandes de crédit en ligne et suivre vos projets immobiliers en temps réel.
          </p>
        </div>

        <div className="mt-12 flex flex-col sm:flex-row gap-4">
          <Button asChild variant="outline" className="rounded-full px-8 h-12">
            <Link to="/"><ArrowLeft className="mr-2 h-4 w-4" /> Retour à l'accueil</Link>
          </Button>
          <Button asChild className="rounded-full px-8 h-12 bg-primary text-white hover:bg-primary/90">
            <Link to="/contact">Être informé de l'ouverture</Link>
          </Button>
        </div>
      </div>
    </Layout>
  );
};

export default EspaceSocietaire;
