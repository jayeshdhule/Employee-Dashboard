import { Card, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/Badge';
import type { LeaveBalance } from '../../types';
import { LEAVE_TYPE_LABELS } from '../../utils/format';

interface LeaveSummaryProps {
  balances: LeaveBalance[];
}

export function LeaveSummary({ balances }: LeaveSummaryProps) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {balances.map((balance) => {
        const usedPercent = balance.total > 0 ? (balance.used / balance.total) * 100 : 0;

        return (
          <Card key={balance.type} className="animate-fade-in">
            <CardHeader className="flex flex-row items-center justify-between mb-2">
              <CardTitle className="text-base">{LEAVE_TYPE_LABELS[balance.type]}</CardTitle>
              <Badge variant={balance.remaining > 0 ? 'success' : 'default'}>
                {balance.remaining} left
              </Badge>
            </CardHeader>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-500 dark:text-slate-400">Used</span>
                <span className="font-medium">
                  {balance.used} / {balance.total} days
                </span>
              </div>
              <div className="h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full rounded-full bg-brand-500 transition-all duration-500"
                  style={{ width: `${usedPercent}%` }}
                />
              </div>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
