import { format, parseISO, differenceInBusinessDays, addDays, eachDayOfInterval } from 'date-fns';
import type { AttendanceStatus, LeaveRequest, LeaveStatus, LeaveType } from '../types';

export function formatDate(dateStr: string, pattern = 'MMM d, yyyy'): string {
  return format(parseISO(dateStr), pattern);
}

export function formatDateTime(dateStr: string): string {
  return format(parseISO(dateStr), 'MMM d, yyyy h:mm a');
}

export function calculateLeaveDays(startDate: string, endDate: string): number {
  return differenceInBusinessDays(parseISO(endDate), parseISO(startDate)) + 1;
}

export const LEAVE_TYPE_LABELS: Record<LeaveType, string> = {
  annual: 'Annual Leave',
  sick: 'Sick Leave',
  personal: 'Personal Leave',
  unpaid: 'Unpaid Leave',
};

export const LEAVE_STATUS_LABELS: Record<LeaveStatus, string> = {
  approved: 'Approved',
  pending: 'Pending',
  rejected: 'Rejected',
};

export const ATTENDANCE_STATUS_LABELS: Record<AttendanceStatus, string> = {
  present: 'Present',
  absent: 'Absent',
  late: 'Late',
  'half-day': 'Half Day',
  wfh: 'Work From Home',
};

export const DEPARTMENTS = [
  'All',
  'Engineering',
  'Design',
  'Product',
  'Human Resources',
  'Marketing',
  'Analytics',
] as const;

export function getMonthDates(year: number, month: number): Date[] {
  const dates: Date[] = [];
  let current = new Date(year, month, 1);
  const end = new Date(year, month + 1, 0);

  while (current <= end) {
    dates.push(new Date(current));
    current = addDays(current, 1);
  }

  return dates;
}

export function getDatesInRange(startDate: string, endDate: string): string[] {
  return eachDayOfInterval({
    start: parseISO(startDate),
    end: parseISO(endDate),
  }).map((d) => format(d, 'yyyy-MM-dd'));
}

export interface LeaveDayInfo {
  request: LeaveRequest;
  type: LeaveType;
  status: LeaveStatus;
}

export function buildLeaveDateMap(requests: LeaveRequest[]): Map<string, LeaveDayInfo> {
  const map = new Map<string, LeaveDayInfo>();

  requests.forEach((request) => {
    if (request.status === 'rejected') return;

    getDatesInRange(request.startDate, request.endDate).forEach((date) => {
      const existing = map.get(date);
      if (!existing || statusPriority(request.status) > statusPriority(existing.status)) {
        map.set(date, { request, type: request.type, status: request.status });
      }
    });
  });

  return map;
}

function statusPriority(status: LeaveStatus): number {
  return { approved: 2, pending: 1, rejected: 0 }[status];
}
