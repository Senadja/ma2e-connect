import { useRef, useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Pencil, Upload, Eraser, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SignaturePadProps {
  value?: string;
  onChange: (dataUrl: string) => void;
}

// Saisie de signature : tracé à la main (souris/tactile) ou import d'une image.
// La valeur remontée est une data-URL PNG/JPG, embarquée telle quelle dans le PDF.
export function SignaturePad({ value, onChange }: SignaturePadProps) {
  const [mode, setMode] = useState<"draw" | "import">("draw");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawing = useRef(false);
  const hasDrawn = useRef(false);

  // (Ré)initialise le canvas à la résolution écran (tracé net) quand on passe en mode dessin.
  useEffect(() => {
    if (mode !== "draw") return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ratio = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * ratio;
    canvas.height = rect.height * ratio;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.scale(ratio, ratio);
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "#0f172a";
  }, [mode]);

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  };

  const start = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    drawing.current = true;
    e.currentTarget.setPointerCapture(e.pointerId);
    const { x, y } = pos(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
  };
  const move = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (!drawing.current) return;
    const ctx = canvasRef.current?.getContext("2d");
    if (!ctx) return;
    const { x, y } = pos(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    hasDrawn.current = true;
  };
  const end = () => {
    if (!drawing.current) return;
    drawing.current = false;
    if (hasDrawn.current && canvasRef.current) onChange(canvasRef.current.toDataURL("image/png"));
  };

  const clear = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    hasDrawn.current = false;
    onChange("");
  };

  const onFile = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => onChange(typeof reader.result === "string" ? reader.result : "");
    reader.readAsDataURL(file);
  };

  return (
    <div className="space-y-3">
      <div className="inline-flex rounded-lg border border-border bg-secondary/30 p-1">
        <button
          type="button"
          onClick={() => setMode("draw")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "draw" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
          )}
        >
          <Pencil className="h-3.5 w-3.5" /> Dessiner
        </button>
        <button
          type="button"
          onClick={() => setMode("import")}
          className={cn(
            "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-xs font-medium transition-colors",
            mode === "import" ? "bg-card shadow-sm text-foreground" : "text-muted-foreground",
          )}
        >
          <Upload className="h-3.5 w-3.5" /> Importer
        </button>
      </div>

      {mode === "draw" ? (
        <div className="space-y-2">
          <canvas
            ref={canvasRef}
            className="h-40 w-full touch-none cursor-crosshair rounded-xl border-2 border-dashed border-border bg-white"
            onPointerDown={start}
            onPointerMove={move}
            onPointerUp={end}
            onPointerLeave={end}
          />
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground">Signez dans le cadre ci-dessus.</p>
            <Button type="button" variant="ghost" size="sm" onClick={clear} className="gap-1.5 text-xs text-muted-foreground">
              <Eraser className="h-3.5 w-3.5" /> Effacer
            </Button>
          </div>
          {value && (
            <p className="flex items-center gap-1.5 text-xs text-emerald-600">
              <Check className="h-3.5 w-3.5" /> Signature enregistrée.
            </p>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {value ? (
            <>
              <div className="rounded-xl border border-border bg-white p-3">
                <img src={value} alt="Signature" className="mx-auto max-h-32 object-contain" />
              </div>
              <Button type="button" variant="ghost" size="sm" onClick={() => onChange("")} className="gap-1.5 text-xs text-muted-foreground">
                <Eraser className="h-3.5 w-3.5" /> Retirer
              </Button>
            </>
          ) : (
            <label className="flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-border p-6 text-center transition-colors hover:bg-secondary/20">
              <Upload className="h-5 w-5 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">Image de votre signature (PNG/JPG)</span>
              <input
                type="file"
                accept="image/png,image/jpeg"
                className="hidden"
                onChange={(e) => { if (e.target.files?.[0]) onFile(e.target.files[0]); e.target.value = ""; }}
              />
            </label>
          )}
        </div>
      )}
    </div>
  );
}
