import { format, isSameDay, parseISO } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Badge } from '../ui/Badge';
import { cn } from '../../utils/helpers';
import {
  buildLeaveDateMap,
  LEAVE_STATUS_LABELS,
  LEAVE_TYPE_LABELS,
} from '../../utils/format';
import type { LeaveRequest, LeaveStatus } from '../../types';

interface LeaveCalendarProps {
  requests: LeaveRequest[];
}

const statusStyles: Record<LeaveStatus, string> = {
  approved:
    'bg-teal-100 text-teal-800 ring-1 ring-teal-300 dark:bg-teal-900/40 dark:text-teal-300 dark:ring-teal-700',
  pending:
    'bg-amber-100 text-amber-800 ring-1 ring-dashed ring-amber-400 dark:bg-amber-900/40 dark:text-amber-300 dark:ring-amber-600',
  rejected: 'bg-slate-100 text-slate-400 line-through dark:bg-slate-800 dark:text-slate-500',
};

const statusBadgeVariant = {
  approved: 'success' as const,
  pending: 'warning' as const,
  rejected: 'default' as const,
};

export function LeaveCalendar({ requests }: LeaveCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const leaveMap = useMemo(() => buildLeaveDateMap(requests), [requests]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  const monthLeaveCount = useMemo(() => {
    let count = 0;
    leaveMap.forEach((_, date) => {
      const d = parseISO(date);
      if (d.getFullYear() === year && d.getMonth() === month) count++;
    });
    return count;
  }, [leaveMap, year, month]);

  return (
    <Card>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <CardTitle>Leave Calendar</CardTitle>
          <CardDescription>
            {monthLeaveCount > 0
              ? `${monthLeaveCount} leave day${monthLeaveCount !== 1 ? 's' : ''} this month`
              : 'Submitted leave requests appear here'}
          </CardDescription>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Previous month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            aria-label="Next month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
          const leave = leaveMap.get(dateStr);
          const isToday = isSameDay(new Date(year, month, day), new Date());

          return (
            <div
              key={dateStr}
              className={cn(
                'relative flex flex-col items-center rounded-lg p-1 sm:p-1.5 min-h-[48px] sm:min-h-[56px] transition-colors',
                isToday && 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900',
                leave
                  ? statusStyles[leave.status]
                  : 'hover:bg-slate-50 dark:hover:bg-slate-800',
              )}
              title={
                leave
                  ? `${LEAVE_TYPE_LABELS[leave.type]} · ${LEAVE_STATUS_LABELS[leave.status]}`
                  : undefined
              }
            >
              <span className="text-xs font-medium">{day}</span>
              {leave && (
                <span className="text-[9px] sm:text-[10px] font-medium truncate w-full leading-tight mt-0.5">
                  {leave.status === 'pending' ? 'Pending' : LEAVE_TYPE_LABELS[leave.type].split(' ')[0]}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-4 flex flex-wrap gap-4 border-t border-slate-200 dark:border-slate-800 pt-4">
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="h-3 w-3 rounded bg-teal-200 dark:bg-teal-800" />
          Approved leave
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
          <span className="h-3 w-3 rounded bg-amber-200 ring-1 ring-dashed ring-amber-400 dark:bg-amber-800" />
          Pending leave
        </div>
      </div>

      {requests.filter((r) => r.status !== 'rejected').length === 0 && (
        <p className="mt-3 text-center text-sm text-slate-500 dark:text-slate-400">
          Submit a leave request above to see it on the calendar.
        </p>
      )}

      {requests.filter((r) => r.status === 'pending').length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {requests
            .filter((r) => r.status === 'pending')
            .slice(0, 3)
            .map((req) => (
              <Badge key={req.id} variant={statusBadgeVariant[req.status]}>
                {LEAVE_TYPE_LABELS[req.type]} · pending
              </Badge>
            ))}
        </div>
      )}
    </Card>
  );
}
