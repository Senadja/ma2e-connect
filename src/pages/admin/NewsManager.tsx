import { useState } from "react";
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
  Settings2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Editor } from "@/components/admin/Editor";
import { NEWS } from "@/data/site";
import { toast } from "sonner";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const NewsManager = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [search, setSearch] = useState("");
  const [currentArticle, setCurrentArticle] = useState<any>(null);

  // Simplified state for the editor
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("Actualités");
  const [status, setStatus] = useState("draft");

  const handleEdit = (article: any) => {
    setCurrentArticle(article);
    setTitle(article.title);
    setContent(article.content.map((c: any) => c.text || "").join("<br>"));
    setCategory(article.category);
    setIsEditing(true);
  };

  const handleCreate = () => {
    setCurrentArticle(null);
    setTitle("");
    setContent("");
    setCategory("Actualités");
    setIsEditing(true);
  };

  const handleSave = () => {
    toast.success(currentArticle ? "Article mis à jour" : "Article publié");
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-display font-bold text-primary-dark">
              {currentArticle ? "Modifier l'article" : "Nouvel article"}
            </h2>
            <p className="text-muted-foreground text-sm">Rédigez et configurez votre contenu.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setIsEditing(false)} className="rounded-full px-6">
              Annuler
            </Button>
            <Button onClick={handleSave} className="rounded-full px-8 bg-primary text-white">
              Enregistrer
            </Button>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6">
            <Card className="border-border/40 shadow-sm overflow-hidden">
              <CardContent className="p-6 space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-bold">Titre de l'article</label>
                  <Input 
                    placeholder="Ex: Assemblée Générale Ordinaire 2025" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="text-lg font-bold"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-bold">Contenu</label>
                  <Editor content={content} onChange={setContent} />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-border/40 shadow-sm">
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="font-bold flex items-center gap-2 border-b pb-2">
                    <Settings2 className="h-4 w-4" /> Publication
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Statut</label>
                    <div className="grid grid-cols-2 gap-2">
                      <Button 
                        variant={status === "draft" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setStatus("draft")}
                        className="rounded-lg h-9"
                      >
                        Brouillon
                      </Button>
                      <Button 
                        variant={status === "published" ? "default" : "outline"} 
                        size="sm" 
                        onClick={() => setStatus("published")}
                        className="rounded-lg h-9"
                      >
                        Publié
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase text-muted-foreground">Catégorie</label>
                    <select 
                      className="w-full h-10 rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus:outline-none focus:ring-2 focus:ring-primary/20"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option>Actualités</option>
                      <option>Événements</option>
                      <option>Communiqués</option>
                      <option>Offres</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-4 pt-4 border-t">
                  <h3 className="font-bold flex items-center gap-2">
                    <Globe className="h-4 w-4" /> SEO & Réseaux
                  </h3>
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-muted-foreground">Méta-description</label>
                    <textarea 
                      className="w-full min-h-[80px] rounded-lg border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 resize-none"
                      placeholder="Description pour les moteurs de recherche..."
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-border/40 shadow-sm bg-primary/5">
              <CardContent className="p-4 space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-primary">Aide au rédacteur</h3>
                <ul className="text-xs space-y-2 text-muted-foreground">
                  <li className="flex gap-2"><CheckCircle2 className="h-3 w-3 text-primary" /> Utilisez des titres H2 pour structurer.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3 w-3 text-primary" /> Ajoutez une image à la une.</li>
                  <li className="flex gap-2"><CheckCircle2 className="h-3 w-3 text-primary" /> Longueur idéale : 300 - 600 mots.</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
        <div>
          <h2 className="text-3xl font-display font-bold text-primary-dark">Gestion des Actualités</h2>
          <p className="text-muted-foreground">Gérez les articles de blog et communiqués officiels.</p>
        </div>
        <Button onClick={handleCreate} className="rounded-full bg-primary text-white gap-2 shadow-lg shadow-primary/20">
          <Plus className="h-5 w-5" /> Nouvel article
        </Button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between py-2">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un titre, un auteur..." 
            className="pl-9 rounded-full bg-card"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="rounded-full gap-2">
            <Filter className="h-4 w-4" /> Filtrer
          </Button>
          <Button variant="outline" size="sm" className="rounded-full gap-2">
            <FileText className="h-4 w-4" /> Exporter
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {NEWS.filter(n => n.title.toLowerCase().includes(search.toLowerCase())).map((article) => (
          <Card key={article.id} className="border-border/40 hover:shadow-md transition-all overflow-hidden group">
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center p-4 gap-4">
              <div className="h-16 w-16 rounded-xl bg-primary/5 flex items-center justify-center shrink-0">
                <FileText className="h-8 w-8 text-primary/40" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant="secondary" className="text-[10px] font-bold uppercase">{article.category}</Badge>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Calendar className="h-3 w-3" /> {article.date}
                  </span>
                  <span className="flex items-center gap-1 text-[10px] text-muted-foreground">
                    <Clock className="h-3 w-3" /> 4 min de lecture
                  </span>
                </div>
                <h3 className="font-bold text-lg truncate group-hover:text-primary transition-colors">{article.title}</h3>
                <p className="text-sm text-muted-foreground line-clamp-1">{article.excerpt}</p>
              </div>
              <div className="flex items-center gap-2 self-end sm:self-center">
                <div className="hidden lg:flex items-center gap-4 mr-4 text-xs text-muted-foreground">
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-foreground">1.2k</span>
                    <span>Vues</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="font-bold text-foreground">42</span>
                    <span>Partages</span>
                  </div>
                </div>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-none">Publié</Badge>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="h-8 w-8">
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <DropdownMenuItem onClick={() => handleEdit(article)}>
                      <Edit2 className="h-4 w-4 mr-2" /> Modifier
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" /> Voir sur le site
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive focus:text-destructive">
                      <Trash2 className="h-4 w-4 mr-2" /> Supprimer
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
