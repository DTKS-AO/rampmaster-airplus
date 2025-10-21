import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { ShiftFormValues, ShiftEmployeeFormValues } from '@/lib/validations/shift';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Shift = Tables<'shifts'>;
type ShiftEmployee = Tables<'shift_employees'>;

export function useShifts(options?: { 
  from?: string; 
  to?: string;
  status?: 'ativo' | 'encerrado';
}) {
  return useQuery({
    queryKey: ['shifts', options],
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          supervisor:employees(*),
          shift_employees(
            *,
            employee:employees(*)
          )
        `);

      if (options?.from) {
        query = query.gte('data_inicio', options.from);
      }
      if (options?.to) {
        query = query.lte('data_fim', options.to);
      }
      if (options?.status) {
        query = query.eq('status', options.status);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
}

export function useShift(id: string) {
  return useQuery({
    queryKey: ['shifts', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          supervisor:employees(*),
          shift_employees(
            *,
            employee:employees(*)
          )
        `)
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: ShiftFormValues) => {
      // Remove system-managed fields and ensure required fields
      const { created_at, updated_at, created_by, updated_by, ...shiftData } = values;
      
      // Validate required fields
      if (!shiftData.nome || !shiftData.data_inicio || !shiftData.data_fim) {
        throw new Error('Nome, data de início e data de fim são obrigatórios');
      }

      const { data, error } = await supabase
        .from('shifts')
        .insert({
          ...shiftData,
          nome: shiftData.nome,
          data_inicio: shiftData.data_inicio,
          data_fim: shiftData.data_fim,
          status: shiftData.status ?? 'ativo',
        } as Shift)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Turno criado com sucesso');
    },
    onError: (error) => {
      console.error('Create shift error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao criar turno');
      }
    },
  });
}

export function useUpdateShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: ShiftFormValues & { id: string }) => {
      // Remove system-managed fields and ensure required fields
      const { created_at, updated_at, created_by, updated_by, ...shiftData } = values;
      
      // Validate required fields
      if (!shiftData.nome || !shiftData.data_inicio || !shiftData.data_fim) {
        throw new Error('Nome, data de início e data de fim são obrigatórios');
      }

      const { data, error } = await supabase
        .from('shifts')
        .update({
          ...shiftData,
          nome: shiftData.nome,
          data_inicio: shiftData.data_inicio,
          data_fim: shiftData.data_fim,
          status: shiftData.status ?? 'ativo',
          updated_at: new Date().toISOString(),
        } as Shift)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', id] });
      toast.success('Turno atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Update shift error:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Erro ao atualizar turno');
      }
    },
  });
}

export function useDeleteShift() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      toast.success('Turno excluído com sucesso');
    },
    onError: (error) => {
      console.error('Delete shift error:', error);
      toast.error('Erro ao excluir turno');
    },
  });
}

export function useUpdateShiftEmployees() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      shiftId, 
      employees 
    }: { 
      shiftId: string;
      employees: Array<Omit<ShiftEmployeeFormValues, 'shift_id'> & { employee_id: string }>;
    }) => {
      // First delete all existing entries for this shift
      await supabase
        .from('shift_employees')
        .delete()
        .eq('shift_id', shiftId);

      // Then insert new entries with all required fields
      const { data, error } = await supabase
        .from('shift_employees')
        .insert(
          employees.map(e => ({
            shift_id: shiftId,
            employee_id: e.employee_id,
            presente: e.presente ?? true,
            justificativa: e.justificativa,
          }))
        )
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { shiftId }) => {
      queryClient.invalidateQueries({ queryKey: ['shifts'] });
      queryClient.invalidateQueries({ queryKey: ['shifts', shiftId] });
      toast.success('Funcionários atualizados com sucesso');
    },
    onError: (error) => {
      console.error('Update shift employees error:', error);
      toast.error('Erro ao atualizar funcionários');
    },
  });
}