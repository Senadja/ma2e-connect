import { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  breadcrumb: { label: string; href?: string }[];
  children?: ReactNode;
}

export const PageHero = ({ title, subtitle, breadcrumb, children }: PageHeroProps) => (
  <section className="relative bg-gradient-hero text-white overflow-hidden">
    <div className="absolute inset-0 grid-pattern-light opacity-60" aria-hidden />
    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-drift" aria-hidden />
    <div className="relative container py-20 md:py-28">
      <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-sm text-white/70 mb-4">
        {breadcrumb.map((b, i) => (
          <span key={i} className="inline-flex items-center gap-2">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5" />}
            {b.href ? <Link to={b.href} className="hover:text-accent">{b.label}</Link> : <span className="text-accent">{b.label}</span>}
          </span>
        ))}
      </nav>
      <h1 className="font-display text-4xl md:text-6xl font-bold text-balance">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>}
      {children}
    </div>
  </section>
);
