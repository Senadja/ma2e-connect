import { type OrgNode } from "@/lib/content";

// Organigramme responsive (jamais de débordement horizontal) :
//  - racine + organes en grille qui s'empile sur mobile ;
//  - les structures rattachées (ex. Direction Générale sous le Conseil d'Administration)
//    sont rendues en arbre vertical indenté → lisible à toute largeur.
// Le même composant est utilisé sur la page À propos ET en aperçu au back-office,
// pour que le BO corresponde exactement au front.

type Variant = "root" | "organ" | "lead" | "node" | "leaf";

const CARD: Record<Variant, string> = {
  root: "inline-block rounded-2xl bg-gradient-primary text-primary-foreground px-7 py-5 shadow-elegant",
  organ:
    "block h-full rounded-xl bg-card border-2 border-primary/20 px-4 py-3 shadow-sm text-center transition-all hover:-translate-y-0.5 hover:shadow-elegant",
  lead: "inline-block rounded-xl bg-card border-2 border-primary/30 px-5 py-3 shadow-sm",
  node: "inline-block rounded-xl bg-card border border-border px-4 py-2.5 shadow-sm transition-colors hover:border-primary/40",
  leaf: "inline-block rounded-lg bg-card border border-border px-3 py-2 shadow-sm transition-colors hover:border-primary/40",
};

const Card = ({ node, variant }: { node: OrgNode; variant: Variant }) => {
  const nameCls =
    variant === "root"
      ? "font-display text-lg md:text-xl font-bold"
      : variant === "leaf"
      ? "text-sm font-semibold"
      : "font-display font-bold text-sm md:text-base";
  const roleCls = variant === "root" ? "text-xs text-white/70 mt-0.5" : "text-[11px] text-muted-foreground mt-0.5";
  return (
    <div className={CARD[variant]}>
      <div className={`${nameCls} break-words`}>{node.name}</div>
      {node.role && <div className={`${roleCls} break-words`}>{node.role}</div>}
    </div>
  );
};

// Branche verticale indentée (récursive).
const VBranch = ({ node, depth }: { node: OrgNode; depth: number }) => {
  const variant: Variant = depth === 0 ? "lead" : depth === 1 ? "node" : "leaf";
  return (
    <li className="org-li">
      <Card node={node} variant={variant} />
      {node.children?.length ? (
        <ul className="org-v">
          {node.children.map((c, i) => (
            <VBranch key={`${c.name}-${i}`} node={c} depth={depth + 1} />
          ))}
        </ul>
      ) : null}
    </li>
  );
};

export const OrgChartView = ({ root }: { root: OrgNode }) => {
  const organs = root.children ?? [];
  const withSub = organs.filter((o) => o.children?.length);
  return (
    <div className="w-full">
      {/* Racine */}
      <div className="flex justify-center">
        <Card node={root} variant="root" />
      </div>
      <div className="mx-auto h-6 w-0.5 bg-border" aria-hidden />
      {/* Organes : grille responsive (1 → 2 → 4 colonnes) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        {organs.map((o, i) => (
          <Card key={`${o.name}-${i}`} node={o} variant="organ" />
        ))}
      </div>
      {/* Sous-structures rattachées (ex. DG sous le Conseil d'Administration) */}
      {withSub.map((o, i) => (
        <div key={`sub-${i}`} className="mt-10">
          <p className="mb-3 text-xs font-mono uppercase tracking-wider text-muted-foreground break-words">
            Rattaché au « {o.name} »
          </p>
          <ul className="org-root">
            {o.children!.map((c, j) => (
              <VBranch key={`${c.name}-${j}`} node={c} depth={0} />
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};
