import { Clock, CheckCircle, AlertTriangle, Home, XCircle } from 'lucide-react';
import { Card } from '../ui/Card';
import type { AttendanceRecord } from '../../types';

interface AttendanceStatsProps {
  records: AttendanceRecord[];
}

export function AttendanceStats({ records }: AttendanceStatsProps) {
  const present = records.filter((r) => r.status === 'present').length;
  const wfh = records.filter((r) => r.status === 'wfh').length;
  const late = records.filter((r) => r.status === 'late').length;
  const absent = records.filter((r) => r.status === 'absent').length;
  const avgHours =
    records.reduce((sum, r) => sum + (r.hoursWorked ?? 0), 0) / records.length;

  const stats = [
    { label: 'Present', value: present, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950 dark:text-emerald-400' },
    { label: 'WFH', value: wfh, icon: Home, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950 dark:text-blue-400' },
    { label: 'Late', value: late, icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950 dark:text-amber-400' },
    { label: 'Absent', value: absent, icon: XCircle, color: 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400' },
    { label: 'Avg Hours', value: avgHours.toFixed(1), icon: Clock, color: 'text-brand-600 bg-brand-50 dark:bg-brand-950 dark:text-brand-400' },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-5">
      {stats.map((stat) => (
        <Card key={stat.label} className="animate-fade-in">
          <div className="flex items-center gap-3">
            <div className={`rounded-lg p-2.5 ${stat.color}`}>
              <stat.icon className="h-5 w-5" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stat.value}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">{stat.label}</p>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
}
