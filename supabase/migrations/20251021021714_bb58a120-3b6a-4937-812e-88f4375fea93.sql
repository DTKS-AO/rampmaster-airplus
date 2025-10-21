-- =====================================================
-- FIX: Security warning - Function Search Path Mutable
-- =====================================================

-- Recriar função update_updated_at_column com search_path fixo
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
