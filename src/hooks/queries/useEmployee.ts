import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

import type { Database } from '@/integrations/supabase/types';

type Employee = Tables<'employees'>;
type EmployeeInsert = TablesInsert<'employees'>;
type EmployeeUpdate = TablesUpdate<'employees'>;
type UserRole = Database['public']['Enums']['user_role'];

// Query key for employees
const EMPLOYEE_KEY = 'employees';

// List employees with optional filters
export const useEmployeeList = (params?: { active?: boolean; role?: UserRole }) => {
  return useQuery({
    queryKey: [EMPLOYEE_KEY, params],
    queryFn: async () => {
      let query = supabase
        .from('employees')
        .select('*')
        .order('nome');

      if (params?.active !== undefined) {
        query = query.eq('ativo', params.active);
      }

      if (params?.role) {
        query = query.eq('funcao', params.role);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar funcionários');
        throw error;
      }

      return data;
    },
  });
};

// Get single employee by ID
export const useEmployee = (id: string) => {
  return useQuery({
    queryKey: [EMPLOYEE_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('employees')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Erro ao carregar funcionário');
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create employee mutation
export const useCreateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (employee: EmployeeInsert) => {
      const { data, error } = await supabase
        .from('employees')
        .insert(employee)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar funcionário');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_KEY] });
      toast.success('Funcionário criado com sucesso');
    },
  });
};

// Update employee mutation
export const useUpdateEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...employee }: EmployeeUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('employees')
        .update(employee)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar funcionário');
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_KEY] });
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_KEY, variables.id] });
      toast.success('Funcionário atualizado com sucesso');
    },
  });
};

// Delete employee mutation
export const useDeleteEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('employees')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir funcionário');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [EMPLOYEE_KEY] });
      toast.success('Funcionário excluído com sucesso');
    },
  });
};

// Upload employee photo
export const useUploadEmployeePhoto = () => {
  return useMutation({
    mutationFn: async ({ file, employeeId }: { file: File; employeeId: string }) => {
      const fileName = `${employeeId}-${Date.now()}${file.name.substring(file.name.lastIndexOf('.'))}`;
      const { error: uploadError } = await supabase.storage
        .from('employee-photos')
        .upload(fileName, file);

      if (uploadError) {
        toast.error('Erro ao enviar foto');
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('employee-photos')
        .getPublicUrl(fileName);

      return publicUrl;
    },
  });
};