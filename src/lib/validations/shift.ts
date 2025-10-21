import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';

type ShiftStatus = Database['public']['Enums']['shift_status'];

export const shiftSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome do turno é obrigatório')
    .max(50, 'Nome muito longo'),
  data_inicio: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Formato inválido'),
  data_fim: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/, 'Formato inválido'),
  supervisor_id: z
    .string()
    .uuid('ID do supervisor inválido'),
  status: z
    .enum(['ativo', 'encerrado'] as const)
    .default('ativo'),
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
});

export type ShiftFormValues = z.infer<typeof shiftSchema>;
export type ShiftEmployeeFormValues = z.infer<typeof shiftEmployeeSchema>;