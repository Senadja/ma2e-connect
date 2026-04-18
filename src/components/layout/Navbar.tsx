import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "../Logo";
import { NAV_LINKS } from "@/data/site";
import { cn } from "@/lib/utils";

export const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
    setOpenMenu(null);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-smooth",
        scrolled ? "bg-background/85 backdrop-blur-lg shadow-soft" : "bg-background/0"
      )}
    >
      <div className={cn("container flex items-center justify-between transition-smooth", scrolled ? "h-16" : "h-20")}>
        <Logo />

        <nav className="hidden lg:flex items-center gap-1" aria-label="Navigation principale">
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
                      "group relative inline-flex items-center gap-1 px-4 py-2 text-sm font-medium transition-smooth",
                      isActive ? "text-primary" : "text-foreground/80 hover:text-primary"
                    )
                  }
                >
                  {({ isActive }) => (
                    <>
                      {link.label}
                      {hasChildren && <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" />}
                      <span
                        className={cn(
                          "absolute -bottom-0.5 left-4 right-4 h-0.5 origin-left scale-x-0 bg-primary transition-transform duration-300",
                          isActive && "scale-x-100"
                        )}
                      />
                    </>
                  )}
                </NavLink>

                {hasChildren && openMenu === link.label && (
                  <div className="absolute left-1/2 top-full -translate-x-1/2 pt-3 animate-slide-down">
                    <div className="w-80 rounded-xl border border-border bg-card p-2 shadow-elegant">
                      {link.children!.map((c) => (
                        <Link
                          key={c.href}
                          to={c.href}
                          className="flex items-start gap-3 rounded-lg p-3 transition-smooth hover:bg-secondary"
                        >
                          <div className="mt-0.5 flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-primary text-primary-foreground">
                            <ArrowRight className="h-4 w-4" />
                          </div>
                          <div>
                            <div className="font-semibold text-sm text-foreground">{c.label}</div>
                            <div className="text-xs text-muted-foreground">{c.desc}</div>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="hidden lg:block">
          <a
            href="#"
            className="inline-flex items-center gap-2 rounded-full border-2 border-accent px-5 py-2 text-sm font-semibold text-accent-foreground bg-transparent transition-smooth hover:bg-accent hover:text-accent-foreground hover:shadow-gold"
          >
            Espace E-MA2E
            <ArrowRight className="h-4 w-4" />
          </a>
        </div>

        <button
          className="lg:hidden p-2 text-foreground"
          aria-label={mobileOpen ? "Fermer le menu" : "Ouvrir le menu"}
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </div>

      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 top-16 bg-background animate-fade-in-fast">
          <nav className="container flex flex-col gap-1 py-6" aria-label="Menu mobile">
            {NAV_LINKS.map((link) => (
              <div key={link.href} className="border-b border-border last:border-b-0">
                <Link to={link.href} className="block py-4 text-lg font-medium text-foreground">
                  {link.label}
                </Link>
                {"children" in link && link.children && (
                  <div className="pb-4 pl-4 space-y-2">
                    {link.children.map((c) => (
                      <Link key={c.href} to={c.href} className="block text-sm text-muted-foreground">
                        → {c.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ))}
            <a href="#" className="mt-4 inline-flex justify-center rounded-full bg-accent px-5 py-3 font-semibold text-accent-foreground">
              Espace E-MA2E
            </a>
          </nav>
        </div>
      )}
    </header>
  );
};
