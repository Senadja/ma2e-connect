import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  FileText, 
  Newspaper, 
  TrendingUp, 
  ArrowUpRight, 
  ArrowDownRight, 
  Clock, 
  ChevronRight,
  Bell,
  Activity,
  UserCheck
} from "lucide-react";
import { STATS } from "@/data/site";
import { Link } from "react-router-dom";
import { cn } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api";

const initials = (name: string) =>
  name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();

const relativeDate = (iso: string) => {
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3_600_000);
  if (h < 1) return "À l'instant";
  if (h < 24) return `Il y a ${h}h`;
  const d = Math.floor(h / 24);
  return d === 1 ? "Hier" : `Il y a ${d} j`;
};

const DashboardStat = ({ title, value, icon: Icon, trend, trendValue, color }: { title: string, value: string | number, icon: any, trend?: 'up' | 'down', trendValue?: string, color: string }) => (
  <Card className="border-border/40 shadow-sm overflow-hidden group hover:shadow-md transition-all duration-300">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-bold text-muted-foreground uppercase tracking-wider">{title}</CardTitle>
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110", color)}>
        <Icon className="h-5 w-5" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-3xl font-display font-bold">{value}</div>
      {trend && (
        <p className="text-xs mt-2 flex items-center gap-1 font-medium">
          <span className={cn("flex items-center px-1.5 py-0.5 rounded-full", trend === 'up' ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700")}>
            {trend === 'up' ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
            {trendValue}
          </span>
          <span className="text-muted-foreground ml-1">vs mois dernier</span>
        </p>
      )}
    </CardContent>
  </Card>
);

interface ApiApplication {
  appId: string;
  type: string;
  category: string;
  name: string;
  status: "PENDING" | "REVIEWING" | "APPROVED" | "REJECTED";
  createdAt: string;
}

const Dashboard = () => {
  const { user } = useAuth();

  const { data: applications = [] } = useQuery({
    queryKey: ["applications"],
    queryFn: () => api<ApiApplication[]>("/applications", { auth: true }),
  });
  const { data: articles = [] } = useQuery({
    queryKey: ["articles", "all"],
    queryFn: () => api<unknown[]>("/articles?status=all"),
  });

  const pendingCount = applications.filter((a) => a.status === "PENDING").length;
  const approvedCount = applications.filter((a) => a.status === "APPROVED").length;
  const recent = applications.slice(0, 5).map((a) => ({
    name: a.name,
    type: a.type,
    service: a.category,
    date: relativeDate(a.createdAt),
    status: a.status.toLowerCase(),
    avatar: initials(a.name),
  }));

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h2 className="text-4xl font-display font-bold tracking-tight text-primary-dark">Vue d'ensemble</h2>
          <p className="text-muted-foreground mt-2 text-lg">
            Ravi de vous revoir, <span className="text-primary font-bold">{user?.name}</span>. L'activité est en hausse ce matin.
          </p>
        </div>
        <div className="flex gap-3">
          <Button className="rounded-full h-12 px-8 bg-primary text-white shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform gap-2" asChild>
            <Link to="/admin/applications"><FileText className="h-4 w-4" /> Traiter les demandes</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStat
          title="Sociétaires"
          value={STATS[0].value.toLocaleString()}
          icon={Users}
          color="bg-blue-100 text-blue-700"
        />
        <DashboardStat
          title="Demandes reçues"
          value={applications.length}
          icon={FileText}
          color="bg-amber-100 text-amber-700"
        />
        <DashboardStat
          title="Demandes approuvées"
          value={approvedCount}
          icon={UserCheck}
          color="bg-emerald-100 text-emerald-700"
        />
        <DashboardStat
          title="Publications"
          value={articles.length}
          icon={Newspaper}
          color="bg-purple-100 text-purple-700"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-12">
        <Card className="lg:col-span-8 border-border/40 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border/40 bg-card/50 px-8 py-6">
            <div className="flex items-center gap-3">
              <Activity className="h-5 w-5 text-primary" />
              <CardTitle className="text-xl font-display font-bold">Dernières Activités</CardTitle>
            </div>
            <Button variant="ghost" size="sm" className="text-primary font-bold hover:bg-primary/5" asChild>
              <Link to="/admin/applications">Voir tout <ChevronRight className="h-4 w-4 ml-1" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-border/40">
              {recent.length === 0 && (
                <div className="px-8 py-12 text-center text-sm text-muted-foreground italic">
                  Aucune demande reçue pour le moment.
                </div>
              )}
              {recent.map((item, i) => (
                <div key={i} className="flex items-center justify-between px-8 py-5 hover:bg-secondary/10 transition-colors cursor-pointer group">
                  <div className="flex items-center gap-5">
                    <div className="h-12 w-12 rounded-2xl bg-secondary border border-border flex items-center justify-center font-bold text-primary transition-transform group-hover:scale-110">
                      {item.avatar}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                         <p className="font-bold text-base leading-none">{item.name}</p>
                         <Badge variant="outline" className="text-[9px] py-0 h-4 border-primary/20 text-primary uppercase font-bold">{item.type}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5">{item.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={cn(
                      "text-[10px] px-3 py-1 rounded-full font-bold uppercase tracking-wider inline-block",
                      item.status === "approved" ? "bg-emerald-100 text-emerald-700" : 
                      item.status === "pending" ? "bg-amber-100 text-amber-700" : 
                      "bg-rose-100 text-rose-700"
                    )}>
                      {item.status === "approved" ? "Validé" : item.status === "pending" ? "En attente" : "Rejeté"}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-2 flex items-center justify-end gap-1 font-medium">
                      <Clock className="h-3 w-3" /> {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="lg:col-span-4 space-y-6">
          <Card className="border-border/40 shadow-sm rounded-3xl overflow-hidden bg-primary text-white">
            <CardHeader className="pb-4">
              <div className="flex items-center gap-2 text-white/80">
                <UserCheck className="h-4 w-4" />
                <span className="text-xs font-bold uppercase tracking-widest">Support Sociétaires</span>
              </div>
              <CardTitle className="text-2xl font-display font-bold mt-2">Prêt à aider ?</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-white/80 mb-6 leading-relaxed">
                Vous avez <span className="font-bold text-white underline decoration-accent decoration-2 underline-offset-4">{pendingCount} demande{pendingCount > 1 ? "s" : ""} en attente</span> de votre validation.
              </p>
              <Button className="w-full rounded-2xl h-12 bg-white text-primary font-bold hover:bg-white/90 shadow-xl shadow-black/10 transition-transform active:scale-95" asChild>
                <Link to="/admin/applications">Ouvrir la file d'attente</Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-border/40 shadow-sm rounded-3xl overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border/40">
              <CardTitle className="text-lg font-display font-bold">Actions de Gestion</CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <Button variant="outline" className="w-full justify-start gap-3 rounded-2xl h-14 px-5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group" asChild>
                <Link to="/admin/news">
                  <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
                    <Newspaper className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm">Publier un article</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-2xl h-14 px-5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group" asChild>
                <Link to="/admin/applications">
                  <div className="h-8 w-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                    <Users className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm">Demandes d'adhésion</span>
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start gap-3 rounded-2xl h-14 px-5 border-border/60 hover:border-primary/40 hover:bg-primary/5 transition-all group" asChild>
                <Link to="/admin/media">
                  <div className="h-8 w-8 rounded-lg bg-emerald-100 flex items-center justify-center text-emerald-700 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
                    <TrendingUp className="h-4 w-4" />
                  </div>
                  <span className="font-bold text-sm">Rapports & documents</span>
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
