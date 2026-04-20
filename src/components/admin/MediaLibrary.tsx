import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { 
  Upload, 
  File, 
  Image as ImageIcon, 
  Search, 
  MoreVertical, 
  Trash2, 
  Download, 
  Check, 
  X,
  Plus
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface MediaFile {
  id: string;
  name: string;
  url: string;
  type: "image" | "pdf" | "other";
  size: string;
  date: string;
}

interface MediaLibraryProps {
  onSelect?: (file: MediaFile) => void;
  selectionMode?: boolean;
}

// Simulated data
const INITIAL_MEDIA: MediaFile[] = [
  { id: "1", name: "Rapport-Annuel-2024.pdf", url: "#", type: "pdf", size: "2.4 MB", date: "15 Mars 2025" },
  { id: "2", name: "Assemblee-Generale.jpg", url: "https://placehold.co/600x400/1A6147/white?text=AG+2025", type: "image", size: "1.2 MB", date: "12 Mars 2025" },
  { id: "3", name: "Brochure-Epargne.pdf", url: "#", type: "pdf", size: "850 KB", date: "01 Fév 2025" },
  { id: "4", name: "Nouvelle-Agence.jpg", url: "https://placehold.co/600x400/F5A623/white?text=Yamoussoukro", type: "image", size: "900 KB", date: "01 Fév 2025" },
];

export const MediaLibrary = ({ onSelect, selectionMode = false }: MediaLibraryProps) => {
  const [files, setFiles] = useState<MediaFile[]>(INITIAL_MEDIA);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "image" | "pdf">("all");
  const [uploading, setUploading] = useState(false);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    setUploading(true);
    // Simulate upload
    setTimeout(() => {
      const newMedia: MediaFile[] = acceptedFiles.map((file, i) => ({
        id: Math.random().toString(36).substr(2, 9),
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.includes("image") ? "image" : file.name.endsWith(".pdf") ? "pdf" : "other",
        size: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        date: "Aujourd'hui",
      }));
      setFiles([...newMedia, ...files]);
      setUploading(false);
      toast.success(`${acceptedFiles.length} fichier(s) téléversé(s)`);
    }, 1500);
  }, [files]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop });

  const filteredFiles = files.filter(f => 
    (filter === "all" || f.type === filter) &&
    f.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Rechercher un fichier..." 
            className="pl-9 rounded-full"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === "all" ? "default" : "outline"} 
            size="sm" 
            className="rounded-full"
            onClick={() => setFilter("all")}
          >
            Tous
          </Button>
          <Button 
            variant={filter === "image" ? "default" : "outline"} 
            size="sm" 
            className="rounded-full"
            onClick={() => setFilter("image")}
          >
            Images
          </Button>
          <Button 
            variant={filter === "pdf" ? "default" : "outline"} 
            size="sm" 
            className="rounded-full"
            onClick={() => setFilter("pdf")}
          >
            PDF
          </Button>
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
        <p className="text-sm text-muted-foreground mt-1">Images (JPG, PNG, WebP) ou documents (PDF) jusqu'à 10 MB.</p>
        {uploading && <p className="text-primary font-bold mt-4 animate-pulse italic">Téléversement en cours...</p>}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {filteredFiles.map((file) => (
          <Card 
            key={file.id} 
            className={cn(
              "group relative overflow-hidden border-border/40 hover:shadow-md transition-all cursor-pointer",
              selectionMode && "hover:ring-2 hover:ring-primary"
            )}
            onClick={() => onSelect?.(file)}
          >
            <div className="aspect-square bg-secondary/50 flex items-center justify-center relative">
              {file.type === "image" ? (
                <img src={file.url} alt={file.name} className="h-full w-full object-cover" />
              ) : (
                <File className="h-12 w-12 text-muted-foreground/40" />
              )}
              
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <Button size="icon" variant="secondary" className="h-8 w-8 rounded-full">
                  <Download className="h-4 w-4" />
                </Button>
                <Button size="icon" variant="destructive" className="h-8 w-8 rounded-full">
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
        <div className="py-20 text-center text-muted-foreground">
          Aucun fichier ne correspond à votre recherche.
        </div>
      )}
    </div>
  );
};
