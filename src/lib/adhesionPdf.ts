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

// Montants du prélèvement — conformes au modèle officiel MA2E (exemple de dossier d'adhésion).
const FEE_ADHESION = "1 000";
const FEE_PART = "5 000";

const LOGO_URL = "/logo-ma2e.png";

// Mentions de bas de page (réutilisées sur chaque page du dossier).
const DPO_TEXT =
  "Les données personnelles recueillies font l'objet d'un traitement destiné à MA2E dans le cadre de votre adhésion. Vous pouvez exercer vos droits (accès, modification, suppression) à tout moment par courrier : DPO de MA2E, 18 BP 1210 Abidjan 18 ou par mail : privacyMA2E@ma2e.ci. Joindre une copie de votre pièce d'identité.";
const LEGAL_TEXT =
  "Institution Mutualiste d'Épargne et de Crédit sans but lucratif — Régie par l'ordonnance N°2011-367 du 3 novembre 2011 — Agrément N°A-1.1.9/09-03. Siège Social : 34 Avenue Houdaille, Plateau, 6ème étage, Immeuble SIDAM — 18 BP 1210 Abidjan 18.";

// Montant mensuel de l'épargne Expresse (obligatoire à l'adhésion) selon la catégorie — modèle officiel MA2E :
// Cadre supérieur 10 000 / Cadre 5 000 / Maîtrise 3 000 / Employé-Ouvrier 1 500. Inconnu => vierge.
function expresseAmountByCategory(cat: string): string {
  const c = cat.toLowerCase().trim();
  if (!c) return "";
  if (/cadre/.test(c) && /sup/.test(c)) return "10 000";
  if (/hors\s*cat|hc/.test(c)) return "10 000";
  if (/cadre/.test(c)) return "5 000";
  if (/ma[iî]tr/.test(c)) return "3 000";
  if (/employ|ouvr|eo|ex[eé]c/.test(c)) return "1 500";
  return "";
}

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
// le sociétaire le signe physiquement à la MA2E.
export async function generateAdhesionPdf(app: AppLike) {
  const d = app.data || {};
  const s = (v: unknown) => (v === null || v === undefined || v === "" ? "" : String(v));
  // Dates ISO (YYYY-MM-DD des <input type="date">) -> JJ/MM/AAAA ; sinon valeur telle quelle.
  const fmtFr = (v: unknown) => {
    const str = s(v).trim();
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
    return m ? `${m[3]}/${m[2]}/${m[1]}` : str;
  };
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const W = 210;
  const M = 15;
  let y = M;

  // Signature fournie en ligne (data-URL) — embarquée dans le PDF si présente.
  const sigImg = d.signature ? await loadImage(String(d.signature)) : null;

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

  const naissance = [fmtFr(d.dateDeNaissance), s(d.lieuDeNaissance)].filter(Boolean).join(" à ");
  row([{ label: "Je soussigné(e)", value: s(app.name) }]);
  row([{ label: "Date de naissance et lieu de naissance", value: naissance }]);
  row([{ label: "N° CNI", value: s(d.cniNumero) }, { label: "Du", value: fmtFr(d.cniDu) }, { label: "au", value: fmtFr(d.cniAu) }]);
  row([{ label: "Situation matrimoniale", value: s(d.situationMatrimoniale) }, { label: "Fonction", value: s(d.fonction) }]);
  row([{ label: "Service", value: s(d.service) }, { label: "Boîte postale", value: s(d.adresse) }]);
  row([{ label: "Matricule", value: s(app.matricule) }, { label: "Catégorie", value: s(d.categorie) }]);
  row([
    { label: "Société", value: s(d.societe) },
    { label: "Direction", value: s(d.direction) },
    { label: "Exploitation", value: s(d.exploitation) },
  ]);
  row([{ label: "Embauché(e) le", value: fmtFr(d.dateEmbauche) }]);
  row([{ label: "Nom du conjoint(e)", value: s(d.conjoint) }, { label: "Contacts", value: s(d.contactConjoint) }]);
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
    doc.text(`${amount} F.CFA pour`, M + 7, y);
    const bx = M + 7 + doc.getTextWidth(`${amount} F.CFA pour`) + 1.4;
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
  contactLine("Domicile", s(d.domicile));
  contactLine("Bureau", s(d.bureau));
  contactLine("Cellulaire", s(app.phone));
  contactLine("E-mail", s(app.email));

  // Colonne signature (à droite)
  let yr = startY;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Fait à Abidjan,   le ${app.date || "...................."}`, colX, yr);
  yr += 8;
  doc.text("Signature", colX + 20, yr);
  yr += 4.5;
  doc.setFontSize(8);
  doc.text("(Précédée de la mention « Lu et Approuvé »)", colX, yr);

  // Signature fournie en ligne : mention typographiée + image ; sinon, espace pour signature manuscrite.
  let signatureBottom: number;
  if (sigImg) {
    const sigW = 42;
    const sigH = Math.min(24, sigW * (sigImg.naturalHeight / sigImg.naturalWidth || 0.35));
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text("Lu et Approuvé", colX, yr + 6);
    doc.addImage(sigImg, "PNG", colX, yr + 8, sigW, sigH);
    signatureBottom = yr + 8 + sigH + 2;
  } else {
    signatureBottom = yr + 22;
  }

  // --- Mentions légales (encadré, juste sous le bloc contact/signature) ---
  const fy = Math.max(y, signatureBottom) + 6;
  doc.setDrawColor(120);
  doc.setLineWidth(0.2);
  doc.rect(M, fy, W - 2 * M, 14);
  doc.setFontSize(6.5);
  doc.setTextColor(60);
  doc.text(doc.splitTextToSize(DPO_TEXT, W - 2 * M - 4), M + 2, fy + 3.5);
  doc.setFontSize(6);
  doc.setTextColor(90);
  doc.text(doc.splitTextToSize(LEGAL_TEXT, W - 2 * M), M, fy + 17);

  // Codes de référence du modèle officiel (bas de page).
  doc.setFontSize(7);
  doc.setTextColor(110);
  doc.text("MA2E IS 80 01 00", M, fy + 26);
  doc.text("Rattachée à la MA2E PO 80 00", W / 2, fy + 26, { align: "center" });

  // Référence (discret, en haut à droite)
  doc.setFontSize(7.5);
  doc.setTextColor(130);
  doc.text(`Réf. ${app.id}`, W - M, M + 2, { align: "right" });

  // ===== Helpers multi-pages (en-tête centré + bas de page) =====
  const drawHeader = (titleText: string) => {
    let yy = M;
    let hb = M + 6;
    if (logo) {
      const h = 14;
      const w = h * (logo.naturalWidth / logo.naturalHeight || 1.5);
      doc.addImage(logo, "PNG", M, yy, w, h);
      hb = yy + h;
    }
    yy = hb + 9;
    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(0);
    doc.text(titleText, W / 2, yy, { align: "center" });
    const tw = doc.getTextWidth(titleText);
    doc.setDrawColor(0);
    doc.setLineWidth(0.4);
    doc.line(W / 2 - tw / 2, yy + 1.5, W / 2 + tw / 2, yy + 1.5);
    doc.setLineWidth(0.2);
    return yy + 11;
  };
  const drawFooterBox = (fy: number) => {
    doc.setDrawColor(120);
    doc.setLineWidth(0.2);
    doc.rect(M, fy, W - 2 * M, 14);
    doc.setFontSize(6.5);
    doc.setTextColor(60);
    doc.text(doc.splitTextToSize(DPO_TEXT, W - 2 * M - 4), M + 2, fy + 3.5);
    doc.setFontSize(6);
    doc.setTextColor(90);
    doc.text(doc.splitTextToSize(LEGAL_TEXT, W - 2 * M), M, fy + 17);
    doc.setFontSize(7);
    doc.setTextColor(110);
    doc.text("MA2E IS 80 01 00", M, fy + 26);
    doc.text("Rattachée à la MA2E PO 80 00", W / 2, fy + 26, { align: "center" });
  };
  const dottedTo = (fromX: number, atY: number, toX: number) => {
    doc.setDrawColor(150);
    doc.setLineDashPattern([0.7, 0.7], 0);
    doc.line(fromX, atY, toX, atY);
    doc.setLineDashPattern([], 0);
  };

  // ============ PAGE 2 : DEMANDE D'ÉPARGNE (Épargne Expresse — obligatoire à l'adhésion) ============
  doc.addPage();
  y = drawHeader("DEMANDE D'ÉPARGNE");
  doc.setTextColor(0);

  // Type d'épargne — « Épargne Expresse » cochée (obligatoire)
  const typeBox = (x: number, checked: boolean, lab: string) => {
    doc.setDrawColor(60);
    doc.setLineWidth(0.3);
    doc.rect(x, y - 3.4, 4.2, 4.2);
    if (checked) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("X", x + 0.7, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(lab, x + 5.6, y);
    return x + 5.6 + doc.getTextWidth(lab) + 7;
  };
  let tx = M;
  tx = typeBox(tx, false, "Épargne Ordinaire");
  tx = typeBox(tx, true, "Épargne Expresse");
  tx = typeBox(tx, false, "Dépôt de garantie");
  y += 7;
  tx = M;
  tx = typeBox(tx, false, "Carte UBA");
  tx = typeBox(tx, false, "Épargne Logement");
  y += 10;

  // Identité (déjà collectée à l'adhésion)
  row([{ label: "Je soussigné(e)", value: s(app.name) }]);
  row([{ label: "Matricule", value: s(app.matricule) }, { label: "Catégorie", value: s(d.categorie) }]);
  row([
    { label: "Direction", value: s(d.direction) },
    { label: "Service", value: s(d.service) },
    { label: "Exploitation", value: s(d.exploitation) },
  ]);
  y += 2;

  // Employé(e) à — case cochée selon la société
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(0);
  const empLabel = "Employé(e) à :";
  doc.text(empLabel, M, y);
  const soc = s(d.societe).toLowerCase();
  const employers = ["CIE", "SODECI", "GS2E", "CIPREL", "AWALE", "SIVE", "SGA2E", "MA2E", "Smart Energy", "Atinkou"];
  const empStartX = M + doc.getTextWidth(empLabel) + 4;
  let ex = empStartX;
  employers.forEach((emp) => {
    const cellW = 5.6 + doc.getTextWidth(emp) + 7;
    if (ex + cellW > W - M) {
      ex = empStartX;
      y += 7;
    }
    doc.setDrawColor(60);
    doc.setLineWidth(0.3);
    doc.rect(ex, y - 3.2, 4, 4);
    if (emp.toLowerCase() === soc) {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text("X", ex + 0.6, y);
    }
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.text(emp, ex + 5.6, y);
    ex += cellW;
  });
  y += 11;

  // Autorisation de prélèvement — montant Expresse pré-rempli selon la catégorie ; période laissée vierge (réglée à l'agence).
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.setTextColor(0);
  const expAmt = expresseAmountByCategory(s(d.categorie));
  const t1 = "Autorise le prélèvement au bénéfice de la MA2E d'une retenue mensuelle de";
  doc.text(t1, M, y);
  let px = M + doc.getTextWidth(t1) + 2;
  dottedTo(px, y + 1.2, px + 24);
  if (expAmt) {
    doc.setFont("helvetica", "bold");
    doc.text(expAmt, px + 12, y, { align: "center" });
    doc.setFont("helvetica", "normal");
  }
  doc.text("F CFA,", px + 26, y);
  y += 7;
  const t2 = "sur mon salaire, pour une période allant de";
  doc.text(t2, M, y);
  px = M + doc.getTextWidth(t2) + 2;
  dottedTo(px, y + 1.2, px + 26);
  doc.text("à", px + 28, y);
  dottedTo(px + 32, y + 1.2, W - M);
  y += 7;
  const t3 = "À la fin de la période, le montant total de mon épargne s'élèvera à";
  doc.text(t3, M, y);
  px = M + doc.getTextWidth(t3) + 2;
  dottedTo(px, y + 1.2, W - M - 16);
  doc.text("CFA.", W - M - 13, y);
  y += 7;
  const t4 = "(En lettre)";
  doc.text(t4, M, y);
  dottedTo(M + doc.getTextWidth(t4) + 2, y + 1.2, W - M);
  y += 11;

  // Mode de paiement — « Prélèvement sur salaire » coché
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.text("MODE DE PAIEMENT SOUHAITÉ", M, y);
  doc.setLineWidth(0.3);
  doc.line(M, y + 1.2, M + doc.getTextWidth("MODE DE PAIEMENT SOUHAITÉ"), y + 1.2);
  y += 8;
  const payBox = (checked: boolean, lab: string) => {
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
    doc.text(lab, M + 7, y);
    y += 7;
  };
  payBox(true, "Prélèvement sur mon salaire");
  payBox(false, "Versement à la caisse");
  y += 6;

  // Contact (gauche) + Signature (droite)
  const startY2 = y;
  doc.setFont("helvetica", "bold");
  doc.setFontSize(9.5);
  doc.text("Contacts", M, y);
  doc.setFont("helvetica", "normal");
  y += 6;
  const cline2 = (label: string, value: string) => {
    doc.text(`${label} :`, M, y);
    doc.setFont("helvetica", "bold");
    doc.text(value, M + 22, y);
    doc.setFont("helvetica", "normal");
    y += 5.5;
  };
  cline2("Domicile", s(d.domicile));
  cline2("Bureau", s(d.bureau));
  cline2("Cellulaire", s(app.phone));
  cline2("E-mail", s(app.email));

  let yr2 = startY2;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9.5);
  doc.text(`Fait à Abidjan,   le ${app.date || "...................."}`, colX, yr2);
  yr2 += 8;
  doc.text("Signature", colX + 20, yr2);
  yr2 += 4.5;
  doc.setFontSize(8);
  doc.text("(Précédée de la mention « Lu et Approuvé »)", colX, yr2);
  let sigBottom2: number;
  if (sigImg) {
    const sigW = 42;
    const sigH = Math.min(24, sigW * (sigImg.naturalHeight / sigImg.naturalWidth || 0.35));
    doc.setFont("helvetica", "italic");
    doc.setFontSize(8);
    doc.setTextColor(0);
    doc.text("Lu et Approuvé", colX, yr2 + 6);
    doc.addImage(sigImg, "PNG", colX, yr2 + 8, sigW, sigH);
    sigBottom2 = yr2 + 8 + sigH + 2;
  } else {
    sigBottom2 = yr2 + 22;
  }
  drawFooterBox(Math.max(y, sigBottom2) + 6);

  // ============ PAGE 3 : COPIE PIÈCE D'IDENTITÉ (CNI recto/verso) ============
  const docsMap = (d.documents && typeof d.documents === "object" ? d.documents : {}) as Record<string, unknown>;
  const slotPath = (slot: string) => {
    const v = docsMap[slot];
    if (!v) return "";
    if (typeof v === "string") return v;
    const p = (v as { path?: unknown }).path;
    return typeof p === "string" ? p : "";
  };
  const isImgPath = (p: string) => /\.(jpe?g|png|webp|gif)$/i.test(p);
  const rectoP = slotPath("cniRecto");
  const versoP = slotPath("cniVerso");
  const passP = slotPath("passeport");
  const rectoImg = isImgPath(rectoP) ? await loadImage(rectoP) : null;
  const versoImg = isImgPath(versoP) ? await loadImage(versoP) : null;
  const passImg = isImgPath(passP) ? await loadImage(passP) : null;
  const idImages: { img: HTMLImageElement; cap: string }[] = [];
  if (rectoImg) idImages.push({ img: rectoImg, cap: "Carte Nationale d'Identité — Recto" });
  if (versoImg) idImages.push({ img: versoImg, cap: "Carte Nationale d'Identité — Verso" });
  if (!rectoImg && !versoImg && passImg) idImages.push({ img: passImg, cap: "Passeport" });
  if (idImages.length) {
    doc.addPage();
    y = drawHeader("PIÈCE D'IDENTITÉ");
    doc.setTextColor(0);
    const maxW = W - 2 * M;
    const maxH = idImages.length > 1 ? 105 : 210;
    idImages.forEach(({ img, cap }) => {
      doc.setFont("helvetica", "bold");
      doc.setFontSize(9.5);
      doc.setTextColor(0);
      doc.text(cap, M, y);
      y += 3;
      let w = maxW;
      let h = w * (img.naturalHeight / (img.naturalWidth || 1));
      if (h > maxH) {
        h = maxH;
        w = h * (img.naturalWidth / (img.naturalHeight || 1));
      }
      try {
        doc.addImage(img, "JPEG", M, y, w, h);
      } catch {
        /* image protégée (CORS) : ignorée pour ne pas bloquer la génération */
      }
      y += h + 8;
    });
  }

  doc.save(`adhesion-${app.id}.pdf`);
}
