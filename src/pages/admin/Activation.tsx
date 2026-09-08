import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { Loader2, KeyRound, ShieldCheck } from "lucide-react";
import { PASSWORD_RULE_TEXT, validatePasswordClient } from "@/lib/passwordPolicy";

// Page d'atterrissage du lien d'invitation / réinitialisation : l'utilisateur y définit
// lui-même son mot de passe. Le lien porte l'identifiant (uid) et le jeton à usage unique.
const Activation = () => {
  const [params] = useSearchParams();
  const uid = params.get("uid") ?? "";
  const token = params.get("token") ?? "";
  const navigate = useNavigate();
  const { setPassword } = useAuth();

  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const linkInvalid = !uid || !token;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const complexityError = validatePasswordClient(next);
    if (complexityError) return toast.error(complexityError);
    if (next !== confirm) return toast.error("La confirmation ne correspond pas au mot de passe.");
    setLoading(true);
    try {
      await setPassword(uid, token, next);
      toast.success("Mot de passe défini. Bienvenue sur le back-office MA2E.");
      navigate("/admin/dashboard");
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "Lien invalide ou expiré.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="mb-8 flex justify-center scale-125">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-elegant border-border/40">
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <KeyRound className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-display font-bold">Définir votre mot de passe</CardTitle>
          <CardDescription>
            Choisissez le mot de passe qui protégera votre accès au back-office MA2E.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          {linkInvalid ? (
            <div className="rounded-lg bg-destructive/10 border border-destructive/30 p-3 text-sm text-destructive">
              Ce lien est incomplet ou invalide. Demandez une nouvelle invitation à votre administrateur.
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-2">
                <Label htmlFor="new">Nouveau mot de passe</Label>
                <Input
                  id="new"
                  type="password"
                  value={next}
                  onChange={(e) => setNext(e.target.value)}
                  autoComplete="new-password"
                  autoFocus
                  required
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirmer le mot de passe</Label>
                <Input
                  id="confirm"
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  autoComplete="new-password"
                  required
                />
              </div>
              <div className="flex gap-2 rounded-lg bg-secondary/40 p-3 text-xs text-muted-foreground">
                <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5 text-primary" />
                <span>{PASSWORD_RULE_TEXT}</span>
              </div>
              <Button
                type="submit"
                className="w-full rounded-full font-bold bg-primary text-white hover:bg-primary/90"
                disabled={loading || !next || !confirm}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Enregistrement...
                  </>
                ) : (
                  "Définir mon mot de passe"
                )}
              </Button>
            </form>
          )}
        </CardContent>
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground w-full">
            © {new Date().getFullYear()} MA2E — Équipe IT
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Activation;
