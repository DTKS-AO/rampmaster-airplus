export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      aircraft: {
        Row: {
          ativo: boolean | null
          client_id: string
          created_at: string | null
          created_by: string | null
          estado: Database["public"]["Enums"]["aircraft_status"] | null
          id: string
          matricula: string
          modelo: string
          ultima_limpeza: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          client_id: string
          created_at?: string | null
          created_by?: string | null
          estado?: Database["public"]["Enums"]["aircraft_status"] | null
          id?: string
          matricula: string
          modelo: string
          ultima_limpeza?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          client_id?: string
          created_at?: string | null
          created_by?: string | null
          estado?: Database["public"]["Enums"]["aircraft_status"] | null
          id?: string
          matricula?: string
          modelo?: string
          ultima_limpeza?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "aircraft_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: string | null
          new_values: Json | null
          old_values: Json | null
          record_id: string | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          new_values?: Json | null
          old_values?: Json | null
          record_id?: string | null
          table_name?: string
          user_id?: string | null
        }
        Relationships: []
      }
      clients: {
        Row: {
          ativo: boolean | null
          codigo: string
          created_at: string | null
          created_by: string | null
          email: string | null
          id: string
          logo_url: string | null
          nome: string
          telefone: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          codigo: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nome: string
          telefone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          codigo?: string
          created_at?: string | null
          created_by?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          nome?: string
          telefone?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      employees: {
        Row: {
          ativo: boolean | null
          bi: string
          created_at: string | null
          created_by: string | null
          email: string
          foto_url: string | null
          funcao: Database["public"]["Enums"]["user_role"]
          id: string
          nome: string
          numero_mecanografico: string
          telefone: string
          updated_at: string | null
          updated_by: string | null
          user_id: string | null
        }
        Insert: {
          ativo?: boolean | null
          bi: string
          created_at?: string | null
          created_by?: string | null
          email: string
          foto_url?: string | null
          funcao?: Database["public"]["Enums"]["user_role"]
          id?: string
          nome: string
          numero_mecanografico: string
          telefone: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Update: {
          ativo?: boolean | null
          bi?: string
          created_at?: string | null
          created_by?: string | null
          email?: string
          foto_url?: string | null
          funcao?: Database["public"]["Enums"]["user_role"]
          id?: string
          nome?: string
          numero_mecanografico?: string
          telefone?: string
          updated_at?: string | null
          updated_by?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          ativo: boolean | null
          client_id: string | null
          created_at: string | null
          email: string
          foto_url: string | null
          full_name: string
          id: string
          telefone: string | null
          updated_at: string | null
        }
        Insert: {
          ativo?: boolean | null
          client_id?: string | null
          created_at?: string | null
          email: string
          foto_url?: string | null
          full_name: string
          id: string
          telefone?: string | null
          updated_at?: string | null
        }
        Update: {
          ativo?: boolean | null
          client_id?: string | null
          created_at?: string | null
          email?: string
          foto_url?: string | null
          full_name?: string
          id?: string
          telefone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_employees: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          justificativa: string | null
          presente: boolean | null
          shift_id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          justificativa?: string | null
          presente?: boolean | null
          shift_id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          justificativa?: string | null
          presente?: boolean | null
          shift_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_employees_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_exports: {
        Row: {
          created_at: string
          created_by: string | null
          file_name: string
          id: string
          shift_id: string | null
          type: Database["public"]["Enums"]["export_type"]
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          file_name: string
          id?: string
          shift_id?: string | null
          type: Database["public"]["Enums"]["export_type"]
        }
        Update: {
          created_at?: string
          created_by?: string | null
          file_name?: string
          id?: string
          shift_id?: string | null
          type?: Database["public"]["Enums"]["export_type"]
        }
        Relationships: [
          {
            foreignKeyName: "shift_exports_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_template_employees: {
        Row: {
          created_at: string
          created_by: string | null
          employee_id: string | null
          id: string
          template_id: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          id?: string
          template_id?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          employee_id?: string | null
          id?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shift_template_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "shift_template_employees_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "shift_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      shift_templates: {
        Row: {
          created_at: string
          created_by: string | null
          descricao: string | null
          horario_fim: string
          horario_inicio: string
          id: string
          nome: string
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          horario_fim: string
          horario_inicio: string
          id?: string
          nome: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          descricao?: string | null
          horario_fim?: string
          horario_inicio?: string
          id?: string
          nome?: string
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      shifts: {
        Row: {
          created_at: string | null
          created_by: string | null
          data_fim: string
          data_inicio: string
          id: string
          nome: string
          status: Database["public"]["Enums"]["shift_status"] | null
          supervisor_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          data_fim: string
          data_inicio: string
          id?: string
          nome: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          supervisor_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          data_fim?: string
          data_inicio?: string
          id?: string
          nome?: string
          status?: Database["public"]["Enums"]["shift_status"] | null
          supervisor_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "shifts_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      team_employees: {
        Row: {
          created_at: string | null
          employee_id: string
          id: string
          team_id: string
        }
        Insert: {
          created_at?: string | null
          employee_id: string
          id?: string
          team_id: string
        }
        Update: {
          created_at?: string | null
          employee_id?: string
          id?: string
          team_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "team_employees_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_employees_team_id_fkey"
            columns: ["team_id"]
            isOneToOne: false
            referencedRelation: "teams"
            referencedColumns: ["id"]
          },
        ]
      }
      teams: {
        Row: {
          ativo: boolean | null
          created_at: string | null
          created_by: string | null
          id: string
          mes_referencia: number | null
          nome: string
          semana_referencia: number | null
          shift_id: string | null
          supervisor_id: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mes_referencia?: number | null
          nome: string
          semana_referencia?: number | null
          shift_id?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          ativo?: boolean | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          mes_referencia?: number | null
          nome?: string
          semana_referencia?: number | null
          shift_id?: string | null
          supervisor_id?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "teams_shift_id_fkey"
            columns: ["shift_id"]
            isOneToOne: false
            referencedRelation: "shifts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "teams_supervisor_id_fkey"
            columns: ["supervisor_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      user_notification_preferences: {
        Row: {
          created_at: string
          id: string
          shift_reminders: boolean
          shift_reports: boolean
          shift_status_changes: boolean
          shift_team_updates: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          shift_reminders?: boolean
          shift_reports?: boolean
          shift_status_changes?: boolean
          shift_team_updates?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          shift_reminders?: boolean
          shift_reports?: boolean
          shift_status_changes?: boolean
          shift_team_updates?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          client_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["user_role"]
          user_id: string
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      },
      service_types: {
        Row: {
          id: string
          name: string
          description: string | null
          checklist: Json | null
          active: boolean
          required_photos: number
          required_signatures: number
          version: number
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          checklist?: Json | null
          active?: boolean
          required_photos?: number
          required_signatures?: number
          version?: number
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          checklist?: Json | null
          active?: boolean
          required_photos?: number
          required_signatures?: number
          version?: number
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      service_reports: {
        Row: {
          id: string
          client_id: string | null
          shift_id: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          aircraft_id: string | null
          service_date: string
          notes: string | null
          status: Database["public"]["Enums"]["report_status"]
          checklist: Json | null
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          shift_id?: string | null
          service_type: Database["public"]["Enums"]["service_type"]
          aircraft_id?: string | null
          service_date: string
          notes?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          checklist?: Json | null
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          client_id?: string | null
          shift_id?: string | null
          service_type?: Database["public"]["Enums"]["service_type"]
          aircraft_id?: string | null
          service_date?: string
          notes?: string | null
          status?: Database["public"]["Enums"]["report_status"]
          checklist?: Json | null
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      report_photos: {
        Row: {
          id: string
          report_id: string
          url: string
          type: string | null
          created_at: string
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          report_id: string
          url: string
          type?: string | null
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          report_id?: string
          url?: string
          type?: string | null
          updated_at?: string | null
        }
      },
      report_signatures: {
        Row: {
          id: string
          report_id: string
          signature_url: string
          signer_name: string
          signer_role: string
          created_at: string
          updated_at: string | null
          created_by: string | null
        }
        Insert: {
          id?: string
          report_id: string
          signature_url: string
          signer_name: string
          signer_role: string
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
        }
        Update: {
          report_id?: string
          signature_url?: string
          signer_name?: string
          signer_role?: string
          updated_at?: string | null
        }
      },
      client_configs: {
        Row: {
          id: string
          client_id: string | null
          config_key: string
          config_value: Json
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          client_id?: string | null
          config_key: string
          config_value: Json
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          client_id?: string | null
          config_key?: string
          config_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      system_configs: {
        Row: {
          id: string
          config_key: string
          config_value: Json
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          config_key: string
          config_value: Json
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      report_configs: {
        Row: {
          id: string
          config_key: string
          config_value: Json
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          config_key: string
          config_value: Json
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      roles: {
        Row: {
          id: string
          name: string
          description: string | null
          is_system: boolean
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          is_system?: boolean
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          name?: string
          description?: string | null
          is_system?: boolean
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      permissions: {
        Row: {
          id: string
          resource: string
          action: string
          description: string | null
          created_at: string
          updated_at: string | null
          created_by: string | null
          updated_by: string | null
        }
        Insert: {
          id?: string
          resource: string
          action: string
          description?: string | null
          created_at?: string
          updated_at?: string | null
          created_by?: string | null
          updated_by?: string | null
        }
        Update: {
          resource?: string
          action?: string
          description?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
      },
      role_permissions: {
        Row: {
          id: string
          role_id: string
          permission_id: string
          created_at: string
          created_by: string | null
        }
        Insert: {
          id?: string
          role_id: string
          permission_id: string
          created_at?: string
          created_by?: string | null
        }
        Update: {
          role_id?: string
          permission_id?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["user_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin_or_manager: {
        Args: { _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      aircraft_status: "ativo" | "em_manutencao" | "inativo"
      export_type: "pdf" | "csv"
      shift_status: "ativo" | "encerrado"
      service_type: "cleaning" | "boarding" | "maintenance"
      report_status: "draft" | "submitted" | "approved" | "rejected"
      user_role:
        | "super_admin"
        | "gestor"
        | "supervisor"
        | "tecnico"
        | "auxiliar"
        | "cliente"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      aircraft_status: ["ativo", "em_manutencao", "inativo"],
      export_type: ["pdf", "csv"],
      shift_status: ["ativo", "encerrado"],
      service_type: ["cleaning", "boarding", "maintenance"],
      report_status: ["draft", "submitted", "approved", "rejected"],
      user_role: [
        "super_admin",
        "gestor",
        "supervisor",
        "tecnico",
        "auxiliar",
        "cliente",
      ],
    },
  },
} as const
