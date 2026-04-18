import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Logo = ({ className, dark = false }: { className?: string; dark?: boolean }) => (
  <Link to="/" aria-label="MA2E - Accueil" className={cn("inline-flex items-center", className)}>
    <span
      className={cn(
        "inline-flex items-center rounded-md px-3 py-1.5 font-display font-bold text-lg tracking-tight",
        dark ? "bg-white text-primary" : "bg-primary text-white"
      )}
    >
      M<span className="text-accent">A</span>2E
    </span>
  </Link>
);
