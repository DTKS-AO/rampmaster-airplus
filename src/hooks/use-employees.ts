import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';
import type { EmployeeFormValues } from '@/lib/validations/employee';

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Employee = Tables<'employees'>;

export function useEmployees() {
  return useQuery({
    queryKey: ['employees'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .order('nome');

      if (error) throw error;
      return data as Employee[];
    },
  });
}

export function useEmployee(id: string) {
  return useQuery({
    queryKey: ['employees', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data as Employee;
    },
    enabled: !!id,
  });
}

export function useCreateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (values: EmployeeFormValues) => {
      // Ensure we only send valid fields to Supabase
      const { created_at, updated_at, created_by, updated_by, ...employeeData } = values;

      const { data, error } = await supabase
        .from('employees')
        .insert({
          ...employeeData,
          nome: employeeData.nome,
          bi: employeeData.bi,
          email: employeeData.email,
          telefone: employeeData.telefone,
          numero_mecanografico: employeeData.numero_mecanografico,
          funcao: employeeData.funcao ?? 'tecnico',
          ativo: employeeData.ativo ?? true,
        } as Employee)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário criado com sucesso');
    },
    onError: (error) => {
      console.error('Create employee error:', error);
      toast.error('Erro ao criar funcionário');
    },
  });
}

export function useUpdateEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...values }: EmployeeFormValues & { id: string }) => {
      // Remove system-managed fields before update
      const { created_at, updated_at, created_by, updated_by, ...employeeData } = values;

      const { data, error } = await supabase
        .from('employees')
        .update({
          ...employeeData,
          updated_at: new Date().toISOString(),
        } as Employee)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      queryClient.invalidateQueries({ queryKey: ['employees', id] });
      toast.success('Funcionário atualizado com sucesso');
    },
    onError: (error) => {
      console.error('Update employee error:', error);
      toast.error('Erro ao atualizar funcionário');
    },
  });
}

export function useDeleteEmployee() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['employees'] });
      toast.success('Funcionário excluído com sucesso');
    },
    onError: (error) => {
      console.error('Delete employee error:', error);
      toast.error('Erro ao excluir funcionário');
    },
  });
}