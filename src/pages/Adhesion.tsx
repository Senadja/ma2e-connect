import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { FileText, UserPlus, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const formSchema = z.object({
  fullName: z.string().min(3, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  matricule: z.string().min(4, "Le matricule est requis"),
  service: z.string().min(2, "Le service est requis"),
  direction: z.string().min(2, "La direction est requise"),
  site: z.string().min(2, "Le site d'affectation est requis"),
  typeAdherent: z.enum(["actif", "retraite"]),
  acceptTerms: z.boolean().refine((val) => val === true, "Vous devez accepter les conditions"),
});

const Adhesion = () => {
  const [submitted, setSubmitted] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      matricule: "",
      service: "",
      direction: "",
      site: "",
      typeAdherent: "actif",
      acceptTerms: false,
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    setSubmitted(true);
    toast.success("Votre demande d'adhésion a été envoyée avec succès !");
  }

  if (submitted) {
    return (
      <Layout>
        <SEO title="Demande envoyée" />
        <div className="container py-32 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-display text-4xl font-bold">Demande d'adhésion reçue !</h1>
          <p className="mt-4 text-muted-foreground max-w-md text-lg">
            Merci pour votre confiance. Un conseiller de la MA2E examinera votre dossier et vous contactera sous 48h ouvrées.
          </p>
          <Button asChild className="mt-10 rounded-full px-8">
            <a href="/">Retour à l'accueil</a>
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <SEO 
        title="Devenir adhérent" 
        description="Rejoignez la MA2E pour bénéficier de nos services d'épargne, de crédit et de logement. Formulaire d'adhésion en ligne pour les agents de l'eau et de l'électricité." 
      />
      <PageHero
        title="Devenir adhérent"
        subtitle="Rejoignez la MA2E et donnez-vous les moyens de vos ambitions."
        breadcrumb={[{ label: "Accueil", href: "/" }, { label: "Adhésion" }]}
      />

      <section className="py-20">
        <div className="container max-w-4xl">
          <div className="grid lg:grid-cols-3 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="rounded-2xl bg-secondary/40 p-6">
                <h3 className="font-display text-xl font-bold mb-4">Pourquoi adhérer ?</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>Accès prioritaire au programme immobilier</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>Taux de crédit préférentiels (dès 6,5%)</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>Épargne sécurisée et rémunérée</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-display text-xl font-bold mb-4">Pièces à fournir</h3>
                <p className="text-sm text-muted-foreground mb-4">Après cette demande, vous devrez nous transmettre :</p>
                <ul className="space-y-3">
                  <li className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Dernier bulletin de salaire</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>Copie de la CNI / Passeport</span>
                  </li>
                  <li className="flex items-center gap-3 text-sm">
                    <FileText className="h-4 w-4 text-primary" />
                    <span>2 photos d'identité</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-2">
              <div className="rounded-2xl border border-border p-8 md:p-10 bg-card shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">Formulaire de demande</h2>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="fullName"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet</FormLabel>
                            <FormControl>
                              <Input placeholder="Jean Dupont" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email professionnel</FormLabel>
                            <FormControl>
                              <Input placeholder="j.dupont@cie.ci" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone</FormLabel>
                            <FormControl>
                              <Input placeholder="07 00 00 00 00" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="matricule"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Matricule</FormLabel>
                            <FormControl>
                              <Input placeholder="ABC12345" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="direction"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Direction</FormLabel>
                            <FormControl>
                              <Input placeholder="DSI" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="service"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Service</FormLabel>
                            <FormControl>
                              <Input placeholder="Développement" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="site"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Site d'affectation</FormLabel>
                          <FormControl>
                            <Input placeholder="Abidjan - Plateau" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="typeAdherent"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Statut</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Sélectionnez votre statut" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="actif">Agent actif</SelectItem>
                              <SelectItem value="retraite">Retraité</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="acceptTerms"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                          <FormControl>
                            <Checkbox
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <div className="space-y-1 leading-none">
                            <FormLabel>
                              J'accepte les conditions d'adhésion et la politique de protection des données.
                            </FormLabel>
                            <FormDescription>
                              En soumettant ce formulaire, vous acceptez d'être contacté par la MA2E.
                            </FormDescription>
                          </div>
                        </FormItem>
                      )}
                    />

                    <Button type="submit" className="w-full h-12 rounded-full text-lg font-bold bg-gradient-gold text-accent-foreground shadow-gold hover:scale-[1.01] transition-bounce">
                      Soumettre ma demande
                    </Button>
                  </form>
                </Form>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Adhesion;
