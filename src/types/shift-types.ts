export type ExportType = 'pdf' | 'csv';

export interface ShiftTemplateEmployee {
  id: string;
  template_id: string;
  employee_id: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string;
  deleted_by?: string;
  employee: {
    id: string;
    nome: string;
    funcao: string;
    foto_url?: string;
  };
}

export interface ShiftTemplate {
  id: string;
  nome: string;
  descricao?: string;
  horario_inicio: string;
  horario_fim: string;
  created_at: string;
  created_by: string;
  updated_at?: string;
  updated_by?: string;
  deleted_at?: string;
  deleted_by?: string;
  shift_template_employees?: ShiftTemplateEmployee[];
}

export interface ShiftExport {
  id: string;
  shift_id: string;
  type: ExportType;
  file_name: string;
  created_at: string;
  created_by: string;
}

export interface UserNotificationPreferences {
  id: string;
  user_id: string;
  shift_status_changes: boolean;
  shift_team_updates: boolean;
  shift_reminders: boolean;
  shift_reports: boolean;
  created_at: string;
  updated_at: string;
}