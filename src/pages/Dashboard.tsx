import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Logo } from "@/components/ui/logo";
import { toast } from "sonner";
import { 
  Plane, 
  Users, 
  ClipboardList, 
  BarChart3, 
  LogOut,
  Menu
} from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

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

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate("/auth");
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-sky flex items-center justify-center">
        <div className="animate-pulse">
          <Logo />
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      title: "Aeronaves Ativas",
      value: "0",
      icon: Plane,
      description: "Registadas no sistema",
      gradient: "gradient-primary"
    },
    {
      title: "Funcionários",
      value: "0",
      icon: Users,
      description: "Ativos no turno atual",
      gradient: "gradient-sky"
    },
    {
      title: "Relatórios Hoje",
      value: "0",
      icon: ClipboardList,
      description: "Pendentes e completos",
      gradient: "gradient-accent"
    },
    {
      title: "Taxa de Serviço",
      value: "0%",
      icon: BarChart3,
      description: "Média do mês",
      gradient: "gradient-primary"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary shadow-aviation sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo className="text-primary-foreground" />
            
            <div className="flex items-center gap-4">
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-primary-foreground">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-primary-foreground/80">
                  Super Administrador
                </p>
              </div>
              
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-primary-foreground hover:bg-primary-light"
              >
                <LogOut className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
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
              <Card key={stat.title} className="transition-smooth hover:shadow-lg">
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
              <Button className="h-24 flex flex-col gap-2">
                <ClipboardList className="h-6 w-6" />
                <span>Novo Relatório</span>
              </Button>
              <Button variant="secondary" className="h-24 flex flex-col gap-2">
                <Plane className="h-6 w-6" />
                <span>Gerir Aeronaves</span>
              </Button>
              <Button variant="outline" className="h-24 flex flex-col gap-2">
                <Users className="h-6 w-6" />
                <span>Gerir Equipas</span>
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
