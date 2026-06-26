import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// Réglage du cadrage d'une photo (point focal), façon WordPress : 2 curseurs X/Y
// + aperçu en direct. La valeur est une chaîne CSS `object-position` (ex. "50% 25%").
interface Props {
  src?: string;
  value?: string;
  onChange: (pos: string) => void;
  shape?: "circle" | "rounded";
}

export function parseFocal(v?: string): [number, number] {
  const m = (v || "").match(/(-?\d+(?:\.\d+)?)%?\s+(-?\d+(?:\.\d+)?)%?/);
  return m ? [Number(m[1]), Number(m[2])] : [50, 50];
}

export function FocalPointPicker({ src, value, onChange, shape = "rounded" }: Props) {
  const [x, y] = parseFocal(value);
  const set = (nx: number, ny: number) => onChange(`${nx}% ${ny}%`);
  return (
    <div className="flex flex-wrap items-center gap-4">
      <div className={cn("h-24 w-24 shrink-0 overflow-hidden border border-border bg-secondary/30", shape === "circle" ? "rounded-full" : "rounded-xl")}>
        {src ? (
          <img src={src} alt="" className="h-full w-full object-cover" style={{ objectPosition: `${x}% ${y}%` }} />
        ) : (
          <div className="grid h-full w-full place-items-center text-[10px] text-muted-foreground">aperçu</div>
        )}
      </div>
      <div className="grid flex-1 gap-2 min-w-[180px]">
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Horizontal — {x}%</Label>
          <input type="range" min={0} max={100} value={x} onChange={(e) => set(Number(e.target.value), y)} className="accent-primary" />
        </div>
        <div className="grid gap-1">
          <Label className="text-xs text-muted-foreground">Vertical — {y}% <span className="opacity-60">(baissez pour remonter le visage)</span></Label>
          <input type="range" min={0} max={100} value={y} onChange={(e) => set(x, Number(e.target.value))} className="accent-primary" />
        </div>
      </div>
    </div>
  );
}
