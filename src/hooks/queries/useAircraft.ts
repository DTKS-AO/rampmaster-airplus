import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Tables, TablesInsert, TablesUpdate } from '@/integrations/supabase/types';
import { toast } from 'sonner';

type Aircraft = Tables<'aircraft'>;
type AircraftInsert = TablesInsert<'aircraft'>;
type AircraftUpdate = TablesUpdate<'aircraft'>;

// Query key for aircraft
const AIRCRAFT_KEY = 'aircraft';

// List aircraft with optional client filter
export const useAircraftList = (clientId?: string) => {
  return useQuery({
    queryKey: [AIRCRAFT_KEY, { clientId }],
    queryFn: async () => {
      let query = supabase
        .from('aircraft')
        .select('*, clients(nome)')
        .order('matricula');

      if (clientId) {
        query = query.eq('client_id', clientId);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar aeronaves');
        throw error;
      }

      return data;
    },
  });
};

// Get single aircraft by ID
export const useAircraft = (id: string) => {
  return useQuery({
    queryKey: [AIRCRAFT_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('aircraft')
        .select('*, clients(nome)')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Erro ao carregar aeronave');
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create aircraft mutation
export const useCreateAircraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (aircraft: AircraftInsert) => {
      const { data, error } = await supabase
        .from('aircraft')
        .insert(aircraft)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar aeronave');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AIRCRAFT_KEY] });
      toast.success('Aeronave criada com sucesso');
    },
  });
};

// Update aircraft mutation
export const useUpdateAircraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...aircraft }: AircraftUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('aircraft')
        .update(aircraft)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar aeronave');
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [AIRCRAFT_KEY] });
      queryClient.invalidateQueries({ queryKey: [AIRCRAFT_KEY, variables.id] });
      toast.success('Aeronave atualizada com sucesso');
    },
  });
};

// Delete aircraft mutation
export const useDeleteAircraft = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('aircraft')
        .delete()
        .eq('id', id);

      if (error) {
        toast.error('Erro ao excluir aeronave');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [AIRCRAFT_KEY] });
      toast.success('Aeronave excluída com sucesso');
    },
  });
};