import { Mail, Shield } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";

const PolitiqueDcp = () => (
  <Layout>
    <PageHero
      title="Politique de protection des données"
      subtitle="Engagement MA2E pour la protection de vos données personnelles."
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Politique DCP" }]}
    />
    <section className="container py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <div className="rounded-2xl border bg-primary/5 p-6 flex gap-4">
          <Shield className="h-6 w-6 shrink-0 text-primary" />
          <p className="text-sm text-muted-foreground leading-relaxed">
            La MA2E s'engage à respecter la confidentialité, l'intégrité et la sécurité des données personnelles de ses
            adhérents et visiteurs, conformément à la loi n° 2013-450 relative à la protection des données à caractère
            personnel en Côte d'Ivoire.
          </p>
        </div>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Données collectées</h2>
          <ul className="list-disc pl-6 text-muted-foreground space-y-1">
            <li>Données d'identification : nom, prénom, date de naissance, numéro d'adhérent ;</li>
            <li>Coordonnées : adresse postale, email, téléphone ;</li>
            <li>Données financières strictement nécessaires aux opérations ;</li>
            <li>Données de connexion (logs techniques anonymisés).</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Finalités</h2>
          <p className="text-muted-foreground leading-relaxed">Vos données sont traitées pour :</p>
          <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-1">
            <li>la gestion de votre adhésion et de vos opérations ;</li>
            <li>l'envoi d'informations institutionnelles ;</li>
            <li>le respect de nos obligations légales et réglementaires ;</li>
            <li>l'amélioration de nos services et de la sécurité du site.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Conservation</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les données sont conservées pour la durée nécessaire aux finalités mentionnées, et au plus 10 ans après la
            fin de la relation d'adhésion, conformément aux obligations légales.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Vos droits</h2>
          <p className="text-muted-foreground leading-relaxed">
            Vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition, de limitation et de
            portabilité de vos données. Pour exercer ces droits, contactez notre Délégué à la Protection des Données :
          </p>
          <a
            href="mailto:privacyMA2E@ma2e.ci"
            className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary px-5 py-3 text-primary-foreground font-medium shadow-sm hover:bg-primary/90 transition-smooth"
          >
            <Mail className="h-4 w-4" />
            privacyMA2E@ma2e.ci
          </a>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Cookies</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le site utilise des cookies essentiels au fonctionnement et, sous réserve de votre consentement, des
            cookies de mesure d'audience. Vous pouvez gérer vos préférences à tout moment depuis le bandeau dédié.
          </p>
        </section>
      </article>
    </section>
  </Layout>
);

export default PolitiqueDcp;
