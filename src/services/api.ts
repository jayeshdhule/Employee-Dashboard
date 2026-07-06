import type {
  Announcement,
  AttendanceRecord,
  Employee,
  LeaveBalance,
  LeaveRequest,
  UserProfile,
} from '../types';
import { delay } from '../utils/helpers';

import attendanceData from '../data/attendance.json';
import announcementsData from '../data/announcements.json';
import employeesData from '../data/employees.json';
import leaveBalancesData from '../data/leaveBalances.json';
import leaveRequestsData from '../data/leaveRequests.json';
import profileData from '../data/profile.json';

const MOCK_DELAY = 600;
const PROFILE_STORAGE_KEY = 'employee-dashboard-profile';
const ANNOUNCEMENTS_STORAGE_KEY = 'employee-dashboard-announcements';
const LEAVE_REQUESTS_STORAGE_KEY = 'employee-dashboard-leave-requests';

let leaveRequestsStore: LeaveRequest[] = loadLeaveRequestsFromStorage();
let announcementsStore: Announcement[] = [...(announcementsData as Announcement[])];
let profileStore: UserProfile = loadProfileFromStorage();

function loadProfileFromStorage(): UserProfile {
  try {
    const stored = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as UserProfile;
  } catch {
    /* use default */
  }
  return profileData as UserProfile;
}

function loadAnnouncementsFromStorage(): Announcement[] {
  try {
    const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as Announcement[];
  } catch {
    /* use default */
  }
  return [...(announcementsData as Announcement[])];
}

function persistAnnouncements() {
  localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(announcementsStore));
}

function persistProfile() {
  localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileStore));
}

function loadLeaveRequestsFromStorage(): LeaveRequest[] {
  try {
    const stored = localStorage.getItem(LEAVE_REQUESTS_STORAGE_KEY);
    if (stored) return JSON.parse(stored) as LeaveRequest[];
  } catch {
    /* use default */
  }
  return [...(leaveRequestsData as LeaveRequest[])];
}

function persistLeaveRequests() {
  localStorage.setItem(LEAVE_REQUESTS_STORAGE_KEY, JSON.stringify(leaveRequestsStore));
}

announcementsStore = loadAnnouncementsFromStorage();

export async function fetchAttendance(): Promise<AttendanceRecord[]> {
  await delay(MOCK_DELAY);
  return attendanceData as AttendanceRecord[];
}

export async function fetchLeaveBalances(): Promise<LeaveBalance[]> {
  await delay(MOCK_DELAY);
  return leaveBalancesData as LeaveBalance[];
}

export async function fetchLeaveRequests(): Promise<LeaveRequest[]> {
  await delay(MOCK_DELAY);
  return [...leaveRequestsStore];
}

export async function submitLeaveRequest(
  request: Omit<LeaveRequest, 'id' | 'status' | 'submittedAt'>,
): Promise<LeaveRequest> {
  await delay(MOCK_DELAY + 200);
  const newRequest: LeaveRequest = {
    ...request,
    id: `lr-${Date.now()}`,
    status: 'pending',
    submittedAt: new Date().toISOString(),
  };
  leaveRequestsStore = [newRequest, ...leaveRequestsStore];
  persistLeaveRequests();
  return newRequest;
}

export async function fetchEmployees(): Promise<Employee[]> {
  await delay(MOCK_DELAY);
  return employeesData as Employee[];
}

export async function fetchAnnouncements(): Promise<Announcement[]> {
  await delay(MOCK_DELAY);
  return [...announcementsStore].sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime(),
  );
}

export async function createAnnouncement(
  data: Omit<Announcement, 'id' | 'publishedAt' | 'author'>,
  author: string,
): Promise<Announcement> {
  await delay(MOCK_DELAY + 200);
  const announcement: Announcement = {
    ...data,
    id: `ann-${Date.now()}`,
    author,
    publishedAt: new Date().toISOString(),
  };
  announcementsStore = [announcement, ...announcementsStore];
  persistAnnouncements();
  return announcement;
}

export async function fetchProfile(): Promise<UserProfile> {
  await delay(MOCK_DELAY);
  return { ...profileStore };
}

export async function updateProfile(
  updates: Partial<Pick<UserProfile, 'name' | 'email' | 'phone' | 'location' | 'bio' | 'role'>>,
): Promise<UserProfile> {
  await delay(MOCK_DELAY + 200);
  profileStore = { ...profileStore, ...updates };
  persistProfile();
  return { ...profileStore };
}
