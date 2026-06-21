import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy, type ComponentType } from "react";
import { AdminLayout } from "./components/layout/AdminLayout";
import { BrandTheme } from "./components/BrandTheme";
import { MatomoTracker } from "./components/MatomoTracker";
import { ScrollToHash } from "./components/ScrollToHash";
import { RouteSEO } from "./components/RouteSEO";

// Recharge la page si un chunk lazy échoue (cas du redéploiement : noms de chunks renommés).
// Garde anti-boucle : un seul rechargement par fenêtre de 10 s.
const lazyWithReload = <T extends ComponentType<any>>(factory: () => Promise<{ default: T }>) =>
  lazy(() =>
    factory().catch((err) => {
      const KEY = "ma2e-chunk-reload-ts";
      const last = Number(sessionStorage.getItem(KEY) || 0);
      if (Date.now() - last > 10000) {
        sessionStorage.setItem(KEY, String(Date.now()));
        window.location.reload();
        return new Promise<{ default: T }>(() => {});
      }
      throw err;
    })
  );

// Lazy loaded pages
const Index = lazyWithReload(() => import("./pages/Index.tsx"));
const Adhesion = lazyWithReload(() => import("./pages/Adhesion.tsx"));
const About = lazyWithReload(() => import("./pages/About.tsx"));
const Products = lazyWithReload(() => import("./pages/Products.tsx"));
const Savings = lazyWithReload(() => import("./pages/Savings.tsx"));
const Credits = lazyWithReload(() => import("./pages/Credits.tsx"));
const RealEstate = lazyWithReload(() => import("./pages/RealEstate.tsx"));
const News = lazyWithReload(() => import("./pages/News.tsx"));
const NewsDetail = lazyWithReload(() => import("./pages/NewsDetail.tsx"));
const Contact = lazyWithReload(() => import("./pages/Contact.tsx"));
const Faq = lazyWithReload(() => import("./pages/Faq.tsx"));
const Mediatheque = lazyWithReload(() => import("./pages/Mediatheque.tsx"));
const Partners = lazyWithReload(() => import("./pages/Partners.tsx"));
const MentionsLegales = lazyWithReload(() => import("./pages/legal/MentionsLegales.tsx"));
const Cgu = lazyWithReload(() => import("./pages/legal/Cgu.tsx"));
const PolitiqueDcp = lazyWithReload(() => import("./pages/legal/PolitiqueDcp.tsx"));
const EspaceSocietaire = lazyWithReload(() => import("./pages/EspaceSocietaire.tsx"));
const NotFound = lazyWithReload(() => import("./pages/NotFound.tsx"));

// Admin Pages
const AdminLogin = lazyWithReload(() => import("./pages/admin/Login.tsx"));
const AdminDashboard = lazyWithReload(() => import("./pages/admin/Dashboard.tsx"));
const NewsManager = lazyWithReload(() => import("./pages/admin/NewsManager.tsx").then(m => ({ default: m.NewsManager })));
const ApplicationsManager = lazyWithReload(() => import("./pages/admin/ApplicationsManager.tsx").then(m => ({ default: m.ApplicationsManager })));
const ProductsManager = lazyWithReload(() => import("./pages/admin/ProductsManager.tsx").then(m => ({ default: m.ProductsManager })));
const MediaLibraryPage = lazyWithReload(() => import("./components/admin/MediaLibrary.tsx").then(m => ({ default: m.MediaLibrary })));
const UsersManager = lazyWithReload(() => import("./pages/admin/UsersManager.tsx"));
const FaqManager = lazyWithReload(() => import("./pages/admin/FaqManager.tsx"));
const SettingsManager = lazyWithReload(() => import("./pages/admin/SettingsManager.tsx"));
const PartnersManager = lazyWithReload(() => import("./pages/admin/PartnersManager.tsx"));
const TeamManager = lazyWithReload(() => import("./pages/admin/TeamManager.tsx"));
const ContactManager = lazyWithReload(() => import("./pages/admin/ContactManager.tsx"));
const AuditLog = lazyWithReload(() => import("./pages/admin/AuditLog.tsx"));

const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />      
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Chargement...</p>
    </div>
  </div>
);

const Placeholder = ({ title }: { title: string }) => (
  <div className="p-8 border-2 border-dashed border-border rounded-2xl flex flex-col items-center justify-center min-h-[400px] text-center">
    <h2 className="text-2xl font-display font-bold text-muted-foreground">{title}</h2>
    <p className="text-muted-foreground mt-2">Ce module est en cours de développement.</p>
  </div>
);

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <TooltipProvider>
        <BrandTheme />
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <MatomoTracker />
          <ScrollToHash />
          <RouteSEO />
          <Suspense fallback={<PageLoader />}>
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Index />} />
              <Route path="/adhesion" element={<Adhesion />} />
              <Route path="/a-propos" element={<About />} />
              <Route path="/produits" element={<Products />} />
              <Route path="/produits/epargne" element={<Savings />} />
              <Route path="/produits/credits" element={<Credits />} />
              <Route path="/produits/immobilier" element={<RealEstate />} />
              <Route path="/actualites" element={<News />} />
              <Route path="/actualites/:slug" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/mediatheque" element={<Mediatheque />} />
              <Route path="/partenaires" element={<Partners />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgu" element={<Cgu />} />
              <Route path="/politique-dcp" element={<PolitiqueDcp />} />
              <Route path="/espace-ema2e" element={<EspaceSocietaire />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="news" element={<NewsManager />} />
                <Route path="products" element={<ProductsManager />} />
                <Route path="faq" element={<FaqManager />} />
                <Route path="applications" element={<ApplicationsManager />} />
                <Route path="contact" element={<ContactManager />} />
                <Route path="media" element={<MediaLibraryPage />} />
                <Route path="partners" element={<PartnersManager />} />
                <Route path="team" element={<TeamManager />} />
                <Route path="users" element={<UsersManager />} />
                <Route path="audit" element={<AuditLog />} />
                <Route path="settings" element={<SettingsManager />} />
              </Route>

              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
