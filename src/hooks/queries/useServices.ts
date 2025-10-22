import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type Service = any;
type ServiceInsert = any;
type ServiceUpdate = any;

// Query keys
const SERVICES_KEY = 'services';
const COMPANY_KEY = 'company';
const DEPARTMENTS_KEY = 'departments';

// =====================================================
// SERVICES HOOKS
// =====================================================

export const useServices = (includeInactive = false) => {
  return useQuery({
    queryKey: [SERVICES_KEY, includeInactive],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .order('categoria', { ascending: true })
        .order('nome', { ascending: true });

      if (!includeInactive) {
        query = query.eq('ativo', true);
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar serviços');
        throw error;
      }

      return data as Service[];
    },
  });
};

export const useService = (id: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Erro ao carregar serviço');
        throw error;
      }

      return data as Service;
    },
    enabled: !!id,
  });
};

export const useServicesByCategory = (categoria?: string) => {
  return useQuery({
    queryKey: [SERVICES_KEY, 'category', categoria],
    queryFn: async () => {
      let query = supabase
        .from('services')
        .select('*')
        .eq('ativo', true);

      if (categoria) {
        query = query.eq('categoria', categoria);
      }

      query = query.order('nome', { ascending: true });

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar serviços');
        throw error;
      }

      return data as Service[];
    },
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (newService: ServiceInsert) => {
      const { data, error } = await supabase
        .from('services')
        .insert(newService)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar serviço');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success('Serviço criado com sucesso');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: ServiceUpdate & { id: string }) => {
      const { data, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar serviço');
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY, variables.id] });
      toast.success('Serviço atualizado com sucesso');
    },
  });
};

export const useToggleService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ativo }: { id: string; ativo: boolean }) => {
      const { data, error } = await supabase
        .from('services')
        .update({ ativo })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar status do serviço');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [SERVICES_KEY] });
      toast.success('Status do serviço atualizado');
    },
  });
};

// =====================================================
// COMPANY HOOKS
// =====================================================

export const useCompany = () => {
  return useQuery({
    queryKey: [COMPANY_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('companies')
        .select('*')
        .eq('ativo', true)
        .single();

      if (error) {
        toast.error('Erro ao carregar informações da empresa');
        throw error;
      }

      return data;
    },
  });
};

export const useUpdateCompany = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (updates: any) => {
      const { data, error } = await supabase
        .from('companies')
        .update(updates)
        .eq('ativo', true)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar informações da empresa');
        throw error;
      }

      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [COMPANY_KEY] });
      toast.success('Informações da empresa atualizadas');
    },
  });
};

// =====================================================
// DEPARTMENTS HOOKS
// =====================================================

export const useDepartments = () => {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          responsavel:responsavel_id(
            id,
            nome,
            funcao,
            foto_url
          )
        `)
        .eq('ativo', true)
        .order('nome', { ascending: true });

      if (error) {
        toast.error('Erro ao carregar departamentos');
        throw error;
      }

      return data;
    },
  });
};

export const useDepartment = (id: string) => {
  return useQuery({
    queryKey: [DEPARTMENTS_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('departments')
        .select(`
          *,
          responsavel:responsavel_id(
            id,
            nome,
            funcao,
            foto_url,
            email
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Erro ao carregar departamento');
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

export const useUpdateDepartment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...updates }: any) => {
      const { data, error } = await supabase
        .from('departments')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar departamento');
        throw error;
      }

      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_KEY] });
      queryClient.invalidateQueries({ queryKey: [DEPARTMENTS_KEY, variables.id] });
      toast.success('Departamento atualizado com sucesso');
    },
  });
};
