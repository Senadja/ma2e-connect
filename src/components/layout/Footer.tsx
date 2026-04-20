import { Link } from "react-router-dom";
import { Facebook, Linkedin, Twitter, MapPin, Phone, Mail } from "lucide-react";
import { Logo } from "../Logo";

export const Footer = () => (
  <footer className="relative bg-primary-dark text-white/80 overflow-hidden">
    <div className="absolute inset-0 grid-pattern-light opacity-50" aria-hidden />
    <div className="relative container py-16">
      <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
        <div>
          <Logo dark />
          <p className="mt-4 text-sm leading-relaxed text-white/70">
            Mutuelle des Agents de l'Eau et de l'Électricité — au service des projets de ses adhérents depuis 2006.
          </p>
          <div className="mt-6 flex gap-3">
            {[Facebook, Linkedin, Twitter].map((Icon, i) => (
              <a key={i} href="#" aria-label="Réseau social" className="grid h-9 w-9 place-items-center rounded-full bg-white/10 hover:bg-accent hover:text-accent-foreground transition-smooth">
                <Icon className="h-4 w-4" />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-white font-display text-lg mb-4">Liens rapides</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/a-propos" className="hover:text-accent transition-smooth">À propos</Link></li>
            <li><Link to="/produits" className="hover:text-accent transition-smooth">Nos produits</Link></li>
            <li><Link to="/actualites" className="hover:text-accent transition-smooth">Actualités</Link></li>
            <li><Link to="/faq" className="hover:text-accent transition-smooth">FAQ</Link></li>
            <li><Link to="/mediatheque" className="hover:text-accent transition-smooth">Médiathèque</Link></li>
            <li><Link to="/partenaires" className="hover:text-accent transition-smooth">Partenaires</Link></li>
            <li><Link to="/contact" className="hover:text-accent transition-smooth">Contact</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-display text-lg mb-4">Nos produits</h3>
          <ul className="space-y-2 text-sm">
            <li><Link to="/produits/epargne" className="hover:text-accent transition-smooth">Épargne rémunérée</Link></li>
            <li><Link to="/produits/credits" className="hover:text-accent transition-smooth">Formules de crédit</Link></li>
            <li><Link to="/produits/immobilier" className="hover:text-accent transition-smooth">Projet immobilier</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="text-white font-display text-lg mb-4">Contact</h3>
          <ul className="space-y-3 text-sm">
            <li className="flex gap-3"><MapPin className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> Avenue Houdaille, Immeuble SIDAM, 6ème étage, Plateau, Abidjan</li>
            <li className="flex gap-3"><Phone className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> (+225) 27 21 23 64 87</li>
            <li className="flex gap-3"><Mail className="h-4 w-4 mt-0.5 shrink-0 text-accent" /> contact@ma2e.ci</li>
          </ul>
        </div>
      </div>

      <div className="mt-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border-t border-white/10 pt-6 text-xs text-white/50">
        <p>© {new Date().getFullYear()} MA2E — Tous droits réservés.</p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <Link to="/mentions-legales" className="hover:text-accent">Mentions légales</Link>
          <Link to="/cgu" className="hover:text-accent">CGU</Link>
          <Link to="/politique-dcp" className="hover:text-accent">Politique DCP</Link>
        </div>
      </div>
    </div>
  </footer>
);
