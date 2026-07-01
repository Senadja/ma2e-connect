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

// Sociétés membres — logos officiels transmis par le client.
// CR du 26/06/2026 : retrait du groupe Eranove (Eranove, Eranove Academy, Fondation Eranove), ajout de CIE, SODECI et MA2E.
const MEMBER_COMPANIES: { name: string; logo: string }[] = [
  { name: "CIE", logo: "/images/partners/cie.webp" },
  { name: "SODECI", logo: "/images/partners/sodeci.png" },
  { name: "MA2E", logo: "/logo-ma2e.png" },
  { name: "CIPREL", logo: "/images/partners/membres/ciprel.png" },
  { name: "ATINKOU", logo: "/images/partners/membres/atinkou.png" },
  { name: "Awale", logo: "/images/partners/membres/awale.png" },
  { name: "GS2E", logo: "/images/partners/membres/gs2e.png" },
  { name: "SGA2E", logo: "/images/partners/membres/sga2e.png" },
  { name: "Smart Energy", logo: "/images/partners/membres/smart-energy.png" },
  { name: "SIVE", logo: "/images/partners/membres/sive.png" },
];

const Partners = () => {
  const { t } = useTranslation();
  const { data: PARTNERS = [] } = usePartners();
  // Les « Sociétés membres » ont leur propre mur de logos (hors des groupes institutionnels).
  const grouped = PARTNERS.filter((p) => p.type !== "Société membre").reduce<Record<string, typeof PARTNERS>>((acc, p) => {
    (acc[p.type] ||= []).push(p);
    return acc;
  }, {});
  // Sociétés membres : depuis la BDD si présentes (gérables au back-office), sinon repli sur la liste intégrée.
  const dbMembers = PARTNERS.filter((p) => p.type === "Société membre");
  const memberCompanies = dbMembers.length
    ? dbMembers.map((p) => ({ name: p.name, logo: (p as any).logo || LOGO_MAP[p.name] || "", url: (p as any).url || "" }))
    : MEMBER_COMPANIES.map((c) => ({ ...c, url: "" }));

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
                const url = (p as any).url as string | undefined;
                const cardCls = "block rounded-2xl border bg-card p-6 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-lg hover:border-accent/40";
                const inner = (
                  <>
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
                    {url && <span className="mt-3 inline-block text-sm font-semibold text-primary">Visiter le site →</span>}
                  </>
                );
                return url ? (
                  <a key={p.name} href={url} target="_blank" rel="noopener noreferrer" className={cardCls}>{inner}</a>
                ) : (
                  <article key={p.name} className={cardCls}>{inner}</article>
                );
              })}
            </div>
          </div>
        ))}

        {/* Sociétés membres — mur de logos */}
        <div>
          <div className="flex items-center gap-3 mb-8">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/10 text-primary">
              <Building2 className="h-5 w-5" />
            </div>
            <h2 className="font-display text-2xl md:text-3xl">Sociétés membres</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
            {memberCompanies.map((c) => {
              const cls = "flex h-32 items-center justify-center rounded-2xl border bg-card p-6 shadow-sm transition-smooth hover:-translate-y-1 hover:shadow-lg hover:border-accent/40";
              const img = <img src={c.logo} alt={c.name} loading="lazy" className="max-h-full max-w-full object-contain" />;
              return c.url ? (
                <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" title={c.name} className={cls}>{img}</a>
              ) : (
                <div key={c.name} title={c.name} className={cls}>{img}</div>
              );
            })}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Partners;
