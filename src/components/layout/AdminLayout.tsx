import { useState, useEffect } from "react";
import { Link, useNavigate, useLocation, Outlet, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { 
  LayoutDashboard, 
  Newspaper, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Bell, 
  User, 
  ChevronRight,
  Database,
  Briefcase,
  HelpCircle,
  Handshake,
  UsersRound,
  Inbox,
  History
} from "lucide-react";
import { Logo } from "@/components/Logo";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

const SidebarLink = ({ to, icon: Icon, label, active, collapsed }: { to: string, icon: any, label: string, active: boolean, collapsed: boolean }) => (
  <Link
    to={to}
    className={cn(
      "flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group",
      active 
        ? "bg-primary text-white shadow-md shadow-primary/20" 
        : "text-muted-foreground hover:bg-secondary hover:text-primary"
    )}
  >
    <Icon className={cn("h-5 w-5 shrink-0", active ? "text-white" : "group-hover:scale-110 transition-transform")} />
    {!collapsed && <span className="font-medium text-sm">{label}</span>}
    {!collapsed && active && <ChevronRight className="ml-auto h-4 w-4 opacity-70" />}
  </Link>
);

export const AdminLayout = () => {
  const { user, isAuthenticated, logout, can } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!isAuthenticated) {
    return <Navigate to="/admin/login" replace />;
  }

  // Menu regroupé par thème pour s'y retrouver plus vite.
  const navGroups: { title: string | null; items: { to: string; icon: any; label: string; perm?: string }[] }[] = [
    { title: null, items: [
      { to: "/admin/dashboard", icon: LayoutDashboard, label: "Tableau de bord" },
    ] },
    { title: "Contenu & pages", items: [
      { to: "/admin/settings", icon: Settings, label: "Paramètres du site", perm: "settings:write" },
      { to: "/admin/news", icon: Newspaper, label: "Actualités", perm: "news:write" },
      { to: "/admin/media", icon: Database, label: "Médiathèque", perm: "media:write" },
      { to: "/admin/faq", icon: HelpCircle, label: "FAQ", perm: "faq:write" },
    ] },
    { title: "Offres & adhésions", items: [
      { to: "/admin/products", icon: Briefcase, label: "Produits & Offres", perm: "products:write" },
      { to: "/admin/applications", icon: FileText, label: "Demandes & Formulaires", perm: "applications:manage" },
      { to: "/admin/contact", icon: Inbox, label: "Messages de contact", perm: "contact:manage" },
    ] },
    { title: "Institution", items: [
      { to: "/admin/team", icon: UsersRound, label: "Équipe & gouvernance", perm: "team:write" },
      { to: "/admin/partners", icon: Handshake, label: "Partenaires", perm: "partners:write" },
    ] },
    { title: "Administration", items: [
      { to: "/admin/users", icon: Users, label: "Utilisateurs", perm: "users:manage" },
      { to: "/admin/audit", icon: History, label: "Journal d'activité", perm: "users:manage" },
    ] },
  ];

  // Menu adaptatif : on n'affiche que ce que l'utilisateur a le droit de gérer (et on masque les groupes vides).
  const visibleGroups = navGroups
    .map((g) => ({ ...g, items: g.items.filter((item) => !item.perm || can(item.perm)) }))
    .filter((g) => g.items.length > 0);

  const renderGroups = (isCollapsed: boolean) =>
    visibleGroups.map((group, gi) => (
      <div key={group.title ?? gi} className="space-y-1">
        {group.title && !isCollapsed && (
          <p className="px-3 pt-3 pb-1 text-[10px] font-bold uppercase tracking-wider text-muted-foreground/60">{group.title}</p>
        )}
        {group.title && isCollapsed && gi > 0 && <div className="mx-2 my-2 border-t border-border/50" />}
        {group.items.map((item) => (
          <SidebarLink
            key={item.to}
            {...item}
            active={location.pathname === item.to}
            collapsed={isCollapsed}
          />
        ))}
      </div>
    ));

  return (
    <div className="min-h-screen bg-secondary/20 flex">
      {/* Sidebar Desktop */}
      <aside 
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card transition-all duration-300 z-30 sticky top-0 h-screen",
          collapsed ? "w-20" : "w-64"
        )}
      >
        <div className="p-6 flex items-center justify-between border-b border-border/50">
          <Link to="/admin/dashboard" className={cn("transition-all", collapsed && "scale-75 origin-left")}>
            <Logo />
          </Link>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-2 mt-4 [scrollbar-width:thin]">
          {renderGroups(collapsed)}
        </nav>

        <div className="p-4 border-t border-border/50">
          <button
            onClick={logout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors group"
          >
            <LogOut className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
            {!collapsed && <span className="font-medium text-sm">Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="h-16 border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-20 flex items-center justify-between px-4 md:px-8">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => setCollapsed(!collapsed)} className="hidden md:flex">
              <Menu className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" onClick={() => setMobileOpen(true)} className="md:hidden">
              <Menu className="h-5 w-5" />
            </Button>
            <h1 className="font-display font-bold text-lg hidden sm:block">Back-office MA2E</h1>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <Button variant="ghost" size="icon" className="relative text-muted-foreground">
              <Bell className="h-5 w-5" />
              <span className="absolute top-2 right-2 h-2 w-2 bg-destructive rounded-full border-2 border-card" />
            </Button>
            
            <div className="h-8 w-px bg-border mx-1" />
            
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-bold">{user?.name}</div>
                <div className="text-[10px] uppercase tracking-wider font-mono text-primary font-bold">{user?.role}</div>
              </div>
              <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold">
                {user?.name.charAt(0)}
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-4 md:p-8 animate-fade-in">
          <Outlet />
        </main>
      </div>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-72 bg-card p-6 flex flex-col animate-slide-right">
            <div className="flex items-center justify-between mb-8">
              <Logo />
              <Button variant="ghost" size="icon" onClick={() => setMobileOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>
            <nav className="flex-1 overflow-y-auto space-y-2 [scrollbar-width:thin]">
              {renderGroups(false)}
            </nav>
            <button
              onClick={logout}
              className="flex items-center gap-3 w-full px-3 py-4 text-destructive font-bold border-t border-border mt-4"
            >
              <LogOut className="h-5 w-5" />
              <span>Déconnexion</span>
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};
