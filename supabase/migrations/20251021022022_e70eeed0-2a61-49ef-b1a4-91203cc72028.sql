-- =====================================================
-- HELPER: Atribuir Super Admin ao primeiro utilizador
-- =====================================================

-- Function para auto-atribuir super_admin ao primeiro utilizador criado
CREATE OR REPLACE FUNCTION public.auto_assign_super_admin()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se é o primeiro utilizador
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    -- Atribuir role de super_admin
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'super_admin'::public.user_role);
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Trigger para auto-atribuir super admin
CREATE TRIGGER auto_assign_super_admin_trigger
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_super_admin();

-- Atribuir super_admin a qualquer utilizador já existente (se for o primeiro)
DO $$
DECLARE
  first_user_id UUID;
BEGIN
  SELECT id INTO first_user_id
  FROM auth.users
  ORDER BY created_at
  LIMIT 1;
  
  IF first_user_id IS NOT NULL THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (first_user_id, 'super_admin'::public.user_role)
    ON CONFLICT (user_id, role, client_id) DO NOTHING;
  END IF;
END $$;
