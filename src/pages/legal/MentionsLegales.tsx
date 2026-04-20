import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";

const MentionsLegales = () => (
  <Layout>
    <PageHero
      title="Mentions légales"
      breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Mentions légales" }]}
    />
    <section className="container py-16">
      <article className="prose-legal mx-auto max-w-3xl space-y-8">
        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Éditeur du site</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le site www.ma2e.ci est édité par la <strong>Mutuelle des Agents de l'Eau et de l'Électricité (MA2E)</strong>,
            institution de microfinance agréée par le Ministère des Finances de Côte d'Ivoire.
          </p>
          <ul className="mt-3 text-muted-foreground space-y-1">
            <li><strong>Siège social :</strong> Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, Abidjan</li>
            <li><strong>Adresse postale :</strong> 18 BP 1210 Abidjan 18</li>
            <li><strong>Téléphone :</strong> (+225) 27 21 23 64 87</li>
            <li><strong>Email :</strong> contact@ma2e.ci</li>
            <li><strong>Directeur de la publication :</strong> Le Directeur Général de la MA2E</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Hébergement</h2>
          <p className="text-muted-foreground leading-relaxed">
            Ce site est hébergé sur une infrastructure cloud sécurisée localisée en Europe, conforme aux standards de
            sécurité en vigueur (chiffrement TLS, sauvegardes régulières, supervision 24/7).
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Propriété intellectuelle</h2>
          <p className="text-muted-foreground leading-relaxed">
            L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes, vidéos, code source) est
            protégé par le droit d'auteur et reste la propriété exclusive de la MA2E ou de ses partenaires. Toute
            reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite
            préalable est strictement interdite.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Liens hypertextes</h2>
          <p className="text-muted-foreground leading-relaxed">
            Le site peut contenir des liens vers des sites tiers. La MA2E n'exerce aucun contrôle sur ces sites et ne
            saurait être tenue responsable de leur contenu ou de leurs pratiques en matière de protection des données.
          </p>
        </section>

        <section>
          <h2 className="font-display text-2xl text-primary mb-3">Contact</h2>
          <p className="text-muted-foreground leading-relaxed">
            Pour toute question relative aux présentes mentions légales, vous pouvez nous écrire à{" "}
            <a href="mailto:contact@ma2e.ci" className="text-primary underline">contact@ma2e.ci</a>.
          </p>
        </section>
      </article>
    </section>
  </Layout>
);

export default MentionsLegales;
