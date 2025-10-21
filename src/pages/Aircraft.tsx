import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plane, Plus, Pencil, Trash2, Search } from "lucide-react";
import { format } from "date-fns";

export default function Aircraft() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [aircraft, setAircraft] = useState<any[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  
  // Form state
  const [formData, setFormData] = useState<{
    matricula: string;
    modelo: string;
    client_id: string;
    estado: "ativo" | "em_manutencao" | "inativo";
  }>({
    matricula: "",
    modelo: "",
    client_id: "",
    estado: "ativo",
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
      fetchAircraft();
      fetchClients();
    }
  }, [user]);

  const fetchAircraft = async () => {
    const { data, error } = await supabase
      .from("aircraft")
      .select(`
        *,
        clients (
          nome,
          codigo
        )
      `)
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar aeronaves");
      console.error(error);
    } else {
      setAircraft(data || []);
    }
  };

  const fetchClients = async () => {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .eq("ativo", true)
      .order("nome");

    if (error) {
      toast.error("Erro ao carregar clientes");
      console.error(error);
    } else {
      setClients(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingAircraft) {
      const { error } = await supabase
        .from("aircraft")
        .update({
          matricula: formData.matricula,
          modelo: formData.modelo,
          client_id: formData.client_id,
          estado: formData.estado,
          updated_by: user?.id,
        })
        .eq("id", editingAircraft.id);

      if (error) {
        toast.error("Erro ao atualizar aeronave");
        console.error(error);
      } else {
        toast.success("Aeronave atualizada com sucesso");
        setIsDialogOpen(false);
        resetForm();
        fetchAircraft();
      }
    } else {
      const { error } = await supabase.from("aircraft").insert([{
        matricula: formData.matricula,
        modelo: formData.modelo,
        client_id: formData.client_id,
        estado: formData.estado,
        created_by: user?.id,
      }]);

      if (error) {
        toast.error("Erro ao criar aeronave");
        console.error(error);
      } else {
        toast.success("Aeronave criada com sucesso");
        setIsDialogOpen(false);
        resetForm();
        fetchAircraft();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar esta aeronave?")) return;

    const { error } = await supabase.from("aircraft").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao eliminar aeronave");
      console.error(error);
    } else {
      toast.success("Aeronave eliminada");
      fetchAircraft();
    }
  };

  const resetForm = () => {
    setFormData({
      matricula: "",
      modelo: "",
      client_id: "",
      estado: "ativo",
    });
    setEditingAircraft(null);
  };

  const openEditDialog = (item: any) => {
    setEditingAircraft(item);
    setFormData({
      matricula: item.matricula,
      modelo: item.modelo,
      client_id: item.client_id,
      estado: item.estado as "ativo" | "em_manutencao" | "inativo",
    });
    setIsDialogOpen(true);
  };

  const filteredAircraft = aircraft.filter((item) =>
    item.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.clients?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getEstadoBadge = (estado: string) => {
    const variants: any = {
      ativo: "default",
      em_manutencao: "secondary",
      inativo: "destructive",
    };
    return <Badge variant={variants[estado] || "default"}>{estado.replace("_", " ")}</Badge>;
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

  return (
    <MainLayout user={user}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <Plane className="h-8 w-8 text-primary" />
              Aeronaves
            </h1>
            <p className="text-muted-foreground">
              Gestão da frota de aeronaves
            </p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={(open) => {
            setIsDialogOpen(open);
            if (!open) resetForm();
          }}>
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Nova Aeronave
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>
                  {editingAircraft ? "Editar Aeronave" : "Nova Aeronave"}
                </DialogTitle>
                <DialogDescription>
                  {editingAircraft
                    ? "Atualize os dados da aeronave"
                    : "Registe uma nova aeronave no sistema"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="matricula">Matrícula *</Label>
                  <Input
                    id="matricula"
                    placeholder="Ex: D2-ABC"
                    value={formData.matricula}
                    onChange={(e) =>
                      setFormData({ ...formData, matricula: e.target.value.toUpperCase() })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="modelo">Modelo *</Label>
                  <Input
                    id="modelo"
                    placeholder="Ex: Boeing 737"
                    value={formData.modelo}
                    onChange={(e) =>
                      setFormData({ ...formData, modelo: e.target.value })
                    }
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="client_id">Cliente *</Label>
                  <Select
                    value={formData.client_id}
                    onValueChange={(value) =>
                      setFormData({ ...formData, client_id: value })
                    }
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o cliente" />
                    </SelectTrigger>
                    <SelectContent>
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id}>
                          {client.nome} ({client.codigo})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="estado">Estado *</Label>
                  <Select
                    value={formData.estado}
                    onValueChange={(value: "ativo" | "em_manutencao" | "inativo") =>
                      setFormData({ ...formData, estado: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ativo">Ativo</SelectItem>
                      <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                      <SelectItem value="inativo">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <DialogFooter>
                  <Button type="submit" className="gradient-primary">
                    {editingAircraft ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Pesquisar por matrícula, modelo ou cliente..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Matrícula</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Última Limpeza</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredAircraft.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Nenhuma aeronave registada
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredAircraft.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono font-semibold">
                        {item.matricula}
                      </TableCell>
                      <TableCell>{item.modelo}</TableCell>
                      <TableCell>
                        {item.clients?.nome}
                        <span className="text-xs text-muted-foreground ml-2">
                          ({item.clients?.codigo})
                        </span>
                      </TableCell>
                      <TableCell>{getEstadoBadge(item.estado)}</TableCell>
                      <TableCell>
                        {item.ultima_limpeza
                          ? format(new Date(item.ultima_limpeza), "dd/MM/yyyy")
                          : "—"}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(item)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleDelete(item.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </MainLayout>
  );
}
