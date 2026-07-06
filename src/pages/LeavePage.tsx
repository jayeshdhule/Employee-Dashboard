import { useEffect, useState, useCallback } from 'react';
import { LeaveSummary } from '../components/leave/LeaveSummary';
import { LeaveRequestForm } from '../components/leave/LeaveRequestForm';
import { LeaveHistory } from '../components/leave/LeaveHistory';
import { LeaveCalendar } from '../components/leave/LeaveCalendar';
import { SkeletonCard, SkeletonTable } from '../components/ui/Skeleton';
import { useNotifications } from '../context/NotificationContext';
import {
  fetchLeaveBalances,
  fetchLeaveRequests,
  submitLeaveRequest,
} from '../services/api';
import type { LeaveBalance, LeaveRequest } from '../types';

export function LeavePage() {
  const [balances, setBalances] = useState<LeaveBalance[]>([]);
  const [requests, setRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [b, r] = await Promise.all([fetchLeaveBalances(), fetchLeaveRequests()]);
      setBalances(b);
      setRequests(r);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSubmit = async (data: {
    startDate: string;
    endDate: string;
    type: LeaveRequest['type'];
    reason: string;
    days: number;
  }) => {
    const newRequest = await submitLeaveRequest(data);
    setRequests((prev) => [newRequest, ...prev]);
    addNotification({
      type: 'success',
      title: 'Leave Request Submitted',
      message: `Your ${data.days}-day leave request is pending approval and shown on the calendar.`,
    });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <SkeletonCard />
        <SkeletonTable />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 animate-fade-in">
      <LeaveSummary balances={balances} />
      <div className="grid gap-4 sm:gap-6 lg:grid-cols-2">
        <LeaveRequestForm onSubmit={handleSubmit} />
        <div className="min-w-0 overflow-hidden">
          <LeaveHistory requests={requests} />
        </div>
      </div>
      <LeaveCalendar requests={requests} />
    </div>
  );
}
