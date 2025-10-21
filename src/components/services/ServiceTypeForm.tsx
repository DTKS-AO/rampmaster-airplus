import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useCreateServiceType, useUpdateServiceType } from '@/hooks/queries/useConfig'
import type { ServiceType } from '@/types/config'

const serviceTypeSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório'),
  description: z.string().optional(),
  checklist: z.array(z.object({
    id: z.string(),
    title: z.string(),
    items: z.array(z.object({
      id: z.string(),
      text: z.string(),
      required: z.boolean()
    }))
  })),
  required_photos: z.number().min(0),
  required_signatures: z.number().min(0),
  active: z.boolean()
})

type FormValues = z.infer<typeof serviceTypeSchema>

interface ServiceTypeFormProps {
  serviceType?: ServiceType
  onSuccess?: () => void
  onCancel?: () => void
}

export function ServiceTypeForm({ serviceType, onSuccess, onCancel }: ServiceTypeFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(serviceTypeSchema),
    defaultValues: serviceType ?? {
      name: '',
      description: '',
      checklist: [],
      required_photos: 0,
      required_signatures: 0,
      active: true
    }
  })

  const createMutation = useCreateServiceType()
  const updateMutation = useUpdateServiceType(serviceType?.id ?? '')

  const onSubmit = async (values: FormValues) => {
    try {
      if (serviceType) {
        await updateMutation.mutateAsync(values)
      } else {
        await createMutation.mutateAsync(values)
      }
      onSuccess?.()
    } catch (error) {
      console.error('Error saving service type:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {serviceType ? 'Editar Tipo de Serviço' : 'Novo Tipo de Serviço'}
        </CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="required_photos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fotos Obrigatórias</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="required_signatures"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Assinaturas Obrigatórias</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={0}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="active"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2">
                  <FormLabel>Ativo</FormLabel>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>

          <CardFooter className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onCancel}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              loading={createMutation.isPending || updateMutation.isPending}
            >
              {serviceType ? 'Salvar' : 'Criar'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}