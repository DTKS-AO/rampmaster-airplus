import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
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
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useCreateService, useUpdateService } from '@/hooks/queries/useServices';
import type { Tables } from '@/integrations/supabase/types';

const serviceSchema = z.object({
  nome: z.string().min(3, 'Nome deve ter pelo menos 3 caracteres'),
  codigo: z.string().min(2, 'Código deve ter pelo menos 2 caracteres'),
  categoria: z.enum(['limpeza', 'rampa', 'formacao', 'gestao', 'manutencao']),
  descricao: z.string().optional(),
  preco_base: z.number().min(0).optional(),
  duracao_estimada_minutos: z.number().min(0).optional(),
  requer_supervisor: z.boolean().default(false),
  minimo_tecnicos: z.number().min(1).default(1),
  ativo: z.boolean().default(true),
});

type ServiceFormValues = z.infer<typeof serviceSchema>;

interface ServiceFormProps {
  service?: any;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export function ServiceForm({ service, onSuccess, onCancel }: ServiceFormProps) {
  const createService = useCreateService();
  const updateService = useUpdateService();

  const form = useForm<ServiceFormValues>({
    resolver: zodResolver(serviceSchema),
    defaultValues: service
      ? {
          nome: service.nome,
          codigo: service.codigo,
          categoria: service.categoria as any,
          descricao: service.descricao || '',
          preco_base: service.preco_base ? Number(service.preco_base) : undefined,
          duracao_estimada_minutos: service.duracao_estimada_minutos || undefined,
          requer_supervisor: service.requer_supervisor,
          minimo_tecnicos: service.minimo_tecnicos,
          ativo: service.ativo,
        }
      : {
          nome: '',
          codigo: '',
          categoria: 'limpeza',
          descricao: '',
          requer_supervisor: false,
          minimo_tecnicos: 1,
          ativo: true,
        },
  });

  const onSubmit = async (values: ServiceFormValues) => {
    try {
      if (service) {
        await updateService.mutateAsync({
          id: service.id,
          ...values,
        });
      } else {
        await createService.mutateAsync(values as any);
      }
      onSuccess?.();
    } catch (error) {
      console.error('Error saving service:', error);
    }
  };

  const isLoading = createService.isPending || updateService.isPending;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Serviço</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Limpeza Exterior" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="codigo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Código</FormLabel>
                <FormControl>
                  <Input 
                    placeholder="Ex: limpeza_exterior" 
                    {...field} 
                    disabled={!!service} // Não permitir edição do código
                  />
                </FormControl>
                <FormDescription>
                  Identificador único (não pode ser alterado)
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="categoria"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categoria</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma categoria" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="limpeza">Limpeza</SelectItem>
                  <SelectItem value="rampa">Rampa</SelectItem>
                  <SelectItem value="formacao">Formação</SelectItem>
                  <SelectItem value="gestao">Gestão</SelectItem>
                  <SelectItem value="manutencao">Manutenção</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="descricao"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Descreva o serviço..."
                  className="min-h-[100px]"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="minimo_tecnicos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mínimo de Técnicos</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={1}
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value))}
                  />
                </FormControl>
                <FormDescription>Técnicos necessários para executar</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="duracao_estimada_minutos"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Duração Estimada (minutos)</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    min={0}
                    placeholder="Ex: 120"
                    {...field}
                    onChange={(e) => field.onChange(parseInt(e.target.value) || undefined)}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="requer_supervisor"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Requer Supervisor</FormLabel>
                <FormDescription>
                  Este serviço requer a presença de um supervisor
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="ativo"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <FormLabel className="text-base">Serviço Ativo</FormLabel>
                <FormDescription>
                  Serviços inativos não aparecem em novos relatórios
                </FormDescription>
              </div>
              <FormControl>
                <Switch checked={field.value} onCheckedChange={field.onChange} />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : service ? 'Atualizar' : 'Criar'}
          </Button>
        </div>
      </form>
    </Form>
  );
}
