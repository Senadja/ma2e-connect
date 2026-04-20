import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import About from "./pages/About.tsx";
import Products from "./pages/Products.tsx";
import Savings from "./pages/Savings.tsx";
import Credits from "./pages/Credits.tsx";
import RealEstate from "./pages/RealEstate.tsx";
import News from "./pages/News.tsx";
import NewsDetail from "./pages/NewsDetail.tsx";
import Contact from "./pages/Contact.tsx";
import Faq from "./pages/Faq.tsx";
import Mediatheque from "./pages/Mediatheque.tsx";
import Partners from "./pages/Partners.tsx";
import MentionsLegales from "./pages/legal/MentionsLegales.tsx";
import Cgu from "./pages/legal/Cgu.tsx";
import PolitiqueDcp from "./pages/legal/PolitiqueDcp.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
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
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
