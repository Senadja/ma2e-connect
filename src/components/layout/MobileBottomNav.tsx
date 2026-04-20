import { NavLink } from "react-router-dom";
import { Home, UserPlus, Briefcase, MessageSquare, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

export const MobileBottomNav = ({ onMenuClick }: { onMenuClick: () => void }) => {
  const items = [
    { icon: Home, label: "Accueil", to: "/" },
    { icon: UserPlus, label: "Adhésion", to: "/adhesion" },
    { icon: Briefcase, label: "Produits", to: "/produits" },
    { icon: MessageSquare, label: "Contact", to: "/contact" },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 bg-background/80 backdrop-blur-xl border-t border-border z-40 pb-safe">
      <div className="container h-16 flex items-center justify-around">
        {items.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => cn(
              "flex flex-col items-center gap-1 transition-all duration-300",
              isActive ? "text-primary scale-110" : "text-muted-foreground hover:text-primary"
            )}
          >
            <item.icon className="h-5 w-5" />
            <span className="text-[10px] font-bold uppercase tracking-tighter">{item.label}</span>
            <span className={cn(
              "h-1 w-1 rounded-full bg-primary transition-all duration-300",
              "opacity-0 scale-0",
              "group-[.active]:opacity-100 group-[.active]:scale-100"
            )} />
          </NavLink>
        ))}
        <button 
          onClick={onMenuClick}
          className="flex flex-col items-center gap-1 text-muted-foreground hover:text-primary transition-all"
        >
          <Menu className="h-5 w-5" />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Menu</span>
        </button>
      </div>
    </nav>
  );
};
