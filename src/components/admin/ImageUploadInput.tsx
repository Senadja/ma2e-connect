import { useRef, useState } from "react";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Upload, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Champ image unifié du back-office : un bouton « Téléverser » (plus aucun champ
// « chemin ou URL »). Encapsule l'appel POST /uploads et remonte le chemin via onChange.
interface Props {
  value?: string;
  onChange: (path: string) => void;
  hint?: string;
  /** Affiche une vignette d'aperçu (désactiver quand un FocalPointPicker suit). */
  showPreview?: boolean;
  /** Forme de la vignette d'aperçu. */
  shape?: "rounded" | "circle";
  /** Classe de dimensionnement de la vignette (défaut : h-20 w-20). */
  previewClassName?: string;
}

export function ImageUploadInput({ value, onChange, hint, showPreview = true, shape = "rounded", previewClassName }: Props) {
  const ref = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const upload = async (file: File) => {
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const { path } = await api<{ path: string }>("/uploads", { method: "POST", auth: true, isForm: true, body: fd });
      onChange(path);
      toast.success("Image téléversée. N'oubliez pas d'enregistrer.");
    } catch (e: any) {
      toast.error(e?.message || "Téléversement impossible.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex items-center gap-3">
      {showPreview && (
        <div className={cn("shrink-0 overflow-hidden border border-border bg-secondary/30 grid place-items-center", shape === "circle" ? "rounded-full" : "rounded-xl", previewClassName || "h-20 w-20")}>
          {value ? <img src={value} alt="" className="h-full w-full object-contain" /> : <ImageIcon className="h-6 w-6 text-muted-foreground/40" />}
        </div>
      )}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <input ref={ref} type="file" accept="image/*" className="hidden" onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = ""; }} />
          <Button type="button" variant="outline" size="sm" disabled={uploading} onClick={() => ref.current?.click()} className="rounded-full gap-2">
            <Upload className="h-4 w-4" /> {uploading ? "Envoi…" : "Téléverser"}
          </Button>
          {value && <button type="button" onClick={() => onChange("")} className="text-xs text-muted-foreground hover:text-destructive">Retirer</button>}
        </div>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}
