import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Suspense, lazy } from "react";

// Lazy loaded pages for performance
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

// Loading fallback
const PageLoader = () => (
  <div className="h-screen w-full flex items-center justify-center bg-background">
    <div className="flex flex-col items-center gap-4">
      <div className="h-12 w-12 rounded-full border-4 border-primary border-t-transparent animate-spin" />
      <p className="text-sm font-medium text-muted-foreground animate-pulse">Chargement...</p>
    </div>
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
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </BrowserRouter>
      </TooltipProvider>
    </HelmetProvider>
  </QueryClientProvider>
);

export default App;
