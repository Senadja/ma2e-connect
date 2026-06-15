import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Upload, File, Search, Trash2, Download, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { api } from "@/lib/api";

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "other";
  size: string;
  date: string;
  published: boolean;
}

interface ApiMedia {
  id: string;
  title: string;
  category: string;
  path: string;
  size?: string;
  year?: string;
  createdAt: string;
  published: boolean;
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void;
  selectionMode?: boolean;
}

function mapMedia(m: ApiMedia): MediaFile {
  const ext = (m.path || "").split(".").pop()?.toLowerCase() || "";
  const type: MediaFile["type"] = ["jpg", "jpeg", "png", "webp", "gif", "svg"].includes(ext)
    ? "image"
    : ext === "pdf"
    ? "pdf"
    : "other";
  return {
    id: m.id,
    name: m.title,
    url: m.path || "#",
    type,
    size: m.size || "",
    date: m.year || new Date(m.createdAt).toLocaleDateString("fr-FR"),
    published: m.published,
  };
}

export const MediaLibrary = ({ onSelect, selectionMode = false }: MediaLibraryProps) => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "pdf">("all");
  const [uploading, setUploading] = useState(false);

  const { data: files = [] } = useQuery({
    queryKey: ["media"],
    queryFn: async () => (await api<ApiMedia[]>("/media/all", { auth: true })).map(mapMedia),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api(`/media/${id}`, { method: "DELETE", auth: true }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["media"] }); toast.success("Fichier supprimé."); },
    onError: (e: any) => toast.error(e?.message || "Suppression impossible."),
  });

  const publishMutation = useMutation({
    mutationFn: ({ id, published }: { id: string; published: boolean }) =>
      api(`/media/${id}`, { method: "PATCH", auth: true, body: { published } }),
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["media"] }); toast.success("Visibilité mise à jour."); },
    onError: (e: any) => toast.error(e?.message || "Mise à jour impossible."),
  });

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    setUploading(true);
    try {
      for (const file of acceptedFiles) {
        const fd = new FormData();
        fd.append("file", file);
        fd.append("title", file.name.replace(/\.[^.]+$/, ""));
        fd.append("category", "Téléversements");
        await api("/media", { method: "POST", auth: true, isForm: true, body: fd });
      }
      queryClient.invalidateQueries({ queryKey: ["media"] });
      toast.success(`${acceptedFiles.length} fichier(s) téléversé(s).`);
    } catch (e: any) {
      toast.error(e?.message || "Téléversement impossible.");
    } finally {
      setUploading(false);
    }
  }, [queryClient]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const filteredFiles = files.filter(
    (f) => (filter === "all" || f.type === filter) && f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Rechercher un fichier..." className="pl-9 rounded-full" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <div className="flex gap-2">
          {(["all", "image", "pdf"] as const).map((f) => (
            <Button key={f} variant={filter === f ? "default" : "outline"} size="sm" className="rounded-full" onClick={() => setFilter(f)}>
              {f === "all" ? "Tous" : f === "image" ? "Images" : "PDF"}
            </Button>
          ))}
        </div>
      </div>

      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-2xl p-10 text-center transition-all cursor-pointer",
          isDragActive ? "border-primary bg-primary/5 scale-[1.01]" : "border-border hover:border-primary/50 bg-secondary/20",
          uploading && "opacity-50 pointer-events-none"
        )}
      >
        <input {...getInputProps()} />
        <div className="mx-auto h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary mb-4">
          <Upload className="h-6 w-6" />
        </div>
        <h4 className="font-bold text-lg">Déposez vos fichiers ici</h4>
        <p className="text-sm text-muted-foreground mt-1">Images (JPG, PNG, WebP) ou documents (PDF) jusqu'à 15 MB.</p>
        <p className="text-xs text-muted-foreground mt-1">Les nouveaux fichiers sont « Masqués » par défaut — cliquez sur l'œil pour les publier sur la médiathèque.</p>
        {uploading && <p className="text-primary font-bold mt-4 animate-pulse italic">Téléversement en cours...</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredFiles.map((file) => (
          <Card
            key={file.id}
            className={cn(
              "group relative overflow-hidden border-border/40 hover:shadow-md transition-all",
              selectionMode && "cursor-pointer hover:ring-2 hover:ring-primary"
            )}
            onClick={() => onSelect?.(file)}
          >
            <div className="aspect-square bg-secondary/50 flex items-center justify-center relative">
              <span className={cn("absolute top-2 left-2 z-10 rounded-full px-2 py-0.5 text-[10px] font-bold", file.published ? "bg-primary text-white" : "bg-muted text-muted-foreground border border-border")}>
                {file.published ? "Publié" : "Masqué"}
              </span>
              {file.type === "image" ? (
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
              ) : (
                <File className="h-12 w-12 text-muted-foreground/40" />
              )}

              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button
                  size="icon"
                  variant="secondary"
                  className="h-8 w-8 rounded-full"
                  title={file.published ? "Masquer du public" : "Publier"}
                  onClick={(e) => { e.stopPropagation(); publishMutation.mutate({ id: file.id, published: !file.published }); }}
                >
                  {file.published ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
                {file.url && file.url !== "#" && (
                  <Button asChild size="icon" variant="secondary" className="h-8 w-8 rounded-full" onClick={(e) => e.stopPropagation()}>
                    <a href={file.url} download target="_blank" rel="noreferrer"><Download className="h-4 w-4" /></a>
                  </Button>
                )}
                <Button
                  size="icon"
                  variant="destructive"
                  className="h-8 w-8 rounded-full"
                  onClick={(e) => { e.stopPropagation(); if (confirm(`Supprimer "${file.name}" ?`)) deleteMutation.mutate(file.id); }}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <CardContent className="p-3">
              <p className="text-xs font-bold truncate" title={file.name}>{file.name}</p>
              <div className="flex justify-between items-center mt-1">
                <span className="text-[10px] text-muted-foreground uppercase">{file.type}</span>
                <span className="text-[10px] text-muted-foreground">{file.size}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFiles.length === 0 && (
        <div className="py-20 text-center text-muted-foreground">Aucun fichier ne correspond à votre recherche.</div>
      )}
    </div>
  );
};
