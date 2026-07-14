import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useSettings } from "@/lib/content";

export const Logo = ({ className, dark = false }: { className?: string; dark?: boolean }) => {
  const { data: settings } = useSettings();
  return (
  <Link to="/" aria-label="MA2E - Accueil" className={cn("inline-flex items-center", className)}>
    <img
      src={settings?.branding?.logo || "/logo-ma2e.png"}
      alt="MA2E Logo"
      className={cn(
        "h-12 w-auto object-contain transition-all",
        // If dark is true (footer), we keep it as is because the logo has a green background 
        // that contrasts well with the dark green of the footer.
        // We only apply brightness boost if really needed.
        dark ? "brightness-110" : ""
      )} 
    />
  </Link>
  );
};
