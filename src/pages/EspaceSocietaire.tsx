import { Layout } from "@/components/layout/Layout";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Smartphone, Lock, Rocket, ArrowLeft, CheckCircle2, ShieldCheck, Zap } from "lucide-react";
import { Link } from "react-router-dom";
import { useTranslation } from "react-i18next";

const EspaceSocietaire = () => {
  const { t } = useTranslation();
  const features = [
    { icon: Zap, text: t("ema2e.feature1") },
    { icon: ShieldCheck, text: t("ema2e.feature2") },
    { icon: CheckCircle2, text: t("ema2e.feature3") },
  ];

  return (
    <Layout>
      <SEO title="Espace E-MA2E" description="L'espace sociétaire sécurisé de la MA2E est en cours de déploiement. Bientôt, accédez à tous vos services en ligne." />
      <div className="container min-h-[80vh] flex flex-col items-center justify-center py-20">
        <div className="max-w-3xl w-full text-center">
          <div className="relative inline-block mb-10">
            <div className="h-28 w-28 rounded-[2rem] bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center text-primary animate-pulse shadow-inner">
              <Smartphone className="h-14 w-14" />
            </div>
            <div className="absolute -top-3 -right-3 h-10 w-10 rounded-full bg-accent flex items-center justify-center text-accent-foreground shadow-xl border-4 border-background">
              <Lock className="h-5 w-5" />
            </div>
          </div>

          <h1 className="font-display text-4xl md:text-6xl font-bold text-primary-dark tracking-tight">{t("ema2e.title")}</h1>
          <p className="mt-6 text-2xl font-display font-medium text-accent italic">{t("ema2e.tagline")}</p>
          
          <div className="mt-12 p-10 rounded-[2.5rem] border border-border bg-card shadow-elegant relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-colors" />
            <Rocket className="mx-auto h-10 w-10 text-primary mb-6 animate-bounce" />
            
            <p className="text-lg text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {t("ema2e.finalizing")}
              <span className="block mt-4 font-semibold text-foreground">{t("ema2e.prepare")}</span>
            </p>

            <div className="mt-10 grid sm:grid-cols-3 gap-6">
              {features.map((f, i) => (
                <div key={i} className="flex flex-col items-center gap-3 p-4 rounded-2xl bg-secondary/30 border border-transparent hover:border-primary/20 transition-all">
                  <f.icon className="h-6 w-6 text-primary" />
                  <span className="text-sm font-medium leading-tight">{f.text}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-center gap-6">
            <Button asChild variant="ghost" className="rounded-full px-8 h-14 text-lg hover:bg-secondary">
              <Link to="/"><ArrowLeft className="mr-2 h-5 w-5" /> {t("ema2e.backHome")}</Link>
            </Button>
            <Button asChild className="rounded-full px-10 h-14 text-lg font-bold bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <Link to="/contact">{t("ema2e.notifyMe")}</Link>
            </Button>
          </div>

          <p className="mt-12 text-sm text-muted-foreground">
            {t("ema2e.footer")}
          </p>
        </div>
      </div>
    </Layout>
  );
};

export default EspaceSocietaire;
