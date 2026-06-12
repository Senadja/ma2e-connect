import { ReactNode } from "react";

interface PageHeroProps {
  title: string;
  subtitle?: string;
  /** Conservé pour compatibilité d'appel ; le fil d'Ariane n'est plus affiché. */
  breadcrumb?: { label: string; href?: string }[];
  children?: ReactNode;
}

export const PageHero = ({ title, subtitle, children }: PageHeroProps) => (
  <section className="relative bg-gradient-hero text-white overflow-hidden">
    <div className="absolute inset-0 grid-pattern-light opacity-60" aria-hidden />
    <div className="absolute -top-32 -right-32 h-96 w-96 rounded-full bg-accent/20 blur-3xl animate-drift" aria-hidden />
    <div className="relative container py-20 md:py-28">
      <h1 className="font-display text-4xl md:text-6xl font-bold text-balance">{title}</h1>
      {subtitle && <p className="mt-4 max-w-2xl text-lg text-white/80">{subtitle}</p>}
      {children}
    </div>
  </section>
);
