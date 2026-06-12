import { Link } from "react-router-dom";
import { Facebook, Linkedin, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useSettings } from "@/lib/content";
import { Logo } from "../Logo";

export const Footer = () => {
  const { t } = useTranslation();
  const { data: settings } = useSettings();
  const socials = [
    { Icon: Facebook, url: settings?.social?.facebook, label: "Facebook" },
    { Icon: Linkedin, url: settings?.social?.linkedin, label: "LinkedIn" },
    { Icon: Twitter, url: settings?.social?.twitter, label: "X (Twitter)" },
  ].filter((s) => s.url);
  return (
    <footer className="relative bg-primary-dark text-white/80 overflow-hidden">
      <div className="absolute inset-0 grid-pattern-light opacity-50" aria-hidden />
      <div className="relative container py-16">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div>
            <Logo dark />
            <p className="mt-4 text-sm leading-relaxed text-white/70">{t("footer.tagline")}</p>
            {socials.length > 0 && (
              <div className="mt-6 flex gap-3">
                {socials.map(({ Icon, url, label }) => (
                  <a key={label} href={url} target="_blank" rel="noreferrer noopener" aria-label={`${t("common.socialNetwork")} — ${label}`} className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground transition-smooth">
                    <Icon className="h-4 w-4" />
                  </a>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 className="text-white font-display text-lg mb-4">{t("footer.quickLinks")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/a-propos" className="hover:text-accent transition-smooth">{t("footer.about")}</Link></li>
              <li><Link to="/produits" className="hover:text-accent transition-smooth">{t("footer.products")}</Link></li>
              <li><Link to="/actualites" className="hover:text-accent transition-smooth">{t("footer.news")}</Link></li>
              <li><Link to="/faq" className="hover:text-accent transition-smooth">FAQ</Link></li>
              <li><Link to="/mediatheque" className="hover:text-accent transition-smooth">{t("footer.media")}</Link></li>
              <li><Link to="/partenaires" className="hover:text-accent transition-smooth">{t("footer.partners")}</Link></li>
              <li><Link to="/contact" className="hover:text-accent transition-smooth">{t("footer.contact")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display text-lg mb-4">{t("footer.ourProducts")}</h3>
            <ul className="space-y-2 text-sm">
              <li><Link to="/produits/epargne" className="hover:text-accent transition-smooth">{t("footer.savings")}</Link></li>
              <li><Link to="/produits/credits" className="hover:text-accent transition-smooth">{t("footer.credits")}</Link></li>
              <li><Link to="/produits/immobilier" className="hover:text-accent transition-smooth">{t("footer.realEstate")}</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-display text-lg mb-4">{t("footer.contact")}</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, Abidjan</li>
              <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> (+225) 27 21 23 64 87</li>
              <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> contact@ma2e.ci</li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
          <p>© {new Date().getFullYear()} MA2E — {t("footer.rights")}</p>
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link to="/mentions-legales" className="hover:text-accent">{t("footer.legal")}</Link>
            <Link to="/cgu" className="hover:text-accent">{t("footer.terms")}</Link>
            <Link to="/politique-dcp" className="hover:text-accent">{t("footer.dcp")}</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};
