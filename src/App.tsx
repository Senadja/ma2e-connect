import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes, Navigate } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";
import { AdminLayout } from "./components/layout/AdminLayout";

// Lazy loaded pages
const Index = lazy(() => import("./pages/Index.tsx"));
const Adhesion = lazy(() => import("./pages/Adhesion.tsx"));
const About = lazy(() => import("./pages/About.tsx"));
const Products = lazy(() => import("./pages/Products.tsx"));
const Savings = lazy(() => import("./pages/Savings.tsx"));
const Credits = lazy(() => import("./pages/Credits.tsx"));
const RealEstate = lazy(() => import("./pages/RealEstate.tsx"));
const News = lazy(() => import("./pages/News.tsx"));
const NewsDetail = lazy(() => import("./pages/NewsDetail.tsx"));
const Contact = lazy(() => import("./pages/Contact.tsx"));
const Faq = lazy(() => import("./pages/Faq.tsx"));
const Mediatheque = lazy(() => import("./pages/Mediatheque.tsx"));
const Partners = lazy(() => import("./pages/Partners.tsx"));
const MentionsLegales = lazy(() => import("./pages/legal/MentionsLegales.tsx"));
const Cgu = lazy(() => import("./pages/legal/Cgu.tsx"));
const PolitiqueDcp = lazy(() => import("./pages/legal/PolitiqueDcp.tsx"));
const NotFound = lazy(() => import("./pages/NotFound.tsx"));

// Admin Pages
const AdminLogin = lazy(() => import("./pages/admin/Login.tsx"));
const AdminDashboard = lazy(() => import("./pages/admin/Dashboard.tsx"));

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
        <Toaster />
        <Sonner />
        <BrowserRouter>
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
              <Route path="/actualites/:id" element={<NewsDetail />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/faq" element={<Faq />} />
              <Route path="/mediatheque" element={<Mediatheque />} />
              <Route path="/partenaires" element={<Partners />} />
              <Route path="/mentions-legales" element={<MentionsLegales />} />
              <Route path="/cgu" element={<Cgu />} />
              <Route path="/politique-dcp" element={<PolitiqueDcp />} />

              {/* Admin Routes */}
              <Route path="/admin/login" element={<AdminLogin />} />
              <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Navigate to="/admin/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="news" element={<Placeholder title="Gestion des Actualités" />} />
                <Route path="products" element={<Placeholder title="Gestion des Produits" />} />
                <Route path="applications" element={<Placeholder title="Gestion des Demandes" />} />
                <Route path="users" element={<Placeholder title="Gestion des Utilisateurs" />} />
                <Route path="settings" element={<Placeholder title="Paramètres du système" />} />
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
