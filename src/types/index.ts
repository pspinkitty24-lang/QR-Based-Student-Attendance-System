export type Role = 'admin' | 'faculty' | 'student';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
  code: string; // Register number for student, Employee ID for faculty/admin
  classId?: string; // For students
  departmentId?: string;
  marks?: number; // Internal / Academic marks out of 100 (for students)
  isActive: boolean;
  mustChangePassword?: boolean;
  avatar?: string;
  phone?: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
}

export interface ClassRoom {
  _id: string;
  name: string;
  departmentId: string;
  academicYear: string;
  semester: number;
}

export interface Subject {
  _id: string;
  name: string;
  code: string;
  departmentId: string;
}

export interface TeachingAssignment {
  _id: string;
  facultyId: string;
  subjectId: string;
  classId: string;
  isActive: boolean;
}

export interface StudentEnrollment {
  _id: string;
  studentId: string;
  assignmentId: string;
  isActive: boolean;
}

export interface TimetablePeriod {
  _id: string;
  assignmentId: string;
  day: number; // 0 Sunday, 1 Monday, ..., 6 Saturday
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  room: string;
}

export type AttendanceStatus = 'present' | 'late' | 'absent' | 'excused' | 'on_duty' | 'permission';

export interface AttendanceRecord {
  _id: string;
  sessionId: string;
  studentId: string;
  status: AttendanceStatus;
  markedAt: string;
  method: 'QR Code' | 'Manual' | 'Auto-Absent';
  reason?: string;
}

export interface AttendanceSession {
  _id: string;
  assignmentId: string;
  facultyId: string;
  startsAt: string;
  endsAt?: string;
  durationMinutes: number;
  status: 'active' | 'completed' | 'cancelled';
  qrToken: string;
  tokenExpiresAt: number;
  rotationCount: number;
  records: AttendanceRecord[];
}

export interface CampusSettings {
  collegeName: string;
  timezone: string;
  threshold: number; // default 75%
  qrSeconds: number; // default 15s rotation
  lateMinutes: number; // default 10m
  sessionMinutes: number; // default 60m
}

export interface AuditLog {
  _id: string;
  timestamp: string;
  actor: string;
  action: string;
  details: string;
  ip?: string;
}

export interface NotificationItem {
  _id: string;
  title: string;
  message: string;
  date: string;
  priority: 'low' | 'normal' | 'high';
  isRead?: boolean;
}

export interface StudentEligibilityReportItem {
  studentId: string; // Code / Register number
  studentDbId: string;
  studentName: string;
  department: string;
  departmentId: string;
  classId?: string;
  className?: string;
  marks: number; // Marks / Score (e.g. out of 100)
  totalWorkingDays: number;
  totalPresentDays: number;
  attendancePercentage: number;
  isEligible: boolean; // >= 75%
}
