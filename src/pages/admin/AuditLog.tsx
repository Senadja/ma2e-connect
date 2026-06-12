import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { History } from "lucide-react";
import { cn } from "@/lib/utils";

interface Log { id: string; userEmail: string; userName?: string; method: string; path: string; status: number; createdAt: string }

const METHOD_COLOR: Record<string, string> = {
  POST: "bg-emerald-100 text-emerald-700",
  PUT: "bg-blue-100 text-blue-700",
  PATCH: "bg-amber-100 text-amber-700",
  DELETE: "bg-rose-100 text-rose-700",
};

// Traduit un chemin d'API en libellé lisible.
const label = (path: string) => {
  const seg = path.replace(/^\/api\//, "").split("/")[0];
  const map: Record<string, string> = {
    articles: "Actualités", products: "Produits", faq: "FAQ", media: "Médiathèque",
    applications: "Demandes", settings: "Paramètres", users: "Utilisateurs",
    partners: "Partenaires", team: "Équipe", contact: "Contact", auth: "Authentification",
  };
  return map[seg] || seg;
};

export const AuditLog = () => {
  const { data: logs = [], isLoading } = useQuery({
    queryKey: ["audit"],
    queryFn: () => api<Log[]>("/audit", { auth: true }),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary-dark flex items-center gap-3"><History className="h-7 w-7 text-primary" /> Journal d'activité</h2>
        <p className="text-muted-foreground">Trace des actions de gestion (création, modification, suppression).</p>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0 divide-y divide-border/40">
          {isLoading && <div className="p-12 text-center text-muted-foreground italic">Chargement…</div>}
          {!isLoading && logs.length === 0 && <div className="p-12 text-center text-muted-foreground italic">Aucune action enregistrée.</div>}
          {logs.map((l) => (
            <div key={l.id} className="flex items-center justify-between p-4 gap-4 hover:bg-secondary/10">
              <div className="flex items-center gap-3 min-w-0">
                <Badge className={cn("border-none font-mono text-[10px] w-16 justify-center", METHOD_COLOR[l.method] || "bg-secondary")}>{l.method}</Badge>
                <div className="min-w-0">
                  <div className="font-semibold text-sm">{label(l.path)} <span className="text-muted-foreground font-normal">— {l.path}</span></div>
                  <div className="text-xs text-muted-foreground">{l.userName || l.userEmail}</div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground shrink-0 text-right">
                {new Date(l.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
};

export default AuditLog;
