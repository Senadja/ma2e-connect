import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useTranslation } from "react-i18next";

const Cgu = () => {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith("en");

  return (
    <Layout>
      <PageHero title={en ? "Terms of use" : "Conditions générales d'utilisation"} />
      <section className="container py-16">
        <article className="mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "1. Purpose" : "1. Objet"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "These Terms of Use (ToU) govern access to and use of MA2E's institutional website as well as the E-MA2E platform reserved for members."
                : "Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site institutionnel de la MA2E ainsi que de la plateforme E-MA2E réservée aux sociétaires."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "2. Acceptance of terms" : "2. Acceptation des conditions"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "Accessing the site implies full acceptance of these ToU. MA2E reserves the right to amend the ToU at any time; it is the user's responsibility to review them regularly."
                : "L'accès au site implique l'acceptation pleine et entière des présentes CGU. La MA2E se réserve le droit de modifier les CGU à tout moment ; il appartient à l'utilisateur de les consulter régulièrement."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "3. Access to the service" : "3. Accès au service"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "The institutional site is freely accessible to anyone with Internet access. Access to the E-MA2E platform is reserved for members, after authentication, and subject to a subscription of 500 FCFA per month."
                : "Le site institutionnel est accessible librement à toute personne disposant d'un accès à Internet. L'accès à la plateforme E-MA2E est réservé aux sociétaires, après authentification, et soumis à un abonnement de 500 FCFA par mois."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "4. User obligations" : "4. Obligations de l'utilisateur"}</h2>
            <p className="text-muted-foreground leading-relaxed">{en ? "The user undertakes to:" : "L'utilisateur s'engage à :"}</p>
            <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-1">
              {en ? (
                <>
                  <li>provide accurate and up-to-date information;</li>
                  <li>keep their credentials confidential;</li>
                  <li>not impair the proper functioning of the site;</li>
                  <li>respect the rights of third parties and applicable law.</li>
                </>
              ) : (
                <>
                  <li>fournir des informations exactes et à jour ;</li>
                  <li>préserver la confidentialité de ses identifiants ;</li>
                  <li>ne pas porter atteinte au bon fonctionnement du site ;</li>
                  <li>respecter les droits des tiers et la législation en vigueur.</li>
                </>
              )}
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "5. Liability" : "5. Responsabilité"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "MA2E makes every effort to ensure the availability and reliability of the site, without however being able to guarantee permanent accessibility. It cannot be held liable in the event of interruption, bug or misuse of the service."
                : "La MA2E met tout en œuvre pour assurer la disponibilité et la fiabilité du site, sans toutefois pouvoir garantir une accessibilité permanente. Sa responsabilité ne saurait être engagée en cas d'interruption, de bug ou d'utilisation détournée du service."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "6. Applicable law" : "6. Droit applicable"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "These ToU are governed by Ivorian law. Any dispute relating to their interpretation or performance falls within the exclusive jurisdiction of the courts of Abidjan."
                : "Les présentes CGU sont soumises au droit ivoirien. Tout litige relatif à leur interprétation ou exécution relève de la compétence exclusive des tribunaux d'Abidjan."}
            </p>
          </section>
        </article>
      </section>
    </Layout>
  );
};

export default Cgu;
