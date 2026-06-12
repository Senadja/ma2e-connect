import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Link } from "react-router-dom";
import { useSettings } from "@/lib/content";

export const FlashBanner = () => {
  const [open, setOpen] = useState(true);
  const { data: settings } = useSettings();
  const banner = settings?.flashBanner;
  const visible = open && !!banner?.enabled && !!banner?.text;

  // Prévient le header (Navbar) pour qu'il repositionne son offset.
  useEffect(() => {
    window.dispatchEvent(new Event("layoutchange"));
  }, [visible]);

  if (!visible) return null;

  const content = (
    <p>
      {banner.text}
    </p>
  );

  return (
    <div data-flash-banner className="relative z-40 bg-gradient-gold text-accent-foreground">
      <div className="container flex items-center py-2.5 text-sm relative">
        <div className="flex-1 flex justify-center items-center gap-3 text-center font-medium">
          <span aria-hidden>🔔</span>
          {banner.link ? (
            <Link to={banner.link} className="hover:underline">
              {content}
            </Link>
          ) : (
            content
          )}
        </div>
        <button onClick={() => setOpen(false)} aria-label="Fermer" className="absolute right-4 p-1 hover:bg-black/10 rounded">
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};
