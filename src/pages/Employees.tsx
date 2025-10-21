import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Users, Plus, Pencil, Trash2, Search } from "lucide-react";

export default function Employees() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<any[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const [formData, setFormData] = useState<{
    nome: string;
    bi: string;
    numero_mecanografico: string;
    telefone: string;
    email: string;
    funcao: "super_admin" | "gestor" | "supervisor" | "tecnico" | "auxiliar" | "cliente";
    foto_url: string;
  }>({
    nome: "",
    bi: "",
    numero_mecanografico: "",
    telefone: "",
    email: "",
    funcao: "tecnico",
    foto_url: "",
  });

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) navigate("/auth");
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) navigate("/auth");
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) fetchEmployees();
  }, [user]);

  const fetchEmployees = async () => {
    const { data, error } = await supabase
      .from("employees")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast.error("Erro ao carregar funcionários");
      console.error(error);
    } else {
      setEmployees(data || []);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (editingEmployee) {
      const { error } = await supabase
        .from("employees")
        .update({
          nome: formData.nome,
          bi: formData.bi,
          numero_mecanografico: formData.numero_mecanografico,
          telefone: formData.telefone,
          email: formData.email,
          funcao: formData.funcao,
          foto_url: formData.foto_url || null,
          updated_by: user?.id,
        })
        .eq("id", editingEmployee.id);

      if (error) {
        toast.error("Erro ao atualizar funcionário");
        console.error(error);
      } else {
        toast.success("Funcionário atualizado");
        setIsDialogOpen(false);
        resetForm();
        fetchEmployees();
      }
    } else {
      const { error } = await supabase.from("employees").insert([{
        nome: formData.nome,
        bi: formData.bi,
        numero_mecanografico: formData.numero_mecanografico,
        telefone: formData.telefone,
        email: formData.email,
        funcao: formData.funcao,
        foto_url: formData.foto_url || null,
        created_by: user?.id,
      }]);

      if (error) {
        toast.error("Erro ao criar funcionário");
        console.error(error);
      } else {
        toast.success("Funcionário criado");
        setIsDialogOpen(false);
        resetForm();
        fetchEmployees();
      }
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar este funcionário?")) return;

    const { error } = await supabase.from("employees").delete().eq("id", id);

    if (error) {
      toast.error("Erro ao eliminar funcionário");
      console.error(error);
    } else {
      toast.success("Funcionário eliminado");
      fetchEmployees();
    }
  };

  const resetForm = () => {
    setFormData({
      nome: "",
      bi: "",
      numero_mecanografico: "",
      telefone: "",
      email: "",
      funcao: "tecnico",
      foto_url: "",
    });
    setEditingEmployee(null);
  };

  const openEditDialog = (item: any) => {
    setEditingEmployee(item);
    setFormData({
      nome: item.nome,
      bi: item.bi,
      numero_mecanografico: item.numero_mecanografico,
      telefone: item.telefone,
      email: item.email,
      funcao: item.funcao as "super_admin" | "gestor" | "supervisor" | "tecnico" | "auxiliar" | "cliente",
      foto_url: item.foto_url || "",
    });
    setIsDialogOpen(true);
  };

  const filteredEmployees = employees.filter(
    (item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.numero_mecanografico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getFuncaoBadge = (funcao: string) => {
    const variants: any = {
      super_admin: "destructive",
      gestor: "default",
      supervisor: "secondary",
      tecnico: "outline",
      auxiliar: "outline",
    };
    return <Badge variant={variants[funcao] || "outline"}>{funcao.replace("_", " ")}</Badge>;
  };

  if (loading) {
    return (
      <div className="min-h-screen gradient-sky flex items-center justify-center">
        <div className="animate-pulse">
          <Users className="h-12 w-12 text-primary" />
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
              <Users className="h-8 w-8 text-primary" />
              Funcionários
            </h1>
            <p className="text-muted-foreground">
              Gestão do quadro de pessoal AirPlus
            </p>
          </div>

          <Dialog
            open={isDialogOpen}
            onOpenChange={(open) => {
              setIsDialogOpen(open);
              if (!open) resetForm();
            }}
          >
            <DialogTrigger asChild>
              <Button className="gradient-primary">
                <Plus className="h-4 w-4 mr-2" />
                Novo Funcionário
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>
                  {editingEmployee ? "Editar Funcionário" : "Novo Funcionário"}
                </DialogTitle>
                <DialogDescription>
                  {editingEmployee
                    ? "Atualize os dados do funcionário"
                    : "Registe um novo funcionário no sistema"}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="nome">Nome Completo *</Label>
                    <Input
                      id="nome"
                      value={formData.nome}
                      onChange={(e) =>
                        setFormData({ ...formData, nome: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="bi">Bilhete de Identidade *</Label>
                    <Input
                      id="bi"
                      value={formData.bi}
                      onChange={(e) =>
                        setFormData({ ...formData, bi: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="numero_mecanografico">Nº Mecanográfico *</Label>
                    <Input
                      id="numero_mecanografico"
                      value={formData.numero_mecanografico}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          numero_mecanografico: e.target.value,
                        })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="telefone">Telefone *</Label>
                    <Input
                      id="telefone"
                      type="tel"
                      placeholder="+244-XXX-XXX-XXX"
                      value={formData.telefone}
                      onChange={(e) =>
                        setFormData({ ...formData, telefone: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="funcao">Função *</Label>
                    <Select
                      value={formData.funcao}
                      onValueChange={(value: "super_admin" | "gestor" | "supervisor" | "tecnico" | "auxiliar" | "cliente") =>
                        setFormData({ ...formData, funcao: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="tecnico">Técnico</SelectItem>
                        <SelectItem value="auxiliar">Auxiliar</SelectItem>
                        <SelectItem value="supervisor">Supervisor</SelectItem>
                        <SelectItem value="gestor">Gestor</SelectItem>
                        <SelectItem value="super_admin">Super Admin</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="foto_url">URL da Foto (opcional)</Label>
                    <Input
                      id="foto_url"
                      type="url"
                      placeholder="https://..."
                      value={formData.foto_url}
                      onChange={(e) =>
                        setFormData({ ...formData, foto_url: e.target.value })
                      }
                    />
                  </div>
                </div>

                <DialogFooter>
                  <Button type="submit" className="gradient-primary">
                    {editingEmployee ? "Atualizar" : "Criar"}
                  </Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardHeader>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pesquisar por nome, BI, nº mecanográfico ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Funcionário</TableHead>
                  <TableHead>BI</TableHead>
                  <TableHead>Nº Mecanográfico</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmployees.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="text-center py-8 text-muted-foreground"
                    >
                      Nenhum funcionário registado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredEmployees.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar>
                            <AvatarImage src={item.foto_url} />
                            <AvatarFallback>
                              {item.nome
                                .split(" ")
                                .map((n: string) => n[0])
                                .join("")
                                .toUpperCase()
                                .substring(0, 2)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{item.nome}</p>
                            <p className="text-sm text-muted-foreground">
                              {item.email}
                            </p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{item.bi}</TableCell>
                      <TableCell className="font-mono text-sm">
                        {item.numero_mecanografico}
                      </TableCell>
                      <TableCell>{item.telefone}</TableCell>
                      <TableCell>{getFuncaoBadge(item.funcao)}</TableCell>
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
