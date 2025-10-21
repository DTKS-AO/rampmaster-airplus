import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

type ServiceType = Database['public']['Enums']['service_type'];
type ReportStatus = Database['public']['Enums']['report_status'];

// Base schema for service report
export const serviceReportSchema = z.object({
  tipo_servico: z.array(z.enum([
    'limpeza_exterior',
    'limpeza_completa',
    'embarque',
    'desembarque',
    'embarque_desembarque'
  ] as const)).min(1, 'Selecione pelo menos um tipo de serviço'),
  
  aircraft_id: z.string().uuid('ID da aeronave inválido'),
  shift_id: z.string().uuid('ID do turno inválido'),
  client_id: z.string().uuid('ID do cliente inválido'),
  
  observacoes: z.string().optional(),
  checklist: z.record(z.string(), z.boolean()).optional(),
  
  status: z.enum(['rascunho', 'publicado'] as const).default('rascunho'),
  supervisor_id: z.string().uuid('ID do supervisor inválido').optional(),
});

// Schema for report employees
export const reportEmployeeSchema = z.object({
  employee_id: z.string().uuid('ID do funcionário inválido'),
  presente: z.boolean().default(true),
  justificativa: z.string().optional(),
});

// Schema for report photos
export const reportPhotoSchema = z.object({
  url: z.string().url('URL da foto inválida'),
  tipo: z.enum(['antes', 'depois'] as const),
  descricao: z.string().optional(),
  ordem: z.number().int().nonnegative(),
});

// Schema for report signatures
export const reportSignatureSchema = z.object({
  cargo: z.string().min(1, 'Cargo é obrigatório'),
  nome: z.string().min(1, 'Nome é obrigatório'),
  assinatura_url: z.string().url('URL da assinatura inválida'),
});

// Combined schema for the entire report workflow
export const reportWorkflowSchema = serviceReportSchema.extend({
  // Step 1: General Information
  // (already covered by base schema)

  // Step 2: Employees
  employees: z.array(reportEmployeeSchema).min(1, 'Adicione pelo menos um funcionário'),

  // Step 3: Photos
  photos: z.object({
    antes: z.array(reportPhotoSchema).min(1, 'Adicione pelo menos uma foto "antes"'),
    depois: z.array(reportPhotoSchema).min(1, 'Adicione pelo menos uma foto "depois"'),
  }),

  // Step 4: Signatures
  signatures: z.array(reportSignatureSchema).min(2, 'São necessárias pelo menos duas assinaturas'),

  // Step 5: Review and Export
  // (uses status from base schema)
});

// Types
export type ServiceReportFormValues = z.infer<typeof serviceReportSchema>;
export type ReportEmployeeFormValues = z.infer<typeof reportEmployeeSchema>;
export type ReportPhotoFormValues = z.infer<typeof reportPhotoSchema>;
export type ReportSignatureFormValues = z.infer<typeof reportSignatureSchema>;
export type ReportWorkflowFormValues = z.infer<typeof reportWorkflowSchema>;