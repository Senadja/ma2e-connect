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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";
import { FileText, UserPlus, CheckCircle2, Upload, Briefcase, User, X } from "lucide-react";
import { useState, useRef } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

const formSchema = z.object({
  // Informations Personnelles
  fullName: z.string().min(3, "Le nom complet est requis"),
  email: z.string().email("Email invalide"),
  phone: z.string().min(10, "Numéro de téléphone invalide"),
  dateDeNaissance: z.string().min(1, "La date de naissance est requise"),
  lieuDeNaissance: z.string().min(2, "Le lieu de naissance est requis"),
  adresse: z.string().min(5, "L'adresse est requise"),
  
  // Informations Professionnelles
  matricule: z.string().min(4, "Le matricule est requis"),
  service: z.string().min(2, "Le service est requis"),
  direction: z.string().min(2, "La direction est requise"),
  site: z.string().min(2, "Le site d'affectation est requis"),
  dateEmbauche: z.string().min(1, "La date d'embauche est requise"),
  typeAdherent: z.enum(["actif", "retraite"]),
  
  // Documents (Simulés pour le moment)
  acceptTerms: z.boolean().refine((val) => val === true, "Vous devez accepter les conditions"),
});

const Adhesion = () => {
  const { t } = useTranslation();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [documents, setDocuments] = useState<{ name: string; path: string }[]>([]);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const docInputRef = useRef<HTMLInputElement>(null);

  const uploadDocuments = async (files: FileList) => {
    setUploadingDoc(true);
    try {
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const res = await api<{ path: string; name: string }>("/applications/documents", { method: "POST", isForm: true, body: fd });
        setDocuments((d) => [...d, { name: res.name, path: res.path }]);
      }
      toast.success("Document(s) ajouté(s).");
    } catch (e: any) {
      toast.error(e?.message || "Échec du téléversement (PDF, image ou Word, 8 Mo max).");
    } finally {
      setUploadingDoc(false);
    }
  };
  const removeDocument = (i: number) => setDocuments((d) => d.filter((_, idx) => idx !== i));

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      phone: "",
      dateDeNaissance: "",
      lieuDeNaissance: "",
      adresse: "",
      matricule: "",
      service: "",
      direction: "",
      site: "",
      dateEmbauche: "",
      typeAdherent: "actif",
      acceptTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { appId } = await api<{ appId: string }>("/applications", {
        method: "POST",
        body: {
          category: "adhésion",
          type: values.typeAdherent === "retraite" ? "Adhésion (retraité)" : "Adhésion (actif)",
          name: values.fullName,
          matricule: values.matricule,
          email: values.email,
          phone: values.phone,
          data: {
            dateDeNaissance: values.dateDeNaissance,
            lieuDeNaissance: values.lieuDeNaissance,
            adresse: values.adresse,
            service: values.service,
            direction: values.direction,
            site: values.site,
            dateEmbauche: values.dateEmbauche,
            typeAdherent: values.typeAdherent,
            documents,
          },
        },
      });
      setSubmitted(true);
      toast.success(`Demande d'adhésion envoyée — référence ${appId} !`);
    } catch (e: any) {
      toast.error(e?.message || t("adhesion.errorToast"));
    } finally {
      setLoading(false);
    }
  }

  if (submitted) {
    return (
      <Layout>
        <SEO title="Demande envoyée" />
        <div className="container py-32 flex flex-col items-center text-center">
          <div className="h-20 w-20 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-6">
            <CheckCircle2 className="h-10 w-10" />
          </div>
          <h1 className="font-display text-4xl font-bold">{t("adhesion.receivedTitle")}</h1>
          <p className="mt-4 text-muted-foreground max-w-md text-lg">
            {t("adhesion.receivedText")}
          </p>
          <Button asChild className="mt-10 rounded-full px-8">
            <a href="/">{t("adhesion.backHome")}</a>
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
        title={t("adhesion.heroTitle")}
        subtitle={t("adhesion.heroSubtitle")}
      />

      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="rounded-2xl bg-secondary/40 p-6">
                <h3 className="font-display text-lg font-bold mb-4">{t("adhesion.whyJoin")}</h3>
                <ul className="space-y-4">
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{t("adhesion.benefit1")}</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{t("adhesion.benefit2")}</span>
                  </li>
                  <li className="flex gap-3 text-sm">
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
                    <span>{t("adhesion.benefit3")}</span>
                  </li>
                </ul>
              </div>

              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-4">{t("adhesion.requiredDocs")}</h3>
                <ul className="space-y-3">
                  <li className="flex items-start gap-3 text-sm">
                    <FileText className="h-4 w-4 text-primary mt-1" />
                    <span>{t("adhesion.doc2")}</span>
                  </li>
                  <li className="flex items-start gap-3 text-sm">
                    <FileText className="h-4 w-4 text-primary mt-1" />
                    <span>{t("adhesion.doc3")}</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border p-8 md:p-10 bg-card shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                    <UserPlus className="h-5 w-5" />
                  </div>
                  <h2 className="font-display text-2xl font-bold">{t("adhesion.fileTitle")}</h2>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-3 mb-10">
                        <TabsTrigger value="personal" className="flex items-center gap-2">
                          <User className="h-4 w-4" />
                          <span className="hidden sm:inline">{t("adhesion.tabPersonal")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="professional" className="flex items-center gap-2">
                          <Briefcase className="h-4 w-4" />
                          <span className="hidden sm:inline">{t("adhesion.tabProfessional")}</span>
                        </TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2">
                          <Upload className="h-4 w-4" />
                          <span className="hidden sm:inline">{t("adhesion.tabDocuments")}</span>
                        </TabsTrigger>
                      </TabsList>

                      <TabsContent value="personal" className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="fullName"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.fullName")}</FormLabel>
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
                                <FormLabel>{t("adhesion.email")}</FormLabel>
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
                                <FormLabel>{t("adhesion.phone")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="07 00 00 00 00" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="dateDeNaissance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.birthDate")}</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="lieuDeNaissance"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.birthPlace")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Abidjan" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="adresse"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.address")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Cocody, Cité des Arts" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button type="button" onClick={() => setActiveTab("professional")} className="rounded-full px-8">{t("adhesion.next")}</Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="professional" className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="matricule"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.matricule")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="ABC12345" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="direction"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.direction")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="DSI / DRH" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="service"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.service")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Développement" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="site"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.site")}</FormLabel>
                                <FormControl>
                                  <Input placeholder="Abidjan - Plateau" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="dateEmbauche"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{t("adhesion.hireDate")}</FormLabel>
                                <FormControl>
                                  <Input type="date" {...field} />
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
                                <FormLabel>{t("adhesion.status")}</FormLabel>
                                <Select onValueChange={field.onChange} defaultValue={field.value}>
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder={t("adhesion.select")} />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="actif">{t("adhesion.activeAgent")}</SelectItem>
                                    <SelectItem value="retraite">{t("adhesion.retired")}</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("personal")} className="rounded-full px-8">{t("adhesion.previous")}</Button>
                          <Button type="button" onClick={() => setActiveTab("documents")} className="rounded-full px-8">{t("adhesion.next")}</Button>
                        </div>
                      </TabsContent>

                      <TabsContent value="documents" className="space-y-8 animate-in fade-in slide-in-from-right-2">
                        <div className="space-y-4">
                          <div
                            onClick={() => docInputRef.current?.click()}
                            className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center text-center hover:bg-secondary/20 transition-colors cursor-pointer"
                          >
                            <Upload className="h-10 w-10 text-muted-foreground mb-4" />
                            <h4 className="font-bold">{uploadingDoc ? t("adhesion.uploading") : t("adhesion.uploadDocs")}</h4>
                            <p className="text-sm text-muted-foreground mt-2 max-w-xs">
                              {t("adhesion.uploadHint")}
                            </p>
                          </div>
                          <input
                            ref={docInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                            className="hidden"
                            onChange={(e) => { if (e.target.files?.length) uploadDocuments(e.target.files); e.target.value = ""; }}
                          />

                          {documents.length > 0 && (
                            <ul className="space-y-2">
                              {documents.map((doc, i) => (
                                <li key={i} className="flex items-center gap-3 rounded-xl border border-border bg-card p-3">
                                  <FileText className="h-5 w-5 text-primary shrink-0" />
                                  <span className="text-sm font-medium flex-1 truncate">{doc.name}</span>
                                  <button type="button" onClick={() => removeDocument(i)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label={t("adhesion.removeDoc")}>
                                    <X className="h-4 w-4" />
                                  </button>
                                </li>
                              ))}
                            </ul>
                          )}
                          
                          <div className="bg-secondary/30 rounded-xl p-4 flex items-center gap-3">
                            <FileText className="h-5 w-5 text-primary" />
                            <div className="text-sm flex-1">
                              <p className="font-medium">{t("adhesion.paperForm")}</p>
                              <p className="text-xs text-muted-foreground">{t("adhesion.paperFormHint")}</p>
                            </div>
                            <Button variant="ghost" size="sm" className="text-primary hover:text-primary-dark" asChild>
                              <a href="/documents/formulaires/Formulaire_FICHE D'ADHESION E-MA2E.pdf" download>{t("adhesion.download")}</a>
                            </Button>
                          </div>
                        </div>

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
                                <FormLabel className="text-sm">
                                  {t("adhesion.certify")}
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("professional")} className="rounded-full px-8">{t("adhesion.previous")}</Button>
                          <Button type="submit" disabled={loading} className="rounded-full px-10 bg-gradient-gold text-accent-foreground font-bold shadow-gold hover:scale-[1.02] transition-all">
                            {loading ? t("adhesion.submitting") : t("adhesion.submit")}
                          </Button>
                        </div>
                      </TabsContent>
                    </Tabs>
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

