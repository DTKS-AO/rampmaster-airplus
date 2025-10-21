import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useUpdateReportConfig } from '@/hooks/queries/useConfig'
import type { ReportConfigValue } from '@/types/config'

const reportConfigSchema = z.object({
  visible_fields: z.array(z.string()),
  required_fields: z.array(z.string()),
  photo_requirements: z.object({
    min_photos: z.number().min(0),
    max_photos: z.number().min(0),
    required_types: z.array(z.string())
  }),
  signature_requirements: z.object({
    min_signatures: z.number().min(0),
    max_signatures: z.number().min(0),
    required_roles: z.array(z.string())
  })
})

type FormValues = z.infer<typeof reportConfigSchema>

interface ReportConfigFormProps {
  serviceTypeId: string
  initialValues?: ReportConfigValue
  onSuccess?: () => void
}

const ALL_FIELDS = [
  { id: 'aircraft', label: 'Aeronave' },
  { id: 'date', label: 'Data' },
  { id: 'shift', label: 'Turno' },
  { id: 'employees', label: 'Funcionários' },
  { id: 'observations', label: 'Observações' },
  { id: 'checklist', label: 'Checklist' },
  { id: 'photos', label: 'Fotos' },
  { id: 'signatures', label: 'Assinaturas' },
]

const PHOTO_TYPES = [
  { id: 'exterior', label: 'Exterior' },
  { id: 'interior', label: 'Interior' },
  { id: 'details', label: 'Detalhes' },
  { id: 'damage', label: 'Danos' },
]

const SIGNATURE_ROLES = [
  { id: 'supervisor', label: 'Supervisor' },
  { id: 'tecnico', label: 'Técnico' },
  { id: 'cliente', label: 'Cliente' },
]

export function ReportConfigForm({
  serviceTypeId,
  initialValues,
  onSuccess
}: ReportConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(reportConfigSchema),
    defaultValues: initialValues ?? {
      visible_fields: ['aircraft', 'date', 'shift', 'employees'],
      required_fields: ['aircraft', 'date'],
      photo_requirements: {
        min_photos: 0,
        max_photos: 10,
        required_types: []
      },
      signature_requirements: {
        min_signatures: 1,
        max_signatures: 3,
        required_roles: ['supervisor']
      }
    }
  })

  const updateConfig = useUpdateReportConfig(serviceTypeId)

  const onSubmit = async (values: FormValues) => {
    try {
      await updateConfig.mutateAsync({
        config_key: 'report_config',
        config_value: values,
      } as unknown as import('@/integrations/supabase/types').TablesInsert<'report_configs'>)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving report config:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configuração do Relatório</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Campos Visíveis</h3>
              {ALL_FIELDS.map(field => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name="visible_fields"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={value.includes(field.id)}
                          onCheckedChange={(checked) => {
                            onChange(
                              checked
                                ? [...value, field.id]
                                : value.filter(v => v !== field.id)
                            )
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Campos Obrigatórios</h3>
              {ALL_FIELDS.map(field => (
                <FormField
                  key={field.id}
                  control={form.control}
                  name="required_fields"
                  render={({ field: { value, onChange } }) => (
                    <FormItem className="flex items-center gap-2">
                      <FormLabel>{field.label}</FormLabel>
                      <FormControl>
                        <Switch
                          checked={value.includes(field.id)}
                          onCheckedChange={(checked) => {
                            onChange(
                              checked
                                ? [...value, field.id]
                                : value.filter(v => v !== field.id)
                            )
                          }}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              ))}
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Requisitos de Fotos</h3>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="photo_requirements.min_photos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínimo de Fotos</FormLabel>
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
                  name="photo_requirements.max_photos"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Fotos</FormLabel>
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

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Tipos de Fotos Obrigatórios</h4>
                {PHOTO_TYPES.map(type => (
                  <FormField
                    key={type.id}
                    control={form.control}
                    name="photo_requirements.required_types"
                    render={({ field: { value, onChange } }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel>{type.label}</FormLabel>
                        <FormControl>
                          <Switch
                            checked={value.includes(type.id)}
                            onCheckedChange={(checked) => {
                              onChange(
                                checked
                                  ? [...value, type.id]
                                  : value.filter(v => v !== type.id)
                              )
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Requisitos de Assinaturas</h3>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="signature_requirements.min_signatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mínimo de Assinaturas</FormLabel>
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
                  name="signature_requirements.max_signatures"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Assinaturas</FormLabel>
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

              <div className="space-y-2">
                <h4 className="text-sm font-medium">Cargos Obrigatórios</h4>
                {SIGNATURE_ROLES.map(role => (
                  <FormField
                    key={role.id}
                    control={form.control}
                    name="signature_requirements.required_roles"
                    render={({ field: { value, onChange } }) => (
                      <FormItem className="flex items-center gap-2">
                        <FormLabel>{role.label}</FormLabel>
                        <FormControl>
                          <Switch
                            checked={value.includes(role.id)}
                            onCheckedChange={(checked) => {
                              onChange(
                                checked
                                  ? [...value, role.id]
                                  : value.filter(v => v !== role.id)
                              )
                            }}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                ))}
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end">
            <Button
              type="submit"
              loading={updateConfig.isPending}
            >
              Salvar
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  )
}