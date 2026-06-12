import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { useTranslation } from "react-i18next";

const MentionsLegales = () => {
  const { i18n } = useTranslation();
  const en = i18n.language?.startsWith("en");

  return (
    <Layout>
      <PageHero title={en ? "Legal notice" : "Mentions légales"} />
      <section className="container py-16">
        <article className="prose-legal mx-auto max-w-3xl space-y-8">
          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Site publisher" : "Éditeur du site"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en ? (
                <>The website www.ma2e.ci is published by the <strong>Mutual Society for Water and Electricity Employees (MA2E)</strong>, a microfinance institution approved by the Ministry of Finance of Côte d'Ivoire.</>
              ) : (
                <>Le site www.ma2e.ci est édité par la <strong>Mutuelle des Agents de l'Eau et de l'Électricité (MA2E)</strong>, institution de microfinance agréée par le Ministère des Finances de Côte d'Ivoire.</>
              )}
            </p>
            <ul className="mt-3 text-muted-foreground space-y-1">
              <li><strong>{en ? "Head office:" : "Siège social :"}</strong> Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, Abidjan</li>
              <li><strong>{en ? "Postal address:" : "Adresse postale :"}</strong> 18 BP 1210 Abidjan 18</li>
              <li><strong>{en ? "Phone:" : "Téléphone :"}</strong> (+225) 27 21 23 64 87</li>
              <li><strong>Email :</strong> contact@ma2e.ci</li>
              <li><strong>{en ? "Publication director:" : "Directeur de la publication :"}</strong> {en ? "The General Manager of MA2E" : "Le Directeur Général de la MA2E"}</li>
            </ul>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Hosting" : "Hébergement"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "This site is hosted on a secure cloud infrastructure located in Europe, compliant with current security standards (TLS encryption, regular backups, 24/7 monitoring)."
                : "Ce site est hébergé sur une infrastructure cloud sécurisée localisée en Europe, conforme aux standards de sécurité en vigueur (chiffrement TLS, sauvegardes régulières, supervision 24/7)."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Intellectual property" : "Propriété intellectuelle"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "All content on this site (text, images, logos, graphics, videos, source code) is protected by copyright and remains the exclusive property of MA2E or its partners. Any reproduction, representation, modification or exploitation, in whole or in part, without prior written authorisation is strictly prohibited."
                : "L'ensemble des contenus présents sur ce site (textes, images, logos, graphismes, vidéos, code source) est protégé par le droit d'auteur et reste la propriété exclusive de la MA2E ou de ses partenaires. Toute reproduction, représentation, modification ou exploitation, totale ou partielle, sans autorisation écrite préalable est strictement interdite."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">{en ? "Hyperlinks" : "Liens hypertextes"}</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en
                ? "The site may contain links to third-party sites. MA2E exercises no control over these sites and cannot be held responsible for their content or their data protection practices."
                : "Le site peut contenir des liens vers des sites tiers. La MA2E n'exerce aucun contrôle sur ces sites et ne saurait être tenue responsable de leur contenu ou de leurs pratiques en matière de protection des données."}
            </p>
          </section>

          <section>
            <h2 className="font-display text-2xl text-primary mb-3">Contact</h2>
            <p className="text-muted-foreground leading-relaxed">
              {en ? "For any question regarding this legal notice, you can write to us at " : "Pour toute question relative aux présentes mentions légales, vous pouvez nous écrire à "}
              <a href="mailto:contact@ma2e.ci" className="text-primary underline">contact@ma2e.ci</a>.
            </p>
          </section>
        </article>
      </section>
    </Layout>
  );
};

export default MentionsLegales;
