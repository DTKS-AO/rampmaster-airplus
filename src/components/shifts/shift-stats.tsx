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

    return {
      totalEmployees,
      presentEmployees,
      absentEmployees,
      attendanceRate: Math.round(attendanceRate),
      justifiedAbsences,
    };
  }, [shift]);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total da Equipe</CardTitle>
          <BriefcaseIcon className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{stats.totalEmployees}</div>
          <p className="text-xs text-muted-foreground">
            Funcionários escalados
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
            {stats.attendanceRate}% de presença
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
          <p className="text-xs text-muted-foreground">
            {stats.justifiedAbsences} com justificativa
          </p>
        </CardContent>
      </Card>
    </div>
  );
}