import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit2, Trash2, X, ShieldCheck, UserPlus, Mail, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface User {
  id: string;
  email: string;
  name: string;
  role: "USER" | "EDITOR" | "ADMIN";
  permissions: string[];
  createdAt: string;
}
interface Meta {
  permissions: string[];
  profiles: Record<string, { label: string; permissions: string[] }>;
}

const PERM_LABELS: Record<string, string> = {
  "news:write": "Actualités",
  "products:write": "Produits & services",
  "faq:write": "FAQ",
  "media:write": "Médiathèque",
  "applications:manage": "Demandes",
  "settings:write": "Paramètres",
  "users:manage": "Utilisateurs",
  "partners:write": "Partenaires",
  "team:write": "Équipe",
  "contact:manage": "Messages de contact",
};

const emptyForm = { id: "", email: "", name: "", password: "", role: "EDITOR" as User["role"], permissions: [] as string[] };

export const UsersManager = () => {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<typeof emptyForm | null>(null);
  // E-mail d'origine du compte en cours d'édition : sert à n'avertir que si l'adresse change.
  const [originalEmail, setOriginalEmail] = useState("");

  const { data: users = [], isLoading } = useQuery({
    queryKey: ["users"],
    queryFn: () => api<User[]>("/users", { auth: true }),
  });
  const { data: meta } = useQuery({
    queryKey: ["users", "meta"],
    queryFn: () => api<Meta>("/users/meta", { auth: true }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["users"] });

  const saveMutation = useMutation({
    mutationFn: (f: typeof emptyForm) => {
      const body: Record<string, unknown> = { name: f.name, role: f.role, permissions: f.permissions };
      if (f.password) body.password = f.password;
      if (f.id) {
        // On n'envoie l'e-mail que s'il a réellement changé (évite un contrôle d'unicité inutile).
        if (f.email !== originalEmail) body.email = f.email;
        return api(`/users/${f.id}`, { method: "PUT", auth: true, body });
      }
      return api("/users", { method: "POST", auth: true, body: { ...body, email: f.email, password: f.password } });
    },
    onSuccess: () => { invalidate(); setEditing(null); toast.success("Utilisateur enregistré."); },
    onError: (e: any) => toast.error(e?.message || "Enregistrement impossible."),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/users/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { invalidate(); toast.success("Utilisateur supprimé."); },
    onError: (e: any) => toast.error(e?.message || "Suppression impossible."),
  });

  const openEditor = (form: typeof emptyForm) => {
    setOriginalEmail(form.email);
    setEditing(form);
  };

  const applyProfile = (key: string) => {
    if (!meta || !editing) return;
    const p = meta.profiles[key];
    if (!p) return;
    setEditing({ ...editing, permissions: [...p.permissions], role: key === "admin" ? "ADMIN" : "EDITOR" });
  };

  const togglePerm = (perm: string) => {
    if (!editing) return;
    const has = editing.permissions.includes(perm);
    setEditing({
      ...editing,
      permissions: has ? editing.permissions.filter((x) => x !== perm) : [...editing.permissions, perm],
    });
  };

  const emailChanged = !!editing?.id && editing.email !== originalEmail;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Utilisateurs & rôles</h2>
          <p className="text-muted-foreground">Gérez les comptes du back-office et leurs droits d'accès.</p>
        </div>
        <Button onClick={() => openEditor({ ...emptyForm })} className="rounded-full bg-primary text-white gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> Nouvel utilisateur
        </Button>
      </div>

      <Card className="border-border/40 shadow-sm">
        <CardContent className="p-0 divide-y divide-border/40">
          {isLoading && <div className="p-12 text-center text-muted-foreground italic">Chargement…</div>}
          {users.map((u) => (
            <div key={u.id} className="flex items-center justify-between p-4 hover:bg-secondary/10 transition-colors gap-4">
              <div className="flex items-center gap-4 min-w-0">
                <div className="h-11 w-11 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold shrink-0">
                  {u.name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <div className="font-bold truncate">{u.name}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5"><Mail className="h-3 w-3" /> {u.email}</div>
                </div>
              </div>
              <div className="hidden md:flex flex-wrap gap-1 justify-end max-w-sm">
                {u.role === "ADMIN" ? (
                  <Badge className="bg-primary text-white border-none gap-1"><ShieldCheck className="h-3 w-3" /> Administrateur</Badge>
                ) : (
                  u.permissions.map((p) => (
                    <Badge key={p} variant="secondary" className="text-[10px]">{PERM_LABELS[p] || p}</Badge>
                  ))
                )}
                {u.role !== "ADMIN" && u.permissions.length === 0 && (
                  <span className="text-xs text-muted-foreground italic">Aucun droit</span>
                )}
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <Button variant="ghost" size="icon" className="h-9 w-9" onClick={() => openEditor({ id: u.id, email: u.email, name: u.name, password: "", role: u.role, permissions: [...u.permissions] })}>
                  <Edit2 className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-9 w-9 text-destructive hover:bg-destructive/10" onClick={() => { if (confirm(`Supprimer ${u.name} ?`)) deleteMutation.mutate(u.id); }}>
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
                <UserPlus className="h-5 w-5 text-primary" /> {editing.id ? "Modifier" : "Nouvel"} utilisateur
              </CardTitle>
              <Button variant="ghost" size="icon" onClick={() => setEditing(null)} className="rounded-full"><X className="h-5 w-5" /></Button>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto space-y-5">
              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Nom complet</label>
                <Input value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} placeholder="Jean Dupont" />
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Email</label>
                <Input type="email" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} placeholder="nom@ma2e.ci" />
                {emailChanged && (
                  <div className="flex gap-2 rounded-lg bg-amber-500/10 border border-amber-500/30 p-2.5 text-[11px] text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5" />
                    <span>
                      Cet e-mail sert d'identifiant de connexion <b>et</b> reçoit le code à 6&nbsp;chiffres.
                      Après ce changement, la personne devra se connecter avec la nouvelle adresse, où arrivera le code.
                    </span>
                  </div>
                )}
              </div>
              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">{editing.id ? "Nouveau mot de passe (optionnel)" : "Mot de passe"}</label>
                <Input type="password" value={editing.password} onChange={(e) => setEditing({ ...editing, password: e.target.value })} placeholder="6 caractères minimum" />
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Profil prédéfini</label>
                <div className="flex flex-wrap gap-2">
                  {meta && Object.entries(meta.profiles).map(([key, p]) => (
                    <button key={key} type="button" onClick={() => applyProfile(key)}
                      className="px-3 py-1.5 rounded-full text-xs font-bold bg-secondary/50 hover:bg-primary hover:text-white transition-colors">
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Droits d'accès</label>
                <div className="grid sm:grid-cols-2 gap-2">
                  {meta?.permissions.map((perm) => {
                    const active = editing.role === "ADMIN" || editing.permissions.includes(perm);
                    return (
                      <button key={perm} type="button" onClick={() => togglePerm(perm)} disabled={editing.role === "ADMIN"}
                        className={cn("flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-all border",
                          active ? "bg-primary/10 border-primary/30 text-primary font-semibold" : "bg-secondary/30 border-transparent text-muted-foreground")}>
                        {PERM_LABELS[perm] || perm}
                        {active && <ShieldCheck className="h-4 w-4" />}
                      </button>
                    );
                  })}
                </div>
                {editing.role === "ADMIN" && <p className="text-[11px] text-muted-foreground">Un administrateur dispose de tous les droits.</p>}
              </div>

              <div className="grid gap-2">
                <label className="text-xs font-bold text-muted-foreground uppercase">Rôle</label>
                <div className="flex gap-2">
                  {(["EDITOR", "ADMIN"] as const).map((r) => (
                    <button key={r} type="button" onClick={() => setEditing({ ...editing, role: r })}
                      className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all",
                        editing.role === r ? "bg-primary text-white" : "bg-secondary/40 text-muted-foreground")}>
                      {r === "ADMIN" ? "Administrateur" : "Éditeur"}
                    </button>
                  ))}
                </div>
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

export default UsersManager;
