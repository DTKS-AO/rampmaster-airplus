import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Settings2, Loader2 } from 'lucide-react';

interface NotificationPreferences {
  id: string;
  user_id: string;
  shift_status_changes: boolean;
  shift_team_updates: boolean;
  shift_reminders: boolean;
  shift_reports: boolean;
  created_at: string;
  updated_at: string;
}
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export function NotificationPreferences() {
  const [isOpen, setIsOpen] = useState(false);
  const queryClient = useQueryClient();

  // Fetch current user's preferences
  const { data: preferences, isLoading } = useQuery({
    queryKey: ['notification-preferences'],
    queryFn: async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No user found');

      let { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', user.id)
        .single();

      // If preferences don't exist, create them
      if (!data && !error) {
        const { data: newPrefs, error: createError } = await supabase
          .from('user_notification_preferences')
          .insert([{
            user_id: user.id,
            shift_status_changes: true,
            shift_team_updates: true,
            shift_reminders: true,
            shift_reports: true
          }])
          .select()
          .single();

        if (createError) throw createError;
        data = newPrefs;
      } else if (error) {
        throw error;
      }

      if (error) throw error;
      return data;
    },
  });

  // Update preferences mutation
  const updatePreferences = useMutation({
    mutationFn: async (updates: Partial<NotificationPreferences>) => {
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

  const handleToggle = (key: keyof NotificationPreferences) => {
    if (!preferences) return;
    
    updatePreferences.mutate({
      [key]: !preferences[key],
    });
  };

  if (isLoading) {
    return (
      <Button variant="outline" disabled>
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Carregando...
      </Button>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Settings2 className="mr-2 h-4 w-4" />
          Preferências de Notificação
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Preferências de Notificação</DialogTitle>
          <DialogDescription>
            Escolha quais notificações você deseja receber
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <Label htmlFor="shift-status" className="flex flex-col">
              <span>Alterações de Status</span>
              <span className="text-sm text-muted-foreground">
                Quando um turno é ativado ou encerrado
              </span>
            </Label>
            <Switch
              id="shift-status"
              checked={preferences?.shift_status_changes}
              onCheckedChange={() => handleToggle('shift_status_changes')}
              disabled={updatePreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="team-updates" className="flex flex-col">
              <span>Atualizações de Equipe</span>
              <span className="text-sm text-muted-foreground">
                Quando membros são adicionados ou removidos
              </span>
            </Label>
            <Switch
              id="team-updates"
              checked={preferences?.shift_team_updates}
              onCheckedChange={() => handleToggle('shift_team_updates')}
              disabled={updatePreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shift-reminders" className="flex flex-col">
              <span>Lembretes de Turno</span>
              <span className="text-sm text-muted-foreground">
                Receber lembretes antes do início do turno
              </span>
            </Label>
            <Switch
              id="shift-reminders"
              checked={preferences?.shift_reminders}
              onCheckedChange={() => handleToggle('shift_reminders')}
              disabled={updatePreferences.isPending}
            />
          </div>

          <div className="flex items-center justify-between">
            <Label htmlFor="shift-reports" className="flex flex-col">
              <span>Relatórios de Turno</span>
              <span className="text-sm text-muted-foreground">
                Quando novos relatórios são gerados
              </span>
            </Label>
            <Switch
              id="shift-reports"
              checked={preferences?.shift_reports}
              onCheckedChange={() => handleToggle('shift_reports')}
              disabled={updatePreferences.isPending}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}