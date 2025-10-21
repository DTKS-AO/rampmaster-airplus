-- Create service types enum
CREATE TYPE public.service_type AS ENUM (
  'cleaning',
  'boarding'
);

-- Create report status enum
CREATE TYPE public.report_status AS ENUM (
  'rascunho',
  'publicado'
);

-- Create service reports table
CREATE TABLE public.service_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo_servico service_type[] NOT NULL,
  aircraft_id UUID NOT NULL REFERENCES public.aircraft(id),
  shift_id UUID NOT NULL REFERENCES public.shifts(id),
  client_id UUID NOT NULL REFERENCES public.clients(id),
  observacoes TEXT,
  checklist JSONB,
  status report_status DEFAULT 'rascunho',
  supervisor_id UUID REFERENCES public.employees(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create report employees table (N:N)
CREATE TABLE public.report_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.service_reports(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id),
  presente BOOLEAN DEFAULT true,
  justificativa TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(report_id, employee_id)
);

-- Create report photos table
CREATE TABLE public.report_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.service_reports(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('antes', 'depois')),
  descricao TEXT,
  ordem INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Create report signatures table
CREATE TABLE public.report_signatures (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  report_id UUID NOT NULL REFERENCES public.service_reports(id) ON DELETE CASCADE,
  cargo TEXT NOT NULL,
  nome TEXT NOT NULL,
  assinatura_url TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id)
);

-- Add RLS policies
ALTER TABLE public.service_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_signatures ENABLE ROW LEVEL SECURITY;

-- Reports visible to all AirPlus staff and client
CREATE POLICY "Reports visible to staff and client" ON public.service_reports
  FOR SELECT TO authenticated
  USING (
    (public.has_role(auth.uid(), 'super_admin') OR
     public.has_role(auth.uid(), 'gestor') OR
     public.has_role(auth.uid(), 'supervisor') OR
     public.has_role(auth.uid(), 'tecnico')) OR
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.id = auth.uid() AND p.client_id = service_reports.client_id
    )
  );

-- Only staff can create reports
CREATE POLICY "Staff can create reports" ON public.service_reports
  FOR INSERT TO authenticated
  WITH CHECK (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico')
  );

-- Only managers and above can update published reports
CREATE POLICY "Managers can update published reports" ON public.service_reports
  FOR UPDATE TO authenticated
  USING (
    CASE
      WHEN status = 'publicado' THEN
        public.has_role(auth.uid(), 'super_admin') OR
        public.has_role(auth.uid(), 'gestor')
      ELSE
        public.has_role(auth.uid(), 'super_admin') OR
        public.has_role(auth.uid(), 'gestor') OR
        public.has_role(auth.uid(), 'supervisor') OR
        public.has_role(auth.uid(), 'tecnico')
    END
  );

-- Report employees visible to related parties
CREATE POLICY "Report employees visible to related parties" ON public.report_employees
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_reports r
      WHERE r.id = report_employees.report_id
      AND (
        (public.has_role(auth.uid(), 'super_admin') OR
         public.has_role(auth.uid(), 'gestor') OR
         public.has_role(auth.uid(), 'supervisor') OR
         public.has_role(auth.uid(), 'tecnico')) OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.client_id = r.client_id
        )
      )
    )
  );

-- Only staff can manage report employees
CREATE POLICY "Staff can manage report employees" ON public.report_employees
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico')
  );

-- Photos visible to related parties
CREATE POLICY "Photos visible to related parties" ON public.report_photos
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_reports r
      WHERE r.id = report_photos.report_id
      AND (
        (public.has_role(auth.uid(), 'super_admin') OR
         public.has_role(auth.uid(), 'gestor') OR
         public.has_role(auth.uid(), 'supervisor') OR
         public.has_role(auth.uid(), 'tecnico')) OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.client_id = r.client_id
        )
      )
    )
  );

-- Only staff can manage photos
CREATE POLICY "Staff can manage photos" ON public.report_photos
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico')
  );

-- Signatures visible to related parties
CREATE POLICY "Signatures visible to related parties" ON public.report_signatures
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.service_reports r
      WHERE r.id = report_signatures.report_id
      AND (
        (public.has_role(auth.uid(), 'super_admin') OR
         public.has_role(auth.uid(), 'gestor') OR
         public.has_role(auth.uid(), 'supervisor') OR
         public.has_role(auth.uid(), 'tecnico')) OR
        EXISTS (
          SELECT 1 FROM public.profiles p
          WHERE p.id = auth.uid() AND p.client_id = r.client_id
        )
      )
    )
  );

-- Only staff can manage signatures
CREATE POLICY "Staff can manage signatures" ON public.report_signatures
  FOR ALL TO authenticated
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor') OR
    public.has_role(auth.uid(), 'tecnico')
  );

-- Add triggers for updated_at
CREATE TRIGGER update_service_reports_updated_at
  BEFORE UPDATE ON public.service_reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_report_employees_updated_at
  BEFORE UPDATE ON public.report_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();