import { z } from 'zod';
import type { Database } from '@/integrations/supabase/types';
import { normalizeAngolanPhone, normalizeBI, normalizeMechanicNumber } from '@/lib/utils/format';

type UserRole = Database['public']['Enums']['user_role'];

// Regex for Angolan phone numbers
const angolanPhoneRegex = /^(\+244|00244)?[9][1-9][0-9]{7}$/;

export const employeeSchema = z.object({
  nome: z
    .string()
    .min(3, 'Nome deve ter pelo menos 3 caracteres')
    .max(100, 'Nome muito longo')
    .trim(),
  bi: z
    .string()
    .min(14, 'BI deve ter 14 caracteres')
    .max(14, 'BI deve ter 14 caracteres')
    .regex(/^[0-9A-Z]+$/, 'Formato de BI inválido')
    .trim()
    .transform(val => normalizeBI(val)),
  numero_mecanografico: z
    .string()
    .min(3, 'Número mecanográfico deve ter pelo menos 3 caracteres')
    .max(20, 'Número mecanográfico muito longo')
    .regex(/^[A-Z0-9]+$/, 'Formato inválido')
    .trim()
    .transform(val => normalizeMechanicNumber(val)),
  telefone: z
    .string()
    .regex(angolanPhoneRegex, 'Número de telefone inválido')
    .trim()
    .transform(val => normalizeAngolanPhone(val)),
  email: z
    .string()
    .email('Email inválido')
    .trim(),
  funcao: z
    .enum(['super_admin', 'gestor', 'supervisor', 'tecnico', 'auxiliar', 'cliente'] as const)
    .default('tecnico'),
  foto_url: z
    .string()
    .url('URL da foto inválida')
    .nullable()
    .optional(),
  ativo: z
    .boolean()
    .default(true),
  user_id: z
    .string()
    .uuid('ID de usuário inválido')
    .nullable()
    .optional(),
  created_by: z
    .string()
    .uuid('ID de criação inválido')
    .nullable()
    .optional(),
  updated_by: z
    .string()
    .uuid('ID de atualização inválido')
    .nullable()
    .optional(),
  created_at: z
    .string()
    .nullable()
    .optional(),
  updated_at: z
    .string()
    .nullable()
    .optional(),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;