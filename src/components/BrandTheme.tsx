import { useEffect } from "react";
import { useSettings } from "@/lib/content";
import { applyBrandColor } from "@/lib/brandColor";

// Applique la couleur de marque définie au CMS (ou laisse le défaut CSS si aucune n'est réglée).
export const BrandTheme = () => {
  const { data: settings } = useSettings();
  const primary = settings?.branding?.primary;
  useEffect(() => {
    applyBrandColor(primary);
  }, [primary]);
  return null;
};
