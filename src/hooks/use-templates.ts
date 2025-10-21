import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import type {
  ShiftTemplate,
  ShiftExport,
  UserNotificationPreferences,
} from '@/types/shift-types';

// Custom PostgrestQueryBuilder types for new tables
interface CustomTables {
  shift_templates: {
    Row: ShiftTemplate;
  };
  shift_exports: {
    Row: ShiftExport;
  };
  user_notification_preferences: {
    Row: UserNotificationPreferences;
  };
}

// Extend Supabase client type
declare module '@supabase/supabase-js' {
  interface SupabaseClient {
    from<T extends keyof CustomTables>(table: T): any;
  }
}

// Templates
export function useShiftTemplates(searchTerm?: string) {
  return useQuery({
    queryKey: ['shift-templates', searchTerm],
    queryFn: async () => {
      let query = supabase
        .from('shift_templates')
        .select(
          `*,
          shift_template_employees(
            employee:employees(*)
          )`
        )
        .order('created_at', { ascending: false });

      if (searchTerm) {
        query = query.ilike('nome', `%${searchTerm}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as ShiftTemplate[];
    },
  });
}

// Exports
export function useTrackExport() {
  return useMutation({
    mutationFn: async ({
      shiftId,
      type,
      fileName,
    }: {
      shiftId: string;
      type: 'pdf' | 'csv';
      fileName: string;
    }) => {
      const { error } = await supabase.from('shift_exports').insert({
        shift_id: shiftId,
        type,
        file_name: fileName,
      });
      if (error) throw error;
    },
  });
}

// Notification Preferences
export function useNotificationPreferences() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error) throw error;
      return data as UserNotificationPreferences;
    },
  });

  const mutation = useMutation({
    mutationFn: async (updates: Partial<UserNotificationPreferences>) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      const { error } = await supabase
        .from('user_notification_preferences')
        .update(updates)
        .eq('user_id', user.id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notification-preferences'] });
      toast.success('Preferências atualizadas com sucesso');
    },
    onError: () => {
      toast.error('Erro ao atualizar preferências');
    },
  });

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    isError: query.isError,
    updatePreferences: mutation.mutate,
    isPending: mutation.isPending,
  };
}