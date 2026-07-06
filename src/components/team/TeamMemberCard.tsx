import { Mail, MapPin, Phone } from 'lucide-react';
import { Card } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { Employee } from '../../types';

interface TeamMemberCardProps {
  employee: Employee;
}

const statusConfig = {
  active: { label: 'Active', variant: 'success' as const },
  'on-leave': { label: 'On Leave', variant: 'warning' as const },
  remote: { label: 'Remote', variant: 'info' as const },
};

export function TeamMemberCard({ employee }: TeamMemberCardProps) {
  const status = statusConfig[employee.status];

  return (
    <Card className="group hover:shadow-md hover:border-brand-200 dark:hover:border-brand-800 transition-all duration-200 animate-fade-in">
      <div className="flex items-start gap-4">
        <img
          src={employee.avatar}
          alt={employee.name}
          className="h-14 w-14 rounded-full ring-2 ring-slate-100 dark:ring-slate-800 group-hover:ring-brand-200 dark:group-hover:ring-brand-800 transition-all"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                {employee.name}
              </h3>
              <p className="text-sm text-brand-600 dark:text-brand-400">{employee.role}</p>
            </div>
            <Badge variant={status.variant}>{status.label}</Badge>
          </div>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{employee.department}</p>
          <div className="mt-3 space-y-1.5">
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Mail className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <Phone className="h-3.5 w-3.5 shrink-0" />
              <span>{employee.phone}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              <span>{employee.location}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
