import { useEffect } from "react";
import { useLocation } from "react-router-dom";

// Fait défiler vers l'ancre (#section) après navigation — React Router ne le fait pas seul.
// Gère aussi le cas où l'on arrive depuis une autre page (le DOM doit être rendu).
export const ScrollToHash = () => {
  const { hash, pathname } = useLocation();

  useEffect(() => {
    if (!hash) return;
    const id = decodeURIComponent(hash.slice(1));
    let tries = 0;
    const scroll = () => {
      const el = document.getElementById(id);
      if (el) {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (tries++ < 10) {
        // l'élément n'est pas encore monté (lazy page) → réessaie
        setTimeout(scroll, 80);
      }
    };
    // petit délai pour laisser la page se rendre
    const timer = setTimeout(scroll, 60);
    return () => clearTimeout(timer);
  }, [hash, pathname]);

  return null;
};
