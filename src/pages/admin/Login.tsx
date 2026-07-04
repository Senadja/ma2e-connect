import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/Logo";
import { toast } from "sonner";
import { ShieldAlert, Loader2 } from "lucide-react";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(email, password);
      toast.success("Bienvenue sur le back-office MA2E");
      navigate("/admin/dashboard");
    } catch (error: any) {
      toast.error(error.message || "Échec de l'authentification");
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
