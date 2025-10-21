import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Team = Tables<'teams'>;
type TeamInsert = TablesInsert<'teams'>;
type TeamUpdate = TablesUpdate<'teams'>;
type TeamEmployee = Tables<'team_employees'>;
type TeamEmployeeInsert = TablesInsert<'team_employees'>;
type TeamEmployeeUpdate = TablesUpdate<'team_employees'>;

// Query keys
const TEAM_KEY = 'teams';
const TEAM_EMPLOYEE_KEY = 'team_employees';

// List teams with optional filters
export const useTeamList = (params?: { 
  active?: boolean; 
  supervisorId?: string;
  shiftId?: string;
  week?: number;
  month?: number;
}) => {
  return useQuery({
    queryKey: [TEAM_KEY, params],
    queryFn: async () => {
      let query = supabase
        .from('teams')
        .select(`
          *,
          supervisor:employees!teams_supervisor_id_fkey(
            id,
            nome,
            foto_url
          ),
          shift:shifts(
            id,
            nome,
            data_inicio,
            data_fim
          ),
          team_employees(
            id,
            employee:employees(
              id,
              nome,
              foto_url,
              funcao
            )
          )
        `)
        .order('created_at', { ascending: false });

      if (params?.active !== undefined) {
        query = query.eq('ativo', params.active);
      }

      if (params?.supervisorId) {
        query = query.eq('supervisor_id', params.supervisorId);
      }

      if (params?.shiftId) {
        query = query.eq('shift_id', params.shiftId);
      }

      if (params?.week) {
        query = query.eq('semana_referencia', params.week);
      }

      if (params?.month) {
        query = query.eq('mes_referencia', params.month);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar equipas');
        throw error;
      }

      return data;
    },
  });
};

// Get single team by ID
export const useTeam = (id: string) => {
  return useQuery({
    queryKey: [TEAM_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select(`
          *,
          supervisor:employees!teams_supervisor_id_fkey(
            id,
            nome,
            foto_url
          ),
          shift:shifts(
            id,
            nome,
            data_inicio,
            data_fim
          ),
          team_employees(
            id,
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
        toast.error('Erro ao carregar equipa');
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create team mutation
export const useCreateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (team: TeamInsert) => {
      const { data, error } = await supabase
        .from('teams')
        .insert(team)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar equipa');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
      toast.success('Equipa criada com sucesso');
    },
  });
};

// Update team mutation
export const useUpdateTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...team }: TeamUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('teams')
        .update(team)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar equipa');
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY, variables.id] });
      toast.success('Equipa atualizada com sucesso');
    },
  });
};

// Delete team mutation
export const useDeleteTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('teams')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir equipa');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
      toast.success('Equipa excluída com sucesso');
    },
  });
};

// Add employee to team mutation
export const useAddEmployeeToTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: TeamEmployeeInsert) => {
      const { error } = await supabase
        .from('team_employees')
        .insert(data);

      if (error) {
        toast.error('Erro ao adicionar funcionário à equipa');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAM_EMPLOYEE_KEY] });
      toast.success('Funcionário adicionado à equipa');
    },
  });
};

// Remove employee from team mutation
export const useRemoveEmployeeFromTeam = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ teamId, employeeId }: { teamId: string; employeeId: string }) => {
      const { error } = await supabase
        .from('team_employees')
        .delete()
        .eq('team_id', teamId)
        .eq('employee_id', employeeId);

      if (error) {
        toast.error('Erro ao remover funcionário da equipa');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [TEAM_KEY] });
      queryClient.invalidateQueries({ queryKey: [TEAM_EMPLOYEE_KEY] });
      toast.success('Funcionário removido da equipa');
    },
  });
};