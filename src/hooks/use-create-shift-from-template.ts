import { useMutation, useQueryClient } from '@tanstack/react-query';
import { addDays, format, parse } from 'date-fns';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Tables } from '@/integrations/supabase/types';

interface CreateShiftFromTemplateParams {
  template: Tables<'shift_templates'> & {
    shift_template_employees: Array<{
      employee: Tables<'employees'>;
    }>;
  };
  date: Date;
}

export function useCreateShiftFromTemplate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ template, date }: CreateShiftFromTemplateParams) => {
      // Parse template times and apply to selected date
      const startTime = parse(template.horario_inicio, 'HH:mm', date);
      const endTime = parse(template.horario_fim, 'HH:mm', date);
      
      // If end time is before start time, assume it ends the next day
      const dataFim = endTime < startTime ? addDays(endTime, 1) : endTime;

      // Create shift
      const { data: shift, error: shiftError } = await supabase
        .from('shifts')
        .insert({
          nome: template.nome,
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

      return shift;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Turno criado com sucesso');
    },
    onError: (error) => {
      console.error('Create shift from template error:', error);
      toast.error('Erro ao criar turno');
    },
  });
}