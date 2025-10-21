import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Shift = Tables<'shifts'>;
type ShiftInsert = TablesInsert<'shifts'>;
type ShiftUpdate = TablesUpdate<'shifts'>;
type ShiftEmployee = Tables<'shift_employees'>;
type ShiftEmployeeInsert = TablesInsert<'shift_employees'>;
type ShiftEmployeeUpdate = TablesUpdate<'shift_employees'>;

// Query keys
const SHIFT_KEY = 'shifts';
const SHIFT_EMPLOYEE_KEY = 'shift_employees';

// List shifts with optional filters
export const useShiftList = (params?: { 
  status?: 'ativo' | 'encerrado'; 
  supervisorId?: string;
  fromDate?: string;
  toDate?: string;
}) => {
  return useQuery({
    queryKey: [SHIFT_KEY, params],
    queryFn: async () => {
      let query = supabase
        .from('shifts')
        .select(`
          *,
          supervisor:employees!shifts_supervisor_id_fkey(
            id,
            nome,
            foto_url
          ),
          shift_employees(
            id,
            presente,
            justificativa,
            employee:employees(
              id,
              nome,
              foto_url,
              funcao
            )
          )
        `)
        .order('data_inicio', { ascending: false });

      if (params?.status) {
        query = query.eq('status', params.status);
      }

      if (params?.supervisorId) {
        query = query.eq('supervisor_id', params.supervisorId);
      }

      if (params?.fromDate) {
        query = query.gte('data_inicio', params.fromDate);
      }

      if (params?.toDate) {
        query = query.lte('data_fim', params.toDate);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar turnos');
        throw error;
      }

      return data;
    },
  });
};

// Get single shift by ID
export const useShift = (id: string) => {
  return useQuery({
    queryKey: [SHIFT_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('shifts')
        .select(`
          *,
          supervisor:employees!shifts_supervisor_id_fkey(
            id,
            nome,
            foto_url
          ),
          shift_employees(
            id,
            presente,
            justificativa,
            employee:employees(
              id,
              nome,
              foto_url,
              funcao
            )
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Erro ao carregar turno');
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create shift mutation
export const useCreateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (shift: ShiftInsert) => {
      const { data, error } = await supabase
        .from('shifts')
        .insert(shift)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar turno');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_KEY] });
      toast.success('Turno criado com sucesso');
    },
  });
};

// Update shift mutation
export const useUpdateShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...shift }: ShiftUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('shifts')
        .update(shift)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar turno');
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHIFT_KEY, variables.id] });
      toast.success('Turno atualizado com sucesso');
    },
  });
};

// Delete shift mutation
export const useDeleteShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('shifts')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir turno');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_KEY] });
      toast.success('Turno excluído com sucesso');
    },
  });
};

// Add employee to shift mutation
export const useAddEmployeeToShift = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ShiftEmployeeInsert) => {
      const { error } = await supabase
        .from('shift_employees')
        .insert(data)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao adicionar funcionário ao turno');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHIFT_EMPLOYEE_KEY] });
      toast.success('Funcionário adicionado ao turno');
    },
  });
};

// Update shift employee (attendance)
export const useUpdateShiftEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      ...data 
    }: ShiftEmployeeUpdate & { id: string }) => {
      const { error } = await supabase
        .from('shift_employees')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar presença');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SHIFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [SHIFT_EMPLOYEE_KEY] });
      toast.success('Presença atualizada com sucesso');
    },
  });
};