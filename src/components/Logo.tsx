import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";

export const Logo = ({ className, dark = false }: { className?: string; dark?: boolean }) => (
  <Link to="/" aria-label="MA2E - Accueil" className={cn("inline-flex items-center", className)}>
    <img 
      src="/logo-ma2e.png" 
      alt="MA2E Logo" 
      className={cn(
        "h-12 w-auto object-contain transition-all",
        dark && "brightness-0 invert" // Optional: makes it white if background is very dark
      )} 
    />
  </Link>
);
