import { format, isSameDay } from 'date-fns';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useMemo, useState } from 'react';
import { Card, CardHeader, CardTitle } from '../ui/Card';
import { cn } from '../../utils/helpers';
import { buildLeaveDateMap, LEAVE_STATUS_LABELS, LEAVE_TYPE_LABELS } from '../../utils/format';
import type { AttendanceRecord, AttendanceStatus, LeaveRequest } from '../../types';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  leaveRequests?: LeaveRequest[];
}

const statusStyles: Record<AttendanceStatus, string> = {
  present: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400',
  absent: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400',
  late: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400',
  'half-day': 'bg-violet-100 text-violet-700 dark:bg-violet-900/40 dark:text-violet-400',
  wfh: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400',
};

export function AttendanceCalendar({ records, leaveRequests = [] }: AttendanceCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 6, 1));

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const recordMap = new Map(records.map((r) => [r.date, r]));
  const leaveMap = useMemo(() => buildLeaveDateMap(leaveRequests), [leaveRequests]);

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const days: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) days.push(null);
  for (let d = 1; d <= daysInMonth; d++) days.push(d);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Attendance Calendar</CardTitle>
        <div className="flex items-center gap-2">
          <button
            onClick={prevMonth}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <span className="text-sm font-medium min-w-[120px] text-center">
            {format(currentDate, 'MMMM yyyy')}
          </span>
          <button
            onClick={nextMonth}
            className="rounded-lg p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-7 gap-1 text-center text-xs font-medium text-slate-500 dark:text-slate-400 mb-2">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} className="py-2">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {days.map((day, i) => {
          if (day === null) return <div key={`empty-${i}`} />;

          const dateStr = format(new Date(year, month, day), 'yyyy-MM-dd');
          const record = recordMap.get(dateStr);
          const leave = leaveMap.get(dateStr);
          const isToday = isSameDay(new Date(year, month, day), new Date(2026, 6, 6));

          const cellStyle = leave
            ? leave.status === 'approved'
              ? 'bg-teal-100 text-teal-800 dark:bg-teal-900/40 dark:text-teal-300'
              : 'bg-amber-100 text-amber-800 ring-1 ring-dashed ring-amber-400 dark:bg-amber-900/40 dark:text-amber-300'
            : record
              ? statusStyles[record.status]
              : 'hover:bg-slate-50 dark:hover:bg-slate-800';

          const label = leave
            ? leave.status === 'pending'
              ? 'Leave'
              : LEAVE_TYPE_LABELS[leave.type].split(' ')[0]
            : record
              ? record.status === 'wfh'
                ? 'WFH'
                : record.status.slice(0, 3)
              : null;

          return (
            <div
              key={dateStr}
              className={cn(
                'relative flex flex-col items-center rounded-lg p-1 sm:p-1.5 min-h-[44px] sm:min-h-[52px] transition-colors',
                isToday && 'ring-2 ring-brand-500 ring-offset-1 dark:ring-offset-slate-900',
                cellStyle,
              )}
              title={
                leave
                  ? `${LEAVE_TYPE_LABELS[leave.type]} · ${LEAVE_STATUS_LABELS[leave.status]}`
                  : record
                    ? `${record.status}${record.checkIn ? ` · ${record.checkIn}-${record.checkOut}` : ''}`
                    : undefined
              }
            >
              <span className="text-xs font-medium">{day}</span>
              {label && (
                <span className="text-[10px] capitalize truncate w-full">{label}</span>
              )}
            </div>
          );
        })}
      </div>
    </Card>
  );
}
