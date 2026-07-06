import { Card, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { LeaveRequest } from '../../types';
import { formatDate, LEAVE_TYPE_LABELS, LEAVE_STATUS_LABELS } from '../../utils/format';

interface LeaveHistoryProps {
  requests: LeaveRequest[];
}

const statusVariant = {
  approved: 'success' as const,
  pending: 'warning' as const,
  rejected: 'danger' as const,
};

export function LeaveHistory({ requests }: LeaveHistoryProps) {
  if (requests.length === 0) {
    return (
      <Card>
        <p className="text-sm text-slate-500 dark:text-slate-400 text-center py-8">
          No leave requests yet
        </p>
      </Card>
    );
  }

  return (
    <Card padding="none">
      <div className="p-5 border-b border-slate-200 dark:border-slate-800">
        <CardTitle>Leave History</CardTitle>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-200 dark:border-slate-800 text-left text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3 font-medium">Type</th>
              <th className="px-5 py-3 font-medium">Dates</th>
              <th className="px-5 py-3 font-medium">Days</th>
              <th className="px-5 py-3 font-medium hidden md:table-cell">Reason</th>
              <th className="px-5 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {requests.map((req) => (
              <tr
                key={req.id}
                className="border-b border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors animate-fade-in"
              >
                <td className="px-5 py-3 font-medium">{LEAVE_TYPE_LABELS[req.type]}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-400">
                  {formatDate(req.startDate)}
                  {req.startDate !== req.endDate && ` – ${formatDate(req.endDate)}`}
                </td>
                <td className="px-5 py-3">{req.days}</td>
                <td className="px-5 py-3 text-slate-600 dark:text-slate-400 hidden md:table-cell max-w-[200px] truncate">
                  {req.reason}
                </td>
                <td className="px-5 py-3">
                  <Badge variant={statusVariant[req.status]}>
                    {LEAVE_STATUS_LABELS[req.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
