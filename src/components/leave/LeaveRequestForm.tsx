import { useState, type FormEvent } from 'react';
import { Card, CardHeader, CardTitle, CardDescription } from '../ui/Card';
import { Input } from '../ui/Input';
import { Select } from '../ui/Select';
import { Button } from '../ui/Button';
import type { LeaveType } from '../../types';
import { calculateLeaveDays, LEAVE_TYPE_LABELS } from '../../utils/format';

interface LeaveRequestFormProps {
  onSubmit: (data: {
    startDate: string;
    endDate: string;
    type: LeaveType;
    reason: string;
    days: number;
  }) => Promise<void>;
}

const leaveTypeOptions = Object.entries(LEAVE_TYPE_LABELS)
  .filter(([key]) => key !== 'unpaid')
  .map(([value, label]) => ({ value, label }));

export function LeaveRequestForm({ onSubmit }: LeaveRequestFormProps) {
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [type, setType] = useState<LeaveType>('annual');
  const [reason, setReason] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!startDate) newErrors.startDate = 'Start date is required';
    if (!endDate) newErrors.endDate = 'End date is required';
    if (startDate && endDate && endDate < startDate) {
      newErrors.endDate = 'End date must be after start date';
    }
    if (!reason.trim()) newErrors.reason = 'Reason is required';
    if (reason.trim().length < 10) newErrors.reason = 'Please provide at least 10 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setLoading(true);
    try {
      await onSubmit({
        startDate,
        endDate,
        type,
        reason: reason.trim(),
        days: calculateLeaveDays(startDate, endDate),
      });
      setStartDate('');
      setEndDate('');
      setType('annual');
      setReason('');
    } finally {
      setLoading(false);
    }
  };

  const previewDays =
    startDate && endDate && endDate >= startDate
      ? calculateLeaveDays(startDate, endDate)
      : null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Request Leave</CardTitle>
        <CardDescription>Submit a new leave request for manager approval</CardDescription>
      </CardHeader>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Start Date"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            error={errors.startDate}
            min="2026-01-01"
          />
          <Input
            label="End Date"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
            min={startDate || '2026-01-01'}
          />
        </div>

        <Select
          label="Leave Type"
          value={type}
          onChange={(e) => setType(e.target.value as LeaveType)}
          options={leaveTypeOptions}
        />

        <div className="space-y-1.5">
          <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
            Reason
          </label>
          <textarea
            id="reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={3}
            placeholder="Describe the reason for your leave request..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 resize-none"
          />
          {errors.reason && <p className="text-xs text-red-500">{errors.reason}</p>}
        </div>

        {previewDays !== null && (
          <p className="text-sm text-slate-600 dark:text-slate-400 animate-fade-in">
            Duration: <span className="font-semibold text-brand-600 dark:text-brand-400">{previewDays} business day{previewDays !== 1 ? 's' : ''}</span>
          </p>
        )}

        <Button type="submit" loading={loading} className="w-full sm:w-auto">
          Submit Request
        </Button>
      </form>
    </Card>
  );
}
