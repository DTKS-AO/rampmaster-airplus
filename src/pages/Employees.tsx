import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@supabase/supabase-js";
import type { Tables } from "@/integrations/supabase/types";
import { supabase } from "@/integrations/supabase/client";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PhotoUpload } from "@/components/ui/photo-upload";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

// Hooks and validation
import {
  useEmployeeList,
  useCreateEmployee,
  useUpdateEmployee,
  useDeleteEmployee,
  useUploadEmployeePhoto,
} from "@/hooks/queries/useEmployee";
import { employeeSchema, type EmployeeFormValues } from "@/lib/validations/employee";
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
import { Users, Users2, Plus, Pencil, Trash2, Search } from "lucide-react";

export default function Employees() {
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // Check and update user session when component mounts
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);
  const [editingEmployee, setEditingEmployee] = useState<Tables<'employees'> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Form setup
  const form = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeSchema),
    defaultValues: {
      nome: "",
      bi: "",
      numero_mecanografico: "",
      telefone: "",
      email: "",
      funcao: "tecnico",
      foto_url: null,
      ativo: true,
    },
  });

  // Queries and mutations
  const { data: employees, isLoading } = useEmployeeList({
    active: true,
  });
  const createMutation = useCreateEmployee();
  const updateMutation = useUpdateEmployee();
  const deleteMutation = useDeleteEmployee();
  const uploadMutation = useUploadEmployeePhoto();

  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      const employeeData = {
        nome: data.nome,
        bi: data.bi,
        numero_mecanografico: data.numero_mecanografico,
        telefone: data.telefone,
        email: data.email,
        funcao: data.funcao,
        foto_url: data.foto_url || null,
        ativo: data.ativo,
        user_id: data.user_id || null,
        created_by: user?.id || null,
        updated_by: user?.id || null,
      };

      if (editingEmployee) {
        await updateMutation.mutateAsync({
          id: editingEmployee.id,
          ...employeeData,
        });
      } else {
        await createMutation.mutateAsync(employeeData);
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingEmployee(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar este funcionário?")) return;
    await deleteMutation.mutateAsync(id);
  };

  const handlePhotoUpload = async (file: File) => {
    return uploadMutation.mutateAsync({
      file,
      employeeId: editingEmployee?.id || 'new',
    });
  };

  const openEditDialog = (employee: any) => {
    setEditingEmployee(employee);
    form.reset({
      nome: employee.nome,
      bi: employee.bi,
      numero_mecanografico: employee.numero_mecanografico,
      telefone: employee.telefone,
      email: employee.email,
      funcao: employee.funcao,
      foto_url: employee.foto_url,
      ativo: employee.ativo,
    });
    setIsDialogOpen(true);
  };

  const filteredEmployees = employees?.filter(
    (item) =>
      item.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.bi.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.numero_mecanografico.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) ?? [];

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

  if (isLoading) {
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
              if (!open) {
                form.reset();
                setEditingEmployee(null);
              }
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
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="foto_url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Foto</FormLabel>
                        <FormControl>
                          <PhotoUpload
                            value={field.value}
                            onChange={field.onChange}
                            onUpload={handlePhotoUpload}
                            isUploading={uploadMutation.isPending}
                            disabled={form.formState.isSubmitting}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="nome"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="bi"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>BI *</FormLabel>
                          <FormControl>
                            <Input placeholder="000000000LA000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="numero_mecanografico"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número Mecanográfico *</FormLabel>
                          <FormControl>
                            <Input placeholder="APM000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="funcao"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Função *</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione a função" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="tecnico">Técnico</SelectItem>
                              <SelectItem value="auxiliar">Auxiliar</SelectItem>
                              <SelectItem value="supervisor">Supervisor</SelectItem>
                              <SelectItem value="gestor">Gestor</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="telefone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="+244900000000" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input 
                              type="email" 
                              placeholder="email@airplus.co.ao" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <DialogFooter>
                    <Button
                      type="submit"
                      className="gradient-primary"
                      disabled={form.formState.isSubmitting}
                    >
                      {form.formState.isSubmitting && (
                        <Users2 className="mr-2 h-4 w-4 animate-spin" />
                      )}
                      {editingEmployee ? 'Atualizar' : 'Criar'}
                    </Button>
                  </DialogFooter>
                </div>
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
