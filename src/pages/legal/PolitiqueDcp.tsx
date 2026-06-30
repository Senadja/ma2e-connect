import { Mail, Shield } from "lucide-react";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useTranslation } from "react-i18next";

const PolitiqueDcp = () => {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith("en");

  return (
    <Layout>
      <PageHero
        title={en ? "Data protection policy" : "Politique de protection des données"}
        subtitle={en ? "MA2E's commitment to protecting your personal data." : "Engagement MA2E pour la protection de vos données personnelles."}
      />
      <section className="container py-16">
        <article className="mx-auto max-w-3xl space-y-8">
          <div className="rounded-2xl border bg-primary/5 p-6 flex gap-4">
            <Shield className="h-6 w-6 shrink-0 text-primary" />
            <p className="text-sm text-muted-foreground leading-relaxed">
              {en
                ? "MA2E is committed to respecting the confidentiality, integrity and security of the personal data of its members and visitors, in accordance with Law no. 2013-450 on the protection of personal data in Côte d'Ivoire."
                : "La MA2E s'engage à respecter la confidentialité, l'intégrité et la sécurité des données personnelles de ses sociétaires et visiteurs, conformément à la loi n° 2013-450 relative à la protection des données à caractère personnel en Côte d'Ivoire."}
            </p>
          </div>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Data collected" : "Données collectées"}</h2>
            <ul className="list-disc pl-6 text-muted-foreground space-y-1">
              {en ? (
                <>
                  <li>Identification data: surname, first name, date of birth, member number;</li>
                  <li>Contact details: postal address, email, phone;</li>
                  <li>Financial data strictly necessary for operations;</li>
                  <li>Connection data (anonymised technical logs).</li>
                </>
              ) : (
                <>
                  <li>Données d'identification : nom, prénom, date de naissance, numéro de sociétaire ;</li>
                  <li>Coordonnées : adresse postale, email, téléphone ;</li>
                  <li>Données financières strictement nécessaires aux opérations ;</li>
                  <li>Données de connexion (logs techniques anonymisés).</li>
                </>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Purposes" : "Finalités"}</h2>
            <p className="text-muted-foreground leading-relaxed">{en ? "Your data is processed for:" : "Vos données sont traitées pour :"}</p>
            <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-1">
              {en ? (
                <>
                  <li>managing your membership and operations;</li>
                  <li>sending institutional information;</li>
                  <li>complying with our legal and regulatory obligations;</li>
                  <li>improving our services and site security.</li>
                </>
              ) : (
                <>
                  <li>la gestion de votre adhésion et de vos opérations ;</li>
                  <li>l'envoi d'informations institutionnelles ;</li>
                  <li>le respect de nos obligations légales et réglementaires ;</li>
                  <li>l'amélioration de nos services et de la sécurité du site.</li>
                </>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Retention" : "Conservation"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "Data is kept for the time necessary for the stated purposes, and at most 10 years after the end of the membership relationship, in accordance with legal obligations."
                : "Les données sont conservées pour la durée nécessaire aux finalités mentionnées, et au plus 10 ans après la fin de la relation d'adhésion, conformément aux obligations légales."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Your rights" : "Vos droits"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "You have the right to access, rectify, delete, object to, restrict and port your data. To exercise these rights, contact our Data Protection Officer:"
                : "Vous disposez d'un droit d'accès, de rectification, de suppression, d'opposition, de limitation et de portabilité de vos données. Pour exercer ces droits, contactez notre Délégué à la Protection des Données :"}
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
              {en
                ? "The site uses cookies essential to its operation and, subject to your consent, audience-measurement cookies. You can manage your preferences at any time from the dedicated banner."
                : "Le site utilise des cookies essentiels au fonctionnement et, sous réserve de votre consentement, des cookies de mesure d'audience. Vous pouvez gérer vos préférences à tout moment depuis le bandeau dédié."}
            </p>
          </section>
        </article>
      </section>
    </Layout>
  );
};

export default PolitiqueDcp;
