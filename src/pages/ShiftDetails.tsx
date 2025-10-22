import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Loader2, UserPlus } from 'lucide-react';
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
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { ShiftReport } from '@/components/shifts/shift-report';
import { ShiftStats } from '@/components/shifts/shift-stats';
import { ShiftStatus } from '@/components/shifts/shift-status';
import { ShiftTemplate } from '@/components/shifts/shift-template';
import { toast } from 'sonner';

import { useShift, useUpdateShiftEmployees } from '@/hooks/use-shifts';
import { useEmployees } from '@/hooks/use-employees';
import { useShiftNotifications } from '@/hooks/use-shift-notifications';
import type { ShiftEmployeeFormValues } from '@/lib/validations/shift';
import { shiftEmployeeSchema } from '@/lib/validations/shift';

export default function ShiftDetails() {
  const { id } = useParams<{ id: string }>();
  const [isTeamDialogOpen, setIsTeamDialogOpen] = useState(false);
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([]);
  useShiftNotifications();
  
  const { data: shift, isLoading } = useShift(id!);
  const { data: employees } = useEmployees();
  const updateShiftEmployees = useUpdateShiftEmployees();

  // Filter out employees already in the shift
  const availableEmployees = employees?.filter(
    (employee) => !shift?.shift_employees?.some((se) => se.employee_id === employee.id)
  );

  const handleAssignTeam = async () => {
    if (!selectedEmployees.length) {
      toast.error('Selecione pelo menos um funcionário');
      return;
    }

    try {
      const newEmployees: Array<Omit<ShiftEmployeeFormValues, 'shift_id'> & { employee_id: string }> = 
        selectedEmployees.map((employeeId) => ({
          employee_id: employeeId,
          presente: true,
        }));

      await updateShiftEmployees.mutateAsync({
        shiftId: id!,
        employees: newEmployees,
      });

      setSelectedEmployees([]);
      setIsTeamDialogOpen(false);
    } catch (error) {
      console.error('Assign team error:', error);
    }
  };

  const handleToggleAttendance = async (employeeId: string, isPresent: boolean) => {
    const currentEmployees = shift?.shift_employees ?? [];
    const updatedEmployees = currentEmployees.map((se) => ({
      employee_id: se.employee_id,
      presente: se.employee_id === employeeId ? isPresent : se.presente,
      justificativa: se.justificativa,
    }));

    try {
      await updateShiftEmployees.mutateAsync({
        shiftId: id!,
        employees: updatedEmployees,
      });
    } catch (error) {
      console.error('Update attendance error:', error);
    }
  };

  if (isLoading || !shift) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold">{shift.nome}</h1>
            <p className="text-muted-foreground">
              {format(new Date(shift.data_inicio), "d 'de' MMMM 'de' yyyy", {
                locale: ptBR,
              })}
            </p>
          </div>

          <div className="flex items-center gap-4">
            <ShiftStatus shift={shift} />
            <ShiftReport shift={shift} />
            <ShiftTemplate shift={shift} />
          </div>
        </div>

        <div className="mt-6">
          <ShiftStats shift={shift} />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-8">
          <div>
            <p className="text-sm font-medium text-muted-foreground">Horário</p>
            <p>
              {format(new Date(shift.data_inicio), 'HH:mm')} -{' '}
              {format(new Date(shift.data_fim), 'HH:mm')}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-muted-foreground">
              Supervisor
            </p>
            <p>{shift.supervisor?.nome ?? 'Não definido'}</p>
          </div>
        </div>
      </div>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-xl font-semibold">Equipe</h2>
        <Dialog open={isTeamDialogOpen} onOpenChange={setIsTeamDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Adicionar à Equipe
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Funcionários</DialogTitle>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              {availableEmployees?.map((employee) => (
                <div key={employee.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={employee.id}
                    checked={selectedEmployees.includes(employee.id)}
                    onCheckedChange={(checked) => {
                      if (checked) {
                        setSelectedEmployees((prev) => [...prev, employee.id]);
                      } else {
                        setSelectedEmployees((prev) =>
                          prev.filter((id) => id !== employee.id)
                        );
                      }
                    }}
                  />
                  <Label htmlFor={employee.id}>{employee.nome}</Label>
                </div>
              ))}

              <Button
                className="w-full"
                disabled={updateShiftEmployees.isPending}
                onClick={handleAssignTeam}
              >
                {updateShiftEmployees.isPending && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Adicionar Selecionados
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Funcionário</TableHead>
              <TableHead>Função</TableHead>
              <TableHead>Presença</TableHead>
              <TableHead>Justificativa</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {shift.shift_employees?.map((se) => (
              <TableRow key={se.id}>
                <TableCell>
                  <div className="flex items-center space-x-2">
                    {se.employee?.foto_url && (
                      <img
                        src={se.employee.foto_url}
                        alt={se.employee.nome}
                        className="h-8 w-8 rounded-full object-cover"
                      />
                    )}
                    <span>{se.employee?.nome}</span>
                  </div>
                </TableCell>
                <TableCell>{se.employee?.funcao}</TableCell>
                <TableCell>
                  <Checkbox
                    checked={se.presente}
                    onCheckedChange={(checked) =>
                      handleToggleAttendance(se.employee_id, checked as boolean)
                    }
                    disabled={shift.status === 'encerrado'}
                  />
                </TableCell>
                <TableCell>
                  <Textarea
                    placeholder="Justificativa (opcional)"
                    value={se.justificativa ?? ''}
                    onChange={(e) => {
                      const currentEmployees = shift.shift_employees ?? [];
                      const updatedEmployees = currentEmployees.map((employee) => ({
                        employee_id: employee.employee_id,
                        presente: employee.presente,
                        justificativa:
                          employee.employee_id === se.employee_id
                            ? e.target.value
                            : employee.justificativa,
                      }));

                      updateShiftEmployees.mutate({
                        shiftId: id!,
                        employees: updatedEmployees,
                      });
                    }}
                    disabled={shift.status === 'encerrado'}
                    className="h-[60px] resize-none"
                  />
                </TableCell>
                <TableCell>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => {
                      const currentEmployees = shift.shift_employees ?? [];
                      const updatedEmployees = currentEmployees
                        .filter((employee) => employee.employee_id !== se.employee_id)
                        .map((employee) => ({
                          employee_id: employee.employee_id,
                          presente: employee.presente,
                          justificativa: employee.justificativa,
                        }));

                      updateShiftEmployees.mutate({
                        shiftId: id!,
                        employees: updatedEmployees,
                      });
                    }}
                    disabled={shift.status === 'encerrado'}
                  >
                    Remover
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}