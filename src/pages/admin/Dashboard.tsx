import { useAuth } from "@/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, FileText, Newspaper, TrendingUp, ArrowUpRight, ArrowDownRight, Clock } from "lucide-react";
import { STATS } from "@/data/site";

const DashboardStat = ({ title, value, icon: Icon, trend, trendValue }: { title: string, value: string | number, icon: any, trend?: 'up' | 'down', trendValue?: string }) => (
  <Card className="border-border/40 shadow-sm">
    <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
      <CardTitle className="text-sm font-medium text-muted-foreground">{title}</CardTitle>
      <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
        <Icon className="h-4 w-4" />
      </div>
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      {trend && (
        <p className="text-xs mt-1 flex items-center gap-1">
          {trend === 'up' ? <ArrowUpRight className="h-3 w-3 text-emerald-500" /> : <ArrowDownRight className="h-3 w-3 text-destructive" />}
          <span className={trend === 'up' ? "text-emerald-500" : "text-destructive"}>{trendValue}</span>
          <span className="text-muted-foreground ml-1">depuis le mois dernier</span>
        </p>
      )}
    </CardContent>
  </Card>
);

const Dashboard = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-display font-bold tracking-tight text-primary-dark">Tableau de bord</h2>
        <p className="text-muted-foreground mt-1">
          Bienvenue, {user?.name}. Voici un aperçu de l'activité de la MA2E aujourd'hui.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStat 
          title="Adhérents Total" 
          value={STATS[0].value.toLocaleString()} 
          icon={Users} 
          trend="up" 
          trendValue="+2.5%" 
        />
        <DashboardStat 
          title="Nouvelles Demandes" 
          value="24" 
          icon={FileText} 
          trend="up" 
          trendValue="+12%" 
        />
        <DashboardStat 
          title="Articles publiés" 
          value="156" 
          icon={Newspaper} 
        />
        <DashboardStat 
          title="Volume Crédits" 
          value="2.4 Mds" 
          icon={TrendingUp} 
          trend="up" 
          trendValue="+5.4%" 
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="lg:col-span-4 border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Dernières demandes d'adhésion</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {[
                { name: "Mamadou Koné", service: "CIE - Plateau", date: "Il y a 2h", status: "En attente" },
                { name: "Awa Diarra", service: "SODECI - Yopougon", date: "Il y a 5h", status: "En attente" },
                { name: "Jean-Pierre Kouassi", service: "CIE - Yamoussoukro", date: "Hier", status: "Validé" },
                { name: "Marie-Louise Kouamé", service: "MA2E - Siège", date: "Hier", status: "Validé" },
              ].map((item, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-9 w-9 rounded-full bg-secondary flex items-center justify-center font-bold text-xs">
                      {item.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-sm font-bold leading-none">{item.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">{item.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className={item.status === "Validé" ? "text-[10px] bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full font-bold" : "text-[10px] bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-bold"}>
                      {item.status}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1 flex items-center justify-end gap-1">
                      <Clock className="h-2 w-2" /> {item.date}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <Button variant="outline" className="w-full mt-6 rounded-lg text-xs" asChild>
              <a href="/admin/applications">Voir toutes les demandes</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-border/40 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-display font-bold">Actions rapides</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-3">
            <Button className="justify-start gap-3 rounded-xl h-12 bg-primary text-white hover:bg-primary/90">
              <Newspaper className="h-5 w-5" />
              <span>Publier une actualité</span>
            </Button>
            <Button variant="outline" className="justify-start gap-3 rounded-xl h-12">
              <Users className="h-5 w-5" />
              <span>Gérer les adhérents</span>
            </Button>
            <Button variant="outline" className="justify-start gap-3 rounded-xl h-12">
              <FileText className="h-5 w-5" />
              <span>Exporter les rapports</span>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;
