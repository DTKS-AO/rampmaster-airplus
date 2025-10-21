import { useState } from 'react';
import { format } from 'date-fns';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Copy, Loader2, Save, X } from 'lucide-react';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Tables } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { useQueryClient } from '@tanstack/react-query';

const templateSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter no mínimo 3 caracteres'),
  descricao: z.string().optional(),
});

type TemplateFormValues = z.infer<typeof templateSchema>;

interface ShiftTemplateProps {
  shift: Tables<'shifts'> & {
    shift_employees?: Array<{
      employee_id: string;
      presente?: boolean;
    }>;
  };
}

export function ShiftTemplate({ shift }: ShiftTemplateProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const queryClient = useQueryClient();

  const form = useForm<TemplateFormValues>({
    resolver: zodResolver(templateSchema),
    defaultValues: {
      nome: `${shift.nome} - Template`,
      descricao: '',
    },
  });

  const onSubmit = async (data: TemplateFormValues) => {
    setIsSaving(true);
    try {
      // Save template
      const { data: template, error: templateError } = await supabase
        .from('shift_templates')
        .insert({
          nome: data.nome,
          descricao: data.descricao,
          horario_inicio: format(new Date(shift.data_inicio), 'HH:mm'),
          horario_fim: format(new Date(shift.data_fim), 'HH:mm'),
          created_by: shift.created_by,
        })
        .select()
        .single();

      if (templateError) throw templateError;

      // Save template employees
      if (shift.shift_employees?.length) {
        const { error: employeesError } = await supabase
          .from('shift_template_employees')
          .insert(
            shift.shift_employees.map(se => ({
              template_id: template.id,
              employee_id: se.employee_id,
              created_by: shift.created_by,
            }))
          );

        if (employeesError) throw employeesError;
      }

      await queryClient.invalidateQueries({ queryKey: ['shift-templates'] });
      toast.success('Template salvo com sucesso');
      setIsOpen(false);
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Copy className="mr-2 h-4 w-4" />
          Salvar como Template
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Salvar como Template</DialogTitle>
          <DialogDescription>
            Crie um template para reutilizar a configuração deste turno em futuras
            escalas.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="nome"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome do Template</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Nome que identificará este template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="descricao"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição (opcional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormDescription>
                    Uma breve descrição do propósito deste template
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsOpen(false)}
                disabled={isSaving}
              >
                <X className="mr-2 h-4 w-4" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Save className="mr-2 h-4 w-4" />
                )}
                Salvar Template
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}