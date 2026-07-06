import { useEffect, useState } from 'react';
import { AttendanceStats } from '../components/attendance/AttendanceStats';
import { AttendanceChart } from '../components/attendance/AttendanceChart';
import { AttendanceCalendar } from '../components/attendance/AttendanceCalendar';
import { SkeletonCard } from '../components/ui/Skeleton';
import { fetchAttendance, fetchLeaveRequests } from '../services/api';
import type { AttendanceRecord, LeaveRequest } from '../types';

export function DashboardPage() {
  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([fetchAttendance(), fetchLeaveRequests()])
      .then(([attendance, leaves]) => {
        setRecords(attendance);
        setLeaveRequests(leaves);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <SkeletonCard />
          <SkeletonCard />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <AttendanceStats records={records} />
      <AttendanceChart records={records} />
      <AttendanceCalendar records={records} leaveRequests={leaveRequests} />
    </div>
  );
}
