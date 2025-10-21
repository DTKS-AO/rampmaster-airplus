import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/integrations/supabase/client'
import type {
  ServiceType,
  ServiceTypeInsert,
  ServiceTypeUpdate,
  Role,
  Permission,
  ClientConfig,
  SystemConfig,
  ReportConfig,
  ClientConfigInsert,
  SystemConfigInsert,
  ReportConfigInsert
} from '@/types/config'
import { toast } from 'sonner'

// Query Keys
export const SERVICES_KEYS = {
  all: ['services'] as const,
  list: () => [...SERVICES_KEYS.all, 'list'] as const,
  detail: (id: string) => [...SERVICES_KEYS.all, 'detail', id] as const,
  versions: (id: string) => [...SERVICES_KEYS.all, 'versions', id] as const,
}

export const CONFIG_KEYS = {
  all: ['config'] as const,
  client: (clientId: string) => [...CONFIG_KEYS.all, 'client', clientId] as const,
  system: () => [...CONFIG_KEYS.all, 'system'] as const,
  report: (serviceTypeId: string) => [...CONFIG_KEYS.all, 'report', serviceTypeId] as const,
}

export const ROLES_KEYS = {
  all: ['roles'] as const,
  list: () => [...ROLES_KEYS.all, 'list'] as const,
  detail: (id: string) => [...ROLES_KEYS.all, 'detail', id] as const,
  permissions: () => [...ROLES_KEYS.all, 'permissions'] as const,
}

// Service Type Hooks
export const useServiceTypes = () => {
  return useQuery({
    queryKey: SERVICES_KEYS.list(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('active', true)
        .order('created_at', { ascending: false })

      if (error) throw error
      return data as ServiceType[]
    },
  })
}

export const useServiceType = (id: string) => {
  return useQuery({
    queryKey: SERVICES_KEYS.detail(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('id', id)
        .eq('active', true)
        .single()

      if (error) throw error
      return data as ServiceType
    },
  })
}

export const useServiceTypeVersions = (id: string) => {
  return useQuery({
    queryKey: SERVICES_KEYS.versions(id),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_types')
        .select('*')
        .eq('id', id)
        .order('version', { ascending: false })

      if (error) throw error
      return data as ServiceType[]
    },
  })
}

export const useCreateServiceType = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (newService: ServiceTypeInsert) => {
      const { data, error } = await supabase
        .from('service_types')
        .insert(newService)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.list() })
      toast.success('Tipo de serviço criado com sucesso')
    },
    onError: (error) => {
      toast.error('Erro ao criar tipo de serviço')
      console.error('Error creating service type:', error)
    },
  })
}

export const useUpdateServiceType = (id: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (updates: ServiceTypeUpdate) => {
      const { data, error } = await supabase
        .from('service_types')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.detail(id) })
      queryClient.invalidateQueries({ queryKey: SERVICES_KEYS.versions(id) })
      toast.success('Tipo de serviço atualizado com sucesso')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar tipo de serviço')
      console.error('Error updating service type:', error)
    },
  })
}

// Configuration Hooks
export const useClientConfig = (clientId: string) => {
  return useQuery({
    queryKey: CONFIG_KEYS.client(clientId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('client_configs')
        .select('*')
        .eq('client_id', clientId)
        .is('valid_until', null)

      if (error) throw error
      return data as ClientConfig[]
    },
  })
}

export const useSystemConfig = () => {
  return useQuery({
    queryKey: CONFIG_KEYS.system(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('system_configs')
        .select('*')
        .is('valid_until', null)

      if (error) throw error
      return data as SystemConfig[]
    },
  })
}

export const useReportConfig = (serviceTypeId: string) => {
  return useQuery({
    queryKey: CONFIG_KEYS.report(serviceTypeId),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('report_configs')
        .select('*')
        .eq('service_type_id', serviceTypeId)
        .is('valid_until', null)

      if (error) throw error
      return data as ReportConfig[]
    },
  })
}

export const useUpdateClientConfig = (clientId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: ClientConfigInsert) => {
      const { data, error } = await supabase
        .from('client_configs')
        .upsert({ ...config, client_id: clientId })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.client(clientId) })
      toast.success('Configuração atualizada com sucesso')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar configuração')
      console.error('Error updating client config:', error)
    },
  })
}

export const useUpdateSystemConfig = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: SystemConfigInsert) => {
      const { data, error } = await supabase
        .from('system_configs')
        .upsert(config)
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.system() })
      toast.success('Configuração do sistema atualizada com sucesso')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar configuração do sistema')
      console.error('Error updating system config:', error)
    },
  })
}

export const useUpdateReportConfig = (serviceTypeId: string) => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (config: ReportConfigInsert) => {
      const { data, error } = await supabase
        .from('report_configs')
        .upsert({ ...config, service_type_id: serviceTypeId })
        .select()
        .single()

      if (error) throw error
      return data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CONFIG_KEYS.report(serviceTypeId) })
      toast.success('Configuração do relatório atualizada com sucesso')
    },
    onError: (error) => {
      toast.error('Erro ao atualizar configuração do relatório')
      console.error('Error updating report config:', error)
    },
  })
}

// Role and Permission Hooks
import type { Tables } from '@/integrations/supabase/types'

export interface RolePermissionWithDetails {
  id: string
  role_id: string
  permission_id: string
  permission: {
    id: string
    resource: string
    action: string
    description: string | null
    created_at: string
    updated_at: string | null
    created_by: string | null
    updated_by: string | null
  }
}

export interface ExtendedRole extends Tables<'roles'> {
  permissions: Tables<'permissions'>[]
}

export const useRoles = () => {
  return useQuery({
    queryKey: ROLES_KEYS.list(),
    queryFn: async () => {
      // Fetch base roles with strong typing
      const { data: roles, error: rolesError } = await supabase
        .from('roles')
        .select()
        .order('created_at', { ascending: false })
        .returns<Tables<'roles'>[]>()

      if (rolesError) throw rolesError
      if (!roles?.length) return []

      // Fetch role permissions with nested permission details
      const { data: rolePermissions, error: permsError } = await supabase
        .from('role_permissions')
        .select(`
          id,
          role_id,
          permission_id,
          permission:permissions (*)
        `)
        .in('role_id', roles.map(r => r.id))
        .returns<RolePermissionWithDetails[]>()

      if (permsError) throw permsError
      if (!rolePermissions?.length) return roles.map(r => ({ ...r, permissions: [] }))

      // Map the roles with their permissions
      const rolesWithPermissions = roles.map(role => ({
        ...role,
        permissions: rolePermissions
          .filter(p => p.role_id === role.id)
          .map(p => p.permission)
      })) satisfies ExtendedRole[]

      return rolesWithPermissions
    },
  })
}

export const usePermissions = () => {
  return useQuery({
    queryKey: ROLES_KEYS.permissions(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('permissions')
        .select()
        .order('resource', { ascending: true })
        .returns<Tables<'permissions'>[]>()

      if (error) throw error
      if (!data) return []
      return data
    },
  })
}