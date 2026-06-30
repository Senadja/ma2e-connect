// Organigramme officiel MA2E (MAJ 22/05/2026) — reproduit la disposition du document officiel
// en SVG vectoriel : net à toute taille, responsive (scale via viewBox, aucun débordement),
// sans la cartouche de validation interne. Utilisé sur la page À propos ET en aperçu au back-office.

type Kind = "root" | "organ" | "lead" | "node" | "leaf";
type Box = { x: number; y: number; w: number; h: number; lines: string[]; role?: string; kind: Kind };

const VW = 1000;
const VH = 680;

const B: Record<string, Box> = {
  ag: { x: 400, y: 14, w: 200, h: 46, lines: ["ASSEMBLÉE GÉNÉRALE"], kind: "root" },

  ethique: { x: 8, y: 116, w: 218, h: 58, lines: ["Comité d'Éthique", "et de Déontologie"], kind: "organ" },
  ca: { x: 250, y: 116, w: 205, h: 58, lines: ["Conseil", "d'Administration"], kind: "organ" },
  credit: { x: 490, y: 116, w: 180, h: 58, lines: ["Comité de Crédit"], kind: "organ" },
  surv: { x: 705, y: 116, w: 205, h: 58, lines: ["Conseil de", "Surveillance"], kind: "organ" },

  dg: { x: 262, y: 212, w: 182, h: 54, lines: ["Directeur Général"], role: "GOUEDAN Franck Olivier", kind: "lead" },
  staff: { x: 8, y: 218, w: 168, h: 44, lines: ["Staff DG (2)"], kind: "node" },

  rai: { x: 735, y: 208, w: 257, h: 58, lines: ["Responsable Audit", "Interne et QSE"], role: "KOISSI Aya Philomène", kind: "node" },
  rsi: { x: 735, y: 280, w: 257, h: 58, lines: ["Responsable des Systèmes", "d'Information"], role: "TOURE Adama", kind: "node" },
  ci: { x: 735, y: 352, w: 257, h: 52, lines: ["Contrôleur Interne"], role: "DJEDJERO Natacha", kind: "node" },

  dagf: { x: 242, y: 306, w: 222, h: 56, lines: ["Directeur Administration", "Gestion Finance"], role: "KONE Madoussou épse Sombo", kind: "lead" },

  chauffeur: { x: 8, y: 446, w: 168, h: 48, lines: ["Chauffeur"], role: "KONAN François L.", kind: "leaf" },
  exploit: { x: 196, y: 442, w: 196, h: 54, lines: ["Responsable Exploitation"], role: "AKPOUE A. Rosabelle", kind: "node" },
  financier: { x: 420, y: 442, w: 196, h: 54, lines: ["Responsable Financier"], role: "TRAORE Ismaël", kind: "node" },
  administratif: { x: 644, y: 442, w: 205, h: 54, lines: ["Responsable Administratif"], role: "N'ZI Obodji Micheline", kind: "node" },

  gestionnaires: { x: 196, y: 536, w: 196, h: 46, lines: ["Gestionnaires de Crédits (4)"], kind: "leaf" },
  comptable: { x: 420, y: 536, w: 196, h: 50, lines: ["Comptable"], role: "GOUA Jean Moïse", kind: "leaf" },
  caissiere: { x: 420, y: 610, w: 196, h: 48, lines: ["Caissière"], role: "BONOUMAN E. M. Esther", kind: "leaf" },
  coursier: { x: 644, y: 536, w: 205, h: 48, lines: ["Chauffeur-coursier"], role: "KONE Siriki", kind: "leaf" },
};

const cx = (b: Box) => b.x + b.w / 2;
const top = (b: Box) => b.y;
const bottom = (b: Box) => b.y + b.h;
const mid = (b: Box) => b.y + b.h / 2;

const STROKE = "#5b7a96";

// Connecteur « parent -> liste d'enfants » (descente, barre horizontale, montées).
const busDown = (parent: Box, children: Box[], busY: number, key: string) => {
  const xs = children.map(cx);
  const elems = [
    <line key={`${key}-d`} x1={cx(parent)} y1={bottom(parent)} x2={cx(parent)} y2={busY} stroke={STROKE} strokeWidth={1.6} />,
    <line key={`${key}-h`} x1={Math.min(...xs)} y1={busY} x2={Math.max(...xs)} y2={busY} stroke={STROKE} strokeWidth={1.6} />,
    ...children.map((c, i) => (
      <line key={`${key}-u${i}`} x1={cx(c)} y1={busY} x2={cx(c)} y2={top(c)} stroke={STROKE} strokeWidth={1.6} />
    )),
  ];
  return elems;
};

const vline = (a: Box, b: Box, key: string) => (
  <line key={key} x1={cx(a)} y1={bottom(a)} x2={cx(b)} y2={top(b)} stroke={STROKE} strokeWidth={1.6} />
);

const FILL: Record<Kind, string> = {
  root: "#15803d",
  organ: "#d6e7f6",
  lead: "#c3dcef",
  node: "#e7f1fb",
  leaf: "#eef5fb",
};
const BORDER: Record<Kind, string> = {
  root: "#0f5c2e",
  organ: "#2b6ca3",
  lead: "#2b6ca3",
  node: "#6b9ec9",
  leaf: "#8fb4d6",
};

const BoxNode = ({ b }: { b: Box }) => {
  const nameSize = b.kind === "root" ? 15 : b.kind === "leaf" ? 11.5 : 12.5;
  const lineH = nameSize + 2;
  const roleH = b.role ? 12 : 0;
  const blockH = b.lines.length * lineH + roleH;
  const startY = b.y + (b.h - blockH) / 2 + nameSize; // baseline 1re ligne
  const tcolor = b.kind === "root" ? "#ffffff" : "#0f2740";
  return (
    <g>
      <rect
        x={b.x}
        y={b.y}
        width={b.w}
        height={b.h}
        rx={8}
        fill={FILL[b.kind]}
        stroke={BORDER[b.kind]}
        strokeWidth={b.kind === "root" ? 1.4 : 1.2}
      />
      {b.lines.map((ln, i) => (
        <text
          key={i}
          x={cx(b)}
          y={startY + i * lineH}
          textAnchor="middle"
          fontSize={nameSize}
          fontWeight={700}
          fill={tcolor}
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {ln}
        </text>
      ))}
      {b.role && (
        <text
          x={cx(b)}
          y={startY + b.lines.length * lineH + 1}
          textAnchor="middle"
          fontSize={9.5}
          fill={b.kind === "root" ? "#e6f5ec" : "#5b6b7d"}
          fontFamily="Arial, Helvetica, sans-serif"
        >
          {b.role}
        </text>
      )}
    </g>
  );
};

export const OrgChartSvg = () => {
  const organs = [B.ethique, B.ca, B.credit, B.surv];
  const dagfChildren = [B.chauffeur, B.exploit, B.financier, B.administratif];
  return (
    <svg
      viewBox={`0 0 ${VW} ${VH}`}
      className="h-auto w-full"
      preserveAspectRatio="xMidYMid meet"
      role="img"
      aria-label="Organigramme officiel de la MA2E : Assemblée Générale, organes (Comité d'Éthique, Conseil d'Administration, Comité de Crédit, Conseil de Surveillance), Direction Générale et services."
    >
      {/* ---- Connecteurs ---- */}
      {busDown(B.ag, organs, 92, "ag")}
      {vline(B.ca, B.dg, "ca-dg")}
      {/* DG -> Staff DG (gauche) */}
      <line x1={B.dg.x} y1={mid(B.dg)} x2={B.staff.x + B.staff.w} y2={mid(B.dg)} stroke={STROKE} strokeWidth={1.6} />
      {/* DG -> colonne droite (RAI / RSI / CI) */}
      <line x1={B.dg.x + B.dg.w} y1={mid(B.dg)} x2={715} y2={mid(B.dg)} stroke={STROKE} strokeWidth={1.6} />
      <line x1={715} y1={mid(B.dg)} x2={715} y2={mid(B.ci)} stroke={STROKE} strokeWidth={1.6} />
      {[B.rai, B.rsi, B.ci].map((c, i) => (
        <line key={`rc-${i}`} x1={715} y1={mid(c)} x2={c.x} y2={mid(c)} stroke={STROKE} strokeWidth={1.6} />
      ))}
      {/* Conseil de Surveillance -> Responsable Audit (lien fonctionnel, pointillé) */}
      <path
        d={`M ${cx(B.surv)} ${bottom(B.surv)} V 194 H ${cx(B.rai)} V ${top(B.rai)}`}
        fill="none"
        stroke={STROKE}
        strokeWidth={1.4}
        strokeDasharray="4 3"
        markerEnd="url(#org-arrow)"
      />
      {/* DG -> DAGF */}
      {vline(B.dg, B.dagf, "dg-dagf")}
      {/* DAGF -> 4 services */}
      {busDown(B.dagf, dagfChildren, 418, "dagf")}
      {/* sous-services */}
      {vline(B.exploit, B.gestionnaires, "ex-ges")}
      {vline(B.financier, B.comptable, "fi-comp")}
      {vline(B.comptable, B.caissiere, "comp-cais")}
      {vline(B.administratif, B.coursier, "adm-cours")}

      <defs>
        <marker id="org-arrow" markerWidth="7" markerHeight="7" refX="5" refY="3" orient="auto">
          <path d="M0,0 L6,3 L0,6 Z" fill={STROKE} />
        </marker>
      </defs>

      {/* ---- Boîtes ---- */}
      {Object.keys(B).map((k) => (
        <BoxNode key={k} b={B[k]} />
      ))}
    </svg>
  );
};
