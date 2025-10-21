import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Plane, 
  Users, 
  ClipboardList, 
  BarChart3
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    aircraft: 0,
    employees: 0,
    reports: 0,
    serviceRate: 0,
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      fetchStats();
    }
  }, [user]);

  const fetchStats = async () => {
    const [aircraftResult, employeesResult] = await Promise.all([
      supabase.from("aircraft").select("*", { count: "exact", head: true }).eq("ativo", true),
      supabase.from("employees").select("*", { count: "exact", head: true }).eq("ativo", true),
    ]);

    setStats({
      aircraft: aircraftResult.count || 0,
      employees: employeesResult.count || 0,
      reports: 0,
      serviceRate: 0,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-sky flex items-center justify-center">
        <div className="animate-pulse">
          <Plane className="h-12 w-12 text-primary" />
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Aeronaves Ativas",
      value: stats.aircraft,
      icon: Plane,
      description: "Registadas no sistema",
      gradient: "gradient-primary",
      link: "/aircraft"
    },
    {
      title: "Funcionários",
      value: stats.employees,
      icon: Users,
      description: "Ativos no quadro",
      gradient: "gradient-sky",
      link: "/employees"
    },
    {
      title: "Relatórios Hoje",
      value: stats.reports,
      icon: ClipboardList,
      description: "Pendentes e completos",
      gradient: "gradient-accent",
      link: "/reports"
    },
    {
      title: "Taxa de Serviço",
      value: `${stats.serviceRate}%`,
      icon: BarChart3,
      description: "Média do mês",
      gradient: "gradient-primary"
    }
  ];

  return (
    <MainLayout user={user}>
      {/* Welcome Section */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">
          Bem-vindo ao AirPlus AAMS
        </h1>
        <p className="text-muted-foreground">
          Sistema de Gestão de Operações Aeronáuticas
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statsCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card 
              key={stat.title} 
              className="transition-smooth hover:shadow-lg cursor-pointer"
              onClick={() => stat.link && navigate(stat.link)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.gradient}`}>
                    <Icon className="h-4 w-4 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold mb-1">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle>Ações Rápidas</CardTitle>
          <CardDescription>
            Acesso rápido às funcionalidades principais
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate("/reports")}
            >
              <ClipboardList className="h-6 w-6" />
              <span>Novo Relatório</span>
            </Button>
            <Button 
              variant="secondary" 
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate("/aircraft")}
            >
              <Plane className="h-6 w-6" />
              <span>Gerir Aeronaves</span>
            </Button>
            <Button 
              variant="outline" 
              className="h-24 flex flex-col gap-2"
              onClick={() => navigate("/employees")}
            >
              <Users className="h-6 w-6" />
              <span>Gerir Funcionários</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </MainLayout>
  );
}
