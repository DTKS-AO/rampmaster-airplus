import { z } from 'zod';

export const employeeSchema = z.object({
  nome: z.string().min(1, 'Nome é obrigatório'),
  bi: z
    .string()
    .min(1, 'BI é obrigatório')
    .regex(/^[0-9A-Z]+$/, 'Formato de BI inválido'),
  numero_mecanografico: z
    .string()
    .min(1, 'Número mecanográfico é obrigatório')
    .regex(/^[A-Z0-9]+$/, 'Formato inválido'),
  telefone: z
    .string()
    .min(1, 'Telefone é obrigatório')
    .regex(/^\+244[1-9][0-9]{8}$/, 'Formato inválido. Use +244XXXXXXXXX'),
  email: z.string().email('Email inválido'),
  funcao: z.enum(['super_admin', 'gestor', 'supervisor', 'tecnico', 'auxiliar', 'cliente']),
  foto_url: z.string().nullable(),
  ativo: z.boolean().default(true),
});

export type EmployeeFormValues = z.infer<typeof employeeSchema>;