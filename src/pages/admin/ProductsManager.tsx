import { useState, useRef } from "react";
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  Briefcase, 
  TrendingUp, 
  Percent,
  Coins,
  Clock,
  ExternalLink,
  MoreVertical,
  Check,
  X,
  Upload,
  Image as ImageIcon,
  FileText,
  ShieldCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";

interface ApiProduct {
  id: string;
  slug: string;
  type: string;
  name: string;
  description: string;
  features: string[];
  meta?: { taux?: string; duree?: string; montant?: string; conditions?: string };
  image?: string;
  form?: string;
  active: boolean;
}

const apiType = (tab: string) => (tab === "épargne" ? "epargne" : tab === "crédit" ? "credit" : "immobilier");

// Normalise un produit API vers la forme plate utilisée par les cartes/le modal.
const mapProduct = (p: ApiProduct) => ({
  id: p.id,
  slug: p.slug,
  name: p.name,
  desc: p.description,
  features: p.features || [],
  image: p.image,
  form: p.form,
  active: p.active,
  taux: p.meta?.taux,
  duree: p.meta?.duree,
  montant: p.meta?.montant,
  conditions: p.meta?.conditions,
  categorie: (p.meta as any)?.type,
  pieces: (p.meta as any)?.pieces,
});

export const ProductsManager = () => {
  const [activeTab, setActiveTab] = useState("épargne");
  const [search, setSearch] = useState("");
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [uploading, setUploading] = useState<null | "image" | "form">(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const formInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();

  // Upload réel d'un fichier (visuel ou formulaire) → renvoie un chemin /documents/uploads/…
  const uploadFile = async (file: File, field: "image" | "form") => {
    setUploading(field);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { path } = await api<{ path: string }>("/uploads", { method: "POST", auth: true, isForm: true, body: fd });
      setEditingProduct((p: any) => ({ ...p, [field]: path }));
      toast.success("Fichier téléversé.");
    } catch (e: any) {
      toast.error(e?.message || "Échec du téléversement.");
    } finally {
      setUploading(null);
    }
  };

  const { data: allProducts = [] } = useQuery({
    queryKey: ["products", "all"],
    queryFn: () => api<ApiProduct[]>("/products?all=true"),
  });

  const SAVINGS = allProducts.filter((p) => p.type === "epargne").map(mapProduct);
  const CREDITS = allProducts.filter((p) => p.type === "credit").map(mapProduct);
  const IMMO = allProducts.filter((p) => p.type === "immobilier").map(mapProduct);

  const saveMutation = useMutation({
    mutationFn: ({ id, body }: { id?: string; body: any }) =>
      id
        ? api(`/products/${id}`, { method: "PUT", auth: true, body })
        : api(`/products`, { method: "POST", auth: true, body }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
      toast.success("Produit enregistré.");
      setEditingProduct(null);
    },
    onError: (e: any) => toast.error(e?.message || "Enregistrement impossible."),
  });

  const handleEdit = (product: any) => {
    setEditingProduct({ ...product, type: activeTab });
  };

  const handleCreate = () => {
    setEditingProduct({ id: undefined, name: "", desc: "", features: [], active: true, type: activeTab });
  };

  const handleSave = () => {
    const p = editingProduct;
    const features = (p.features || []).map((f: string) => f.trim()).filter(Boolean);
    let body: Record<string, unknown>;
    if (p.type === "crédit") {
      body = {
        name: p.name,
        description: p.conditions || p.desc || "",
        features,
        image: p.image,
        form: p.form,
        meta: { taux: p.taux, duree: p.duree, montant: p.montant, conditions: p.conditions },
      };
    } else if (p.type === "immobilier") {
      body = {
        name: p.name,
        description: p.desc || "",
        features,
        image: p.image,
        form: p.form,
        meta: { type: p.categorie, pieces: p.pieces },
      };
    } else {
      body = { name: p.name, description: p.desc || "", features, image: p.image, form: p.form };
    }
    if (!p.id) body.type = apiType(p.type); // requis à la création
    saveMutation.mutate({ id: p.id, body });
  };

  // Édition de la liste de caractéristiques (puces affichées sur le site public).
  const updateFeature = (i: number, val: string) =>
    setEditingProduct((p: any) => ({ ...p, features: (p.features || []).map((f: string, idx: number) => (idx === i ? val : f)) }));
  const addFeature = () =>
    setEditingProduct((p: any) => ({ ...p, features: [...(p.features || []), ""] }));
  const removeFeature = (i: number) =>
    setEditingProduct((p: any) => ({ ...p, features: (p.features || []).filter((_: string, idx: number) => idx !== i) }));

  const handleToggleStatus = (product: any) => {
    saveMutation.mutate({ id: product.id, body: { active: !product.active } });
  };

  return (
    <div className="space-y-6 animate-fade-in relative">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Gestion des Produits & Offres</h2>  
          <p className="text-muted-foreground">Configurez les taux, durées, fiches et formulaires des services MA2E.</p>
        </div>
        <Button onClick={handleCreate} className="rounded-full bg-primary text-white gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> Nouveau produit
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between mb-6">
          <TabsList className="bg-secondary/40 p-1 rounded-xl">
            <TabsTrigger value="épargne" className="rounded-lg px-8">Épargne</TabsTrigger>
            <TabsTrigger value="crédit" className="rounded-lg px-8">Crédits</TabsTrigger>
            <TabsTrigger value="immobilier" className="rounded-lg px-8">Immobilier</TabsTrigger>
          </TabsList>

          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />       
            <Input
              placeholder="Rechercher un produit..."
              className="pl-9 rounded-full bg-card"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <TabsContent value="épargne" className="animate-in fade-in slide-in-from-bottom-2 mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SAVINGS.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <Card key={p.id} className="border-border/40 hover:shadow-md transition-all group overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/10 bg-secondary/10 relative">
                  {p.image && <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${p.image})`}} />}
                  <div className="flex justify-between items-start relative z-10">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2 bg-card">
                      <TrendingUp className="h-5 w-5" />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 bg-card/50 backdrop-blur-sm">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(p)}>
                          <Edit2 className="h-4 w-4 mr-2" /> Modifier
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(p)}>
                          <Check className="h-4 w-4 mr-2" /> {p.active ? "Masquer du site" : "Afficher sur le site"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl font-bold relative z-10">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-4">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{p.desc}</p>

                  <div className="space-y-2">
                    <div className="text-xs font-bold uppercase text-muted-foreground tracking-wider">Caractéristiques</div>
                    <div className="flex flex-wrap gap-2">
                      {p.features.slice(0, 3).map((f, i) => (
                        <Badge key={i} variant="secondary" className="text-[10px] font-medium py-0">
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      {p.form && <Badge variant="outline" className="text-[9px] bg-secondary/50 border-primary/20 text-primary">Doc joint</Badge>}
                    </div>
                    <Button variant="ghost" size="sm" className="h-8 text-primary gap-1" asChild>
                      <a href="/produits/epargne" target="_blank" rel="noreferrer">
                        Voir <ExternalLink className="h-3 w-3" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="crédit" className="animate-in fade-in slide-in-from-bottom-2 mt-0">
          <div className="grid lg:grid-cols-2 gap-6">
            {CREDITS.filter(p => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <Card key={p.id} className="border-border/40 hover:shadow-md transition-all overflow-hidden">     
                <div className="flex flex-col md:flex-row h-full">
                  <div className="md:w-1/3 bg-primary/5 p-6 flex flex-col items-center justify-center text-center border-r border-border/10 relative">
                    {p.image && <div className="absolute inset-0 bg-cover bg-center opacity-10" style={{ backgroundImage: `url(${p.image})`}} />}
                    <div className="h-12 w-12 rounded-full bg-card flex items-center justify-center text-primary mb-3 shadow-sm relative z-10">
                      <Percent className="h-6 w-6" />
                    </div>
                    <div className="text-2xl font-display font-bold text-primary relative z-10">{p.taux}</div>
                    <div className="text-[10px] font-bold uppercase text-muted-foreground tracking-widest mt-1 relative z-10">Taux Annuel</div>
                  </div>
                  <div className="md:w-2/3 p-6 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-xl">{p.name}</h3>
                        {p.form && <Badge variant="outline" className="text-[9px] bg-secondary/50 border-primary/20 text-primary">Formulaire OK</Badge>}
                      </div>
                      <div className="grid grid-cols-2 gap-4 mt-4">
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="text-xs">
                            <span className="block text-muted-foreground">Durée Max</span>
                            <span className="font-bold truncate max-w-[100px] block" title={p.duree}>{p.duree}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Coins className="h-4 w-4 text-muted-foreground shrink-0" />
                          <div className="text-xs">
                            <span className="block text-muted-foreground">Plafond</span>
                            <span className="font-bold truncate max-w-[100px] block" title={p.montant}>{p.montant}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="mt-6 pt-4 border-t flex justify-end gap-2">
                      <Button variant="outline" size="sm" className="rounded-lg h-9 px-4 hover:border-primary/50 hover:bg-primary/5" onClick={() => handleEdit(p)}>
                        <Edit2 className="h-3.5 w-3.5 mr-2" /> Paramétrer
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="immobilier" className="animate-in fade-in slide-in-from-bottom-2 mt-0">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {IMMO.filter((p) => p.name.toLowerCase().includes(search.toLowerCase())).map((p) => (
              <Card key={p.id} className="border-border/40 hover:shadow-md transition-all group overflow-hidden">
                <CardHeader className="pb-2 border-b border-border/10 bg-secondary/10 relative">
                  <div className="flex justify-between items-start">
                    <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-2"><Briefcase className="h-5 w-5" /></div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild><Button variant="ghost" size="icon" className="h-8 w-8"><MoreVertical className="h-4 w-4" /></Button></DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleEdit(p)}><Edit2 className="h-4 w-4 mr-2" /> Modifier</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleToggleStatus(p)}><Check className="h-4 w-4 mr-2" /> {p.active ? "Masquer du site" : "Afficher sur le site"}</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <CardTitle className="text-xl font-bold">{p.name}</CardTitle>
                </CardHeader>
                <CardContent className="pt-6 space-y-3">
                  <p className="text-sm text-muted-foreground line-clamp-2 h-10">{p.desc}</p>
                  <div className="flex flex-wrap gap-2">
                    {p.categorie && <Badge variant="secondary" className="text-[10px]">{p.categorie}</Badge>}
                    {p.pieces && <Badge variant="outline" className="text-[10px]">{p.pieces} pièces</Badge>}
                    {!p.active && <Badge variant="outline" className="text-[10px] text-amber-600 border-amber-200">Masqué</Badge>}
                  </div>
                  <Button variant="outline" size="sm" className="w-full rounded-lg h-9 mt-2" onClick={() => handleEdit(p)}>
                    <Edit2 className="h-3.5 w-3.5 mr-2" /> Paramétrer
                  </Button>
                </CardContent>
              </Card>
            ))}
            {IMMO.length === 0 && (
              <div className="col-span-full py-16 text-center text-muted-foreground italic">Aucun bien immobilier. Utilisez « Nouveau produit ».</div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Product Edit Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
          <div className="absolute inset-0 bg-primary-dark/80 backdrop-blur-sm transition-opacity" onClick={() => setEditingProduct(null)} />
          <Card className="w-full max-w-2xl bg-card relative z-10 shadow-2xl rounded-2xl overflow-hidden animate-scale-in flex flex-col max-h-[90vh]">
            <CardHeader className="border-b bg-secondary/30 pb-4 shrink-0">
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle className="text-xl font-display font-bold flex items-center gap-2">
                    <Edit2 className="h-5 w-5 text-primary" /> {editingProduct.id ? "Modifier" : "Nouveau"} : {editingProduct.name || "produit"}
                  </CardTitle>
                  <p className="text-xs text-muted-foreground mt-1 uppercase tracking-wider font-bold">Type: {editingProduct.type}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setEditingProduct(null)} className="rounded-full hover:bg-destructive/10 hover:text-destructive">
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 overflow-y-auto space-y-6">
              
              {/* Informations Générales */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary border-b pb-2">Informations Générales</h3>
                <div className="grid gap-4">
                  <div>
                    <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nom du produit</label>
                    <Input value={editingProduct.name} onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})} className="font-bold" />
                  </div>
                  {(editingProduct.type === "épargne" || editingProduct.type === "immobilier") && (
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Description</label>
                      <Textarea value={editingProduct.desc} onChange={(e) => setEditingProduct({...editingProduct, desc: e.target.value})} rows={3} />
                    </div>
                  )}
                  {editingProduct.type === "immobilier" && (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Catégorie</label>
                        <Input value={editingProduct.categorie || ""} onChange={(e) => setEditingProduct({...editingProduct, categorie: e.target.value})} placeholder="Villa / Duplex" />
                      </div>
                      <div>
                        <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block">Nombre de pièces</label>
                        <Input value={editingProduct.pieces || ""} onChange={(e) => setEditingProduct({...editingProduct, pieces: e.target.value})} placeholder="4" />
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Caractéristiques (puces affichées sur le site) */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-primary border-b pb-2">Caractéristiques (affichées sur le site)</h3>
                {(editingProduct.features || []).map((f: string, i: number) => (
                  <div key={i} className="flex gap-2">
                    <Input value={f} onChange={(e) => updateFeature(i, e.target.value)} placeholder={`Caractéristique ${i + 1}`} />
                    <Button type="button" variant="ghost" size="icon" onClick={() => removeFeature(i)} className="shrink-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
                {(editingProduct.features || []).length === 0 && (
                  <p className="text-xs text-muted-foreground italic">Aucune caractéristique. Ajoutez les puces qui décrivent ce produit.</p>
                )}
                <Button type="button" variant="outline" size="sm" onClick={addFeature} className="w-fit rounded-full gap-2">
                  <Plus className="h-4 w-4" /> Ajouter une caractéristique
                </Button>
              </div>

              {/* Conditions Financières */}
              {editingProduct.type === "crédit" && (
                <div className="space-y-4">
                  <h3 className="text-sm font-bold text-primary border-b pb-2">Conditions Financières</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1"><Percent className="h-3 w-3"/> Taux Annuel</label>
                      <Input value={editingProduct.taux} onChange={(e) => setEditingProduct({...editingProduct, taux: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1"><Clock className="h-3 w-3"/> Durée Maximale</label>
                      <Input value={editingProduct.duree} onChange={(e) => setEditingProduct({...editingProduct, duree: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1"><Coins className="h-3 w-3"/> Plafond (Montant)</label>
                      <Input value={editingProduct.montant} onChange={(e) => setEditingProduct({...editingProduct, montant: e.target.value})} />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground uppercase mb-1 block flex items-center gap-1"><ShieldCheck className="h-3 w-3"/> Condition d'accès</label>
                      <Input value={editingProduct.conditions} onChange={(e) => setEditingProduct({...editingProduct, conditions: e.target.value})} />
                    </div>
                  </div>
                </div>
              )}

              {/* Ressources & Fichiers */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-primary border-b pb-2">Ressources & Médias</h3>
                <div className="grid sm:grid-cols-2 gap-6">
                  
                  {/* Fiche produit (Image) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase block flex items-center gap-1"><ImageIcon className="h-3 w-3"/> Fiche visuelle (.jpg/.png)</label>
                    <div onClick={() => imageInputRef.current?.click()} className="rounded-xl border-2 border-dashed border-border p-4 text-center hover:bg-secondary/50 transition-colors cursor-pointer group">
                      {editingProduct.image ? (
                        <div className="relative rounded-lg overflow-hidden h-24 bg-secondary">
                           <img src={editingProduct.image} alt="Fiche" className="w-full h-full object-cover opacity-50 group-hover:opacity-30 transition-opacity" />
                           <div className="absolute inset-0 flex items-center justify-center">
                             <Button type="button" variant="secondary" size="sm" className="h-7 text-xs font-bold">{uploading === "image" ? "Envoi…" : "Changer l'image"}</Button>
                           </div>
                        </div>
                      ) : (
                        <div className="py-4">
                          <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <span className="text-xs font-medium">{uploading === "image" ? "Envoi en cours…" : "Uploader une image"}</span>
                        </div>
                      )}
                    </div>
                    <input ref={imageInputRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "image"); e.target.value = ""; }} />
                    <Input value={editingProduct.image || ""} onChange={(e) => setEditingProduct({...editingProduct, image: e.target.value})} placeholder="…ou coller un chemin /images/products/…" className="text-xs mt-2" />
                  </div>

                  {/* Formulaire (Docx/PDF) */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase block flex items-center gap-1"><FileText className="h-3 w-3"/> Formulaire associé (.pdf/.docx)</label>
                    <div onClick={() => formInputRef.current?.click()} className="rounded-xl border-2 border-dashed border-border p-4 text-center hover:bg-secondary/50 transition-colors cursor-pointer group flex flex-col justify-center h-[132px]">
                      {editingProduct.form ? (
                        <div className="flex flex-col items-center">
                          <FileText className="h-8 w-8 text-primary mb-2" />
                          <span className="text-xs font-bold text-primary line-clamp-1 px-2">{editingProduct.form.split('/').pop()}</span>
                          <Button type="button" variant="outline" size="sm" className="h-6 text-[10px] font-bold mt-2">{uploading === "form" ? "Envoi…" : "Remplacer"}</Button>
                        </div>
                      ) : (
                        <div>
                          <Upload className="h-6 w-6 text-muted-foreground mx-auto mb-2" />
                          <span className="text-xs font-medium">{uploading === "form" ? "Envoi en cours…" : "Lier un document"}</span>
                        </div>
                      )}
                    </div>
                    <input ref={formInputRef} type="file" accept=".pdf,.doc,.docx" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadFile(f, "form"); e.target.value = ""; }} />
                    <Input value={editingProduct.form || ""} onChange={(e) => setEditingProduct({...editingProduct, form: e.target.value})} placeholder="…ou coller un chemin /documents/…" className="text-xs mt-2" />
                  </div>

                </div>
              </div>

            </CardContent>
            <div className="p-4 border-t bg-card shrink-0 flex justify-end gap-3">
              <Button variant="outline" onClick={() => setEditingProduct(null)} className="rounded-full px-6">Annuler</Button>
              <Button onClick={handleSave} className="rounded-full px-8 bg-primary text-white shadow-md shadow-primary/20">Enregistrer les modifications</Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
};
