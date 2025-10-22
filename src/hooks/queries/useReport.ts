import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import type { ServiceReport } from '@/integrations/supabase/report-types';
import type { Tables } from '@/integrations/supabase/types';

type ReportInsert = Omit<Tables<'service_reports'>, 'id' | 'created_at' | 'updated_at'>;
type ReportUpdate = Partial<ReportInsert>;

// Query keys
const REPORT_KEY = 'reports';

// List reports with filters
export const useReportList = (params?: { 
  status?: 'rascunho' | 'publicado';
  clientId?: string;
  aircraftId?: string;
  shiftId?: string;
  startDate?: Date;
  endDate?: Date;
}) => {
  return useQuery({
    queryKey: [REPORT_KEY, params],
    queryFn: async () => {
      let query = supabase
        .from('service_reports')
        .select(`
          *,
          aircraft:aircraft(*),
          shift:shifts(*),
          client:clients(*),
          supervisor:employees(*),
          report_employees(
            *,
            employee:employees(*)
          ),
          report_photos(
            *
          ),
          report_signatures(
            *
          )
        `)
        .order('created_at', { ascending: false });

      if (params?.status) {
        query = query.eq('status', params.status);
      }
      if (params?.clientId) {
        query = query.eq('client_id', params.clientId);
      }
      if (params?.aircraftId) {
        query = query.eq('aircraft_id', params.aircraftId);
      }
      if (params?.shiftId) {
        query = query.eq('shift_id', params.shiftId);
      }
      if (params?.startDate) {
        query = query.gte('created_at', params.startDate.toISOString());
      }
      if (params?.endDate) {
        query = query.lte('created_at', params.endDate.toISOString());
      }

      const { data, error } = await query;

      if (error) {
        toast.error('Erro ao carregar relatórios');
        throw error;
      }

      return data;
    },
  });
};

// Get single report by ID
export const useReport = (id: string) => {
  return useQuery({
    queryKey: [REPORT_KEY, id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('service_reports')
        .select(`
          *,
          aircraft:aircraft(*),
          shift:shifts(*),
          client:clients(*),
          supervisor:employees(*),
          report_employees(
            *,
            employee:employees(*)
          ),
          report_photos(
            *
          ),
          report_signatures(
            *
          )
        `)
        .eq('id', id)
        .single();

      if (error) {
        toast.error('Erro ao carregar relatório');
        throw error;
      }

      return data;
    },
    enabled: !!id,
  });
};

// Create report mutation
export const useCreateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data: ReportInsert) => {
      const { data: report, error } = await supabase
        .from('service_reports')
        .insert(data)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao criar relatório');
        throw error;
      }

      return report;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORT_KEY] });
      toast.success('Relatório criado com sucesso');
    },
  });
};

// Update report mutation
export const useUpdateReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, ...data }: ReportUpdate & { id: string }) => {
      const { data: report, error } = await supabase
        .from('service_reports')
        .update(data)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        toast.error('Erro ao atualizar relatório');
        throw error;
      }

      return report;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [REPORT_KEY] });
      queryClient.invalidateQueries({ queryKey: [REPORT_KEY, variables.id] });
      toast.success('Relatório atualizado com sucesso');
    },
  });
};

// Delete report (only drafts)
export const useDeleteReport = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('service_reports')
        .delete()
        .eq('id', id)
        .eq('status', 'rascunho'); // Only allow deleting drafts

      if (error) {
        toast.error('Erro ao excluir relatório');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [REPORT_KEY] });
      toast.success('Relatório excluído com sucesso');
    },
  });
};

// Upload report photo
export const useUploadReportPhoto = () => {
  return useMutation({
    mutationFn: async ({ 
      file, 
      reportId,
      tipo,
      ordem 
    }: { 
      file: File; 
      reportId: string;
      tipo: 'antes' | 'depois';
      ordem: number;
    }) => {
      // Upload photo
      const fileName = `${reportId}/${tipo}/${Date.now()}-${ordem}${file.name.substring(file.name.lastIndexOf('.'))}`;
      const { error: uploadError } = await supabase.storage
        .from('report-photos')
        .upload(fileName, file);

      if (uploadError) {
        toast.error('Erro ao enviar foto');
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report-photos')
        .getPublicUrl(fileName);

      // Create photo record
      const { data: photo, error: photoError } = await supabase
        .from('report_photos')
        .insert({
          report_id: reportId,
          url: publicUrl,
          tipo,
          ordem,
        })
        .select()
        .single();

      if (photoError) {
        toast.error('Erro ao salvar foto');
        throw photoError;
      }

      return photo;
    },
  });
};

// Upload signature
export const useUploadSignature = () => {
  return useMutation({
    mutationFn: async ({ 
      signature, 
      reportId,
      nome,
      cargo 
    }: { 
      signature: string; // Base64 signature image
      reportId: string;
      nome: string;
      cargo: string;
    }) => {
      // Convert base64 to blob
      const base64Data = signature.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/png' });

      // Upload signature
      const fileName = `${reportId}/${Date.now()}-${nome.replace(/\s+/g, '-')}}.png`;
      const { error: uploadError } = await supabase.storage
        .from('report-signatures')
        .upload(fileName, blob);

      if (uploadError) {
        toast.error('Erro ao enviar assinatura');
        throw uploadError;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('report-signatures')
        .getPublicUrl(fileName);

      // Create signature record
      const { data: signature_record, error: signatureError } = await supabase
        .from('report_signatures')
        .insert({
          report_id: reportId,
          nome,
          cargo,
          assinatura_url: publicUrl,
        })
        .select()
        .single();

      if (signatureError) {
        toast.error('Erro ao salvar assinatura');
        throw signatureError;
      }

      return signature_record;
    },
  });
};