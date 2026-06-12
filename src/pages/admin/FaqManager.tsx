import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, X, HelpCircle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface FaqItem {
  id: string;
  category: string;
  question: string;
  answer: string;
  order: number;
}

const CATEGORIES = ["Adhésion", "Épargne", "Crédit", "Immobilier", "E-MA2E"];
const emptyForm = { id: "", category: "Adhésion", question: "", answer: "", order: 0 };

export const FaqManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  const [filter, setFilter] = useState<string>("Toutes");

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["faq"],
    queryFn: () => api<FaqItem[]>("/faq"),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["faq"] });

  const saveMutation = useMutation({
    mutationFn: (f: typeof emptyForm) => {
      const body = { category: f.category, question: f.question, answer: f.answer, order: f.order };
      return f.id
        ? api(`/faq/${f.id}`, { method: "PUT", auth: true, body })
        : api("/faq", { method: "POST", auth: true, body });
    },
    onSuccess: () => { invalidate(); setEditing(null); toast.success("Question enregistrée."); },
    onError: (e: any) => toast.error(e?.message || "Enregistrement impossible."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/faq/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { invalidate(); toast.success("Question supprimée."); },
    onError: (e: any) => toast.error(e?.message || "Suppression impossible."),
  });

  const filtered = filter === "Toutes" ? items : items.filter((i) => i.category === filter);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Foire aux questions</h2>
          <p className="text-muted-foreground">Gérez les questions/réponses affichées sur le site.</p>
        </div>
        <Button onClick={() => setEditing({ ...emptyForm })} className="rounded-full bg-primary text-white gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> Nouvelle question
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {["Toutes", ...CATEGORIES].map((c) => (
          <button key={c} onClick={() => setFilter(c)}
            className={cn("px-4 py-1.5 rounded-full text-sm font-semibold transition-colors border",
              filter === c ? "bg-primary text-white border-primary" : "bg-card text-muted-foreground border-border hover:border-primary/40")}>
            {c}
          </button>
        ))}
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0 divide-y divide-border/40">
          {isLoading && <div className="p-12 text-center text-muted-foreground italic">Chargement…</div>}
          {!isLoading && filtered.length === 0 && <div className="p-12 text-center text-muted-foreground italic">Aucune question.</div>}
          {filtered.map((item) => (
            <div key={item.id} className="flex items-start justify-between p-4 hover:bg-secondary/10 transition-colors gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px]">{item.category}</Badge>
                </div>
                <div className="font-bold">{item.question}</div>
                <p className="text-sm text-muted-foreground line-clamp-2 mt-1">{item.answer}</p>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => setEditing({ ...item })}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Supprimer cette question ?")) deleteMutation.mutate(item.id); }}>
                  <Trash2 className="h-4 w-4" />
                </Button>
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
              <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-primary" /> {editing.id ? "Modifier" : "Nouvelle"} question
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditing(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto space-y-5">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Catégorie</label>
                <div className="flex flex-wrap gap-2">
                  {CATEGORIES.map((c) => (
                    <button key={c} type="button" onClick={() => setEditing({ ...editing, category: c })}
                      className={cn("px-3 py-1.5 rounded-full text-xs font-bold transition-colors",
                        editing.category === c ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground")}>
                      {c}
                    </button>
                  ))}
                </div>
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Question</label>
                <Input value={editing.question} onChange={(e) => setEditing({ ...editing, question: e.target.value })} placeholder="Saisissez la question…" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Réponse</label>
                <Textarea rows={5} value={editing.answer} onChange={(e) => setEditing({ ...editing, answer: e.target.value })} placeholder="Saisissez la réponse…" />
              </div>
            </CardContent>
            <div className="p-4 border-t bg-card shrink-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditing(null)} className="rounded-full px-6">Annuler</Button>
              <Button disabled={saveMutation.isPending} onClick={() => saveMutation.mutate(editing)} className="rounded-full px-8 bg-primary text-white">
                {saveMutation.isPending ? "Enregistrement…" : "Enregistrer"}
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};

export default FaqManager;
