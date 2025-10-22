import { ReactNode, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/ui/logo";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import {
  LogOut,
  Menu,
  Plane,
  Users,
  Clock,
  UsersRound,
  ClipboardList,
  Settings,
  LayoutDashboard
} from "lucide-react";

interface MainLayoutProps {
  children: ReactNode;
  user: any;
}

export const MainLayout = ({ children, user }: MainLayoutProps) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    toast.success("Sessão encerrada");
    navigate("/auth");
  };

  const menuItems = [
    { icon: LayoutDashboard, label: "Dashboard", path: "/" },
    { icon: Plane, label: "Aeronaves", path: "/aircraft" },
    { icon: Users, label: "Funcionários", path: "/employees" },
    { icon: Clock, label: "Turnos", path: "/shifts" },
    { icon: ClipboardList, label: "Relatórios", path: "/reports" },
    { icon: UsersRound, label: "Serviços", path: "/services" },
    { icon: Settings, label: "Configurações", path: "/config" },
  ];

  const MenuItem = ({ icon: Icon, label, path, mobile = false }: any) => (
    <Button
      variant="ghost"
      className={`${
        mobile ? "w-full justify-start" : ""
      } text-primary-foreground hover:bg-primary-light`}
      onClick={() => {
        navigate(path);
        setMobileMenuOpen(false);
      }}
    >
      <Icon className="h-5 w-5 mr-2" />
      {label}
    </Button>
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="gradient-primary shadow-aviation sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Logo className="text-primary-foreground" />

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-2">
              {menuItems.map((item) => (
                <MenuItem key={item.path} {...item} />
              ))}
            </nav>

            <div className="flex items-center gap-4">
              {/* User Info */}
              <div className="hidden md:block text-right">
                <p className="text-sm font-medium text-primary-foreground">
                  {user?.user_metadata?.full_name || user?.email}
                </p>
                <p className="text-xs text-primary-foreground/80">
                  Super Administrador
                </p>
              </div>

              {/* Sign Out */}
              <Button
                variant="ghost"
                size="icon"
                onClick={handleSignOut}
                className="text-primary-foreground hover:bg-primary-light"
              >
                <LogOut className="h-5 w-5" />
              </Button>

              {/* Mobile Menu */}
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild className="lg:hidden">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-primary-foreground hover:bg-primary-light"
                  >
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-64">
                  <div className="flex flex-col gap-4 mt-8">
                    <div className="pb-4 border-b">
                      <p className="font-medium">
                        {user?.user_metadata?.full_name || user?.email}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Super Administrador
                      </p>
                    </div>
                    {menuItems.map((item) => (
                      <MenuItem key={item.path} {...item} mobile />
                    ))}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">{children}</main>
    </div>
  );
};
