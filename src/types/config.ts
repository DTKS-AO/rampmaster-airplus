import { Tables, TablesInsert, Json } from '@/integrations/supabase/types'

// Service Types
export interface ServiceType extends Tables<'service_types'> {
  // Stored in DB as Json; keep a rich local type separately if needed
  checklist: Json
}

export interface ServiceChecklist {
  id: string
  title: string
  items: ServiceChecklistItem[]
}

export interface ServiceChecklistItem {
  id: string
  text: string
  required: boolean
}

// Configuration Types
export interface ClientConfig extends Tables<'client_configs'> {
  config_value: Json
}

export interface SystemConfig extends Tables<'system_configs'> {
  config_value: Json
}

export interface ReportConfig extends Tables<'report_configs'> {
  config_value: Json
}

export interface ClientConfigValue {
  branding?: {
    logo_url?: string
    primary_color?: string
    secondary_color?: string
  }
  language?: string
  timezone?: string
  contact_info?: {
    email?: string
    phone?: string
    address?: string
  }
}

export interface SystemConfigValue {
  default_language: string
  available_languages: string[]
  default_timezone: string
  session_timeout: number
  maintenance_mode: boolean
  maintenance_message?: string
  version: string
}

export interface ReportConfigValue {
  visible_fields: string[]
  required_fields: string[]
  photo_requirements?: {
    min_photos: number
    max_photos: number
    required_types: string[]
  }
  signature_requirements?: {
    min_signatures: number
    max_signatures: number
    required_roles: string[]
  }
}

// Role and Permission Types
export interface Role extends Tables<'roles'> {
  permissions?: Permission[]
}

export interface Permission extends Tables<'permissions'> {
  roles?: Role[]
}

export interface RolePermission extends Tables<'role_permissions'> {
  role?: Role
  permission?: Permission
}

// Insert Types
export type ServiceTypeInsert = TablesInsert<'service_types'> & {
  checklist: ServiceChecklist[]
}

export type ClientConfigInsert = TablesInsert<'client_configs'> & {
  config_value: Json
}

export type SystemConfigInsert = TablesInsert<'system_configs'> & {
  config_value: Json
}

export type ReportConfigInsert = TablesInsert<'report_configs'> & {
  config_value: Json
}

// Update Types
export type ServiceTypeUpdate = Partial<ServiceTypeInsert>
export type ClientConfigUpdate = Partial<ClientConfigInsert>
export type SystemConfigUpdate = Partial<SystemConfigInsert>
export type ReportConfigUpdate = Partial<ReportConfigInsert>

// Configuration Keys
export const CONFIG_KEYS = {
  client: {
    BRANDING: 'branding',
    LANGUAGE: 'language',
    TIMEZONE: 'timezone',
    CONTACT_INFO: 'contact_info'
  },
  system: {
    LANGUAGE: 'language',
    TIMEZONE: 'timezone',
    SESSION: 'session',
    MAINTENANCE: 'maintenance',
    VERSION: 'version'
  },
  report: {
    FIELDS: 'fields',
    PHOTOS: 'photos',
    SIGNATURES: 'signatures'
  }
} as const