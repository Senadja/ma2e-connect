import { useEffect, useState } from "react";
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
import { ShieldCheck, AlertTriangle, Copy, Download } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

interface MeResponse {
  backupCodesLeft: number;
  backupCodesCreatedAt: string | null;
}

// Codes de secours de la double authentification : ils permettent de se connecter
// quand le code par e-mail n'arrive pas (panne du serveur d'envoi, boîte inaccessible).
// Le serveur ne stocke que leurs empreintes : ils ne sont lisibles qu'à la génération.
export function BackupCodesDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (o: boolean) => void }) {
  const [left, setLeft] = useState<number | null>(null);
  const [createdAt, setCreatedAt] = useState<string | null>(null);
  const [password, setPassword] = useState("");
  const [codes, setCodes] = useState<string[] | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    api<MeResponse>("/auth/me", { auth: true })
      .then((r) => {
        setLeft(r.backupCodesLeft);
        setCreatedAt(r.backupCodesCreatedAt);
      })
      .catch(() => setLeft(null));
  }, [open]);

  const reset = () => {
    setPassword("");
    setCodes(null);
  };

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api<{ codes: string[] }>("/auth/backup-codes", {
        method: "POST",
        auth: true,
        body: { password },
      });
      setCodes(res.codes);
      setLeft(res.codes.length);
      setPassword("");
      toast.success("Nouveaux codes générés. Les anciens ne fonctionnent plus.");
    } catch (e: any) {
      toast.error(e?.message || "Échec de la génération des codes.");
    } finally {
      setLoading(false);
    }
  };

  const asText = () =>
    [
      "Codes de secours — back-office MA2E",
      `Générés le ${new Date().toLocaleString("fr-FR")}`,
      "",
      ...(codes || []),
      "",
      "Chaque code ne fonctionne qu'une seule fois.",
      "Conservez cette feuille en lieu sûr : ces codes remplacent le code reçu par e-mail.",
    ].join("\n");

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(asText());
      toast.success("Codes copiés dans le presse-papiers.");
    } catch {
      toast.error("Copie impossible. Utilisez le téléchargement.");
    }
  };

  const download = () => {
    const url = URL.createObjectURL(new Blob([asText()], { type: "text/plain;charset=utf-8" }));
    const a = document.createElement("a");
    a.href = url;
    a.download = "ma2e-codes-de-secours.txt";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(o) => {
        if (!o) reset();
        onOpenChange(o);
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5 text-primary" /> Codes de secours
          </DialogTitle>
          <DialogDescription>
            Ils vous connectent au back-office si le code par e-mail ne vous parvient pas.
          </DialogDescription>
        </DialogHeader>

        {codes ? (
          <div className="space-y-4 py-2">
            <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-3">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <p>
                Ces codes ne seront <strong>plus jamais affichés</strong>. Copiez-les ou
                téléchargez-les maintenant, puis imprimez-les et rangez-les en lieu sûr.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-2 rounded-lg border bg-muted/40 p-4 font-mono text-center text-sm tracking-widest">
              {codes.map((c) => (
                <span key={c}>{c}</span>
              ))}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1 rounded-full" onClick={copy}>
                <Copy className="mr-2 h-4 w-4" /> Copier
              </Button>
              <Button variant="outline" className="flex-1 rounded-full" onClick={download}>
                <Download className="mr-2 h-4 w-4" /> Télécharger
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-2">
            {left === 0 && (
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-3">
                <AlertTriangle className="h-5 w-5 shrink-0" />
                <p>
                  Aucun code de secours n'est actif. Si l'envoi d'e-mail tombe en panne, vous ne
                  pourrez plus vous connecter. Générez-les dès maintenant.
                </p>
              </div>
            )}
            {left !== null && left > 0 && (
              <p className="text-sm text-muted-foreground">
                Il vous reste <strong className="text-foreground">{left}</strong> code
                {left > 1 ? "s" : ""} de secours
                {createdAt && ` (générés le ${new Date(createdAt).toLocaleDateString("fr-FR")})`}.
                {left < 3 && " Pensez à en générer un nouveau jeu."}
              </p>
            )}
            <div className="space-y-1.5">
              <Label htmlFor="bc-password">Confirmez votre mot de passe</Label>
              <Input
                id="bc-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
              />
              <p className="text-xs text-muted-foreground">
                Générer un nouveau jeu de 8 codes annule immédiatement les précédents.
              </p>
            </div>
          </div>
        )}

        <DialogFooter className="gap-2 sm:gap-0">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-full">
            {codes ? "J'ai conservé mes codes" : "Annuler"}
          </Button>
          {!codes && (
            <Button
              onClick={generate}
              disabled={loading || !password}
              className="rounded-full bg-primary text-white"
            >
              {loading ? "Génération…" : left ? "Régénérer les codes" : "Générer les codes"}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
