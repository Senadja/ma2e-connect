import { useState } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FlashBanner } from "./FlashBanner";
import { MobileBottomNav } from "./MobileBottomNav";
import { FloatingWidgets } from "@/components/FloatingWidgets";

export const Layout = ({ children }: { children: React.ReactNode }) => {
  const [mobileMenuOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen flex-col bg-background selection:bg-primary/10">
      <FlashBanner />
      <Navbar mobileOpenExtern={mobileMenuOpen} setMobileOpenExtern={setMobileOpen} />
      <main className="flex-1 pb-20 lg:pb-0">{children}</main>
      <Footer />
      <FloatingWidgets />
      <MobileBottomNav onMenuClick={() => setMobileOpen(true)} />
    </div>
  );
};
