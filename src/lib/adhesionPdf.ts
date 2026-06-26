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

// Génère le formulaire d'adhésion / souscription au capital pré-rempli (PDF imprimable).
// L'admin le télécharge depuis le back-office, l'imprime, et l'adhérent le signe à la MA2E.
export function generateAdhesionPdf(app: AppLike) {
  const d = app.data || {};
  const s = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : String(v));
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 16;
  const colW = (W - 2 * M) / 2;
  let y = M;

  // En-tête
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text("MA2E — Mutuelle des Agents de l'Eau et de l'Électricité", W / 2, y, { align: "center" });
  y += 7;
  doc.setFontSize(15);
  doc.text("DEMANDE D'ADHÉSION / SOUSCRIPTION AU CAPITAL", W / 2, y, { align: "center" });
  y += 8;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(`Référence : ${app.id}`, M, y);
  doc.text(`Date : ${app.date || ""}`, W - M, y, { align: "right" });
  y += 3;
  doc.setDrawColor(170);
  doc.line(M, y, W - M, y);
  y += 7;

  const section = (title: string) => {
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10.5);
    doc.setTextColor(20, 90, 70);
    doc.text(title, M, y);
    doc.setTextColor(0);
    y += 6;
  };

  const row = (l1: string, v1: string, l2?: string, v2?: string) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(120);
    doc.text(l1.toUpperCase(), M, y);
    if (l2) doc.text(l2.toUpperCase(), M + colW, y);
    doc.setFontSize(10.5);
    doc.setTextColor(0);
    doc.text(v1, M, y + 4.8);
    if (l2) doc.text(v2 || "—", M + colW, y + 4.8);
    doc.setDrawColor(220);
    doc.line(M, y + 6.3, M + colW - 6, y + 6.3);
    if (l2) doc.line(M + colW, y + 6.3, W - M, y + 6.3);
    y += 11.5;
  };

  const checkbox = (checked: unknown, label: string) => {
    doc.setDrawColor(70);
    doc.rect(M, y - 3.3, 4.2, 4.2);
    if (checked) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("X", M + 0.7, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10.5);
    doc.setTextColor(0);
    doc.text(label, M + 7, y);
    y += 7.5;
  };

  section("Identité");
  row("Nom et prénoms", s(app.name), "Nom de la mère", s(d.nomMere));
  row("Date de naissance", s(d.dateDeNaissance), "Lieu de naissance", s(d.lieuDeNaissance));
  row("Situation matrimoniale", s(d.situationMatrimoniale), "Adresse / Boîte postale", s(d.adresse));
  y += 2;

  section("Informations professionnelles");
  row("Matricule", s(app.matricule), "Société", s(d.societe));
  row("Catégorie", s(d.categorie), "Direction", s(d.direction));
  row("Service", s(d.service), "Exploitation", s(d.exploitation));
  y += 2;

  section("Personnes liées");
  row("Personne à prévenir", s(d.personneAPrevenir), "Contact", s(d.contactPrevenir));
  row("Ayant(s) droit", s(d.ayantsDroit), "Contact", s(d.contactAyantsDroit));
  y += 2;

  section("Contact");
  row("Téléphone", s(app.phone), "Email", s(app.email));
  y += 2;

  section("Engagement de paiement (prélèvement à la source)");
  checkbox(d.intentionAdhesion, "Droit d'adhésion — 6 000 FCFA");
  checkbox(d.intentionPart, "Souscription à la part sociale — 8 000 FCFA");
  y += 6;

  doc.setFontSize(9.5);
  doc.setTextColor(0);
  doc.text("Fait à ......................................................   le ......................................", M, y);
  y += 13;
  doc.text("Signature de l'adhérent (précédée de la mention « Lu et Approuvé ») :", M, y);
  doc.setDrawColor(150);
  doc.rect(M, y + 3, W - 2 * M, 24);

  // Pied de page
  doc.setFontSize(7.5);
  doc.setTextColor(130);
  doc.text(
    "Document généré depuis la plateforme E-MA2E à partir de la demande en ligne — à imprimer et à signer à la MA2E.",
    W / 2,
    287,
    { align: "center" },
  );

  doc.save(`adhesion-${app.id}.pdf`);
}
