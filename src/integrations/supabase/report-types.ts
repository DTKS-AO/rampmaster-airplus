import { Json } from './types';

export interface ServiceReport {
  id: string;
  service_type: 'cleaning' | 'boarding';
  aircraft_id: string;
  shift_id: string;
  client_id: string;
  notes?: string;
  checklist?: Json;
  status: 'rascunho' | 'publicado';
  supervisor_id?: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  // Relations
  aircraft?: {
    id: string;
    registration: string;
    model: string;
  };
  shift?: {
    id: string;
    name: string;
    start_date: string;
    end_date: string;
  };
  client?: {
    id: string;
    name: string;
    code: string;
  };
  supervisor?: {
    id: string;
    name: string;
    role: string;
  };
  report_employees?: ReportEmployee[];
  report_photos?: ReportPhoto[];
  report_signatures?: ReportSignature[];
}

export interface ReportEmployee {
  id: string;
  report_id: string;
  employee_id: string;
  role: string;
  hours_worked: number;
  created_at?: string;
  updated_at?: string;
  // Relations
  employee?: {
    id: string;
    name: string;
    role: string;
  };
}

export interface ReportPhoto {
  id: string;
  report_id: string;
  url: string;
  tipo: 'antes' | 'depois';
  descricao?: string;
  ordem: number;
  created_at?: string;
  created_by?: string;
}

export interface ReportSignature {
  id: string;
  report_id: string;
  cargo: string;
  nome: string;
  assinatura_url: string;
  created_at?: string;
  created_by?: string;
}