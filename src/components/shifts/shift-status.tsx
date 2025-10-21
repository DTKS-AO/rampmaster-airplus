import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

interface ShiftStatusProps {
  shift: Tables<'shifts'>;
}

export function ShiftStatus({ shift }: ShiftStatusProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const queryClient = useQueryClient();

  const handleStatusChange = async () => {
    if (shift.status === 'encerrado') {
      toast.error('Não é possível reabrir um turno encerrado');
      return;
    }

    setIsUpdating(true);
    try {
      const { error } = await supabase
        .from('shifts')
        .update({ status: 'encerrado', updated_at: new Date().toISOString() })
        .eq('id', shift.id);

      if (error) throw error;

      await queryClient.invalidateQueries({ queryKey: ['shifts'] });
      await queryClient.invalidateQueries({ queryKey: ['shift', shift.id] });
      toast.success('Turno encerrado com sucesso');
      setIsDialogOpen(false);
    } catch (error) {
      console.error('Error updating shift status:', error);
      toast.error('Erro ao encerrar turno');
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <>
      <div className="flex items-center gap-4">
        <Badge
          variant={shift.status === 'ativo' ? 'default' : 'secondary'}
          className="h-7 px-3 text-sm"
        >
          {shift.status === 'ativo' ? 'Ativo' : 'Encerrado'}
        </Badge>
        {shift.status === 'ativo' && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Encerrar Turno
          </Button>
        )}
      </div>

      <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              Encerrar Turno
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja encerrar este turno? Esta ação não pode ser
              desfeita e o turno não poderá mais ser editado.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isUpdating}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleStatusChange}
              disabled={isUpdating}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Encerrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}