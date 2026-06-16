import { Building2, Handshake } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { usePartners } from "@/lib/content";
import { useTranslation } from "react-i18next";

// Logos fournis directement dans le projet (affichés tant qu'aucun logo n'est défini via le CMS).
const LOGO_MAP: Record<string, string> = {
  "BCEAO": "/images/partners/bceao.svg",
  "Ministère des Finances": "/images/partners/minfin.png",
  "APSFD-CI": "/images/partners/apsfd.png",
  "CIE": "/images/partners/cie.webp",
  "SODECI": "/images/partners/sodeci.png",
  "CNPS": "/images/partners/cnps.jpeg",
};

const Partners = () => {
  const { t } = useTranslation();
  const { data: PARTNERS = [] } = usePartners();
  const grouped = PARTNERS.reduce<Record<string, typeof PARTNERS>>((acc, p) => {
    (acc[p.type] ||= []).push(p);
    return acc;
  }, {});

  return (
    <Layout>
      <PageHero
        title={t("partnersPage.heroTitle")}
        subtitle={t("partnersPage.heroSubtitle")}
      />

      <section className="container py-16 space-y-16">
        {Object.entries(grouped).map(([type, items]) => (
          <div key={type}>
            <div className="flex items-center gap-3 mb-8">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
                <Handshake className="h-5 w-5" />
              </div>
              <h2 className="font-display text-2xl md:text-3xl">{type}</h2>
            </div>
            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {items.map((p) => {
                const logo = (p as any).logo || LOGO_MAP[p.name];
                return (
                <article
                  key={p.name}
                  className="rounded-2xl border bg-card p-6 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-lg hover:border-accent/40"
                >
                  <div className="flex h-40 items-center justify-center rounded-xl bg-gradient-to-br from-primary/5 to-accent/5 mb-5 overflow-hidden p-4">
                    {logo ? (
                      <img src={logo} alt={p.name} className="h-full w-full object-contain" />
                    ) : (
                      <div className="flex items-center gap-2 text-primary">
                        <Building2 className="h-6 w-6" />
                        <span className="font-display text-xl font-semibold">{p.name}</span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">{p.desc}</p>
                </article>
                );
              })}
            </div>
          </div>
        ))}
      </section>
    </Layout>
  );
};

export default Partners;
