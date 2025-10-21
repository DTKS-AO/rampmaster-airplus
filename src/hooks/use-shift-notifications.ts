import { useEffect } from 'react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

export function useShiftNotifications() {
  const queryClient = useQueryClient();

  useEffect(() => {
    const channel = supabase
      .channel('shift-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shifts',
        },
        async (payload) => {
          const { new: newShift, old: oldShift } = payload;

          // Status change notification
          if (newShift.status !== oldShift.status) {
            toast.info(
              `Turno ${newShift.nome} foi ${
                newShift.status === 'ativo' ? 'ativado' : 'encerrado'
              }`
            );
          }

          // Team update notification
          if (newShift.updated_at !== oldShift.updated_at) {
            const { data: updatedShift } = await supabase
              .from('shifts')
              .select(
                '*, supervisor:employees(*), shift_employees:shift_employees(*, employee:employees(*))'
              )
              .eq('id', newShift.id)
              .single();

            if (updatedShift) {
              // Update cached data
              queryClient.setQueryData(['shift', newShift.id], updatedShift);
              
              toast.info('Informações do turno foram atualizadas');
            }
          }
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, [queryClient]);
}