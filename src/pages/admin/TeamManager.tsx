import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, X, Users } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Member { id: string; name: string; role: string; initials: string; category: string; order: number }
const CATEGORIES = ["Gouvernance", "Direction"];
const empty = { id: "", name: "", role: "", initials: "", category: "Gouvernance", order: 0 };

export const TeamManager = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);

  const { data: items = [], isLoading } = useQuery({ queryKey: ["team"], queryFn: () => api<Member[]>("/team") });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["team"] });

  const save = useMutation({
    mutationFn: (f: typeof empty) => {
      const body = { name: f.name, role: f.role, initials: f.initials, category: f.category, order: f.order };
      return f.id ? api(`/team/${f.id}`, { method: "PUT", auth: true, body }) : api("/team", { method: "POST", auth: true, body });
    },
    onSuccess: () => { invalidate(); setEditing(null); toast.success("Enregistré."); },
    onError: (e: any) => toast.error(e?.message || "Erreur."),
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/team/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { invalidate(); toast.success("Supprimé."); },
    onError: (e: any) => toast.error(e?.message || "Erreur."),
  });

  const autoInitials = (name: string) => name.split(" ").map((w) => w[0]).filter(Boolean).slice(0, 3).join("").toUpperCase();

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start sm:items-center gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Équipe & gouvernance</h2>
          <p className="text-muted-foreground">Gérez les organes et l'équipe dirigeante affichés sur « À propos ».</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="rounded-full bg-primary text-white gap-2"><Plus className="h-5 w-5" /> Nouveau</Button>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0 divide-y divide-border/40">
          {isLoading && <div className="p-12 text-center text-muted-foreground italic">Chargement…</div>}
          {!isLoading && items.length === 0 && <div className="p-12 text-center text-muted-foreground italic">Aucun élément.</div>}
          {items.map((m) => (
            <div key={m.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-full bg-gradient-primary text-white flex items-center justify-center font-bold shrink-0">{m.initials}</div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="font-bold">{m.name}</span><Badge variant="secondary" className="text-[10px]">{m.category}</Badge></div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{m.role}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditing({ ...m })}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm(`Supprimer ${m.name} ?`)) del.mutate(m.id); }}><Trash2 className="h-4 w-4" /></Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-primary-dark/80 backdrop-blur-sm" onClick={() => setEditing(null)} />
          <Card className="w-full max-w-lg bg-card relative z-10 shadow-2xl rounded-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <CardHeader className="border-b bg-secondary/30 pb-4 shrink-0 flex flex-row items-center justify-between">
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2"><Users className="h-5 w-5 text-primary" /> {editing.id ? "Modifier" : "Nouveau"}</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditing(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto space-y-4">
              <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Nom / Organe</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value, initials: editing.initials || autoInitials(e.target.value) })} /></div>
              <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Rôle / Description</label><Input value={editing.role} onChange={(e) => setEditing({ ...editing, role: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Initiales (avatar)</label><Input maxLength={4} value={editing.initials} onChange={(e) => setEditing({ ...editing, initials: e.target.value.toUpperCase() })} /></div>
                <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Catégorie</label>
                  <div className="flex gap-2">{CATEGORIES.map((c) => (<button key={c} type="button" onClick={() => setEditing({ ...editing, category: c })} className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-colors", editing.category === c ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground")}>{c}</button>))}</div>
                </div>
              </div>
            </CardContent>
            <div className="p-4 border-t bg-card shrink-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full px-6">Annuler</Button>
              <Button disabled={save.isPending} onClick={() => save.mutate(editing)} className="rounded-full px-8 bg-primary text-white">{save.isPending ? "…" : "Enregistrer"}</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default TeamManager;
