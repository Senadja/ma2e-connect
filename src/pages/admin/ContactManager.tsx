import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Mail, Trash2, Phone, Reply, Check } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface Message {
  id: string; name: string; email: string; phone?: string; subject?: string;
  message: string; read: boolean; createdAt: string;
}

export const ContactManager = () => {
  const qc = useQueryClient();
  const [selected, setSelected] = useState<Message | null>(null);

  const { data: messages = [], isLoading } = useQuery({
    queryKey: ["contact"],
    queryFn: () => api<Message[]>("/contact", { auth: true }),
  });
  const invalidate = () => qc.invalidateQueries({ queryKey: ["contact"] });

  const markRead = useMutation({
    mutationFn: ({ id, read }: { id: string; read: boolean }) => api(`/contact/${id}`, { method: "PATCH", auth: true, body: { read } }),
    onSuccess: () => invalidate(),
  });
  const del = useMutation({
    mutationFn: (id: string) => api(`/contact/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { invalidate(); setSelected(null); toast.success("Message supprimé."); },
  });

  const open = (m: Message) => { setSelected(m); if (!m.read) markRead.mutate({ id: m.id, read: true }); };
  const unread = messages.filter((m) => !m.read).length;

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h2 className="text-3xl font-display font-bold text-primary-dark flex items-center gap-3">
          Messages de contact
          {unread > 0 && <Badge className="bg-primary text-white">{unread} non lu{unread > 1 ? "s" : ""}</Badge>}
        </h2>
        <p className="text-muted-foreground">Messages reçus via le formulaire de contact du site.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="border-border/40 shadow-sm">
          <CardContent className="p-0 divide-y divide-border/40 max-h-[70vh] overflow-y-auto">
            {isLoading && <div className="p-12 text-center text-muted-foreground italic">Chargement…</div>}
            {!isLoading && messages.length === 0 && <div className="p-12 text-center text-muted-foreground italic">Aucun message.</div>}
            {messages.map((m) => (
              <button key={m.id} onClick={() => open(m)} className={cn("w-full text-left p-4 hover:bg-secondary/10 transition-colors flex gap-3 items-start", selected?.id === m.id && "bg-primary/5 border-l-4 border-l-primary", !m.read && "bg-accent/5")}>
                <div className={cn("h-2 w-2 rounded-full mt-2 shrink-0", m.read ? "bg-transparent" : "bg-primary")} />
                <div className="min-w-0 flex-1">
                  <div className="flex justify-between gap-2">
                    <span className={cn("truncate", m.read ? "font-medium" : "font-bold")}>{m.name}</span>
                    <span className="text-[10px] text-muted-foreground shrink-0">{new Date(m.createdAt).toLocaleDateString("fr-FR")}</span>
                  </div>
                  <div className="text-xs text-muted-foreground truncate">{m.subject || "—"} · {m.email}</div>
                  <div className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{m.message}</div>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        <div>
          {selected ? (
            <Card className="border-border/40 shadow-md sticky top-24">
              <CardContent className="p-6 space-y-5">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-display text-xl font-bold">{selected.name}</div>
                    <div className="text-sm text-muted-foreground">{selected.subject || "Message de contact"}</div>
                  </div>
                  <Button variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => { if (confirm("Supprimer ce message ?")) del.mutate(selected.id); }}><Trash2 className="h-4 w-4" /></Button>
                </div>
                <div className="flex flex-wrap gap-3 text-sm">
                  <a href={`mailto:${selected.email}`} className="inline-flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2 hover:text-primary"><Mail className="h-4 w-4" /> {selected.email}</a>
                  {selected.phone && <a href={`tel:${selected.phone}`} className="inline-flex items-center gap-2 rounded-lg bg-secondary/40 px-3 py-2 hover:text-primary"><Phone className="h-4 w-4" /> {selected.phone}</a>}
                </div>
                <div className="rounded-xl bg-secondary/20 border border-border/50 p-4 text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</div>
                <div className="flex gap-3">
                  <Button asChild className="rounded-full gap-2"><a href={`mailto:${selected.email}?subject=Re: ${encodeURIComponent(selected.subject || "Votre message")}`}><Reply className="h-4 w-4" /> Répondre par e-mail</a></Button>
                  <Button variant="outline" className="rounded-full gap-2" onClick={() => markRead.mutate({ id: selected.id, read: !selected.read })}><Check className="h-4 w-4" /> Marquer {selected.read ? "non lu" : "lu"}</Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="border-border/40 border-dashed bg-secondary/5 flex flex-col items-center justify-center p-12 text-center min-h-[300px]">
              <Mail className="h-12 w-12 text-primary/20 mb-4" />
              <p className="text-muted-foreground">Sélectionnez un message pour le lire.</p>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactManager;
