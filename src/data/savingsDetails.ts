// Contenu officiel des fiches produits d'épargne (source : documents MA2E, juin 2026).
// Affiché sur la page détail /produits/epargne/:slug. La clé correspond à l'id du produit.
// NB : contenu réglementaire stable ; non éditable via le CMS (choix assumé).

export interface SavingsDetailSection {
  heading: string;
  items: string[];
}

export interface SavingsRateTable {
  columns: string[];
  rows: string[][];
}

export interface SavingsDetail {
  intro: string;
  sections: SavingsDetailSection[];
  rateTable?: SavingsRateTable;
  note?: string;
}

export const SAVINGS_DETAILS: Record<string, SavingsDetail> = {
  "expresse": {
    "intro": "L’épargne expresse est constituée dans un compte d’épargne ouvert dans les livres de la MA2E par toutes les personnes qui adhèrent à la MA2E. Ce compte d’épargne rend son titulaire accessible à tous les produits de crédit de l’institution. L’épargne expresse peut être constituée en une seule fois. Dans ce cas, un compte d’épargne est directement ouvert. Elle peut être constituée mensuellement. Dans ce cas, il est ouvert un plan d’épargne. Le compte d’épargne expresse est clôturé lorsque le titulaire sort du groupe des employeurs.",
    "sections": [
      {
        "heading": "Conditions d’ouverture",
        "items": [
          "Prélèvement mensuel de 10 000 F CFA minimum pour les Cadres de direction, de 5 000 F CFA pour les cadres, de 3 000 F CFA pour les agents de Maîtrise supérieure et 1 500 FCFA pour les agents de Maîtrise 1 et 2, Employés et Ouvriers (EOC) ;",
          "Pas de frais d’ouverture ni de frais de clôture de compte ;"
        ]
      },
      {
        "heading": "Fonctionnement",
        "items": [
          "Le compte d’épargne expresse détenu par le membre à la MA2E",
          "Il est unique pour tout adhérent ;",
          "Reçoit des versements espèces et les virements ;",
          "La périodicité d’alimentation du compte par les sociétaires est mensuelle selon les montants définis par catégorie d’agent. Les retenues se font à la source et reversées à la MA2E. Cependant, les versements peuvent se faire à tout moment en espèce selon la volonté du membre ;",
          "Pas de frais de gestion mensuels sur le compte ;",
          "Ce compte est rémunéré au taux annuel de 3,5%."
        ]
      },
      {
        "heading": "Condition de fermeture",
        "items": [
          "La décision de clôture peut émaner soit de l‘Institution pour licenciement, démission ou décès du sociétaire, soit du sociétaire qui rompt son adhésion. Une demande doit être écrite par le sociétaire qui demande la clôture de son compte ;",
          "Pas de frais de clôture du compte."
        ]
      }
    ]
  },
  "ordinaire": {
    "intro": "Le compte d’épargne ordinaire est ouvert à tout moment à la demande du sociétaire, en vue de constituer une épargne libre.",
    "sections": [
      {
        "heading": "Conditions d’ouverture",
        "items": [
          "Disposer au préalable d’un compte d’épargne expresse ;",
          "Souscrire à un montant minimum de 5 000 F à verser mensuellement ;"
        ]
      },
      {
        "heading": "Fonctionnement",
        "items": [
          "Le compte d’épargne ordinaire détenu par le sociétaire à la MA2E est utilisé pour les transactions suivantes, à savoir ;",
          "Les versements et les retraits du membre ;",
          "Les virements internes vers d’autres comptes d’épargne.",
          "Le montant minimum du versement sur le compte est de 5 000 F CFA ;",
          "La périodicité d’alimentation du compte peut être mensuelle ou ponctuelle ;",
          "Les versements peuvent se faire à tout moment à partir des retenus à la source ou en espèces selon la volonté du membre ;",
          "Les retraits peuvent se faire à tout moment à condition de maintenir au minimum 3 500 F dans le compte ;",
          "Pas de frais de gestion sur ce compte;",
          "Ce compte est rémunéré au taux annuel de 3,5% ;",
          "La date de valeur est le 16 du mois pour les versements en date du 01 au 15 du mois ; la date de valeur est le 1er du mois pour les versements du 16 au 30/31 du mois.",
          "La date de valeur est le 1er du mois pour le retraits du 01 au 15 ; la date de valeur est le 16 pour les retraits du 16 au 30/31",
          "Le calcul des intérêts se fait à la clôture de l’exercice comptable.",
          "Ce compte donne droit au crédit ordinaire et peut servir de garantie au crédit ordinaire."
        ]
      },
      {
        "heading": "Condition de fermeture",
        "items": [
          "La décision de clôture peut émaner soit de l‘Institution pour licenciement, démission et décès du sociétaire, soit du sociétaire pour désadhésion. Une demande doit être écrite par le sociétaire qui demande la clôture de son compte.",
          "Pas de frais de clôture du compte ;"
        ]
      }
    ]
  },
  "logement": {
    "intro": "L’épargne logement est constituée dans un compte d’épargne logement ouvert dans les livres de la MA2E en vue d’acquérir un logement.",
    "sections": [
      {
        "heading": "Conditions d’ouverture",
        "items": [
          "Disposer au préalable d’un compte d’épargne expresse et ordinaire;",
          "Accepter d’effectuer un versement périodique, mensuel ou ponctuel."
        ]
      },
      {
        "heading": "Fonctionnement",
        "items": [
          "Les versements sur le compte peuvent se faire mensuellement ou de façon ponctuelle à partir d’une retenue à la source ou en espèces ;",
          "Les opérations de retrait ne sont pas autorisées sur ce compte ;",
          "Pas de frais de gestion ;",
          "Ce compte n’est rémunéré ;"
        ]
      },
      {
        "heading": "Condition de fermeture",
        "items": [
          "La décision de clôture intervient à la livraison du logement après règlement complet de son coût de revient.",
          "Il n’y a pas de frais de clôture de compte."
        ]
      }
    ]
  },
  "dat": {
    "intro": "Le compte de dépôt à terme est un compte d’épargne qui peut être ouvert dans les livres de la MA2E pour tous sociétaires qui désirent faire des placements sur une période déterminée auprès de la MA2E.",
    "sections": [
      {
        "heading": "Conditions d’ouverture",
        "items": [
          "Disposer au préalable d’un compte épargne expresse;",
          "Disposer d’un montant minimum de 100 000 F CFA de dépôt à la souscription ;",
          "Renseigner et faire signer le formulaire du contrat de dépôt à terme simple par le membre."
        ]
      },
      {
        "heading": "Fonctionnement",
        "items": [
          "Le compte de dépôt à terme simple est ouvert avec un montant qui fait l’objet du contrat à la souscription ;",
          "La constitution du montant du dépôt à terme simple peut se faire à partir d’une retenue à la source, en espèces ou par chèque. Dans ce cas, la date de valeur du DAT sera celle de la disponibilité du montant encaissé.",
          "Aucun versement ni retrait n’est permis sur ce compte jusqu’au terme prévu au contrat ;",
          "La résiliation du contrat avant terme, donne droit à une retenue de 2% du dépôt constitué sauf en cas de décès, d’invalidité permanente ou de départ involontaire du membre ;",
          "Le montant minimum du compte est de 100 000 F CFA ;",
          "Ce compte ne fait pas l’objet de prélèvement mensuel de frais de tenue de compte;",
          "Ce compte est rémunéré selon le barème suivant :",
          "Le calcul des intérêts se fait au terme du contrat ;",
          "Les intérêts ne sont pas capitalisés en cas de renouvellement, sauf stipulation d’un nouveau contrat, et sont reversés à l’échéance en même temps que le capital souscrit sur le compte d’épargne ordinaire ;",
          "La durée minimum de souscription à ce compte est de six (6) mois ;"
        ]
      },
      {
        "heading": "Condition de fermeture",
        "items": [
          "La décision de clôture intervient à la date d’échéance prévue dans le contrat où à la demande du membre. Dans ce dernier cas, le membre subie une retenue de 2% du dépôt constitué sauf en cas de décès, d’invalidité permanente ou de départ involontaire ;",
          "Les frais de clôture ne sont pas dus sur ce compte."
        ]
      }
    ],
    "rateTable": {
      "columns": [
        "Durée du DAT",
        "Montant du DATS",
        "Taux d'intérêt brut annuel"
      ],
      "rows": [
        [
          "Comprise entre six mois et un an",
          "Inférieur ou égal à 500 000 FCFA",
          "3,5%"
        ],
        [
          "Comprise entre six mois et un an",
          "Supérieur à 500 000 FCFA",
          "3,65%"
        ],
        [
          "Comprise entre un et deux ans",
          "Inférieur ou égal à 500 000 FCFA",
          "3,65%"
        ],
        [
          "Comprise entre un et deux ans",
          "Supérieur à 500 000 FCFA",
          "3,80%"
        ],
        [
          "Supérieure à deux ans",
          "Inférieur ou égal à 500 000 FCFA",
          "3,80%"
        ],
        [
          "Supérieure à deux ans",
          "Supérieur à 500 000 FCFA",
          "4,00%"
        ]
      ]
    },
    "note": "Le taux de rémunération des DAT est conditionné par le taux communiqué semestriellement par la BCEAO"
  },
  "datv": {
    "intro": "Le compte de dépôt à terme à versements progressifs, est un compte qui est destiné aux sociétaires qui envisage de faire un placement à partir de versements périodiques, d’investir dans une activité ou réaliser un projet spécifique à partir de leurs épargnes.",
    "sections": [
      {
        "heading": "Conditions d’ouverture",
        "items": [
          "Disposer au préalable d’un compte d’épargne expresse ou ordinaire;",
          "Disposer d’un montant minimum de 10 000 F CFA à la souscription;",
          "Accepter d’effectuer des versements réguliers sur une période donnée ;",
          "Renseigner et faire signer le formulaire du contrat de dépôt à terme à versements progressifs;"
        ]
      },
      {
        "heading": "Fonctionnement",
        "items": [
          "Le compte de dépôt à terme à versements progressifs est alimenté mensuellement selon les modalités fixées à la souscription et n’admet pas de retrait jusqu’à la fin du contrat;",
          "Le montant minimum à verser régulièrement selon les modalités fixées à la souscription est de 5 000 F CFA ;",
          "Le montant minimum à atteindre au terme du contrat est de 120 000 F CFA ;",
          "En cas de retrait du montant total avant terme, il est appliqué une retenue de 2% du dépôt constitué avant 2 ans et 1% après 2 ans.",
          "Pas de retenue pour un retrait, en cas de décès, d’invalidité permanente ou de départ involontaire d’un membre ;",
          "Ce compte est rémunéré selon les conditions suivantes :",
          "Pour une durée inférieure ou égale à deux (02) ans, et pour un montant inférieur ou égal à 500 000 F, il est appliqué un taux de 3,5% l’an ;",
          "Pour une durée inférieure ou égale à deux (02) ans, et pour un montant supérieur à 500 000 F, il est appliqué un taux de 3,6% l’an ;",
          "Pour une durée de plus de deux (02) ans à quatre (04) ans, et pour un montant inférieur ou égal à 1 000 000 F, il est appliqué un taux de 3,70% l’an ;",
          "Pour une durée de plus de deux (02) ans à quatre (04) ans, et pour un montant supérieur à 1 000 000 F, il est appliqué un taux de 3,80% l’an ;",
          "Pour une durée de plus de quatre (04) ans à cinq (05) ans et pour un montant inférieur ou égal à 2 000 000 F, il est appliqué un taux de 3,90% l’an;",
          "Pour une durée de plus de quatre (04) ans à cinq (05) ans et pour un montant supérieur à 2 000 000 F, il est appliqué un taux de 4,00% l’an ;",
          "Les intérêts sont calculés au terme souscrit dans le contrat (date d’échéance du DATAVP)",
          "Les intérêts et le capital souscrit sont reversés à l’échéance sur le compte d’épargne ordinaire ;",
          "La durée minimum de souscription à ce compte est de deux (02) ans et maximum 5 ans  ;"
        ]
      },
      {
        "heading": "Condition de fermeture",
        "items": [
          "La décision de clôture intervient à la date d’échéance prévue dans le contrat ou à la demande du sociétaire ;",
          "Il n’y a pas de frais à la clôture du compte."
        ]
      }
    ]
  }
};

// Résout la fiche détaillée d'un produit épargne en tolérant le préfixe « epargne- ».
// Le slug d'un produit est dérivé de son nom (« Épargne Ordinaire » → « epargne-ordinaire »),
// alors que les fiches sont indexées par le slug court (« ordinaire ») ; on tente donc
// le slug tel quel PUIS sa version sans préfixe. `overrides` = éventuelles fiches du CMS.
export function resolveSavingsDetail(
  slug: string | undefined,
  overrides?: Record<string, SavingsDetail>,
): SavingsDetail | undefined {
  if (!slug) return undefined;
  const all = { ...SAVINGS_DETAILS, ...(overrides ?? {}) };
  return all[slug] ?? all[slug.replace(/^epargne-/, "")];
}
