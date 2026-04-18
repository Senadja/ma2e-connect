import { ReactNode } from "react";
import { Navbar } from "./Navbar";
import { Footer } from "./Footer";
import { FlashBanner } from "./FlashBanner";

export const Layout = ({ children }: { children: ReactNode }) => (
  <div className="min-h-screen flex flex-col">
    <FlashBanner />
    <Navbar />
    <main className="flex-1 pt-16 lg:pt-20">{children}</main>
    <Footer />
  </div>
);
