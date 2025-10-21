-- Create shift templates table and related tables
CREATE TABLE public.shift_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  nome TEXT NOT NULL,
  descricao TEXT,
  horario_inicio TIME NOT NULL,
  horario_fim TIME NOT NULL,
  supervisor_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
  ativo BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_by UUID REFERENCES auth.users(id)
);

-- Create shift template employees table (N:N)
CREATE TABLE public.shift_template_employees (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  template_id UUID NOT NULL REFERENCES public.shift_templates(id) ON DELETE CASCADE,
  employee_id UUID NOT NULL REFERENCES public.employees(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(template_id, employee_id)
);

-- Add RLS policies
ALTER TABLE public.shift_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shift_template_employees ENABLE ROW LEVEL SECURITY;

-- Templates visible to AirPlus staff
CREATE POLICY "Templates visible to AirPlus staff" ON public.shift_templates
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor')
  );

-- Only admins/managers can manage templates
CREATE POLICY "Only admins/managers can manage templates" ON public.shift_templates
  FOR ALL TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

-- Template employees visible to AirPlus staff
CREATE POLICY "Template employees visible to AirPlus staff" ON public.shift_template_employees
  FOR SELECT TO authenticated 
  USING (
    public.has_role(auth.uid(), 'super_admin') OR
    public.has_role(auth.uid(), 'gestor') OR
    public.has_role(auth.uid(), 'supervisor')
  );

-- Only admins/managers can manage template employees
CREATE POLICY "Only admins/managers can manage template employees" ON public.shift_template_employees
  FOR ALL TO authenticated 
  USING (public.is_admin_or_manager(auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_shift_templates_updated_at
  BEFORE UPDATE ON public.shift_templates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_shift_template_employees_updated_at
  BEFORE UPDATE ON public.shift_template_employees
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();