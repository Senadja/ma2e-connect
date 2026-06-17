import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, ArrowRight, Smartphone, ShieldCheck, HelpCircle } from "lucide-react";
import { useTranslation } from "react-i18next";
import { Logo } from "../Logo";
import { LanguageSwitcher } from "../LanguageSwitcher";
import { NAV_LINKS, EBANKING_URL } from "@/data/site";
import { cn } from "@/lib/utils";

// Correspondance href → clé de traduction (évite de modifier NAV_LINKS).
const NAV_KEY: Record<string, string> = {
  "/": "home",
  "/adhesion": "adhesion",
  "/a-propos": "about",
  "/produits": "products",
  "/actualites": "news",
  "/contact": "contact",
};
const CHILD_KEY: Record<string, { label: string; desc: string }> = {
  "/a-propos#histoire": { label: "history", desc: "descHistory" },
  "/a-propos#mission": { label: "mission", desc: "descMission" },
  "/a-propos#organisation": { label: "organisation", desc: "descOrganisation" },
  "/produits/epargne": { label: "savings", desc: "descSavings" },
  "/produits/credits": { label: "credits", desc: "descCredits" },
  "/produits/immobilier": { label: "realEstate", desc: "descRealEstate" },
};

interface NavbarProps {
  mobileOpenExtern?: boolean;
  setMobileOpenExtern?: (open: boolean) => void;
}

export const Navbar = ({ mobileOpenExtern, setMobileOpenExtern }: NavbarProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [topOffset, setTopOffset] = useState(0);
  const [internalMobileOpen, setInternalMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();
  const { t } = useTranslation();
  const navLabel = (href: string, fallback: string) => (NAV_KEY[href] ? t(`nav.${NAV_KEY[href]}`) : fallback);
  const childLabel = (href: string, fallback: string) => (CHILD_KEY[href] ? t(`nav.${CHILD_KEY[href].label}`) : fallback);
  const childDesc = (href: string, fallback?: string) => (CHILD_KEY[href] ? t(`nav.${CHILD_KEY[href].desc}`) : fallback);

  const isMobileOpen = mobileOpenExtern ?? internalMobileOpen;
  const setMobileOpen = setMobileOpenExtern ?? setInternalMobileOpen;

  useEffect(() => {
    const onScroll = () => {
      setScrolled(window.scrollY > 5);
      // Positionne le header juste sous la banderole (qui défile naturellement),
      // pour éviter tout chevauchement. 0 si la banderole est absente/dépassée.
      const banner = document.querySelector("[data-flash-banner]") as HTMLElement | null;
      const bottom = banner ? banner.getBoundingClientRect().bottom : 0;
      setTopOffset(Math.max(0, bottom));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    // Recalcule immédiatement quand la banderole apparaît/disparaît.
    window.addEventListener("layoutchange", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      window.removeEventListener("layoutchange", onScroll);
    };
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname, setMobileOpen]);

  return (
    <header
      style={{ top: topOffset }}
      className={cn(
        "fixed inset-x-0 z-50 transition-all duration-300",
        scrolled ? "bg-background border-b border-border shadow-soft" : "bg-transparent"
      )}
    >
      <div className={cn("container flex items-center justify-between transition-all duration-500", scrolled ? "h-16" : "h-20 lg:h-24")}>
        <Logo />

        <nav className="hidden lg:flex items-center gap-2" aria-label="Navigation principale">
          {NAV_LINKS.map((link) => {
            const hasChildren = "children" in link && link.children;
            return (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenMenu(link.label)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <NavLink
                  to={link.href}
                  end={link.href === "/"}
                  className={({ isActive }) =>
                    cn(
                      "group relative inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold transition-all duration-300 rounded-full",
                      isActive 
                        ? (scrolled ? "text-primary bg-primary/5" : "text-accent bg-white/10") 
                        : (scrolled ? "text-foreground/70 hover:text-primary hover:bg-primary/5" : "text-white/90 hover:text-white hover:bg-white/10")
                    )
                  }
                >
                  {navLabel(link.href, link.label)}
                  {hasChildren && <ChevronDown className={cn("h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-180", !scrolled && "text-white/70")} />}
                </NavLink>

                {hasChildren && openMenu === link.label && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3 animate-slide-down">
                    <div className="w-80 rounded-2xl border border-border bg-card p-3 shadow-elegant overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
                      <div className="relative space-y-1">
                        {link.children!.map((c) => (
                          <Link
                            key={c.href}
                            to={c.href}
                            className="flex items-start gap-4 rounded-xl p-3 transition-all duration-300 hover:bg-secondary group/item"
                          >
                            <div className="mt-0.5 flex h-10 w-10 items-center justify-center rounded-xl bg-background border border-border group-hover/item:bg-primary group-hover/item:text-white transition-colors duration-300">
                              <ArrowRight className="h-4 w-4" />
                            </div>
                            <div>
                              <div className="font-bold text-sm text-foreground">{childLabel(c.href, c.label)}</div>
                              <div className="text-xs text-muted-foreground line-clamp-1">{childDesc(c.href, c.desc)}</div>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-4">
          <LanguageSwitcher dark={!scrolled} />
          <Link
            to="/admin/login"
            className={cn("text-sm font-bold transition-colors", scrolled ? "text-muted-foreground hover:text-primary" : "text-white/70 hover:text-white")}
          >
            {t("common.accessAdmin")}
          </Link>
          <a
            href={EBANKING_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-gradient-gold px-6 py-2.5 text-sm font-bold text-accent-foreground shadow-gold hover:scale-[1.03] transition-bounce"
          >
            {t("common.espaceEma2e")}
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-foreground relative z-50 transition-transform active:scale-90"
          aria-label={isMobileOpen ? t("common.closeMenu") : t("common.openMenu")}
          onClick={() => setMobileOpen(!isMobileOpen)}
        >
          {isMobileOpen ? <X className={cn("h-7 w-7", scrolled || isMobileOpen ? "text-primary" : "text-white")} /> : <Menu className={cn("h-7 w-7", !scrolled && "text-white")} />}
        </button>
      </div>

      {/* FULL SCREEN MOBILE MENU */}
      <div className={cn(
        "lg:hidden fixed inset-0 bg-background transition-all duration-300 ease-in-out z-40 transform-gpu",
        isMobileOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-full pointer-events-none"
      )}>
        <div className="container h-full flex flex-col pt-24 pb-32 overflow-y-auto overscroll-contain">
          <nav className="flex-1 space-y-1" aria-label="Menu mobile immersif">
            {NAV_LINKS.map((link, i) => (
              <div 
                key={link.href} 
                className={cn("animate-in fade-in slide-in-from-bottom-4 duration-500", !isMobileOpen && "opacity-0")} 
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <Link 
                  to={link.href}
                  className="flex items-center justify-between py-4 text-2xl font-display font-bold text-foreground active:text-primary"
                >
                  {navLabel(link.href, link.label)}
                  <ArrowRight className="h-6 w-6 text-primary/40" />
                </Link>
                {"children" in link && link.children && (
                  <div className="grid grid-cols-1 gap-2 pb-4">
                    {link.children.map((c) => (
                      <Link 
                        key={c.href} 
                        to={c.href} 
                        className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50 text-sm font-bold text-muted-foreground"
                      >
                        <div className="h-2 w-2 rounded-full bg-accent" />
                        {childLabel(c.href, c.label)}
                      </Link>
                    ))}
                  </div>
                )}
                <div className="h-px bg-border/50" />
              </div>
            ))}
          </nav>

          <div className={cn("mt-8 space-y-4 transition-all duration-700 delay-200", !isMobileOpen && "opacity-0")}>
            <div className="flex justify-center">
              <LanguageSwitcher />
            </div>
            <a href={EBANKING_URL} target="_blank" rel="noopener noreferrer" className="flex items-center justify-center gap-3 rounded-2xl bg-primary h-16 text-lg font-bold text-white shadow-xl shadow-primary/20">
              <Smartphone className="h-6 w-6" /> {t("common.espaceEma2e")}
            </a>
            <div className="grid grid-cols-2 gap-4">
              <Link to="/faq" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
                <HelpCircle className="h-5 w-5 text-primary" /> {t("common.faq")}
              </Link>
              <Link to="/politique-dcp" className="flex flex-col items-center justify-center gap-2 p-4 rounded-2xl bg-secondary text-xs font-bold text-muted-foreground">
                <ShieldCheck className="h-5 w-5 text-primary" /> {t("common.security")}
              </Link>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

