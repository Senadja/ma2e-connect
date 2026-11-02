import { Link } from "react-router-dom";
import { Download, Info, FileText, Coins, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useFormsPublic } from "@/components/forms/FormClosed";
import { DEFAULT_FORMS_PUBLIC } from "@/data/formsPublic";

// Guide affiché à la place du formulaire d'adhésion quand celui-ci est fermé au back-office.
//
// Le formulaire fermé ne disparaît PAS du site : la page reste un guide. Le visiteur voit ce que
// la fiche demande, télécharge la fiche officielle et dépose son dossier au siège. Aucune donnée
// personnelle n'est saisie ni transmise — c'est l'intérêt du dispositif pendant le lot 1 : la
// MA2E reste joignable pour adhérer, sans qu'aucune DCP ne transite par le site.
//
// La liste ci-dessous est la transcription de la fiche papier « DEMANDE D'ADHESION /
// SOUSCRIPTION AU CAPITAL » (public/documents/formulaires), dont le formulaire en ligne est tiré.
// Rien n'y est inventé : si la fiche change, c'est ici qu'il faut la retranscrire.

const FICHE_PDF = "/documents/formulaires/Fiche_adhesion_MA2E.pdf";

/** Champs sans lesquels le dossier ne peut pas être traité (mêmes règles que le formulaire en ligne). */
const REQUIRED = new Set(["Nom et prénoms", "Matricule", "Société", "Catégorie", "Téléphone"]);

const SECTIONS: { title: string; fields: string[] }[] = [
  {
    title: "Identité",
    fields: [
      "Nom et prénoms",
      "Nom de la mère",
      "Date et lieu de naissance",
      "Situation matrimoniale",
      "N° de CNI, avec ses dates de validité (du … au …)",
      "Adresse ou boîte postale",
      "Téléphone",
      "Téléphone domicile et bureau",
      "Adresse électronique",
    ],
  },
  {
    title: "Situation professionnelle",
    fields: [
      "Matricule",
      "Société",
      "Catégorie",
      "Fonction",
      "Direction",
      "Service",
      "Exploitation",
      "Date d'embauche",
    ],
  },
  {
    title: "Proches et ayants droit",
    fields: [
      "Nom du conjoint et son contact",
      "Personne à prévenir et son contact",
      "Ayants droit et leurs contacts",
    ],
  },
];

export const AdhesionGuide = ({
  categories,
  feeAdhesion,
  feePart,
}: {
  categories: { value: string; montant: number }[];
  feeAdhesion: number;
  feePart: number;
}) => {
  const { closedNotice } = useFormsPublic();
  const paragraphs = (closedNotice || DEFAULT_FORMS_PUBLIC.closedNotice)
    .split(/\n\s*\n/)
    .filter((p) => p.trim());
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="space-y-10">
      {/* Message éditable au back-office (Réglages › Interactions). */}
      <div className="rounded-2xl bg-secondary/40 p-6">
        <div className="flex gap-3">
          <Info className="h-5 w-5 shrink-0 text-primary" />
          <div className="space-y-2 text-sm leading-relaxed text-muted-foreground">
            {paragraphs.map((p, i) => (
              <p key={i}>{p}</p>
            ))}
            <p className="font-semibold text-foreground">
              L'adhésion se poursuit normalement sur la fiche officielle, à télécharger ci-dessous.
            </p>
          </div>
        </div>
      </div>

      {/* Téléchargement de la fiche */}
      <div className="rounded-2xl border border-primary/30 bg-primary/5 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <FileText className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <h3 className="font-display text-base font-bold">Fiche d'adhésion et de souscription au capital</h3>
              <p className="text-sm text-muted-foreground">
                Document officiel de la MA2E, à imprimer, remplir et signer. 1 page, PDF.
              </p>
            </div>
          </div>
          <Button asChild className="shrink-0 rounded-full gap-2">
            <a href={FICHE_PDF} download>
              <Download className="h-4 w-4" /> Télécharger la fiche
            </a>
          </Button>
        </div>
      </div>

      {/* Ce que la fiche demande */}
      <div>
        <h3 className="font-display text-lg font-bold">Ce que la fiche vous demandera</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Rassemblez ces informations avant de remplir la fiche. Les mentions{" "}
          <span className="font-semibold text-primary">obligatoire</span> sont celles sans lesquelles le dossier
          ne peut pas être traité.
        </p>
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {SECTIONS.map((section) => (
            <div key={section.title} className="rounded-2xl border border-border p-5">
              <h4 className="font-display text-sm font-bold uppercase tracking-wide">{section.title}</h4>
              <ul className="mt-3 space-y-2">
                {section.fields.map((field) => (
                  <li key={field} className="flex items-start gap-2 text-sm">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                    <span>
                      {field}
                      {REQUIRED.has(field) && (
                        <span className="ml-1 text-xs font-semibold text-primary">— obligatoire</span>
                      )}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Montants */}
      <div>
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <Coins className="h-5 w-5 text-primary" /> Ce que vous autorisez à prélever
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          En signant la fiche, vous donnez votre accord pour le prélèvement de ces sommes sur votre salaire.
        </p>
        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between rounded-xl border border-border px-5 py-3 text-sm">
            <span>Droit d'adhésion</span>
            <strong>{fmt(feeAdhesion)} FCFA</strong>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-border px-5 py-3 text-sm">
            <span>Libération de la part sociale</span>
            <strong>{fmt(feePart)} FCFA</strong>
          </div>
        </div>
        {categories.length > 0 && (
          <div className="mt-6 rounded-2xl bg-secondary/40 p-5">
            <h4 className="text-sm font-bold">Épargne Expresse — obligatoire à l'adhésion</h4>
            <p className="mt-1 text-sm text-muted-foreground">
              La retenue mensuelle dépend de votre catégorie professionnelle.
            </p>
            <ul className="mt-3 space-y-2">
              {categories.map((c) => (
                <li key={c.value} className="flex items-center justify-between text-sm">
                  <span>{c.value}</span>
                  <strong>{fmt(c.montant)} FCFA / mois</strong>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Dépôt du dossier */}
      <div className="rounded-2xl border border-border p-6">
        <h3 className="font-display text-lg font-bold flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" /> Déposer votre dossier
        </h3>
        <ol className="mt-4 space-y-3 text-sm">
          {[
            "Imprimez la fiche et remplissez-la à la main.",
            "Signez-la en faisant précéder votre signature de la mention « Lu et Approuvé », et datez-la.",
            "Joignez une copie de votre CNI recto et verso (ou de votre passeport) et une photo d'identité.",
            "Déposez l'ensemble au siège de la MA2E.",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <p className="mt-5 text-sm text-muted-foreground">
          Adresse, téléphone et horaires d'ouverture figurent sur la{" "}
          <Link to="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
            page Contact
          </Link>
          .
        </p>
      </div>
    </div>
  );
};
