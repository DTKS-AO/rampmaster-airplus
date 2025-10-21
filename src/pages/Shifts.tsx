import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { zodResolver } from '@hookform/resolvers/zod';
import { format, formatISO } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, Plus } from 'lucide-react';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { 
  useShifts,
  useCreateShift,
  useUpdateShift,
  useDeleteShift,
  useUpdateShiftEmployees
} from '@/hooks/use-shifts';
import { useEmployees } from '@/hooks/use-employees';
import type { ShiftFormValues } from '@/lib/validations/shift';
import { shiftSchema } from '@/lib/validations/shift';
import { ShiftForm } from '@/components/shifts/shift-form';

export default function Shifts() {
  const navigate = useNavigate();
  const { data: shifts, isLoading } = useShifts();
  const { data: employees } = useEmployees();
  const createShift = useCreateShift();
  const updateShift = useUpdateShift();
  const deleteShift = useDeleteShift();
  const [editingShift, setEditingShift] = useState<(typeof shifts)[0] | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);

  const form = useForm<ShiftFormValues>({
    resolver: zodResolver(shiftSchema),
    defaultValues: {
      status: 'ativo',
    },
  });

  // Reset form when editingShift changes
  useEffect(() => {
    if (editingShift) {
      form.reset({
        nome: editingShift.nome,
        data_inicio: editingShift.data_inicio,
        data_fim: editingShift.data_fim,
        supervisor_id: editingShift.supervisor_id,
        status: editingShift.status,
      });
    } else {
      form.reset({
        status: 'ativo',
      });
    }
  }, [editingShift, form]);

  const onSubmit = async (data: ShiftFormValues) => {
    try {
      if (editingShift) {
        await updateShift.mutateAsync({ id: editingShift.id, ...data });
        setIsEditOpen(false);
      } else {
        await createShift.mutateAsync(data);
        setIsCreateOpen(false);
      }
      form.reset();
      setEditingShift(null);
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Turnos</h1>
          <p className="text-muted-foreground">
            Gerencie os turnos e equipes de trabalho
          </p>
        </div>

        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Turno
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Novo Turno</DialogTitle>
            </DialogHeader>
            <ShiftForm
              form={form}
              onSubmit={onSubmit}
              employees={employees}
              isSubmitting={createShift.isPending}
              submitLabel="Criar Turno"
            />
          </DialogContent>
        </Dialog>

        <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Editar Turno</DialogTitle>
            </DialogHeader>
            <ShiftForm
              form={form}
              onSubmit={onSubmit}
              employees={employees}
              isSubmitting={updateShift.isPending}
              submitLabel="Salvar Alterações"
            />
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="flex h-96 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin" />
        </div>
      ) : (
        <div className="rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>Período</TableHead>
                <TableHead>Supervisor</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {shifts?.map((shift) => (
                <TableRow key={shift.id}>
                  <TableCell>{shift.nome}</TableCell>
                  <TableCell>
                    <div className="flex flex-col space-y-1">
                      <span>
                        {format(new Date(shift.data_inicio), "d 'de' MMMM", {
                          locale: ptBR,
                        })}
                      </span>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(shift.data_inicio), "HH:mm", { locale: ptBR })} - 
                        {format(new Date(shift.data_fim), "HH:mm", { locale: ptBR })}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {shift.supervisor?.nome ?? 'Não definido'}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={shift.status === 'ativo' ? 'default' : 'secondary'}
                    >
                      {shift.status === 'ativo' ? 'Ativo' : 'Encerrado'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex space-x-2">
                      <div className="flex space-x-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            setEditingShift(shift);
                            setIsEditOpen(true);
                          }}
                        >
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/shifts/${shift.id}`)}
                        >
                          Detalhes
                        </Button>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => {
                          if (
                            window.confirm(
                              'Tem certeza que deseja excluir este turno?'
                            )
                          ) {
                            deleteShift.mutate(shift.id);
                          }
                        }}
                      >
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}