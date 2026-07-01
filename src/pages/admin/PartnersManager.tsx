import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, X, Handshake, Image as ImageIcon, Upload } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Partner { id: string; name: string; type: string; desc: string; logo?: string; url?: string; order: number }
const TYPES = ["Tutelle", "Partenaire institutionnel", "Association professionnelle", "Partenaire", "Société membre"];
const empty = { id: "", name: "", type: "Partenaire", desc: "", logo: "", url: "", order: 0 };

export const PartnersManager = () => {
  const qc = useQueryClient();
  const [editing, setEditing] = useState<typeof empty | null>(null);
  const [uploading, setUploading] = useState(false);

  const uploadLogo = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("title", `Logo ${editing?.name || file.name}`);
      fd.append("category", "Logos partenaires");
      const m = await api<{ path: string }>("/media", { method: "POST", auth: true, isForm: true, body: fd });
      setEditing((e) => (e ? { ...e, logo: m.path } : e));
      toast.success("Logo téléversé.");
    } catch (e: any) {
      toast.error(e?.message || "Échec du téléversement.");
    } finally {
      setUploading(false);
    }
  };

  const { data: items = [], isLoading } = useQuery({ queryKey: ["partners"], queryFn: () => api<Partner[]>("/partners") });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["partners"] });

  const save = useMutation({
    mutationFn: (f: typeof empty) => {
      const body = { name: f.name, type: f.type, desc: f.desc, logo: f.logo, url: f.url, order: f.order };
      return f.id ? api(`/partners/${f.id}`, { method: "PUT", auth: true, body }) : api("/partners", { method: "POST", auth: true, body });
    },
    onSuccess: () => { invalidate(); setEditing(null); toast.success("Partenaire enregistré."); },
    onError: (e: any) => toast.error(e?.message || "Erreur."),
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/partners/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { invalidate(); toast.success("Partenaire supprimé."); },
    onError: (e: any) => toast.error(e?.message || "Erreur."),
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-start sm:items-center gap-4 flex-col sm:flex-row">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Partenaires & tutelles</h2>
          <p className="text-muted-foreground">Gérez les partenaires affichés sur le site.</p>
        </div>
        <Button onClick={() => setEditing({ ...empty })} className="rounded-full bg-primary text-white gap-2"><Plus className="h-5 w-5" /> Nouveau partenaire</Button>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0 divide-y divide-border/40">
          {isLoading && <div className="p-12 text-center text-muted-foreground italic">Chargement…</div>}
          {!isLoading && items.length === 0 && <div className="p-12 text-center text-muted-foreground italic">Aucun partenaire.</div>}
          {items.map((p) => (
            <div key={p.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-xl bg-secondary/40 text-primary flex items-center justify-center font-bold shrink-0 overflow-hidden border border-border/50">
                  {p.logo ? <img src={p.logo} alt="" className="h-full w-full object-contain p-1" /> : <Handshake className="h-5 w-5" />}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2"><span className="font-bold">{p.name}</span><Badge variant="secondary" className="text-[10px]">{p.type}</Badge></div>
                  <p className="text-sm text-muted-foreground line-clamp-1">{p.desc}</p>
                </div>
              </div>
              <div className="flex gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditing({ ...p, logo: p.logo || "", url: p.url || "" })}><Edit2 className="h-4 w-4" /></Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm(`Supprimer ${p.name} ?`)) del.mutate(p.id); }}><Trash2 className="h-4 w-4" /></Button>
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
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2"><Handshake className="h-5 w-5 text-primary" /> {editing.id ? "Modifier" : "Nouveau"} partenaire</CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditing(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto space-y-4">
              <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Nom</label><Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></div>
              <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Type</label>
                <div className="flex flex-wrap gap-2">{TYPES.map((t) => (<button key={t} type="button" onClick={() => setEditing({ ...editing, type: t })} className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-colors", editing.type === t ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground")}>{t}</button>))}</div>
              </div>
              <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Description</label><Textarea rows={3} value={editing.desc} onChange={(e) => setEditing({ ...editing, desc: e.target.value })} /></div>

              <div className="grid gap-3">
                <label className="text-xs font-bold text-muted-foreground uppercase">Logo / image</label>
                <div className="h-40 w-full rounded-xl border border-border bg-secondary/30 flex items-center justify-center overflow-hidden p-4">
                  {editing.logo ? (
                    <img src={editing.logo} alt="" className="h-full w-full object-contain" />
                  ) : (
                    <div className="flex flex-col items-center text-muted-foreground/40">
                      <ImageIcon className="h-10 w-10" />
                      <span className="text-[11px] mt-1">Aucun logo</span>
                    </div>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <label className={cn("inline-flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-bold cursor-pointer transition-colors shrink-0", uploading ? "bg-secondary text-muted-foreground" : "bg-primary/10 text-primary hover:bg-primary hover:text-white")}>
                    <Upload className="h-3.5 w-3.5" /> {uploading ? "Téléversement…" : "Téléverser"}
                    <input type="file" accept="image/*" disabled={uploading} className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadLogo(f); }} />
                  </label>
                  <Input value={editing.logo} onChange={(e) => setEditing({ ...editing, logo: e.target.value })} placeholder="ou coller une URL / un chemin" className="text-xs flex-1 min-w-[160px]" />
                </div>
              </div>

              <div className="grid gap-2"><label className="text-xs font-bold text-muted-foreground uppercase">Lien (optionnel)</label><Input value={editing.url} onChange={(e) => setEditing({ ...editing, url: e.target.value })} placeholder="https://…" /></div>
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

export default PartnersManager;
