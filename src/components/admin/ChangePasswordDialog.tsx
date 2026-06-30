import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

// Changement de son propre mot de passe (self-service) depuis le back-office.
export function ChangePasswordDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const reset = () => { setCurrent(""); setNext(""); setConfirm(""); };

  const submit = async () => {
    if (next.length < 6) { toast.error("Le nouveau mot de passe doit faire au moins 6 caractères."); return; }
    if (next !== confirm) { toast.error("La confirmation ne correspond pas au nouveau mot de passe."); return; }
    setLoading(true);
    try {
      await api("/auth/change-password", {
        method: "POST",
        auth: true,
        body: { currentPassword: current, newPassword: next },
      });
      toast.success("Mot de passe modifié.");
      reset();
      onOpenChange(false);
    } catch (e: any) {
      toast.error(e?.message || "Échec du changement de mot de passe.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <KeyRound className="h-5 w-5 text-primary" /> Changer le mot de passe
          </DialogTitle>
          <DialogDescription>
            Pour votre sécurité, saisissez votre mot de passe actuel puis le nouveau.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-2">
          <div className="space-y-1.5">
            <Label htmlFor="cp-current">Mot de passe actuel</Label>
            <Input id="cp-current" type="password" value={current} onChange={(e) => setCurrent(e.target.value)} autoComplete="current-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-new">Nouveau mot de passe</Label>
            <Input id="cp-new" type="password" value={next} onChange={(e) => setNext(e.target.value)} placeholder="6 caractères minimum" autoComplete="new-password" />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="cp-confirm">Confirmer le nouveau mot de passe</Label>
            <Input id="cp-confirm" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" />
          </div>
        </div>
        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">Annuler</Button>
          <Button onClick={submit} disabled={loading || !current || !next || !confirm} className="rounded-full bg-primary text-white">
            {loading ? "Modification…" : "Modifier"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
