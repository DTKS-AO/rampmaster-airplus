import { UseFormReturn } from 'react-hook-form';
import { Form } from '@/components/ui/form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { ShiftFormValues } from '@/lib/validations/shift';
import type { Tables } from '@/integrations/supabase/types';

interface ShiftFormProps {
  form: UseFormReturn<ShiftFormValues>;
  onSubmit: (data: ShiftFormValues) => Promise<void>;
  employees?: Tables<'employees'>[];
  isSubmitting?: boolean;
  submitLabel: string;
}

export function ShiftForm({
  form,
  onSubmit,
  employees,
  isSubmitting,
  submitLabel,
}: ShiftFormProps) {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="nome">Nome do Turno</Label>
            <Input
              id="nome"
              placeholder="Ex: Manhã - Pista 1"
              {...form.register('nome')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="data_inicio">Data e Hora de Início</Label>
            <Input
              id="data_inicio"
              type="datetime-local"
              {...form.register('data_inicio')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="data_fim">Data e Hora de Fim</Label>
            <Input
              id="data_fim"
              type="datetime-local"
              {...form.register('data_fim')}
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="supervisor_id">Supervisor</Label>
            <Select
              value={form.watch('supervisor_id')}
              onValueChange={(value) => form.setValue('supervisor_id', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um supervisor" />
              </SelectTrigger>
              <SelectContent>
                {employees
                  ?.filter((e) => e.funcao === 'supervisor')
                  .map((supervisor) => (
                    <SelectItem key={supervisor.id} value={supervisor.id}>
                      {supervisor.nome}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select
              value={form.watch('status')}
              onValueChange={(value) =>
                form.setValue('status', value as 'ativo' | 'encerrado')
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="encerrado">Encerrado</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button type="submit" disabled={isSubmitting} className="w-full">
          {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {submitLabel}
        </Button>
      </form>
    </Form>
  );
}