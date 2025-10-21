import { z } from 'zod';

export const teamSchema = z.object({
  nome: z
    .string()
    .min(1, 'Nome da equipa é obrigatório')
    .max(50, 'Nome muito longo'),
  supervisor_id: z
    .string()
    .uuid('ID do supervisor inválido'),
  turno_id: z
    .string()
    .uuid('ID do turno inválido')
    .nullable()
    .optional(),
  semana_referencia: z
    .number()
    .int('Semana deve ser um número inteiro')
    .min(1, 'Semana inválida')
    .max(52, 'Semana inválida')
    .nullable()
    .optional(),
  mes_referencia: z
    .number()
    .int('Mês deve ser um número inteiro')
    .min(1, 'Mês inválido')
    .max(12, 'Mês inválido')
    .nullable()
    .optional(),
  ativo: z
    .boolean()
    .default(true),
});

export const teamEmployeeSchema = z.object({
  team_id: z
    .string()
    .uuid('ID da equipa inválido'),
  employee_id: z
    .string()
    .uuid('ID do funcionário inválido'),
});

export type TeamFormValues = z.infer<typeof teamSchema>;
export type TeamEmployeeFormValues = z.infer<typeof teamEmployeeSchema>;