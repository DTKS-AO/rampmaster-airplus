import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { useUpdateSystemConfig } from '@/hooks/queries/useConfig'
import type { SystemConfigValue } from '@/types/config'

const systemConfigSchema = z.object({
  default_language: z.string(),
  available_languages: z.array(z.string()),
  default_timezone: z.string(),
  session_timeout: z.number().min(1),
  maintenance_mode: z.boolean(),
  maintenance_message: z.string().optional(),
  version: z.string(),
})

type FormValues = z.infer<typeof systemConfigSchema>

interface SystemConfigFormProps {
  initialValues?: SystemConfigValue
  onSuccess?: () => void
}

export function SystemConfigForm({ initialValues, onSuccess }: SystemConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(systemConfigSchema),
    defaultValues: initialValues ?? {
      default_language: 'pt-BR',
      available_languages: ['pt-BR', 'en'],
      default_timezone: 'Africa/Luanda',
      session_timeout: 60,
      maintenance_mode: false,
      version: '1.0.0',
    }
  })

  const updateConfig = useUpdateSystemConfig()

  const onSubmit = async (values: FormValues) => {
    try {
      await updateConfig.mutateAsync({
        config_key: 'system_config',
        config_value: values,
      })
      onSuccess?.()
    } catch (error) {
      console.error('Error saving system config:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Sistema</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Localização</h3>
              <FormField
                control={form.control}
                name="default_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Idioma Padrão</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_timezone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fuso Horário Padrão</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Sessão</h3>
              <FormField
                control={form.control}
                name="session_timeout"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tempo Limite da Sessão (minutos)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min={1}
                        {...field}
                        onChange={e => field.onChange(parseInt(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Manutenção</h3>
              <FormField
                control={form.control}
                name="maintenance_mode"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-2">
                    <FormLabel>Modo Manutenção</FormLabel>
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

              <FormField
                control={form.control}
                name="maintenance_message"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Mensagem de Manutenção</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Versão</h3>
              <FormField
                control={form.control}
                name="version"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Versão do Sistema</FormLabel>
                    <FormControl>
                      <Input {...field} readOnly />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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