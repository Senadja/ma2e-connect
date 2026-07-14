import { useState, useRef } from "react";
import {
  Plus,
  Search, 
  Filter, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Eye, 
  CheckCircle2, 
  Clock, 
  AlertCircle,
  FileText,
  Calendar,
  Globe,
  Settings2,
  Image as ImageIcon,
  ChevronLeft,
  Share2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@/components/admin/Editor";
import { cn } from "@/lib/utils";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/api";
import { format, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

// Date de publication : le site affiche un libellé FR (ex. « 20 novembre 2024 »).
// On édite via un sélecteur de date (valeur ISO) et on convertit dans les deux sens.
const FR_MONTHS = ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];
const isoToFr = (iso: string) => { try { return format(parseISO(iso), "d MMMM yyyy", { locale: fr }); } catch { return ""; } };
const frToISO = (label: string) => {
  const m = (label || "").trim().toLowerCase().match(/(\d{1,2})\s+([a-zà-ÿ]+)\s+(\d{4})/);
  if (!m) return "";
  const mo = FR_MONTHS.indexOf(m[2]);
  if (mo < 0) return "";
  return `${m[3]}-${String(mo + 1).padStart(2, "0")}-${m[1].padStart(2, "0")}`;
};

interface Block { type: "p" | "h2" | "quote" | "list" | "gallery"; text?: string; items?: string[] }
interface ApiArticle {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  content: Block[];
  image?: string;
  date?: string;
  status: string;
  createdAt: string;
}

// Conversion naïve éditeur <-> blocs (l'éditeur de blocs riche viendra en 2e passe).
// Les blocs « gallery » sont gérés à part (section Galerie), pas dans l'éditeur texte.
const blocksToText = (blocks: Block[] = []) =>
  blocks.filter((b) => b.type !== "gallery").map((b) => (b.type === "list" ? (b.items || []).join("\n") : b.text || "")).join("\n\n");
const extractGallery = (blocks: Block[] = []) => blocks.find((b) => b.type === "gallery")?.items || [];
const textToBlocks = (text: string): Block[] =>
  text
    .split(/\n{2,}|<br\s*\/?>(?:\s*<br\s*\/?>)*/i)
    .map((s) => s.replace(/<[^>]+>/g, "").trim())
    .filter(Boolean)
    .map((t) => ({ type: "p", text: t }));

export const NewsManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentArticle, setCurrentArticle] = useState<any>(null);
  const queryClient = useQueryClient();

  // Editor State
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [excerpt, setExcerpt] = useState("");
  const [category, setCategory] = useState("Actualités");
  const [date, setDate] = useState("");
  const [status, setStatus] = useState("draft");
  const [image, setImage] = useState("");
  const [imgUploading, setImgUploading] = useState(false);
  const newsImgRef = useRef<HTMLInputElement>(null);
  const [gallery, setGallery] = useState<string[]>([]);
  const [galUploading, setGalUploading] = useState(false);
  const galRef = useRef<HTMLInputElement>(null);

  const uploadNewsImage = async (file: File) => {
    setImgUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { path } = await api<{ path: string }>("/uploads", { method: "POST", auth: true, isForm: true, body: fd });
      setImage(path);
      toast.success("Image téléversée.");
    } catch (e: any) {
      toast.error(e?.message || "Échec du téléversement.");
    } finally {
      setImgUploading(false);
    }
  };

  const uploadGalleryImages = async (files: FileList) => {
    setGalUploading(true);
    try {
      const paths: string[] = [];
      for (const file of Array.from(files)) {
        const fd = new FormData();
        fd.append("file", file);
        const { path } = await api<{ path: string }>("/uploads", { method: "POST", auth: true, isForm: true, body: fd });
        paths.push(path);
      }
      setGallery((g) => [...g, ...paths]);
      toast.success(`${paths.length} photo(s) ajoutée(s) à la galerie.`);
    } catch (e: any) {
      toast.error(e?.message || "Échec du téléversement.");
    } finally {
      setGalUploading(false);
    }
  };

  const { data: articles = [], isLoading } = useQuery({
    queryKey: ["articles", "all"],
    queryFn: () => api<ApiArticle[]>("/articles?status=all", { auth: true }),
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["articles"] });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/articles/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { invalidate(); toast.success("Article supprimé."); },
    onError: (e: any) => toast.error(e?.message || "Suppression impossible."),
  });

  const saveMutation = useMutation({
    mutationFn: (payload: any) =>
      currentArticle
        ? api(`/articles/${currentArticle.id}`, { method: "PUT", auth: true, body: payload })
        : api("/articles", { method: "POST", auth: true, body: payload }),
    onSuccess: () => {
      invalidate();
      toast.success(currentArticle ? "Article mis à jour." : "Article publié sur le site.");
      setIsEditing(false);
    },
    onError: (e: any) => toast.error(e?.message || "Enregistrement impossible."),
  });

  const handleEdit = (article: ApiArticle) => {
    setCurrentArticle(article);
    setTitle(article.title);
    setExcerpt(article.excerpt || "");
    setContent(blocksToText(article.content));
    setCategory(article.category);
    setDate(frToISO(article.date || "") || (article.createdAt ? article.createdAt.slice(0, 10) : ""));
    setStatus(article.status || "draft");
    setImage(article.image || "");
    setGallery(extractGallery(article.content));
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentArticle(null);
    setTitle("");
    setExcerpt("");
    setContent("");
    setCategory("Actualités");
    setDate(new Date().toISOString().slice(0, 10));
    setStatus("draft");
    setImage("");
    setGallery([]);
    setIsEditing(true);
  };

  const handleSave = (publish: boolean) => {
    if (!title.trim()) { toast.error("Le titre est requis."); return; }
    const finalStatus = publish ? "published" : "draft";
    setStatus(finalStatus);
    const blocks = textToBlocks(content);
    const finalContent: Block[] = gallery.length ? [...blocks, { type: "gallery", items: gallery }] : blocks;
    saveMutation.mutate({
      title,
      excerpt: excerpt || title,
      category,
      content: finalContent,
      image: image || "",
      status: finalStatus,
      ...(date ? { date: isoToFr(date) } : {}),
    });
  };

  if (isEditing) {
    return (
      <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
        <div className="flex items-center justify-between border-b pb-6">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setIsEditing(false)} className="rounded-full">
              <ChevronLeft className="h-6 w-6" />
            </Button>
            <div>
              <h2 className="text-2xl font-display font-bold text-primary-dark">
                {currentArticle ? "Modifier la publication" : "Créer un nouvel article"}
              </h2>
              <p className="text-muted-foreground text-sm">Rédigez un contenu captivant pour vos sociétaires.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" disabled={saveMutation.isPending} onClick={() => handleSave(false)} className="rounded-full px-6">
              Enregistrer en brouillon
            </Button>
            <Button disabled={saveMutation.isPending} onClick={() => handleSave(true)} className="rounded-full px-8 bg-primary text-white shadow-lg shadow-primary/20">
              {saveMutation.isPending ? "Enregistrement…" : currentArticle ? "Mettre à jour" : "Publier maintenant"}
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/40 shadow-sm overflow-hidden rounded-2xl">
              <CardContent className="p-8 space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary tracking-wide uppercase">Titre de l'article</label>
                  <Input 
                    placeholder="Saisissez un titre percutant..." 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-2xl font-display font-bold h-16 border-none px-0 focus-visible:ring-0 placeholder:text-muted-foreground/30"
                  />
                </div>
                
                <div className="h-px bg-border/40 w-full" />

                <div className="space-y-3">
                  <label className="text-sm font-bold text-primary tracking-wide uppercase">Corps de l'article</label>
                  <Editor content={content} onChange={setContent} />
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm rounded-2xl bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Image à la une
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  onClick={() => newsImgRef.current?.click()}
                  className="aspect-video rounded-xl border-2 border-dashed border-border flex flex-col items-center justify-center bg-card group hover:bg-primary/5 transition-colors cursor-pointer overflow-hidden relative"
                >
                  {image ? (
                    <>
                      <img src={image} alt="Aperçu image à la une" className="absolute inset-0 h-full w-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-white text-sm font-bold">{imgUploading ? "Envoi…" : "Changer l'image"}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-3 group-hover:scale-110 transition-transform">
                        <Plus className="h-6 w-6" />
                      </div>
                      <p className="text-sm font-bold">{imgUploading ? "Envoi en cours…" : "Ajouter une image"}</p>
                      <p className="text-xs text-muted-foreground mt-1">Format recommandé : 1200x630px</p>
                    </>
                  )}
                </div>
                <input ref={newsImgRef} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadNewsImage(f); e.target.value = ""; }} />
                {image && (
                  <button type="button" onClick={() => setImage("")} className="mt-2 text-xs text-muted-foreground hover:text-destructive font-medium">
                    Retirer l'image
                  </button>
                )}
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm rounded-2xl bg-secondary/10">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <ImageIcon className="h-5 w-5 text-primary" /> Galerie photos
                  <span className="text-xs font-normal text-muted-foreground">(optionnel)</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-muted-foreground">Ces photos s'affichent en grille dans l'article (avec visionneuse plein écran). Idéal pour un reportage d'événement.</p>
                {gallery.length > 0 && (
                  <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
                    {gallery.map((src, i) => (
                      <div key={i} className="group relative aspect-square overflow-hidden rounded-lg border border-border">
                        <img src={src} alt={`Galerie ${i + 1}`} className="h-full w-full object-cover" />
                        <button
                          type="button"
                          onClick={() => setGallery((g) => g.filter((_, j) => j !== i))}
                          className="absolute top-1 right-1 h-6 w-6 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                          aria-label="Retirer la photo"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                <Button type="button" variant="outline" className="rounded-full" disabled={galUploading} onClick={() => galRef.current?.click()}>
                  <Plus className="h-4 w-4 mr-2" /> {galUploading ? "Envoi…" : "Ajouter des photos"}
                </Button>
                <input ref={galRef} type="file" accept="image/*" multiple className="hidden" onChange={(e) => { if (e.target.files?.length) uploadGalleryImages(e.target.files); e.target.value = ""; }} />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/40 shadow-sm rounded-2xl">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2 border-b pb-3">
                    <Settings2 className="h-4 w-4 text-primary" /> Configuration
                  </h3>
                  
                  <div className="space-y-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Catégorie</label>
                    <div className="grid grid-cols-1 gap-2">
                      {["Actualités", "Événements", "Communiqués", "Offres"].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setCategory(cat)}
                          className={cn(
                            "flex items-center justify-between px-4 py-2 rounded-xl text-sm transition-all",
                            category === cat 
                              ? "bg-primary text-white font-bold shadow-md shadow-primary/10" 
                              : "bg-secondary/40 text-muted-foreground hover:bg-secondary/60"
                          )}
                        >
                          {cat}
                          {category === cat && <CheckCircle2 className="h-4 w-4" />}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t space-y-3">
                    <label className="text-xs font-bold uppercase text-muted-foreground tracking-widest">Date de publication</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} className="pl-10 rounded-xl" />
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      {date ? <>Affichée sur le site : <strong>{isoToFr(date)}</strong></> : "Laissez vide pour ne pas afficher de date."}
                    </p>
                  </div>
                </div>

                <div className="space-y-4 pt-6 border-t">
                  <h3 className="font-bold flex items-center gap-2">
                    <Globe className="h-4 w-4 text-primary" /> SEO & Social
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground uppercase">Extrait (Méta-description)</label>
                    <textarea
                      value={excerpt}
                      onChange={(e) => setExcerpt(e.target.value)}
                      maxLength={160}
                      className="w-full min-h-[100px] rounded-xl border border-input bg-background px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none transition-all"
                      placeholder="Court résumé pour Google et les réseaux sociaux..."
                    />
                    <p className="text-[10px] text-right text-muted-foreground">{excerpt.length} / 160 caractères</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="rounded-2xl bg-gradient-to-br from-primary to-primary-dark p-6 text-white shadow-xl">
              <h3 className="font-bold flex items-center gap-2 mb-4">
                <AlertCircle className="h-5 w-5" /> Checklist Qualité
              </h3>
              <ul className="space-y-4 text-sm opacity-90">
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">1</div>
                  <span>Vérifiez l'orthographe et la ponctuation.</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">2</div>
                  <span>L'image doit être claire et sans filigrane.</span>
                </li>
                <li className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center shrink-0">3</div>
                  <span>Le titre doit être explicite et accrocheur.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-6 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-4xl font-display font-bold text-primary-dark">Actualités & Presse</h2>
          <p className="text-muted-foreground mt-1 text-lg">Gérez la voix éditoriale de la MA2E.</p>
        </div>
        <Button onClick={handleCreate} className="rounded-full bg-primary text-white h-14 px-8 gap-3 shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
          <Plus className="h-6 w-6" /> <span className="text-lg font-bold">Nouvel article</span>
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-4 bg-card rounded-3xl px-6 border border-border/40 shadow-sm">
        <div className="relative w-full md:w-[450px]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input 
            placeholder="Rechercher par titre, mot-clé ou auteur..." 
            className="pl-12 h-12 rounded-2xl bg-secondary/20 border-none focus-visible:ring-primary/20"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-2xl h-12 px-6 gap-2">
            <Filter className="h-5 w-5" /> Filtrage avancé
          </Button>
          <Button variant="outline" className="rounded-2xl h-12 px-6 gap-2">
            <Share2 className="h-5 w-5" /> Partager
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {isLoading && (
          <div className="py-16 text-center text-muted-foreground italic">Chargement des articles…</div>
        )}
        {!isLoading && articles.length === 0 && (
          <div className="py-16 text-center text-muted-foreground italic">Aucun article. Cliquez sur « Nouvel article » pour publier.</div>
        )}
        {articles.filter(n => n.title.toLowerCase().includes(search.toLowerCase())).map((article) => (
          <Card key={article.id} className="border-border/40 hover:shadow-xl transition-all overflow-hidden group rounded-[2rem]">
            <div className="flex flex-col md:flex-row items-stretch p-6 gap-8">
              <div className="md:w-64 h-48 md:h-auto rounded-2xl overflow-hidden bg-primary/5 shrink-0 relative">
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
                <div className="absolute inset-0 flex items-center justify-center">
                   <FileText className="h-16 w-16 text-primary/10 group-hover:scale-110 transition-transform duration-500" />
                </div>
                <Badge className="absolute top-4 left-4 bg-primary text-white border-none shadow-lg">{article.category}</Badge>
              </div>
              
              <div className="flex-1 flex flex-col py-2">
                <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">
                  <span className="flex items-center gap-2 bg-secondary/40 px-3 py-1 rounded-full text-primary">
                    <Calendar className="h-3 w-3" /> {article.date || new Date(article.createdAt).toLocaleDateString("fr-FR")}
                  </span>
                  <span className="flex items-center gap-2">
                    <Clock className="h-3.5 w-3.5" /> 4 min
                  </span>
                  <span className="flex items-center gap-2">
                    <Eye className="h-3.5 w-3.5" /> 1.2k vues
                  </span>
                </div>
                
                <h3 className="font-display text-2xl font-bold group-hover:text-primary transition-colors mb-4 line-clamp-2">
                  {article.title}
                </h3>
                
                <p className="text-muted-foreground leading-relaxed line-clamp-2 mb-6">
                  {article.excerpt}
                </p>
                
                <div className="mt-auto flex items-center justify-between pt-4 border-t border-border/40">
                  <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-secondary border border-border flex items-center justify-center text-[10px] font-bold">
                      AD
                    </div>
                    <span className="text-sm font-bold">Admin MA2E</span>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    {article.status === "published" ? (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-emerald-600 uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" /> Publié
                      </div>
                    ) : (
                      <div className="hidden sm:flex items-center gap-1 text-[10px] font-bold text-amber-600 uppercase bg-amber-50 px-3 py-1 rounded-full border border-amber-100">
                        <div className="h-1.5 w-1.5 rounded-full bg-amber-500" /> Brouillon
                      </div>
                    )}
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="secondary" size="icon" className="h-10 w-10 rounded-xl hover:bg-primary hover:text-white transition-all">
                          <MoreVertical className="h-5 w-5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-56 rounded-2xl p-2 shadow-2xl">
                        <DropdownMenuItem className="rounded-xl py-3 cursor-pointer" onClick={() => handleEdit(article)}>
                          <Edit2 className="h-4 w-4 mr-3 text-primary" /> 
                          <span className="font-bold">Modifier l'article</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          className="rounded-xl py-3 cursor-pointer"
                          onClick={() => window.open(`/actualites/${article.slug}`, "_blank", "noopener")}
                        >
                          <Eye className="h-4 w-4 mr-3 text-primary" />
                          <span className="font-bold">Aperçu en direct</span>
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="rounded-xl py-3 cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
                          onClick={() => { if (confirm(`Supprimer définitivement « ${article.title} » ?`)) deleteMutation.mutate(article.id); }}
                        >
                          <Trash2 className="h-4 w-4 mr-3" />
                          <span className="font-bold">Supprimer définitivement</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
