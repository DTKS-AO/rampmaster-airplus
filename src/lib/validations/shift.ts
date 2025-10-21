import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

type ShiftStatus = Database['public']['Enums']['shift_status'];

type Tables<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
type Shift = Tables<'shifts'>;

// Required fields schema
const requiredFields = z.object({
  nome: z
    .string()
    .min(1, 'Nome do turno é obrigatório')
    .max(50, 'Nome muito longo')
    .trim(),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Formato inválido'),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Formato inválido'),
});

export const shiftSchema = requiredFields.extend({
  supervisor_id: z
    .string()
    .uuid('ID do supervisor inválido')
    .optional(),
  status: z
    .enum(['ativo', 'encerrado'] as const)
    .default('ativo'),
  // Optional fields managed by the system
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
  created_by: z.string().uuid('ID inválido').optional(),
  updated_by: z.string().uuid('ID inválido').optional(),
});

export const shiftEmployeeSchema = z.object({
  employee_id: z
    .string()
    .uuid('ID do funcionário inválido'),
  shift_id: z
    .string()
    .uuid('ID do turno inválido'),
  presente: z
    .boolean()
    .default(true),
  justificativa: z
    .string()
    .max(500, 'Justificativa muito longa')
    .nullable()
    .optional(),
  // Optional fields managed by the system
  created_at: z.string().optional(),
  updated_at: z.string().optional(),
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
export type ShiftEmployeeFormValues = z.infer<typeof shiftEmployeeSchema>;