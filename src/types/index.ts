export type AttendanceStatus = 'present' | 'absent' | 'late' | 'half-day' | 'wfh';

export interface AttendanceRecord {
  date: string;
  status: AttendanceStatus;
  checkIn?: string;
  checkOut?: string;
  hoursWorked?: number;
}

export type LeaveType = 'annual' | 'sick' | 'personal' | 'unpaid';
export type LeaveStatus = 'approved' | 'pending' | 'rejected';

export interface LeaveRequest {
  id: string;
  startDate: string;
  endDate: string;
  type: LeaveType;
  reason: string;
  status: LeaveStatus;
  days: number;
  submittedAt: string;
}

export interface LeaveBalance {
  type: LeaveType;
  total: number;
  used: number;
  remaining: number;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  location: string;
  joinDate: string;
  status: 'active' | 'on-leave' | 'remote';
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  author: string;
  department: string;
  publishedAt: string;
  priority: 'low' | 'medium' | 'high';
  tags: string[];
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  department: string;
  avatar: string;
  phone: string;
  location: string;
  joinDate: string;
  manager: string;
  bio: string;
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'info' | 'warning';
  title: string;
  message: string;
}

export interface AISummaryResult {
  summary: string;
  keyPoints: string[];
  sentiment: 'positive' | 'neutral' | 'informative';
  readingTimeMinutes: number;
  provider?: 'gemini' | 'local' | 'openai';
}
