import { useState } from 'react';
import { format, addDays } from 'date-fns';
import { Calendar as CalendarIcon, Loader2 } from 'lucide-react';
import { useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Calendar } from '@/components/ui/calendar';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface ShiftTemplate {
  id: string;
  nome: string;
  descricao?: string;
  horario_inicio: string;
  horario_fim: string;
  supervisor_id?: string;
  ativo: boolean;
  created_at: string;
  updated_at: string;
  created_by?: string;
  updated_by?: string;
  shift_template_employees: Array<{
    employee: Tables<'employees'>;
  }>;
}

interface BatchTemplateApplyProps {
  template: ShiftTemplate;
}

export function BatchTemplateApply({ template }: BatchTemplateApplyProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedDates, setSelectedDates] = useState<Date[]>([]);
  const queryClient = useQueryClient();

  const handleApply = async () => {
    if (!selectedDates.length) {
      toast.error('Selecione pelo menos uma data');
      return;
    }

    setIsLoading(true);
    try {
      // Create shifts for each selected date
      for (const date of selectedDates) {
        // Parse template times and apply to selected date
        const startTime = new Date(date);
        const [startHour, startMinute] = template.horario_inicio.split(':');
        startTime.setHours(Number(startHour), Number(startMinute), 0, 0);

        const endTime = new Date(date);
        const [endHour, endMinute] = template.horario_fim.split(':');
        endTime.setHours(Number(endHour), Number(endMinute), 0, 0);

        // If end time is before start time, assume it ends the next day
        const dataFim = endTime < startTime ? addDays(endTime, 1) : endTime;

        // Create shift
        const { data: shift, error: shiftError } = await supabase
          .from('shifts')
          .insert({
            nome: `${template.nome} - ${format(date, 'dd/MM')}`,
            data_inicio: format(startTime, 'yyyy-MM-dd HH:mm:ss'),
            data_fim: format(dataFim, 'yyyy-MM-dd HH:mm:ss'),
            status: 'ativo',
          })
          .select()
          .single();

        if (shiftError) throw shiftError;

        // Add employees from template
        if (template.shift_template_employees?.length) {
          const { error: employeesError } = await supabase
            .from('shift_employees')
            .insert(
              template.shift_template_employees.map((te) => ({
                shift_id: shift.id,
                employee_id: te.employee.id,
                presente: true,
              }))
            );

          if (employeesError) throw employeesError;
        }
      }

      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success(
        `${selectedDates.length} turno${
          selectedDates.length > 1 ? 's' : ''
        } criado${selectedDates.length > 1 ? 's' : ''} com sucesso`
      );
      setIsOpen(false);
    } catch (error) {
      console.error('Batch apply error:', error);
      toast.error('Erro ao criar turnos');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Aplicar em Lote</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Aplicar Template em Lote</DialogTitle>
          <DialogDescription>
            Selecione as datas para criar turnos com este template
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="flex flex-col space-y-2">
            <Label>Template Selecionado</Label>
            <p className="text-sm">{template.nome}</p>
            {template.descricao && (
              <p className="text-sm text-muted-foreground">
                {template.descricao}
              </p>
            )}
          </div>

          <Calendar
            mode="multiple"
            selected={selectedDates}
            onSelect={setSelectedDates}
            className="rounded-md border"
          />

          <Button
            className="w-full"
            onClick={handleApply}
            disabled={isLoading || !selectedDates.length}
          >
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <CalendarIcon className="mr-2 h-4 w-4" />
            )}
            Aplicar para {selectedDates.length} data
            {selectedDates.length !== 1 ? 's' : ''}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}