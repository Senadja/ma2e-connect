import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Layout } from "@/components/layout/Layout";
import { PageHero } from "@/components/PageHero";
import { SEO } from "@/components/SEO";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SignaturePad } from "@/components/SignaturePad";
import { toast } from "sonner";
import { FileText, UserPlus, CheckCircle2, Upload, Briefcase, User, X, Users } from "lucide-react";
import { useState } from "react";
import { api } from "@/lib/api";
import { useTranslation } from "react-i18next";

// Sociétés membres (liste déroulante du champ « Société »).
const SOCIETES = ["CIE", "SODECI", "MA2E", "CIPREL", "ATINKOU", "AWALE", "GS2E", "SGA2E", "SIVE", "Smart Energy", "Autre"];

// Pièces à téléverser : un champ distinct par type de document.
const DOC_SLOTS = [
  { key: "cniRecto", label: "CNI — Recto" },
  { key: "cniVerso", label: "CNI — Verso" },
  { key: "passeport", label: "Passeport (si pas de CNI)" },
  { key: "photo", label: "Photo d'identité" },
] as const;

const formSchema = z.object({
  // Personnel
  fullName: z.string().min(3, "Le nom complet est requis"),
  nomMere: z.string().optional(),
  situationMatrimoniale: z.string().optional(),
  email: z.string().email("Email invalide").optional().or(z.literal("")), // non bloquant
  phone: z.string().min(8, "Numéro de téléphone invalide"),
  dateDeNaissance: z.string().optional(),
  lieuDeNaissance: z.string().optional(),
  adresse: z.string().optional(),
  cniNumero: z.string().optional(),
  cniDu: z.string().optional(),
  cniAu: z.string().optional(),
  domicile: z.string().optional(),
  bureau: z.string().optional(),
  // Professionnel
  matricule: z.string().min(1, "Le matricule est requis"),
  societe: z.string().min(1, "La société est requise"),
  fonction: z.string().optional(),
  categorie: z.string().optional(),
  direction: z.string().optional(),
  service: z.string().optional(),
  exploitation: z.string().optional(),
  dateEmbauche: z.string().optional(),
  // Proches
  conjoint: z.string().optional(),
  contactConjoint: z.string().optional(),
  personneAPrevenir: z.string().optional(),
  contactPrevenir: z.string().optional(),
  ayantsDroit: z.string().optional(),
  contactAyantsDroit: z.string().optional(),
  // Engagement
  intentionAdhesion: z.boolean().optional(),
  intentionPart: z.boolean().optional(),
  acceptTerms: z.boolean().refine((val) => val === true, "Vous devez accepter les conditions"),
});

type Slot = (typeof DOC_SLOTS)[number]["key"];

const Adhesion = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("personal");
  const [docs, setDocs] = useState<Partial<Record<Slot, { name: string; path: string }>>>({});
  const [uploading, setUploading] = useState<Slot | null>(null);
  const [signature, setSignature] = useState("");

  const uploadSlot = async (slot: Slot, file: File) => {
    setUploading(slot);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api<{ path: string; name: string }>("/applications/documents", { method: "POST", isForm: true, body: fd });
      setDocs((d) => ({ ...d, [slot]: { name: res.name, path: res.path } }));
      toast.success("Document ajouté.");
    } catch (e: any) {
      toast.error(e?.message || "Échec du téléversement (PDF ou image, 8 Mo max).");
    } finally {
      setUploading(null);
    }
  };
  const removeSlot = (slot: Slot) => setDocs((d) => { const n = { ...d }; delete n[slot]; return n; });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "", nomMere: "", situationMatrimoniale: "", email: "", phone: "",
      dateDeNaissance: "", lieuDeNaissance: "", adresse: "",
      cniNumero: "", cniDu: "", cniAu: "", domicile: "", bureau: "",
      matricule: "", societe: "", fonction: "", categorie: "", direction: "", service: "", exploitation: "", dateEmbauche: "",
      conjoint: "", contactConjoint: "", personneAPrevenir: "", contactPrevenir: "", ayantsDroit: "", contactAyantsDroit: "",
      intentionAdhesion: false, intentionPart: false, acceptTerms: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setLoading(true);
    try {
      const { appId } = await api<{ appId: string }>("/applications", {
        method: "POST",
        body: {
          category: "adhésion",
          type: "Adhésion (sociétaire)",
          name: values.fullName,
          matricule: values.matricule,
          email: values.email || "",
          phone: values.phone,
          data: {
            nomMere: values.nomMere,
            situationMatrimoniale: values.situationMatrimoniale,
            dateDeNaissance: values.dateDeNaissance,
            lieuDeNaissance: values.lieuDeNaissance,
            adresse: values.adresse,
            cniNumero: values.cniNumero,
            cniDu: values.cniDu,
            cniAu: values.cniAu,
            domicile: values.domicile,
            bureau: values.bureau,
            fonction: values.fonction,
            societe: values.societe,
            categorie: values.categorie,
            direction: values.direction,
            service: values.service,
            exploitation: values.exploitation,
            dateEmbauche: values.dateEmbauche,
            conjoint: values.conjoint,
            contactConjoint: values.contactConjoint,
            personneAPrevenir: values.personneAPrevenir,
            contactPrevenir: values.contactPrevenir,
            ayantsDroit: values.ayantsDroit,
            contactAyantsDroit: values.contactAyantsDroit,
            intentionAdhesion: values.intentionAdhesion,
            intentionPart: values.intentionPart,
            documents: docs,
            signature,
          },
        },
      });
      toast.success(`Demande d'adhésion envoyée — référence ${appId} !`);
      // Étape suivante : l'Épargne Expresse est obligatoire à l'adhésion → on redirige vers son formulaire.
      navigate("/produits/epargne/expresse", { state: { fromAdhesion: true, ref: appId } });
    } catch (e: any) {
      toast.error(e?.message || t("adhesion.errorToast"));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Layout>
      <SEO
        title="Devenir sociétaire"
        description="Rejoignez la MA2E pour bénéficier de nos services d'épargne et de crédit. Formulaire d'adhésion en ligne pour les agents de l'eau et de l'électricité."
      />
      <PageHero title="Devenir sociétaire" subtitle={t("adhesion.heroSubtitle")} />

      <section className="py-20">
        <div className="container max-w-5xl">
          <div className="grid lg:grid-cols-4 gap-12">
            <div className="lg:col-span-1 space-y-8">
              <div className="rounded-2xl bg-secondary/40 p-6">
                <h3 className="font-display text-lg font-bold mb-4">{t("adhesion.whyJoin")}</h3>
                <ul className="space-y-4">
                  {[t("adhesion.benefit1"), t("adhesion.benefit2"), t("adhesion.benefit3")].map((b, i) => (
                    <li key={i} className="flex gap-3 text-sm"><CheckCircle2 className="h-5 w-5 text-primary shrink-0" /><span>{b}</span></li>
                  ))}
                </ul>
              </div>
              <div className="rounded-2xl border border-border p-6">
                <h3 className="font-display text-lg font-bold mb-4">Pièces à fournir</h3>
                <ul className="space-y-3">
                  {["CNI (recto et verso) ou passeport", "Photo d'identité"].map((d, i) => (
                    <li key={i} className="flex items-start gap-3 text-sm"><FileText className="h-4 w-4 text-primary mt-1" /><span>{d}</span></li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="lg:col-span-3">
              <div className="rounded-2xl border border-border p-8 md:p-10 bg-card shadow-sm">
                <div className="flex items-center gap-3 mb-8">
                  <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary"><UserPlus className="h-5 w-5" /></div>
                  <h2 className="font-display text-2xl font-bold">{t("adhesion.fileTitle")}</h2>
                </div>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                      <TabsList className="grid w-full grid-cols-4 mb-10">
                        <TabsTrigger value="personal" className="flex items-center gap-2"><User className="h-4 w-4" /><span className="hidden sm:inline">Personnel</span></TabsTrigger>
                        <TabsTrigger value="professional" className="flex items-center gap-2"><Briefcase className="h-4 w-4" /><span className="hidden sm:inline">Professionnel</span></TabsTrigger>
                        <TabsTrigger value="proches" className="flex items-center gap-2"><Users className="h-4 w-4" /><span className="hidden sm:inline">Proches</span></TabsTrigger>
                        <TabsTrigger value="documents" className="flex items-center gap-2"><Upload className="h-4 w-4" /><span className="hidden sm:inline">Documents</span></TabsTrigger>
                      </TabsList>

                      {/* PERSONNEL */}
                      <TabsContent value="personal" className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="fullName" render={({ field }) => (
                            <FormItem><FormLabel>Nom et prénoms *</FormLabel><FormControl><Input placeholder="Jean Dupont" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="nomMere" render={({ field }) => (
                            <FormItem><FormLabel>Nom de la mère</FormLabel><FormControl><Input placeholder="Nom de jeune fille" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="email" render={({ field }) => (
                            <FormItem><FormLabel>Email (professionnel)</FormLabel><FormControl><Input placeholder="j.dupont@cie.ci" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="phone" render={({ field }) => (
                            <FormItem><FormLabel>Téléphone *</FormLabel><FormControl><Input placeholder="07 00 00 00 00" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="dateDeNaissance" render={({ field }) => (
                            <FormItem><FormLabel>Date de naissance</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="lieuDeNaissance" render={({ field }) => (
                            <FormItem><FormLabel>Lieu de naissance</FormLabel><FormControl><Input placeholder="Abidjan" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="situationMatrimoniale" render={({ field }) => (
                            <FormItem><FormLabel>Situation matrimoniale</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {["Célibataire", "Marié(e)", "Veuf(ve)", "Divorcé(e)"].map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="adresse" render={({ field }) => (
                            <FormItem><FormLabel>Adresse / Boîte postale</FormLabel><FormControl><Input placeholder="Cocody, 18 BP 1210" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-3 gap-6">
                          <FormField control={form.control} name="cniNumero" render={({ field }) => (
                            <FormItem><FormLabel>N° CNI</FormLabel><FormControl><Input placeholder="C1000812473" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="cniDu" render={({ field }) => (
                            <FormItem><FormLabel>CNI valable du</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="cniAu" render={({ field }) => (
                            <FormItem><FormLabel>au</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="domicile" render={({ field }) => (
                            <FormItem><FormLabel>Téléphone domicile</FormLabel><FormControl><Input placeholder="Numéro fixe / domicile" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="bureau" render={({ field }) => (
                            <FormItem><FormLabel>Téléphone bureau</FormLabel><FormControl><Input placeholder="Numéro bureau" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="flex justify-end"><Button type="button" onClick={() => setActiveTab("professional")} className="rounded-full px-8">{t("adhesion.next")}</Button></div>
                      </TabsContent>

                      {/* PROFESSIONNEL */}
                      <TabsContent value="professional" className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="matricule" render={({ field }) => (
                            <FormItem><FormLabel>Matricule *</FormLabel><FormControl><Input placeholder="ABC12345" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="societe" render={({ field }) => (
                            <FormItem><FormLabel>Société *</FormLabel>
                              <Select onValueChange={field.onChange} value={field.value}>
                                <FormControl><SelectTrigger><SelectValue placeholder="Choisir votre société" /></SelectTrigger></FormControl>
                                <SelectContent>
                                  {SOCIETES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                                </SelectContent>
                              </Select><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="fonction" render={({ field }) => (
                            <FormItem><FormLabel>Fonction</FormLabel><FormControl><Input placeholder="Intitulé du poste" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="categorie" render={({ field }) => (
                            <FormItem><FormLabel>Catégorie</FormLabel><FormControl><Input placeholder="Cadre, Agent de maîtrise…" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="direction" render={({ field }) => (
                            <FormItem><FormLabel>Direction</FormLabel><FormControl><Input placeholder="DG / DAGF…" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="service" render={({ field }) => (
                            <FormItem><FormLabel>Service</FormLabel><FormControl><Input placeholder="Exploitation, Finances…" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="exploitation" render={({ field }) => (
                            <FormItem><FormLabel>Exploitation</FormLabel><FormControl><Input placeholder="G31…" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="dateEmbauche" render={({ field }) => (
                            <FormItem><FormLabel>Date d'embauche</FormLabel><FormControl><Input type="date" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("personal")} className="rounded-full px-8">{t("adhesion.previous")}</Button>
                          <Button type="button" onClick={() => setActiveTab("proches")} className="rounded-full px-8">{t("adhesion.next")}</Button>
                        </div>
                      </TabsContent>

                      {/* PROCHES */}
                      <TabsContent value="proches" className="space-y-6 animate-in fade-in slide-in-from-right-2">
                        <p className="text-sm text-muted-foreground">Conjoint(e), personne(s) à prévenir et ayant(s) droit en cas de besoin.</p>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="conjoint" render={({ field }) => (
                            <FormItem><FormLabel>Nom du conjoint(e)</FormLabel><FormControl><Input placeholder="Nom et prénoms" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="contactConjoint" render={({ field }) => (
                            <FormItem><FormLabel>Contact du conjoint(e)</FormLabel><FormControl><Input placeholder="07 00 00 00 00" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="personneAPrevenir" render={({ field }) => (
                            <FormItem><FormLabel>Personne à prévenir</FormLabel><FormControl><Input placeholder="Nom et prénoms" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="contactPrevenir" render={({ field }) => (
                            <FormItem><FormLabel>Contact</FormLabel><FormControl><Input placeholder="07 00 00 00 00" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="grid md:grid-cols-2 gap-6">
                          <FormField control={form.control} name="ayantsDroit" render={({ field }) => (
                            <FormItem><FormLabel>Ayant(s) droit</FormLabel><FormControl><Input placeholder="Nom et prénoms" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                          <FormField control={form.control} name="contactAyantsDroit" render={({ field }) => (
                            <FormItem><FormLabel>Contact</FormLabel><FormControl><Input placeholder="07 00 00 00 00" {...field} /></FormControl><FormMessage /></FormItem>
                          )} />
                        </div>
                        <div className="flex justify-between">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("professional")} className="rounded-full px-8">{t("adhesion.previous")}</Button>
                          <Button type="button" onClick={() => setActiveTab("documents")} className="rounded-full px-8">{t("adhesion.next")}</Button>
                        </div>
                      </TabsContent>

                      {/* DOCUMENTS */}
                      <TabsContent value="documents" className="space-y-8 animate-in fade-in slide-in-from-right-2">
                        <div className="grid sm:grid-cols-2 gap-4">
                          {DOC_SLOTS.map((slot) => {
                            const file = docs[slot.key];
                            return (
                              <div key={slot.key} className="rounded-2xl border border-border p-4">
                                <p className="text-sm font-semibold mb-2">{slot.label}</p>
                                {file ? (
                                  <div className="flex items-center gap-2 rounded-lg bg-secondary/40 p-2">
                                    <FileText className="h-4 w-4 text-primary shrink-0" />
                                    <span className="text-xs flex-1 truncate">{file.name}</span>
                                    <button type="button" onClick={() => removeSlot(slot.key)} className="text-muted-foreground hover:text-destructive shrink-0" aria-label="Retirer"><X className="h-4 w-4" /></button>
                                  </div>
                                ) : (
                                  <label className="flex flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-border p-4 text-center cursor-pointer hover:bg-secondary/20 transition-colors">
                                    <Upload className="h-5 w-5 text-muted-foreground" />
                                    <span className="text-xs text-muted-foreground">{uploading === slot.key ? "Envoi…" : "PDF ou image · 8 Mo"}</span>
                                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="hidden" onChange={(e) => { if (e.target.files?.[0]) uploadSlot(slot.key, e.target.files[0]); e.target.value = ""; }} />
                                  </label>
                                )}
                              </div>
                            );
                          })}
                        </div>

                        {/* Signature (tracé ou import) */}
                        <div className="rounded-2xl border border-border p-5 space-y-3">
                          <p className="text-sm font-semibold">Signature</p>
                          <p className="text-xs text-muted-foreground">Signez directement ci-dessous ou importez l'image de votre signature. Facultatif : vous pourrez aussi signer la version imprimée à la MA2E.</p>
                          <SignaturePad value={signature} onChange={setSignature} />
                        </div>

                        {/* Engagement de paiement (à la source) */}
                        <div className="rounded-2xl border border-border bg-secondary/20 p-5 space-y-3">
                          <p className="text-sm font-semibold">Engagement de paiement (prélèvement à la source)</p>
                          <p className="text-xs text-muted-foreground">En cochant ci-dessous, vous marquez votre intention de payer. Aucun paiement n'est effectué en ligne : les règlements se font à la source.</p>
                          <FormField control={form.control} name="intentionAdhesion" render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-3 space-y-0">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="text-sm font-normal">Droit d'adhésion — <strong>1 000 FCFA</strong></FormLabel>
                            </FormItem>
                          )} />
                          <FormField control={form.control} name="intentionPart" render={({ field }) => (
                            <FormItem className="flex flex-row items-center gap-3 space-y-0">
                              <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                              <FormLabel className="text-sm font-normal">Souscription à la part sociale — <strong>5 000 FCFA</strong></FormLabel>
                            </FormItem>
                          )} />
                        </div>

                        <FormField control={form.control} name="acceptTerms" render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                            <FormControl><Checkbox checked={field.value} onCheckedChange={field.onChange} /></FormControl>
                            <div className="space-y-1 leading-none"><FormLabel className="text-sm">{t("adhesion.certify")}</FormLabel></div>
                          </FormItem>
                        )} />

                        <div className="flex justify-between pt-4">
                          <Button type="button" variant="outline" onClick={() => setActiveTab("proches")} className="rounded-full px-8">{t("adhesion.previous")}</Button>
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
