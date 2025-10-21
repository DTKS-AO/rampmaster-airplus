import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { supabase } from "@/integrations/supabase/client";
import type { Database, Tables } from "@/integrations/supabase/types";
import { User } from "@supabase/supabase-js";
import { useQuery } from "@tanstack/react-query";
import { MainLayout } from "@/components/layout/MainLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Hooks and validation
import { useAircraftList, useCreateAircraft, useUpdateAircraft, useDeleteAircraft } from "@/hooks/queries/useAircraft";
import { aircraftSchema, type AircraftFormValues } from "@/lib/validations/aircraft";
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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingAircraft, setEditingAircraft] = useState<Tables<'aircraft'> | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  // Query hooks
  const { data: aircraft = [] } = useAircraftList();
  const { data: clients = [] } = useQuery<Tables<'clients'>[]>({
    queryKey: ['clients'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('clients')
        .select('*')
        .eq('ativo', true)
        .order('nome');

      if (error) {
        toast.error('Erro ao carregar clientes');
        throw error;
      }

      return data;
    },
  });

  // Mutation hooks
  const createMutation = useCreateAircraft();
  const updateMutation = useUpdateAircraft();
  const deleteMutation = useDeleteAircraft();
  
  // Form setup
  const form = useForm<AircraftFormValues>({
    resolver: zodResolver(aircraftSchema),
    defaultValues: {
      matricula: "",
      modelo: "",
      client_id: "",
      estado: "ativo",
      ativo: true
    }
  });

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        navigate("/auth");
      }
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        if (!session?.user) {
          navigate("/auth");
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const onSubmit = async (data: AircraftFormValues) => {
    try {
      const aircraftData = {
        matricula: data.matricula,
        modelo: data.modelo,
        client_id: data.client_id,
        estado: data.estado || 'ativo',
        ativo: data.ativo ?? true,
        ultima_limpeza: data.ultima_limpeza,
        created_by: user?.id,
        updated_by: user?.id
      } as const;

      if (editingAircraft) {
        await updateMutation.mutateAsync({
          id: editingAircraft.id,
          ...aircraftData,
        });
      } else {
        await createMutation.mutateAsync(aircraftData);
      }
      setIsDialogOpen(false);
      form.reset();
      setEditingAircraft(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Tem certeza que deseja eliminar esta aeronave?")) return;

    try {
      await deleteMutation.mutateAsync(id);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const resetForm = () => {
    form.reset({
      matricula: "",
      modelo: "",
      client_id: "",
      estado: "ativo",
      ativo: true
    });
    setEditingAircraft(null);
  };

  const openEditDialog = (item: Tables<'aircraft'>) => {
    setEditingAircraft(item);
    form.reset({
      matricula: item.matricula,
      modelo: item.modelo,
      client_id: item.client_id,
      estado: item.estado || "ativo",
      ativo: item.ativo || true
    });
    setIsDialogOpen(true);
  };

  const filteredAircraft = aircraft.filter((item) =>
    item.matricula.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    clients.find(c => c.id === item.client_id)?.nome.toLowerCase().includes(searchTerm.toLowerCase())
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
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="matricula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Matrícula *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: D2-ABC"
                            {...field}
                            onChange={(e) => field.onChange(e.target.value.toUpperCase())}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="modelo"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Modelo *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Ex: Boeing 737"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="client_id"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cliente *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o cliente" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {clients.map((client) => (
                              <SelectItem key={client.id} value={client.id}>
                                {client.nome} ({client.codigo})
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="estado"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado *</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ativo">Ativo</SelectItem>
                            <SelectItem value="em_manutencao">Em Manutenção</SelectItem>
                            <SelectItem value="inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <DialogFooter>
                    <Button type="submit" className="gradient-primary">
                      {editingAircraft ? "Atualizar" : "Criar"}
                    </Button>
                  </DialogFooter>
                </form>
              </Form>
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
                        {clients.find(c => c.id === item.client_id)?.nome}
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
