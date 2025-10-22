import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { useUpdateReport } from '@/hooks/queries/useReport';
import { toast } from 'sonner';

const formSchema = z.object({
  service_type: z.enum(['cleaning', 'boarding']),
  aircraft_id: z.string(),
  client_id: z.string(),
  shift_id: z.string(),
  service_date: z.date(),
  notes: z.string().optional(),
});

interface ReportBasicInfoProps {
  report: any;
  isPublished: boolean;
  onNext: () => void;
}

export function ReportBasicInfo({ report, isPublished, onNext }: ReportBasicInfoProps) {
  const updateReport = useUpdateReport();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      service_type: report?.service_type,
      aircraft_id: report?.aircraft_id,
      client_id: report?.client_id,
      shift_id: report?.shift_id,
      service_date: report?.service_date ? new Date(report.service_date) : new Date(),
      notes: report?.notes,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsLoading(true);
      await updateReport.mutateAsync({
        id: report.id,
        ...values,
        service_date: values.service_date.toISOString(),
      });
      onNext();
    } catch (error) {
      toast.error('Erro ao salvar informações');
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="service_type"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tipo de Serviço</FormLabel>
              <Select
                disabled={isPublished}
                onValueChange={field.onChange}
                defaultValue={field.value}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo de serviço" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="cleaning">Limpeza</SelectItem>
                  <SelectItem value="boarding">Embarque/Desembarque</SelectItem>
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="service_date"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Data do Serviço</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-[240px] pl-3 text-left font-normal",
                        !field.value && "text-muted-foreground"
                      )}
                    >
                      {field.value ? (
                        format(field.value, "PPP", { locale: ptBR })
                      ) : (
                        <span>Selecione uma data</span>
                      )}
                      <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value}
                    onSelect={field.onChange}
                    disabled={isPublished}
                    initialFocus
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Observações</FormLabel>
              <FormControl>
                <Input
                  disabled={isPublished}
                  placeholder="Observações adicionais"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {!isPublished && (
          <Button type="submit" disabled={isLoading}>
            Salvar e Continuar
          </Button>
        )}
      </form>
    </Form>
  );
}