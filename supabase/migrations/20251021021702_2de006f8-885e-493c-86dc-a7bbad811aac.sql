-- =====================================================
-- AIRPLUS AAMS - DATABASE SCHEMA
-- Módulo: Operações (Aeronaves, Funcionários, Turnos)
-- =====================================================

-- 1. ENUMS
-- =====================================================

-- Roles do sistema (separados da tabela profiles por segurança)
CREATE TYPE public.user_role AS ENUM (
  'super_admin',
  'gestor', 
  'supervisor',
  'tecnico',
  'auxiliar',
  'cliente'
);

-- Estados da aeronave
CREATE TYPE public.aircraft_status AS ENUM (
  'ativo',
  'em_manutencao',
  'inativo'
);

-- Status do turno
CREATE TYPE public.shift_status AS ENUM (
  'ativo',
  'encerrado'
);

-- 2. TABELAS PRINCIPAIS
-- =====================================================

-- Tabela de Clientes (Companhias Aéreas)
CREATE TABLE public.clients (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  codigo TEXT UNIQUE NOT NULL, -- Ex: TAAG, LAM
  email TEXT UNIQUE,
  telefone TEXT,
  logo_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de Perfis de Usuário
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  telefone TEXT,
  foto_url TEXT,
  client_id UUID REFERENCES public.clients(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tabela de Roles (CRÍTICO: Separada de profiles)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL,
  client_id UUID REFERENCES public.clients(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(user_id, role, client_id)
);

-- Tabela de Funcionários (Staff AirPlus)
CREATE TABLE public.employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  nome TEXT NOT NULL,
  bi TEXT NOT NULL, -- Bilhete de Identidade
  numero_mecanografico TEXT UNIQUE NOT NULL,
  telefone TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  funcao public.user_role NOT NULL DEFAULT 'tecnico',
  foto_url TEXT,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de Aeronaves
CREATE TABLE public.aircraft (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  matricula TEXT UNIQUE NOT NULL, -- Ex: D2-ABC
  modelo TEXT NOT NULL, -- Ex: Boeing 737
  client_id UUID NOT NULL REFERENCES public.clients(id) ON DELETE CASCADE,
  estado public.aircraft_status DEFAULT 'ativo',
  ultima_limpeza TIMESTAMPTZ,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de Turnos
CREATE TABLE public.shifts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL, -- Ex: Turno A, Turno Noite
  data_inicio TIMESTAMPTZ NOT NULL,
  data_fim TIMESTAMPTZ NOT NULL,
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  status public.shift_status DEFAULT 'ativo',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Tabela de Equipas (F1, F2, etc.)
CREATE TABLE public.teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL, -- Ex: F1, F2
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  shift_id UUID REFERENCES public.shifts(id) ON DELETE CASCADE,
  semana_referencia INT CHECK (semana_referencia BETWEEN 1 AND 52),
  mes_referencia INT CHECK (mes_referencia BETWEEN 1 AND 12),
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- 3. TABELAS DE ASSOCIAÇÃO
-- =====================================================

-- Técnicos em Turnos (N:N)
CREATE TABLE public.shift_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  shift_id UUID NOT NULL REFERENCES public.shifts(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  presente BOOLEAN DEFAULT true,
  justificativa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(shift_id, employee_id)
);

-- Técnicos em Equipas (N:N)
CREATE TABLE public.team_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES public.teams(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(team_id, employee_id)
);

-- 4. TABELA DE AUDITORIA
-- =====================================================

CREATE TABLE public.audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL, -- 'INSERT', 'UPDATE', 'DELETE'
  table_name TEXT NOT NULL,
  record_id UUID,
  old_values JSONB,
  new_values JSONB,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. ÍNDICES PARA PERFORMANCE
-- =====================================================

CREATE INDEX idx_aircraft_client ON public.aircraft(client_id);
CREATE INDEX idx_aircraft_matricula ON public.aircraft(matricula);
CREATE INDEX idx_employees_numero ON public.employees(numero_mecanografico);
CREATE INDEX idx_employees_email ON public.employees(email);
CREATE INDEX idx_shifts_dates ON public.shifts(data_inicio, data_fim);
CREATE INDEX idx_user_roles_user ON public.user_roles(user_id);
CREATE INDEX idx_user_roles_role ON public.user_roles(role);
CREATE INDEX idx_audit_logs_user ON public.audit_logs(user_id);
CREATE INDEX idx_audit_logs_table ON public.audit_logs(table_name);

-- 6. TRIGGERS PARA UPDATED_AT
-- =====================================================

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON public.clients
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_employees_updated_at BEFORE UPDATE ON public.employees
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_aircraft_updated_at BEFORE UPDATE ON public.aircraft
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shifts_updated_at BEFORE UPDATE ON public.shifts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON public.teams
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 7. TRIGGER PARA AUTO-CRIAR PROFILE
-- =====================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    NEW.email
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. FUNCTION PARA VERIFICAR ROLE
-- =====================================================

CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role public.user_role)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Function para verificar se é admin ou gestor
CREATE OR REPLACE FUNCTION public.is_admin_or_manager(_user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role IN ('super_admin', 'gestor')
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 9. ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE public.clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.aircraft ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shifts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.team_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Policies para Clients
CREATE POLICY "Clients visible to all authenticated" ON public.clients
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can insert clients" ON public.clients
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can update clients" ON public.clients
  FOR UPDATE TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can delete clients" ON public.clients
  FOR DELETE TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

-- Policies para Profiles
CREATE POLICY "Users can view all profiles" ON public.profiles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE TO authenticated 
  USING (auth.uid() = id);

-- Policies para User Roles
CREATE POLICY "Roles visible to authenticated" ON public.user_roles
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Only admins can manage roles" ON public.user_roles
  FOR ALL TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Policies para Employees
CREATE POLICY "Employees visible to AirPlus staff" ON public.employees
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    auth.uid() = user_id
  );

CREATE POLICY "Only admins/managers can create employees" ON public.employees
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins/managers can update employees" ON public.employees
  FOR UPDATE TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can delete employees" ON public.employees
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Policies para Aircraft
CREATE POLICY "Aircraft visible to owner and AirPlus" ON public.aircraft
  FOR SELECT TO authenticated 
  USING (
    public.is_admin_or_manager(auth.uid()) OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico') OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.client_id = aircraft.client_id
    )
  );

CREATE POLICY "Only admins/managers can create aircraft" ON public.aircraft
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins/managers can update aircraft" ON public.aircraft
  FOR UPDATE TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Only admins can delete aircraft" ON public.aircraft
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Policies para Shifts
CREATE POLICY "Shifts visible to AirPlus staff" ON public.shifts
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "Only admins/managers can create shifts" ON public.shifts
  FOR INSERT TO authenticated 
  WITH CHECK (public.is_admin_or_manager(auth.uid()));

CREATE POLICY "Managers and supervisors can update shifts" ON public.shifts
  FOR UPDATE TO authenticated 
  USING (
    public.is_admin_or_manager(auth.uid()) OR
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Only admins can delete shifts" ON public.shifts
  FOR DELETE TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Policies para Teams
CREATE POLICY "Teams visible to AirPlus staff" ON public.teams
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico')
  );

CREATE POLICY "Only admins/managers can manage teams" ON public.teams
  FOR ALL TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

-- Policies para Shift Employees
CREATE POLICY "Shift employees visible to AirPlus" ON public.shift_employees
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Supervisors can manage shift attendance" ON public.shift_employees
  FOR ALL TO authenticated 
  USING (
    public.has_role(auth.uid(), 'supervisor') OR
    public.is_admin_or_manager(auth.uid())
  );

-- Policies para Team Employees
CREATE POLICY "Team employees visible to AirPlus" ON public.team_employees
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor')
  );

CREATE POLICY "Only admins/managers can manage team members" ON public.team_employees
  FOR ALL TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

-- Policies para Audit Logs
CREATE POLICY "Audit logs visible to admins only" ON public.audit_logs
  FOR SELECT TO authenticated 
  USING (public.has_role(auth.uid(), 'super_admin'));

-- 10. DADOS SEED INICIAIS
-- =====================================================

-- Cliente de teste (AirPlus como primeiro cliente)
INSERT INTO public.clients (nome, codigo, email, telefone, ativo)
VALUES ('AirPlus Angola', 'AIRPLUS', 'info@airplus.ao', '+244-XXX-XXX-XXX', true);
