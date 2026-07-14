// Contenu des pages légales (Mentions légales / CGU / Protection des données).
// Source de repli ET contenu initial du CMS : le back-office édite `settings.legal`
// (onglet « Légal »). Texte repris FIDÈLEMENT du site officiel ma2e.ci
// (mentions-legales, conditions-generales, et la « Politique de protection des
// données personnelles » v. 28/09/2021). Les autres langues sont assurées par le
// widget Google Translate, comme le reste du contenu du site.
//
// Format d'un `body` : paragraphes séparés par une ligne vide. Une suite de lignes
// commençant par « - » devient une liste à puces. Les e-mails et liens http(s)
// sont transformés en liens automatiquement au rendu.

export interface LegalSection {
  heading: string;
  body: string;
}
export interface LegalPage {
  title: string;
  subtitle?: string;
  intro?: string; // encadré mis en avant en tête de page (optionnel)
  sections: LegalSection[];
}
export interface LegalContent {
  mentions: LegalPage;
  cgu: LegalPage;
  dcp: LegalPage;
}

export const DEFAULT_LEGAL: LegalContent = {
  mentions: {
    title: "Mentions légales",
    intro: "MENTIONS LÉGALES DU SITE WEB « https://ma2e.ci »",
    sections: [
      {
        heading: "Mentions légales",
        body:
          "Mutuelle des Agents de l'Eau et de l'Électricité, en abrégé « MA2E ».\n\n" +
          "- Société mutualiste au capital social (capital variable) de : 634 700 000 FCFA (six cent trente-quatre millions sept cent mille Francs CFA).\n" +
          "- Siège social : Abidjan – Plateau – Avenue Houdaille – Immeuble SIDAM 6ème étage, Côte d'Ivoire, 18 BP 1210 Abidjan 18.\n" +
          "- Compte contribuable : 1342324-D\n" +
          "- Email : info@ma2e.ci\n" +
          "- Tél. : +225 27 21 23 64 87",
      },
      {
        heading: "À propos",
        body: "MA2E est une institution mutualiste d'Épargne et de Crédit sans but lucratif, régie par l'ordonnance N°2011-367 du 3 novembre 2011 portant réglementation des systèmes financiers décentralisés.",
      },
    ],
  },
  cgu: {
    title: "Conditions générales d'utilisation",
    intro: "IMPORTANT : LA MUTUELLE DES AGENTS DE L'EAU ET DE L'ELECTRICITE ACCORDE L'UTILISATION DE SON SITE WEB « https://ma2e.ci », POUR VOTRE USAGE PERSONNEL, SOUS RÉSERVE DE VOTRE ACCORD D'ÊTRE LIÉ PAR LES TERMES ET CONDITIONS D'UTILISATION INDIQUÉS CI-DESSOUS.",
    sections: [
      {
        heading: "",
        body:
          "Les présents Termes et Conditions d'Utilisation, ci-après « Termes et Conditions », ont pour objet de définir les différents usages du site web « https://ma2e.ci » accessible pour smartphones, tablettes (iPhone/iPad, Android) et ordinateurs.\n\n" +
          "Le site web « https://ma2e.ci » est ouvert à tous les pays et territoires du monde dont la législation n'interdit pas, de manière générale, l'activité du site web. A défaut, il appartient à chaque personne physique ou morale dénommée ci-après « l'Utilisateur », de renoncer à accéder au site web « https://ma2e.ci » à partir de ce pays ou territoire.\n\n" +
          "L'utilisation du site web « https://ma2e.ci » après la modification de nos Termes et Conditions indique que vous acceptez nos nouvelles conditions.",
      },
      {
        heading: "1. Mentions légales",
        body:
          "Mutuelle des Agents de l'Eau et de l'Électricité, en abrégé « MA2E ».\n\n" +
          "- Société mutualiste au capital social (capital variable) de : 634 700 000 FCFA (six cent trente-quatre millions sept cent mille Francs CFA).\n" +
          "- Siège social : Abidjan – Plateau – Avenue Houdaille – Immeuble SIDAM 6ème étage, Côte d'Ivoire, 18 BP 1210 Abidjan 18.\n" +
          "- Compte contribuable : 1342324-D\n" +
          "- Email : info@ma2e.ci\n" +
          "- Tél. : +225 27 21 23 64 87",
      },
      {
        heading: "2. Données à caractère personnel",
        body:
          "Dans le respect de la réglementation applicable, notamment à la loi N°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en Côte d'Ivoire, des données à caractère personnel vous concernant pourront être collectées aux conditions indiquées dans la « Politique de protection des données personnelles ».\n\n" +
          "Vous disposez d'un droit d'accès, d'opposition, de modification, de rectification et de suppression des données à caractère personnel que nous pourrions être amenés à collecter.\n\n" +
          "Vous pouvez l'exercer à tout moment en contactant notre correspondant à la Protection des données à l'adresse suivante : PrivacyMA2E@ma2e.ci",
      },
      {
        heading: "3. Mentions cookies",
        body:
          "L'Éditeur MA2E n'utilise pas de cookies et ne collecte pas les données de navigation de l'Utilisateur, à l'occasion de l'utilisation du site web https://ma2e.ci et de ses Services. Toutefois, l'Éditeur MA2E peut à tout moment les utiliser dans une évolution future du site web https://ma2e.ci. L'Utilisateur sera alors informé de ces procédés ainsi que de leur objet et aura la faculté d'y consentir et de s'y opposer.\n\n" +
          "Les cookies : Les cookies sont de petits fichiers dont la fonction essentielle est de faciliter la navigation sur Internet. L'un de leurs principaux objectifs est de faire gagner du temps à l'Utilisateur, en indiquant au serveur web qu'il consulte à nouveau une page spécifique du site web.\n\n" +
          "La navigation : Lorsque l'Utilisateur accède à un site web et utilise ses Services, les données de navigation sont les informations relatives à son adresse IP, son système d'exploitation, le type et la langue de son navigateur, ses temps d'accès, la date, l'heure et la requête de sa recherche, ou encore les adresses des sites que l'Utilisateur visite.",
      },
      {
        heading: "4. Conditions générales d'utilisation du site",
        body:
          "Toute connexion au site web https://ma2e.ci est subordonnée au respect des présentes conditions générales d'utilisation (ci-après désignées « Conditions Générales d'Utilisation ») qui définissent les règles d'utilisation du présent site web.\n\n" +
          "La simple utilisation du présent site web https://ma2e.ci suppose l'acceptation pleine et entière des Conditions Générales d'Utilisation ainsi que les stipulations contenues dans les rubriques « Mentions légales » et « Politique de protection de données personnelles » et, plus généralement, l'ensemble des dispositions légales et réglementaires applicables.",
      },
      {
        heading: "Article 1 – Définitions",
        body:
          "- Site : Le Site désigne le site web accessible à l'adresse url : https://ma2e.ci.\n" +
          "- Utilisateur : l'Utilisateur désigne toute personne physique ou morale qui consulte le Site ou l'un des services proposés sur le Site.\n" +
          "- MA2E : MA2E signifie Mutuelle des Agents de l'Eau et de l'Électricité.\n" +
          "- Editeur : L'Éditeur désigne la MA2E qui édite le Site.",
      },
      {
        heading: "Article 2 – Objet du Site",
        body: "Le Site a pour objet d'accroître la notoriété de la MA2E et être plus proche de ses adhérents dans les conditions visées par les présentes Conditions Générales d'Utilisation.",
      },
      {
        heading: "Article 3 – Accès au Site",
        body:
          "L'Éditeur s'efforce de permettre l'accès au Site 24 heures sur 24, 7 jours sur 7, sauf en cas de force majeure ou d'un événement hors du contrôle de l'Éditeur, et sous réserve des éventuelles pannes et interventions de maintenance nécessaires au bon fonctionnement du Site et des services.\n\n" +
          "L'Éditeur ne peut garantir une disponibilité du Site, une fiabilité des transmissions et des performances en termes de temps de réponse ou de qualité. Il n'est prévu aucune assistance technique vis-à-vis de l'Utilisateur que ce soit par des moyens électroniques ou téléphoniques.\n\n" +
          "La responsabilité de l'Éditeur ne saurait être engagée en cas d'impossibilité d'accès à ce Site.\n\n" +
          "L'Éditeur peut être amené à interrompre le Site, à tout moment sans préavis, le tout sans droit à indemnités. L'Utilisateur reconnaît et accepte que l'Éditeur ne soit pas responsable des interruptions, et des conséquences qui peuvent en découler pour l'Utilisateur ou tout tiers.\n\n" +
          "Par ailleurs, l'accès à certaines parties du Site ou à certains services peut être restreint et/ou leur utilisation soumise à des conditions additionnelles et/ou spécifiques.",
      },
      {
        heading: "Article 4 – Modification des Conditions Générales d'Utilisation",
        body: "L'Éditeur se réserve la possibilité de modifier, à tout moment et sans préavis, les présentes Conditions Générales d'Utilisation afin de les adapter aux évolutions du Site et/ou de son exploitation.",
      },
      {
        heading: "Article 5 – Propriété intellectuelle",
        body:
          "La structure générale du Site, ainsi que les textes, graphiques, images, sons, vidéos et plus généralement tous contenus la composant, sont la propriété de l'Éditeur à l'exception des marques de tiers qui pourraient y être citées et/ou représentées.\n\n" +
          "Toute représentation et/ou reproduction et/ou exploitation partielle ou totale des contenus proposés par le Site, par quelque procédé que ce soit, sans l'autorisation préalable et par écrit de l'Éditeur est strictement interdite et serait susceptible de constituer une contrefaçon telle que prévue par les articles 37 et suivants de l'annexe III de l'accord de Bangui du 02 mars 1977, révisé le 24 février 1999, ou tout texte subséquent.\n\n" +
          "Dans l'hypothèse où l'Utilisateur souhaiterait exploiter un des contenus du Site (texte, image, etc.), il s'engage à requérir l'autorisation préalable et écrite de l'Éditeur, en écrivant ou en utilisant le formulaire de contact.\n\n" +
          "Néanmoins, la reproduction des textes sur un support papier est notamment autorisée dans le cadre d'information, sous réserve du respect des trois (3) conditions suivantes :\n\n" +
          "- Gratuité de la diffusion ;\n" +
          "- Respect de l'intégrité des documents reproduits (pas de modification ni d'altération) ;\n" +
          "- Citation claire et lisible de la source sous la forme suivante : Ce document provient du site web « https://ma2e.ci », propriété de la Mutuelle des Agents de l'Eau et de l'Électricité (MA2E).\n\n" +
          "Les droits de reproduction sont réservés et strictement limités.",
      },
      {
        heading: "Article 6 – Liens hypertextes",
        body:
          "Les liens hypertextes mis en place dans le cadre du Site en direction d'autres ressources présentes sur le réseau internet, notamment vers des partenaires, ont fait l'objet d'une autorisation préalable et expresse.\n\n" +
          "Les Utilisateurs et visiteurs du Site ne peuvent en aucun cas mettre en place un lien hypertexte en direction du Site, sans l'autorisation écrite et préalable de la MA2E. Toute demande tendant à cette fin doit être adressée via le formulaire de contact.\n\n" +
          "Le Site peut contenir des liens hypertextes renvoyant vers des sites qui ne sont pas édités par l'Éditeur. La MA2E n'étant pas l'éditeur de ces sites, elle ne peut en contrôler le contenu.\n\n" +
          "Si l'Utilisateur choisit de consulter ces sites à partir de liens hypertextes accessibles depuis le Site, la MA2E lui conseille vivement de prendre connaissance, avant toute utilisation de leurs services, de leur rubrique relative aux données à caractère personnel.",
      },
      {
        heading: "Article 7 – Responsabilité",
        body:
          "De l'Éditeur :\n\n" +
          "Les informations et/ou documents figurant sur ce Site et/ou accessibles par ce Site proviennent de sources considérées comme étant fiables. Toutefois, ces informations et/ou documents sont susceptibles de contenir des inexactitudes techniques et des erreurs typographiques. L'Éditeur se réserve le droit de les corriger, dès que ces erreurs sont portées à sa connaissance.\n\n" +
          "Il appartient à l'Utilisateur de vérifier l'exactitude et la pertinence des informations et/ou documents mis à disposition sur ce Site. Les informations et/ou documents disponibles sur ce Site sont susceptibles d'être modifiés à tout moment, et peuvent avoir fait l'objet de mises à jour.\n\n" +
          "De l'Utilisateur :\n\n" +
          "L'Utilisateur est le seul responsable du bon fonctionnement de son équipement nécessaire à l'accès et à l'utilisation du Site ainsi que de son accès à internet. Il appartient à l'Utilisateur de prendre toutes les mesures appropriées pour protéger ses propres données, ses systèmes informatiques et/ou logiciels de la contamination par d'éventuels virus.\n\n" +
          "L'utilisation des informations et/ou documents disponibles sur ce Site se fait sous l'entière et seule responsabilité de l'Utilisateur, qui assume la totalité des conséquences pouvant en découler, sans que l'Éditeur puisse être recherché à ce titre, et sans recours contre ce dernier.",
      },
      {
        heading: "Article 8 – Droit applicable",
        body:
          "Les présentes Conditions Générales d'Utilisation du Site sont régies par le Droit en vigueur en République de Côte d'Ivoire. En cas de litige, et après une tentative de conciliation demeurée infructueuse, compétence expresse est attribuée aux Tribunaux Ivoiriens, nonobstant la pluralité de défendeurs ou l'appel en garantie, même pour les procédures d'urgence ou les procédures conservatoires, en référé ou à la requête.\n\n" +
          "Pour toute question relative aux présentes Conditions Générales d'Utilisation du Site, vous pouvez nous écrire à l'adresse suivante : info@ma2e.ci",
      },
    ],
  },
  dcp: {
    title: "Politique de protection des données personnelles",
    subtitle: "Version du 28 septembre 2021.",
    sections: [
      {
        heading: "1. Préambule",
        body:
          "1.1. Dans le cadre de ses différentes activités, MA2E collecte et traite des Données Personnelles permettant d'identifier ses parties prenantes (clients, fournisseurs, prestataires, avocats libéraux, salariés, partenaires commerciaux, transferts de données, etc.).\n\n" +
          "1.2. En tant qu'organisation qui traite des Données Personnelles, MA2E reconnaît qu'il est primordial d'en contrôler la collecte, la conservation, l'utilisation et la destruction afin de se conformer à la Loi n°2013-450 du 19 juin 2013 relative à la protection des données à caractère personnel en Côte d'Ivoire. A ce titre, MA2E a désigné un Correspondant à la Protection des Données couramment nommé « Data Protection Officer » (en abrégé « DPO ») pour assurer sa conformité à la règlementation applicable en matière de Protection des Données Personnelles.\n\n" +
          "1.3. A travers la présente Politique de Protection des Données Personnelles (la « Politique »), MA2E s'engage à mettre en œuvre des mesures techniques et organisationnelles permettant de garantir le traitement équitable, transparent, licite et adéquat des Données Personnelles.\n\n" +
          "1.4. La Politique traduit l'ensemble des engagements pris par MA2E en matière de protection des Données Personnelles.",
      },
      {
        heading: "2. Définitions",
        body:
          "Autorité de Protection : Autorité administrative indépendante chargée de veiller à la mise en œuvre des traitements des données à caractère personnel conformément aux dispositions des législations relatives à la protection des données à caractère personnel (loi n°2013-450 du 19 juin 2013 en Côte d'Ivoire).\n\n" +
          "Correspondant / Délégué à la Protection des Données (Data Protection Officer, DPO) : Personne en charge de contrôler la conformité aux Législations sur la Protection des Données. Le Délégué à la Protection des Données est associé à toutes les questions relatives à la protection des Données Personnelles, notamment en cas de nouveau projet entraînant la collecte, la conservation et/ou l'utilisation de Données Personnelles. Il assure un rôle de conseil et d'alerte. Il est également l'interlocuteur spécialisé et privilégié des Autorités de Protection compétentes en matière de protection des Données Personnelles et des Personnes Concernées.\n\n" +
          "Données à Caractère Personnel (DCP) ou Données Personnelles : Toute information sur une Personne Concernée qui l'identifie ou qui permet de l'identifier, éventuellement en conjonction avec d'autres informations détenues. Les Données Personnelles sont définies de manière très large et incluent des éléments tels que le nom, l'adresse géographique, l'adresse électronique, l'adresse IP, le numéro de téléphone personnel ainsi que des catégories de données plus sensibles.\n\n" +
          "Catégories Particulières de Données Personnelles : Données Personnelles qui révèlent l'origine raciale ou ethnique, les opinions politiques, les convictions religieuses ou philosophiques, l'appartenance syndicale, les données génétiques, les données biométriques, la santé physique ou mentale, la vie sexuelle ou l'orientation sexuelle et le casier judiciaire. Elles sont soumises à des contrôles supplémentaires par rapport aux Données Personnelles ordinaires.\n\n" +
          "Traitement des Données Personnelles ou Traitement : Toute opération ou ensemble d'opérations appliquées à des Données Personnelles (par exemple : collecte, enregistrement, conservation, consultation ou destruction de Données Personnelles).\n\n" +
          "Responsable du Traitement : La personne, l'autorité publique, la société ou l'organisme qui, seul ou conjointement avec d'autres, décide de la création du traitement ; il en détermine les finalités et les moyens.\n\n" +
          "Sous-Traitant : Désigne un tiers extérieur à l'entreprise qui traite les données à caractère personnel pour le compte du Responsable du Traitement.\n\n" +
          "Personne Concernée : Les personnes physiques qui peuvent être identifiées, directement ou indirectement, à partir des informations dont dispose MA2E. Les Personnes Concernées englobent l'ensemble des parties prenantes de MA2E.\n\n" +
          "Législations sur la Protection des Données : Désignent en Côte d'Ivoire l'ensemble des lois et règlements relatifs aux données personnelles, notamment la loi n°2013-450 du 19 juin 2013. En Europe, le Règlement Général sur la Protection des Données (RGPD, Règlement (UE) 2016/679 du 27 avril 2016).",
      },
      {
        heading: "3. Utilisation licite des Données Personnelles",
        body:
          "3.1. MA2E s'engage à uniquement traiter les Données Personnelles de manière licite. Ainsi, pour chaque Traitement mis en œuvre, MA2E aura préalablement identifié la base juridique sur laquelle se fonde celui-ci. Cette base juridique est portée à la connaissance des Personnes Concernées lors de la collecte des Données Personnelles.\n\n" +
          "3.2. Par ailleurs, lorsque MA2E collecte, conserve et utilise des Catégories Particulières de Données Personnelles, elle s'assure de respecter les conditions légales supplémentaires requises.\n\n" +
          "3.3. MA2E s'engage également à collecter les Données Personnelles pour des finalités déterminées, explicites et légitimes. En aucun cas les Données Personnelles collectées ne sauraient être ultérieurement traitées d'une manière incompatible avec les finalités initialement établies.",
      },
      {
        heading: "4. Traitement loyal et transparent",
        body:
          "4.1. Lorsque MA2E recueille des Données Personnelles directement auprès des Personnes Concernées, MA2E s'engage à les informer des conditions dans lesquelles leurs Données Personnelles sont traitées.\n\n" +
          "4.2. Ainsi, pour chaque Traitement de Données Personnelles, MA2E communique aux Personnes Concernées, a minima, les informations suivantes :\n\n" +
          "- L'identité et les coordonnées du Responsable du Traitement ;\n" +
          "- Les coordonnées du Correspondant à la Protection des Données ;\n" +
          "- La finalité pour laquelle les Données Personnelles sont traitées ;\n" +
          "- La base juridique du Traitement des Données Personnelles ;\n" +
          "- Le caractère facultatif ou obligatoire de la fourniture des Données Personnelles, et les conséquences éventuelles d'un défaut de fourniture ;\n" +
          "- Les destinataires ou les catégories de destinataires des Données Personnelles ;\n" +
          "- La durée de conservation des Données Personnelles, ou en cas d'impossibilité, les critères permettant de la déterminer ;\n" +
          "- L'existence et les modalités d'exercice des droits que détiennent les Personnes Concernées sur leurs Données Personnelles ;\n" +
          "- L'existence du droit d'introduire une réclamation auprès de l'Autorité de Protection des données compétente ;\n" +
          "- Le cas échéant, l'existence d'une prise de décision automatisée ;\n" +
          "- Le cas échéant, les transferts de Données Personnelles effectués à destination d'un pays situé hors de la CEDEAO.\n\n" +
          "4.3. Si MA2E reçoit des Données Personnelles d'une autre source que la Personne Concernée elle-même, cette source informera MA2E des conditions dans lesquelles ses Données Personnelles sont traitées. Cette information sera fournie dès que cela sera raisonnablement possible et en tout état de cause dans un délai d'un (1) mois.\n\n" +
          "4.4. Si MA2E modifie la façon dont elle traite les Données Personnelles, MA2E s'engage à en informer les Personnes Concernées dans les meilleurs délais.",
      },
      {
        heading: "5. Qualité des Données Personnelles",
        body:
          "5.1. MA2E s'engage à collecter uniquement les Données Personnelles qui sont strictement nécessaires et pertinentes au regard des finalités poursuivies par les Traitements mis en œuvre. Lors des collectes de Données Personnelles, les données obligatoires et les données facultatives seront clairement identifiées comme telles.\n\n" +
          "5.2. MA2E veille à ce que les Données Personnelles traitées soient enregistrées avec exactitude, qu'elles soient tenues à jour et qu'elles soient rectifiées ou effacées en cas de nécessité. Cela se traduit par :\n\n" +
          "- Une vigilance permanente des membres de MA2E ;\n" +
          "- La possibilité laissée aux Personnes Concernées d'entrer en contact avec MA2E afin de demander la rectification de leurs Données Personnelles.",
      },
      {
        heading: "6. Conservation limitée des Données Personnelles",
        body:
          "6.1. MA2E s'engage à conserver les Données Personnelles uniquement pendant la durée nécessaire à la réalisation des finalités pour lesquelles elles ont été collectées.\n\n" +
          "6.2. MA2E doit également conserver les Données Personnelles pour respecter les obligations légales auxquelles elle est soumise ou parce qu'elles sont nécessaires à la constatation, l'exercice ou la défense de droits en justice. Dans ce contexte, les Données Personnelles ne seront pas conservées au-delà des durées de conservation légales et des délais de prescriptions applicables.",
      },
      {
        heading: "7. Communication et transferts de Données Personnelles",
        body:
          "7.1. MA2E s'engage à mettre en œuvre une politique d'habilitation afin de s'assurer que seules les personnes autorisées et ayant une réelle légitimité accèdent aux Données Personnelles collectées et traitées.\n\n" +
          "7.2. Lorsque MA2E fait appel aux services de prestataires (« Sous-traitants ») pour traiter des Données Personnelles en son nom et pour son compte, les Sous-traitants sont soumis au respect d'obligations strictes afin de s'assurer que les Données Personnelles sont traitées de manière sécurisée et conforme. MA2E se réserve notamment le droit de réaliser des audits afin de s'assurer du respect des obligations par ses Sous-traitants.\n\n" +
          "7.3. Dans la mesure où MA2E procède à des transferts de Données Personnelles vers un pays situé hors de la CEDEAO, MA2E s'engage à :\n\n" +
          "- Encadrer juridiquement le transfert des Données Personnelles, en soumettant un dossier de demande d'autorisation de transfert de données auprès de l'Autorité de Protection compétente ;\n" +
          "- Informer les Personnes Concernées de l'existence du transfert et des garanties encadrant celui-ci.",
      },
      {
        heading: "8. Sécurité des Données Personnelles",
        body:
          "8.1. MA2E, qui accorde une grande importance à la sécurité des Données Personnelles, a mis en place des mesures de sécurité techniques et organisationnelles contre tout traitement illégal ou non autorisé, toute perte accidentelle, détérioration, modification ou altération non autorisée de Données Personnelles.\n\n" +
          "8.2. Les procédures et les mesures de sécurité physiques et logiques mises en place sont adaptées en fonction du degré de sensibilité des Données Personnelles, afin qu'elles soient traitées de manière sécurisée de leur collecte jusqu'à leur destruction.\n\n" +
          "8.3. A ce titre, MA2E dispose d'un Responsable de Sécurité des Systèmes d'Information (RSSI), qui définit et met en œuvre la Politique de Sécurité.",
      },
      {
        heading: "9. Respect des droits des Personnes Concernées",
        body:
          "9.1. MA2E s'engage à respecter l'intégralité des droits dont disposent les Personnes Concernées en vertu des Législations sur la Protection des Données. Ainsi, à tout moment, les Personnes Concernées peuvent contacter MA2E afin de :\n\n" +
          "- Demander l'accès aux Données Personnelles que MA2E détient à leur sujet ;\n" +
          "- Faire rectifier les Données Personnelles inexactes que MA2E détient à leur sujet ;\n" +
          "- Faire effacer les Données Personnelles dans certaines conditions ;\n" +
          "- Demander la limitation du traitement de leurs Données Personnelles ;\n" +
          "- S'opposer au traitement, y compris s'opposer à la prospection ou demander si MA2E a un intérêt légitime pour le Traitement ;\n" +
          "- Se voir fournir les Données Personnelles, dans certaines circonstances, dans un format électronique couramment utilisé et réutilisable ;\n" +
          "- Retirer leur consentement à l'utilisation de leurs Données Personnelles lorsque leur Traitement est fondé sur celui-ci ;\n" +
          "- Faire connaître leurs directives quant au sort de leurs Données Personnelles après leur décès.\n\n" +
          "9.2. MA2E s'assure qu'elle permet aux Personnes Concernées d'exercer leurs droits en les informant des modalités d'exercice de ces derniers au moment de la collecte des Données Personnelles.\n\n" +
          "9.3. Toute demande d'exercice de droits doit être adressée au Correspondant à la Protection des Données de MA2E en joignant une copie d'une pièce d'identité :\n\n" +
          "- Par email : privacyMA2E@ma2e.ci\n" +
          "- Par voie postale : DPO de MA2E, 18 BP 1210 Abidjan 18\n\n" +
          "9.4. MA2E s'engage à répondre aux demandes dans les meilleurs délais, et en tout état de cause, sans dépasser le délai d'un (1) mois prévu par les Législations sur la Protection des Données, à compter de leur réception. Ce délai pourra cependant être prolongé de deux (2) mois supplémentaires si cela s'avère nécessaire au regard de la complexité et du nombre de demandes reçues.",
      },
      {
        heading: "10. Mise à jour de la Politique",
        body: "10.1. La présente version de la Politique a été rédigée et validée par le Correspondant à la Protection des Données de MA2E le 28 septembre 2021. Elle est susceptible d'être modifiée ou aménagée à tout moment, notamment en cas d'évolution légale, jurisprudentielle, des décisions et recommandations de l'Autorité de Protection ou des usages.",
      },
    ],
  },
};
