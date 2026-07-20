import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth, type LoginChallenge } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { ShieldAlert, Loader2, MailCheck, ArrowLeft, KeyRound } from "lucide-react";

const RESEND_COOLDOWN = 60;

function formatDelay(seconds: number) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // Étape 2 : vérification du code envoyé par e-mail.
  const [challenge, setChallenge] = useState<LoginChallenge | null>(null);
  const [code, setCode] = useState("");
  const [backupCode, setBackupCode] = useState("");
  const [useBackup, setUseBackup] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(0);
  const [resendIn, setResendIn] = useState(0);

  const { login, verifyCode, resendCode } = useAuth();
  const navigate = useNavigate();

  // Un seul intervalle pour les deux comptes à rebours : validité du code et
  // délai avant de pouvoir en redemander un.
  useEffect(() => {
    if (!challenge) return;
    const timer = setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
      setResendIn((s) => (s > 0 ? s - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [challenge]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const next = await login(email, password);
      // next === null : la double authentification est désactivée côté serveur.
      if (!next) {
        toast.success("Bienvenue sur le back-office MA2E");
        navigate("/admin/dashboard");
        return;
      }
      setChallenge(next);
      setSecondsLeft(next.expiresIn);
      setResendIn(RESEND_COOLDOWN);
      if (!next.emailSent) {
        setUseBackup(true);
        toast.error("L'envoi du code a échoué. Utilisez un code de secours.");
      }
    } catch (error: any) {
      toast.error(error.message || "Échec de l'authentification");
    } finally {
      setLoading(false);
    }
  };

  const submitCode = async (value: string) => {
    if (!challenge || loading) return;
    setLoading(true);
    try {
      await verifyCode(challenge.challengeId, value);
      toast.success("Bienvenue sur le back-office MA2E");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Code incorrect");
      setCode("");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!challenge) return;
    setLoading(true);
    try {
      await resendCode(challenge.challengeId);
      setCode("");
      setSecondsLeft(challenge.expiresIn);
      setResendIn(RESEND_COOLDOWN);
      toast.success("Un nouveau code vous a été envoyé.");
    } catch (error: any) {
      toast.error(error.message || "Impossible de renvoyer le code");
    } finally {
      setLoading(false);
    }
  };

  const backToCredentials = () => {
    setChallenge(null);
    setCode("");
    setBackupCode("");
    setUseBackup(false);
    setPassword("");
  };

  const expired = challenge !== null && secondsLeft === 0;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-secondary/30 p-4">
      <div className="mb-8 flex justify-center scale-125">
        <Logo />
      </div>
      <Card className="w-full max-w-md shadow-elegant border-border/40">
        {!challenge ? (
          <>
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-2xl font-display font-bold">Connexion Back-office</CardTitle>
              <CardDescription>
                Entrez vos identifiants pour accéder à l'administration.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-3">
                <ShieldAlert className="h-5 w-5 shrink-0" />
                <p>Accès restreint aux personnels autorisés de la MA2E uniquement.</p>
              </div>
              <form onSubmit={handleLogin} className="space-y-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email professionnel</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="nom@ma2e.ci"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="grid gap-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password">Mot de passe</Label>
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full rounded-full font-bold bg-primary text-white hover:bg-primary/90 mt-2"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Connexion...
                    </>
                  ) : (
                    "Se connecter"
                  )}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader className="space-y-1 text-center">
              <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <MailCheck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-display font-bold">Vérification par email</CardTitle>
              <CardDescription>
                Un code de vérification à 6 chiffres a été envoyé à{" "}
                <span className="font-semibold text-foreground">{challenge.maskedEmail}</span>.
              </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              {!challenge.emailSent && (
                <div className="rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800 flex gap-3">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <p>
                    Le serveur e-mail n'a pas pu envoyer le code. Saisissez l'un de vos codes de
                    secours pour vous connecter.
                  </p>
                </div>
              )}

              {!useBackup ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitCode(code);
                  }}
                  className="space-y-4"
                >
                  <div className="flex justify-center">
                    <InputOTP
                      maxLength={6}
                      value={code}
                      onChange={setCode}
                      onComplete={submitCode}
                      disabled={loading || expired}
                      autoFocus
                    >
                      <InputOTPGroup>
                        {[0, 1, 2, 3, 4, 5].map((i) => (
                          <InputOTPSlot key={i} index={i} />
                        ))}
                      </InputOTPGroup>
                    </InputOTP>
                  </div>

                  <p className="text-center text-sm text-muted-foreground">
                    {expired ? (
                      <span className="text-destructive">
                        Le code a expiré. Demandez-en un nouveau.
                      </span>
                    ) : (
                      <>
                        Le code est valide pendant 5 minutes —{" "}
                        <span className="font-medium text-foreground">{formatDelay(secondsLeft)}</span>{" "}
                        restantes.
                      </>
                    )}
                  </p>

                  <Button
                    type="submit"
                    className="w-full rounded-full font-bold bg-primary text-white hover:bg-primary/90"
                    disabled={loading || code.length !== 6 || expired}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      "Vérifier"
                    )}
                  </Button>
                </form>
              ) : (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    submitCode(backupCode);
                  }}
                  className="space-y-4"
                >
                  <div className="grid gap-2">
                    <Label htmlFor="backup">Code de secours</Label>
                    <Input
                      id="backup"
                      placeholder="XXXX-XXXX"
                      autoComplete="off"
                      spellCheck={false}
                      className="text-center font-mono tracking-widest uppercase"
                      value={backupCode}
                      onChange={(e) => setBackupCode(e.target.value)}
                      autoFocus
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      L'un des 8 codes imprimés lors de leur génération. Chaque code ne sert
                      qu'une fois.
                    </p>
                  </div>
                  <Button
                    type="submit"
                    className="w-full rounded-full font-bold bg-primary text-white hover:bg-primary/90"
                    disabled={loading || backupCode.trim().length < 8}
                  >
                    {loading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Vérification...
                      </>
                    ) : (
                      "Valider le code de secours"
                    )}
                  </Button>
                </form>
              )}

              <div className="flex flex-col gap-2 pt-1 text-sm">
                {!useBackup && (
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={loading || resendIn > 0}
                    className="text-primary hover:underline disabled:text-muted-foreground disabled:no-underline disabled:cursor-not-allowed"
                  >
                    {resendIn > 0
                      ? `Renvoyer le code (${resendIn} s)`
                      : "Je n'ai pas reçu le code — le renvoyer"}
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setUseBackup((v) => !v)}
                  className="text-primary hover:underline inline-flex items-center justify-center gap-1"
                >
                  <KeyRound className="h-3.5 w-3.5" />
                  {useBackup ? "Revenir au code reçu par e-mail" : "Utiliser un code de secours"}
                </button>
                <button
                  type="button"
                  onClick={backToCredentials}
                  className="text-muted-foreground hover:text-foreground inline-flex items-center justify-center gap-1"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Changer de compte
                </button>
              </div>
            </CardContent>
          </>
        )}
        <CardFooter>
          <p className="text-center text-xs text-muted-foreground w-full">
            © {new Date().getFullYear()} MA2E — Équipe IT
          </p>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Login;
