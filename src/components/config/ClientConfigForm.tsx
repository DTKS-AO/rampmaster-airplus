import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUpdateClientConfig } from '@/hooks/queries/useConfig'
import type { ClientConfigValue } from '@/types/config'

const clientConfigSchema = z.object({
  branding: z.object({
    logo_url: z.string().url().optional(),
    primary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
    secondary_color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Cor inválida').optional(),
  }),
  language: z.string(),
  timezone: z.string(),
  contact_info: z.object({
    email: z.string().email().optional(),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
})

type FormValues = z.infer<typeof clientConfigSchema>

interface ClientConfigFormProps {
  clientId: string
  initialValues?: ClientConfigValue
  onSuccess?: () => void
}

const LANGUAGES = [
  { value: 'pt-BR', label: 'Português (Brasil)' },
  { value: 'en', label: 'English' },
]

const TIMEZONES = [
  { value: 'Africa/Luanda', label: 'Africa/Luanda' },
  { value: 'UTC', label: 'UTC' },
]

export function ClientConfigForm({ clientId, initialValues, onSuccess }: ClientConfigFormProps) {
  const form = useForm<FormValues>({
    resolver: zodResolver(clientConfigSchema),
    defaultValues: initialValues ?? {
      branding: {},
      language: 'pt-BR',
      timezone: 'Africa/Luanda',
      contact_info: {},
    }
  })

  const updateConfig = useUpdateClientConfig(clientId)

  const onSubmit = async (values: FormValues) => {
    try {
      // Cast to the generated ClientConfigInsert shape so Supabase typed helpers accept it
      await updateConfig.mutateAsync({
        config_key: 'client_config',
        config_value: values,
      } as unknown as import('@/integrations/supabase/types').TablesInsert<'client_configs'>)
      onSuccess?.()
    } catch (error) {
      console.error('Error saving client config:', error)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações do Cliente</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <h3 className="font-medium">Marca</h3>
              <FormField
                control={form.control}
                name="branding.logo_url"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do Logo</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="https://..." />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="branding.primary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Primária</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="#000000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="branding.secondary_color"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cor Secundária</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="#000000" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Localização</h3>
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Idioma</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o idioma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {LANGUAGES.map(lang => (
                            <SelectItem key={lang.value} value={lang.value}>
                              {lang.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="timezone"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormLabel>Fuso Horário</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o fuso horário" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {TIMEZONES.map(tz => (
                            <SelectItem key={tz.value} value={tz.value}>
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-medium">Contato</h3>
              <FormField
                control={form.control}
                name="contact_info.email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_info.phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contact_info.address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Endereço</FormLabel>
                    <FormControl>
                      <Input {...field} />
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