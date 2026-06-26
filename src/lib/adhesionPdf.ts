import { jsPDF } from "jspdf";

interface AppLike {
  id: string;
  name: string;
  matricule: string;
  email: string;
  phone: string;
  date?: string;
  data: Record<string, unknown>;
}

// Montants du prélèvement (à confirmer avec MA2E — le CR indique 6 000 F de droit
// d'adhésion ; l'ancien modèle imprimé indiquait 1 000 / 5 000).
const FEE_ADHESION = "6 000";
const FEE_PART = "8 000";

const LOGO_URL = "/logo-ma2e.png";

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Génère le formulaire d'adhésion / souscription au capital pré-rempli (PDF imprimable),
// reprenant la disposition du modèle officiel MA2E. L'admin le télécharge, l'imprime, et
// l'adhérent le signe physiquement à la MA2E.
export async function generateAdhesionPdf(app: AppLike) {
  const d = app.data || {};
  const s = (v: unknown) => (v === null || v === undefined || v === "" ? "" : String(v));
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 15;
  let y = M;

  // --- En-tête : logo + titre ---
  const logo = await loadImage(LOGO_URL);
  let headerBottom = M + 6;
  if (logo) {
    const h = 14;
    const w = h * (logo.naturalWidth / logo.naturalHeight || 1.5);
    doc.addImage(logo, "PNG", M, y, w, h);
    headerBottom = y + h;
  }
  y = headerBottom + 9;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.setTextColor(0);
  const title = "DEMANDE D'ADHÉSION / SOUSCRIPTION AU CAPITAL";
  doc.text(title, M, y);
  doc.setDrawColor(0);
  doc.setLineWidth(0.4);
  doc.line(M, y + 1.5, M + doc.getTextWidth(title), y + 1.5);
  doc.setLineWidth(0.2);
  y += 9;

  // --- Champs en ligne (label : valeur sur pointillés) ---
  const row = (segments: { label: string; value: string }[]) => {
    const segW = (W - 2 * M) / segments.length;
    segments.forEach((seg, i) => {
      const x = M + i * segW;
      doc.setFont("helvetica", "normal");
      doc.setFontSize(9.5);
      doc.setTextColor(0);
      const lbl = `${seg.label} :`;
      doc.text(lbl, x, y);
      const vx = x + doc.getTextWidth(lbl) + 1.5;
      const end = M + (i + 1) * segW - (i === segments.length - 1 ? 0 : 4);
      doc.setFont("helvetica", "bold");
      doc.text(seg.value, vx, y);
      doc.setDrawColor(150);
      doc.setLineDashPattern([0.7, 0.7], 0);
      doc.line(vx, y + 1.3, end, y + 1.3);
      doc.setLineDashPattern([], 0);
    });
    y += 8.2;
  };

  const naissance = [s(d.dateDeNaissance), s(d.lieuDeNaissance)].filter(Boolean).join(" à ");
  row([{ label: "Je soussigné(e)", value: s(app.name) }]);
  row([{ label: "Date de naissance et lieu de naissance", value: naissance }]);
  row([{ label: "N° CNI", value: "" }]);
  row([{ label: "Situation matrimoniale", value: s(d.situationMatrimoniale) }, { label: "Fonction", value: "" }]);
  row([{ label: "Service", value: s(d.service) }, { label: "Boîte postale", value: "" }]);
  row([{ label: "Matricule", value: s(app.matricule) }, { label: "Catégorie", value: s(d.categorie) }]);
  row([
    { label: "Société", value: s(d.societe) },
    { label: "Direction", value: s(d.direction) },
    { label: "Exploitation", value: s(d.exploitation) },
  ]);
  row([{ label: "Embauché(e) le", value: s(d.dateEmbauche) }]);
  row([{ label: "Nom du conjoint(e)", value: "" }, { label: "Contacts", value: "" }]);
  row([{ label: "Nom de la mère", value: s(d.nomMere) }]);
  row([{ label: "Personnes à prévenir", value: s(d.personneAPrevenir) }, { label: "Contacts", value: s(d.contactPrevenir) }]);
  row([{ label: "Ayants droit", value: s(d.ayantsDroit) }, { label: "Contacts", value: s(d.contactAyantsDroit) }]);
  y += 3;

  // --- Prélèvement ---
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text("Donne mon accord pour le prélèvement sur mon salaire de la somme de :", M, y);
  y += 7;
  const checkbox = (checked: unknown, amount: string, label: string) => {
    doc.setDrawColor(60);
    doc.setLineWidth(0.3);
    doc.rect(M, y - 3.4, 4.4, 4.4);
    if (checked) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("X", M + 0.8, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9.5);
    doc.text(`${amount} F.CFA pour `, M + 7, y);
    const bx = M + 7 + doc.getTextWidth(`${amount} F.CFA pour `);
    doc.setFont("helvetica", "bold");
    doc.text(label, bx, y);
    doc.setLineWidth(0.2);
    y += 7;
  };
  checkbox(d.intentionAdhesion, FEE_ADHESION, "le règlement de mon droit d'adhésion");
  checkbox(d.intentionPart, FEE_PART, "la libération de ma part sociale");
  y += 6;

  // --- Contact (gauche) + Signature (droite) ---
  const colX = W / 2 + 8;
  const startY = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Contact :", M, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  const contactLine = (label: string, value: string) => {
    doc.text(`${label} :`, M, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, M + 22, y);
    doc.setFont("helvetica", "normal");
    y += 5.5;
  };
  contactLine("Domicile", "");
  contactLine("Bureau", "");
  contactLine("Cellulaire", s(app.phone));
  contactLine("E-mail", s(app.email));

  // Colonne signature (à droite)
  let yr = startY;
  doc.setFont("helvetica", "normal");
  doc.text(`Fait à ...............................   le ${app.date || "...................."}`, colX, yr);
  yr += 8;
  doc.text("Signature", colX + 20, yr);
  yr += 4.5;
  doc.setFontSize(8);
  doc.text("(Précédée de la mention « Lu et Approuvé »)", colX, yr);

  // --- Mentions légales (encadré, juste sous le bloc contact/signature, avec un espace de signature) ---
  const fy = Math.max(y, yr) + 22;
  doc.setDrawColor(120);
  doc.setLineWidth(0.2);
  doc.rect(M, fy, W - 2 * M, 14);
  doc.setFontSize(6.5);
  doc.setTextColor(60);
  const dpo =
    "Les données personnelles recueillies font l'objet d'un traitement destiné à MA2E dans le cadre de votre adhésion. Vous pouvez exercer vos droits (accès, modification, suppression) à tout moment par courrier : DPO de MA2E, 18 BP 1210 Abidjan 18 ou par mail : privacyMA2E@ma2e.ci. Joindre une copie de votre pièce d'identité.";
  doc.text(doc.splitTextToSize(dpo, W - 2 * M - 4), M + 2, fy + 3.5);
  doc.setFontSize(6);
  doc.setTextColor(90);
  const legal =
    "Institution Mutualiste d'Épargne et de Crédit sans but lucratif — Régie par l'ordonnance N°2011-367 du 3 novembre 2011 — Agrément N°A-1.1.9/09-03. Siège Social : 34 Avenue Houdaille, Plateau, 6ème étage, Immeuble SIDAM — 18 BP 1210 Abidjan 18.";
  doc.text(doc.splitTextToSize(legal, W - 2 * M), M, fy + 17);

  // Référence (discret, en haut à droite)
  doc.setFontSize(7.5);
  doc.setTextColor(130);
  doc.text(`Réf. ${app.id}`, W - M, M + 2, { align: "right" });

  doc.save(`adhesion-${app.id}.pdf`);
}
