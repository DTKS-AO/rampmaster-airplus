import { useState } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ServiceTypeForm } from '@/components/services/ServiceTypeForm'
import { ChecklistEditor } from '@/components/services/ChecklistEditor'
import { ClientConfigForm } from '@/components/config/ClientConfigForm'
import { SystemConfigForm } from '@/components/config/SystemConfigForm'
import { ReportConfigForm } from '@/components/config/ReportConfigForm'
import { RoleMatrix } from '@/components/config/RoleMatrix'
import { useServiceTypes, useUpdateReportConfig, useSystemConfig, useClientConfig } from '@/hooks/queries/useConfig'
import { useAuth } from '@/hooks/auth'

export function ConfigPage() {
  const [activeTab, setActiveTab] = useState('services')
  const { user } = useAuth()
  const { data: services } = useServiceTypes()
  const { data: systemConfig } = useSystemConfig()
  const { data: clientConfig } = useClientConfig(user?.client_id ?? '')

  const [selectedServiceId, setSelectedServiceId] = useState<string>()

  const isAdmin = user?.role === 'super_admin'

  if (!user) return null

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          {isAdmin && <TabsTrigger value="services">Tipos de Serviço</TabsTrigger>}
          {isAdmin && <TabsTrigger value="system">Sistema</TabsTrigger>}
          {!isAdmin && <TabsTrigger value="client">Cliente</TabsTrigger>}
          {isAdmin && <TabsTrigger value="roles">Permissões</TabsTrigger>}
        </TabsList>

        {isAdmin && (
          <TabsContent value="services" className="space-y-6">
            <ServiceTypeForm
              serviceType={services?.find(s => s.id === selectedServiceId)}
              onSuccess={() => setSelectedServiceId(undefined)}
            />
            {selectedServiceId && (
              <ReportConfigForm
                serviceTypeId={selectedServiceId}
              />
            )}
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="system">
            <SystemConfigForm
              initialValues={systemConfig?.[0]?.config_value as any}
            />
          </TabsContent>
        )}

        {!isAdmin && (
          <TabsContent value="client">
            <ClientConfigForm
              clientId={user.client_id ?? ''}
              initialValues={clientConfig?.[0]?.config_value as any}
            />
          </TabsContent>
        )}

        {isAdmin && (
          <TabsContent value="roles">
            <RoleMatrix
              onTogglePermission={(roleId, permissionId, granted) => {
                // Implement permission toggle
                console.log('Toggle permission', { roleId, permissionId, granted })
              }}
            />
          </TabsContent>
        )}
      </Tabs>
    </div>
  )
}