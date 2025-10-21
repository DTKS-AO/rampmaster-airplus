import { z } from 'zod';

export const aircraftSchema = z.object({
  matricula: z
    .string()
    .min(1, 'Matrícula é obrigatória')
    .regex(/^[A-Z0-9-]+$/, 'Formato inválido. Use letras maiúsculas, números e hífen'),
  modelo: z.string().min(1, 'Modelo é obrigatório'),
  client_id: z.string().uuid('Cliente é obrigatório'),
  estado: z.enum(['ativo', 'em_manutencao', 'inativo']).default('ativo'),
  ultima_limpeza: z.string().nullable(),
  ativo: z.boolean().default(true),
});

export type AircraftFormValues = z.infer<typeof aircraftSchema>;