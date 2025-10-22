import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PlusIcon, Trash2Icon } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useUpdateReport } from '@/hooks/queries/useReport';
import { toast } from 'sonner';

interface ReportEmployeesProps {
  report: any;
  isPublished: boolean;
  onNext: () => void;
  onPrevious: () => void;
}

export function ReportEmployees({
  report,
  isPublished,
  onNext,
  onPrevious,
}: ReportEmployeesProps) {
  const updateReport = useUpdateReport();
  const [isLoading, setIsLoading] = useState(false);
  const [employees, setEmployees] = useState(report.report_employees || []);

  const handleAddEmployee = () => {
    setEmployees([
      ...employees,
      {
        employee_id: '',
        role: '',
        hours_worked: 0,
      },
    ]);
  };

  const handleRemoveEmployee = (index: number) => {
    setEmployees(employees.filter((_, i) => i !== index));
  };

  const handleEmployeeChange = (index: number, field: string, value: any) => {
    const updatedEmployees = [...employees];
    updatedEmployees[index] = {
      ...updatedEmployees[index],
      [field]: value,
    };
    setEmployees(updatedEmployees);
  };

  const handleSubmit = async () => {
    try {
      setIsLoading(true);
      
      // First update report employees
      const { error } = await supabase
        .from('report_employees')
        .delete()
        .eq('report_id', report.id);

      if (error) throw error;

      const { error: insertError } = await supabase
        .from('report_employees')
        .insert(
          employees.map(emp => ({
            report_id: report.id,
            employee_id: emp.employee_id,
            role: emp.role,
            hours_worked: emp.hours_worked,
          }))
        );

      if (insertError) throw insertError;

      onNext();
    } catch (error) {
      toast.error('Erro ao salvar equipe');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Equipe do Serviço</h3>
        {!isPublished && (
          <Button onClick={handleAddEmployee}>
            <PlusIcon className="h-4 w-4 mr-2" />
            Adicionar Funcionário
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {employees.map((employee: any, index: number) => (
          <div
            key={index}
            className="flex items-start space-x-4 p-4 border rounded-lg"
          >
            <div className="flex-1 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label>Funcionário</Label>
                  <Select
                    disabled={isPublished}
                    value={employee.employee_id}
                    onValueChange={(value) =>
                      handleEmployeeChange(index, 'employee_id', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* Add employee options */}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Função</Label>
                  <Select
                    disabled={isPublished}
                    value={employee.role}
                    onValueChange={(value) =>
                      handleEmployeeChange(index, 'role', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="supervisor">Supervisor</SelectItem>
                      <SelectItem value="tecnico">Técnico</SelectItem>
                      <SelectItem value="auxiliar">Auxiliar</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Horas Trabalhadas</Label>
                  <Input
                    disabled={isPublished}
                    type="number"
                    value={employee.hours_worked}
                    onChange={(e) =>
                      handleEmployeeChange(
                        index,
                        'hours_worked',
                        parseFloat(e.target.value)
                      )
                    }
                  />
                </div>
              </div>
            </div>

            {!isPublished && (
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveEmployee(index)}
              >
                <Trash2Icon className="h-4 w-4" />
              </Button>
            )}
          </div>
        ))}
      </div>

      {!isPublished && employees.length > 0 && (
        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={onPrevious}>
            Voltar
          </Button>
          <Button onClick={handleSubmit} disabled={isLoading}>
            Salvar e Continuar
          </Button>
        </div>
      )}

      {!isPublished && employees.length === 0 && (
        <div className="text-center text-muted-foreground">
          Adicione funcionários à equipe do serviço
        </div>
      )}
    </div>
  );
}