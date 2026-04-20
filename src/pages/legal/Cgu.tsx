import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";

const Cgu = () => (
  <Layout>
    <PageHero
      title="Conditions générales d'utilisation"
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "CGU" }]}
    />
    <section className="container py-16">
      <article className="mx-auto max-w-3xl space-y-8">
        <section>
          <h2 className="font-display text-2xl text-primary mb-3">1. Objet</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes Conditions Générales d'Utilisation (CGU) régissent l'accès et l'utilisation du site
            institutionnel de la MA2E ainsi que de la plateforme E-MA2E réservée aux adhérents.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">2. Acceptation des conditions</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'accès au site implique l'acceptation pleine et entière des présentes CGU. La MA2E se réserve le droit de
            modifier les CGU à tout moment ; il appartient à l'utilisateur de les consulter régulièrement.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">3. Accès au service</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le site institutionnel est accessible librement à toute personne disposant d'un accès à Internet.
            L'accès à la plateforme E-MA2E est réservé aux adhérents, après authentification, et soumis à un
            abonnement de 500 FCFA par mois.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">4. Obligations de l'utilisateur</h2>
          <p className="text-muted-foreground leading-relaxed">L'utilisateur s'engage à :</p>
          <ul className="mt-3 list-disc pl-6 text-muted-foreground space-y-1">
            <li>fournir des informations exactes et à jour ;</li>
            <li>préserver la confidentialité de ses identifiants ;</li>
            <li>ne pas porter atteinte au bon fonctionnement du site ;</li>
            <li>respecter les droits des tiers et la législation en vigueur.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">5. Responsabilité</h2>
          <p className="text-muted-foreground leading-relaxed">
            La MA2E met tout en œuvre pour assurer la disponibilité et la fiabilité du site, sans toutefois pouvoir
            garantir une accessibilité permanente. Sa responsabilité ne saurait être engagée en cas d'interruption,
            de bug ou d'utilisation détournée du service.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">6. Droit applicable</h2>
          <p className="text-muted-foreground leading-relaxed">
            Les présentes CGU sont soumises au droit ivoirien. Tout litige relatif à leur interprétation ou exécution
            relève de la compétence exclusive des tribunaux d'Abidjan.
          </p>
        </section>
      </article>
    </section>
  </Layout>
);

export default Cgu;
