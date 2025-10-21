import { useMemo } from 'react';
import { Tables } from '@/integrations/supabase/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { BriefcaseIcon, UserCheckIcon, UserXIcon } from 'lucide-react';

type ShiftWithEmployees = Tables<'shifts'> & {
  supervisor?: Tables<'employees'>;
  shift_employees?: Array<{
    employee?: Tables<'employees'>;
    presente: boolean;
    justificativa?: string | null;
  }>;
};

interface ShiftStatsProps {
  shift: ShiftWithEmployees;
}

export function ShiftStats({ shift }: ShiftStatsProps) {
  const stats = useMemo(() => {
    const totalEmployees = shift.shift_employees?.length ?? 0;
    const presentEmployees = shift.shift_employees?.filter(se => se.presente).length ?? 0;
    const absentEmployees = totalEmployees - presentEmployees;
    const attendanceRate = totalEmployees ? (presentEmployees / totalEmployees) * 100 : 0;
    const justifiedAbsences = shift.shift_employees?.filter(
      se => !se.presente && se.justificativa
    ).length ?? 0;

    // Group by role statistics
    const roleStats = shift.shift_employees?.reduce((acc, se) => {
      const role = se.employee?.funcao;
      if (role) {
        if (!acc[role]) {
          acc[role] = { total: 0, present: 0 };
        }
        acc[role].total++;
        if (se.presente) {
          acc[role].present++;
        }
      }
      return acc;
    }, {} as Record<string, { total: number; present: number }>);

    // Calculate time metrics
    const startTime = new Date(shift.data_inicio);
    const endTime = new Date(shift.data_fim);
    const durationHours = (endTime.getTime() - startTime.getTime()) / (1000 * 60 * 60);
    const totalManHours = durationHours * presentEmployees;

    // Calculate efficiency metrics
    const efficiencyRate = justifiedAbsences ? 
      ((absentEmployees - justifiedAbsences) / absentEmployees) * 100 : 
      100;

    return {
      totalEmployees,
      presentEmployees,
      absentEmployees,
      attendanceRate: Math.round(attendanceRate),
      justifiedAbsences,
      roleStats,
      durationHours: Math.round(durationHours * 10) / 10,
      totalManHours: Math.round(totalManHours * 10) / 10,
      efficiencyRate: Math.round(efficiencyRate),
      roleDistribution: Object.entries(roleStats ?? {}).map(([role, stats]) => ({
        role,
        total: stats.total,
        present: stats.present,
        rate: Math.round((stats.present / stats.total) * 100),
      })),
    };
  }, [shift]);

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total da Equipe</CardTitle>
            <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalEmployees}</div>
            <p className="text-xs text-muted-foreground">
              {stats.durationHours}h de trabalho total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Presentes</CardTitle>
            <UserCheckIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.presentEmployees}</div>
            <Progress
              value={stats.attendanceRate}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.attendanceRate}% de presença ({stats.totalManHours}h/homem)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ausentes</CardTitle>
            <UserXIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.absentEmployees}</div>
            <Progress
              value={stats.efficiencyRate}
              className="mt-2"
            />
            <p className="text-xs text-muted-foreground mt-2">
              {stats.justifiedAbsences} justificadas ({stats.efficiencyRate}% eficiência)
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Distribuição por Função</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {stats.roleDistribution.map(({ role, total, present, rate }) => (
              <div key={role} className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="font-medium">{role}</span>
                  <span className="text-muted-foreground">
                    {present}/{total} ({rate}%)
                  </span>
                </div>
                <Progress value={rate} />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}