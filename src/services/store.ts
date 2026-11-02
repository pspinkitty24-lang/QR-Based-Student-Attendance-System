import {
  User,
  Department,
  ClassRoom,
  Subject,
  TeachingAssignment,
  StudentEnrollment,
  TimetablePeriod,
  AttendanceSession,
  AttendanceRecord,
  CampusSettings,
  AuditLog,
  NotificationItem,
  StudentEligibilityReportItem,
  AttendanceStatus,
} from '../types';

const STORAGE_KEY = 'attendly_campus_store_v6';

interface CampusDatabase {
  users: User[];
  departments: Department[];
  classes: ClassRoom[];
  subjects: Subject[];
  assignments: TeachingAssignment[];
  enrollments: StudentEnrollment[];
  timetable: TimetablePeriod[];
  sessions: AttendanceSession[];
  settings: CampusSettings;
  audit: AuditLog[];
  notifications: NotificationItem[];
}

const DEFAULT_SETTINGS: CampusSettings = {
  collegeName: "Department of Computer Science · Campus Workspace",
  timezone: 'Asia/Kolkata (IST)',
  threshold: 75,
  qrSeconds: 15,
  lateMinutes: 10,
  sessionMinutes: 10, // Default 10 minutes session for fast attendance
};

// Seed: Exactly ONE department as requested: Department of Computer Science
const SEED_DEPARTMENTS: Department[] = [
  { _id: 'dept-cs', name: 'Department of Computer Science', code: 'CS' },
];

// Seed: Exactly THREE classes under Computer Science: MCA, M.Sc, MDS
const SEED_CLASSES: ClassRoom[] = [
  {
    _id: 'class-mca',
    name: 'MCA (Master of Computer Applications)',
    departmentId: 'dept-cs',
    academicYear: '2025-2026',
    semester: 1,
  },
  {
    _id: 'class-msc',
    name: 'M.Sc (Master of Science in Computer Science)',
    departmentId: 'dept-cs',
    academicYear: '2025-2026',
    semester: 1,
  },
  {
    _id: 'class-mds',
    name: 'MDS (Master of Data Science)',
    departmentId: 'dept-cs',
    academicYear: '2025-2026',
    semester: 1,
  },
];

// Seed: Exactly 3 subjects suited to each class (9 subjects in total)
const SEED_SUBJECTS: Subject[] = [
  // MCA Subjects
  {
    _id: 'subj-mca-1',
    name: 'Web Technologies',
    code: 'MCA101',
    departmentId: 'dept-cs',
  },
  {
    _id: 'subj-mca-2',
    name: 'Python Programming',
    code: 'MCA102',
    departmentId: 'dept-cs',
  },
  {
    _id: 'subj-mca-3',
    name: 'Data Structures & Algorithms',
    code: 'MCA103',
    departmentId: 'dept-cs',
  },

  // M.Sc Subjects
  {
    _id: 'subj-msc-1',
    name: 'Advanced Operating Systems',
    code: 'MSC101',
    departmentId: 'dept-cs',
  },
  {
    _id: 'subj-msc-2',
    name: 'Cloud Computing',
    code: 'MSC102',
    departmentId: 'dept-cs',
  },
  {
    _id: 'subj-msc-3',
    name: 'Database Management Systems',
    code: 'MSC103',
    departmentId: 'dept-cs',
  },

  // MDS Subjects
  {
    _id: 'subj-mds-1',
    name: 'Machine Learning',
    code: 'MDS101',
    departmentId: 'dept-cs',
  },
  {
    _id: 'subj-mds-2',
    name: 'Data Structures & Analysis',
    code: 'MDS102',
    departmentId: 'dept-cs',
  },
  {
    _id: 'subj-mds-3',
    name: 'Big Data Analytics',
    code: 'MDS103',
    departmentId: 'dept-cs',
  },
];

// Seed users: Exactly 1 Admin, Exactly 3 Faculty, Exactly 30 Students (10 per class)
const SEED_USERS: User[] = [
  // 1 ADMIN (Sole administrator account)
  {
    _id: 'usr-admin-1',
    name: 'Dr. Elena Vance',
    email: 'admin@college.edu',
    role: 'admin',
    code: 'ADM001',
    departmentId: 'dept-cs',
    isActive: true,
  },

  // 3 FACULTY (Independent logins for starting sessions)
  {
    _id: 'usr-fac-1',
    name: 'Prof. Alan Turing',
    email: 'faculty@college.edu',
    role: 'faculty',
    code: 'FAC101',
    departmentId: 'dept-cs',
    isActive: true,
  },
  {
    _id: 'usr-fac-2',
    name: 'Dr. Priya Sharma',
    email: 'sharma@college.edu',
    role: 'faculty',
    code: 'FAC102',
    departmentId: 'dept-cs',
    isActive: true,
  },
  {
    _id: 'usr-fac-3',
    name: 'Dr. K. Subramanian',
    email: 'subramanian@college.edu',
    role: 'faculty',
    code: 'FAC103',
    departmentId: 'dept-cs',
    isActive: true,
  },

  // ==========================================
  // MCA CLASS: EXACTLY 10 DISTINCT STUDENTS
  // Registration Numbers: MCA2024-001 to MCA2024-010
  // ==========================================
  {
    _id: 'usr-stu-mca-1',
    name: 'Arun Kumar',
    email: 'arun.mca@college.edu',
    role: 'student',
    code: 'MCA2024-001',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 88,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-2',
    name: 'Maya Lin',
    email: 'maya.mca@college.edu',
    role: 'student',
    code: 'MCA2024-002',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 92,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-3',
    name: 'Rahul Varma',
    email: 'rahul.mca@college.edu',
    role: 'student',
    code: 'MCA2024-003',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 64,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-4',
    name: 'Ananya Sen',
    email: 'ananya.mca@college.edu',
    role: 'student',
    code: 'MCA2024-004',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 85,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-5',
    name: 'Vikram Sethi',
    email: 'vikram.mca@college.edu',
    role: 'student',
    code: 'MCA2024-005',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 74,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-6',
    name: 'Swetha Natarajan',
    email: 'swetha.mca@college.edu',
    role: 'student',
    code: 'MCA2024-006',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 95,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-7',
    name: 'Manoj Prabhakar',
    email: 'manoj.mca@college.edu',
    role: 'student',
    code: 'MCA2024-007',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 71,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-8',
    name: 'Harini Venkatesh',
    email: 'harini.mca@college.edu',
    role: 'student',
    code: 'MCA2024-008',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 89,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-9',
    name: 'Deepak Chandran',
    email: 'deepak.mca@college.edu',
    role: 'student',
    code: 'MCA2024-009',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 79,
    isActive: true,
  },
  {
    _id: 'usr-stu-mca-10',
    name: 'Kavita Pillai',
    email: 'kavita.mca@college.edu',
    role: 'student',
    code: 'MCA2024-010',
    classId: 'class-mca',
    departmentId: 'dept-cs',
    marks: 91,
    isActive: true,
  },

  // ==========================================
  // M.SC CLASS: EXACTLY 10 DISTINCT STUDENTS
  // Registration Numbers: MSC2024-001 to MSC2024-010
  // ==========================================
  {
    _id: 'usr-stu-msc-1',
    name: 'Dev Patel',
    email: 'dev.msc@college.edu',
    role: 'student',
    code: 'MSC2024-001',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 45,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-2',
    name: 'Zara Qureshi',
    email: 'zara.msc@college.edu',
    role: 'student',
    code: 'MSC2024-002',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 91,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-3',
    name: 'Karthik Raja',
    email: 'karthik.msc@college.edu',
    role: 'student',
    code: 'MSC2024-003',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 78,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-4',
    name: 'Preethi Mohan',
    email: 'preethi.msc@college.edu',
    role: 'student',
    code: 'MSC2024-004',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 86,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-5',
    name: 'Naveen Balaji',
    email: 'naveen.msc@college.edu',
    role: 'student',
    code: 'MSC2024-005',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 68,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-6',
    name: 'Aishwarya Ramesh',
    email: 'aishwarya.msc@college.edu',
    role: 'student',
    code: 'MSC2024-006',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 94,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-7',
    name: 'Rakesh Roshan',
    email: 'rakesh.msc@college.edu',
    role: 'student',
    code: 'MSC2024-007',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 73,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-8',
    name: 'Shruti Iyer',
    email: 'shruti.msc@college.edu',
    role: 'student',
    code: 'MSC2024-008',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 82,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-9',
    name: 'Gautam Shankar',
    email: 'gautam.msc@college.edu',
    role: 'student',
    code: 'MSC2024-009',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 88,
    isActive: true,
  },
  {
    _id: 'usr-stu-msc-10',
    name: 'Nithya Sridhar',
    email: 'nithya.msc@college.edu',
    role: 'student',
    code: 'MSC2024-010',
    classId: 'class-msc',
    departmentId: 'dept-cs',
    marks: 80,
    isActive: true,
  },

  // ==========================================
  // MDS CLASS: EXACTLY 10 DISTINCT STUDENTS
  // Registration Numbers: MDS2024-001 to MDS2024-010
  // ==========================================
  {
    _id: 'usr-stu-mds-1',
    name: 'Divya Prakash',
    email: 'divya.mds@college.edu',
    role: 'student',
    code: 'MDS2024-001',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 82,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-2',
    name: 'Sanjay Ram',
    email: 'sanjay.mds@college.edu',
    role: 'student',
    code: 'MDS2024-002',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 58,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-3',
    name: 'Sneha Murugan',
    email: 'sneha.mds@college.edu',
    role: 'student',
    code: 'MDS2024-003',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 87,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-4',
    name: 'Ashwin Kumar',
    email: 'ashwin.mds@college.edu',
    role: 'student',
    code: 'MDS2024-004',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 93,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-5',
    name: 'Bhavna Sundaram',
    email: 'bhavna.mds@college.edu',
    role: 'student',
    code: 'MDS2024-005',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 70,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-6',
    name: 'Chetan Nair',
    email: 'chetan.mds@college.edu',
    role: 'student',
    code: 'MDS2024-006',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 89,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-7',
    name: 'Gayathri Krishnan',
    email: 'gayathri.mds@college.edu',
    role: 'student',
    code: 'MDS2024-007',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 96,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-8',
    name: 'Harish Madhavan',
    email: 'harish.mds@college.edu',
    role: 'student',
    code: 'MDS2024-008',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 65,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-9',
    name: 'Lavanya Rajan',
    email: 'lavanya.mds@college.edu',
    role: 'student',
    code: 'MDS2024-009',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 84,
    isActive: true,
  },
  {
    _id: 'usr-stu-mds-10',
    name: 'Tarun Joseph',
    email: 'tarun.mds@college.edu',
    role: 'student',
    code: 'MDS2024-010',
    classId: 'class-mds',
    departmentId: 'dept-cs',
    marks: 90,
    isActive: true,
  },
];

// Seed assignments: Map class subjects to faculty
const SEED_ASSIGNMENTS: TeachingAssignment[] = [
  // MCA (3 subjects taught by faculty)
  {
    _id: 'assign-mca-1',
    facultyId: 'usr-fac-1',
    subjectId: 'subj-mca-1', // Web Technologies
    classId: 'class-mca',
    isActive: true,
  },
  {
    _id: 'assign-mca-2',
    facultyId: 'usr-fac-2',
    subjectId: 'subj-mca-2', // Python Programming
    classId: 'class-mca',
    isActive: true,
  },
  {
    _id: 'assign-mca-3',
    facultyId: 'usr-fac-3',
    subjectId: 'subj-mca-3', // Data Structures & Algorithms
    classId: 'class-mca',
    isActive: true,
  },

  // M.Sc (3 subjects taught by faculty)
  {
    _id: 'assign-msc-1',
    facultyId: 'usr-fac-1',
    subjectId: 'subj-msc-1', // Advanced Operating Systems
    classId: 'class-msc',
    isActive: true,
  },
  {
    _id: 'assign-msc-2',
    facultyId: 'usr-fac-2',
    subjectId: 'subj-msc-2', // Cloud Computing
    classId: 'class-msc',
    isActive: true,
  },
  {
    _id: 'assign-msc-3',
    facultyId: 'usr-fac-3',
    subjectId: 'subj-msc-3', // Database Management Systems
    classId: 'class-msc',
    isActive: true,
  },

  // MDS (3 subjects taught by faculty)
  {
    _id: 'assign-mds-1',
    facultyId: 'usr-fac-1',
    subjectId: 'subj-mds-1', // Machine Learning
    classId: 'class-mds',
    isActive: true,
  },
  {
    _id: 'assign-mds-2',
    facultyId: 'usr-fac-2',
    subjectId: 'subj-mds-2', // Data Structures & Analysis
    classId: 'class-mds',
    isActive: true,
  },
  {
    _id: 'assign-mds-3',
    facultyId: 'usr-fac-3',
    subjectId: 'subj-mds-3', // Big Data Analytics
    classId: 'class-mds',
    isActive: true,
  },
];

// Seed enrollments for all 10 students into their respective class assignments
const SEED_ENROLLMENTS: StudentEnrollment[] = [];
SEED_USERS.filter((u) => u.role === 'student').forEach((student) => {
  const classAssignments = SEED_ASSIGNMENTS.filter((a) => a.classId === student.classId);
  classAssignments.forEach((a) => {
    SEED_ENROLLMENTS.push({
      _id: `enr-${a._id}-${student._id}`,
      studentId: student._id,
      assignmentId: a._id,
      isActive: true,
    });
  });
});

// Seed timetable
const SEED_TIMETABLE: TimetablePeriod[] = [
  {
    _id: 'tt-1',
    assignmentId: 'assign-mca-1',
    day: 1, // Monday
    startTime: '09:00',
    endTime: '10:00',
    room: 'Hall 301 - CS Wing',
  },
  {
    _id: 'tt-2',
    assignmentId: 'assign-mca-2',
    day: 1, // Monday
    startTime: '11:15',
    endTime: '12:15',
    room: 'Lab 2B - Turing Center',
  },
  {
    _id: 'tt-3',
    assignmentId: 'assign-msc-1',
    day: 2, // Tuesday
    startTime: '10:00',
    endTime: '11:00',
    room: 'Lab 4A - Systems Lab',
  },
  {
    _id: 'tt-4',
    assignmentId: 'assign-mds-1',
    day: 3, // Wednesday
    startTime: '09:00',
    endTime: '10:00',
    room: 'Data Science Studio',
  },
  {
    _id: 'tt-5',
    assignmentId: 'assign-mca-3',
    day: 4, // Thursday
    startTime: '14:00',
    endTime: '15:30',
    room: 'Hall 301 - CS Wing',
  },
  {
    _id: 'tt-6',
    assignmentId: 'assign-mds-2',
    day: 5, // Friday
    startTime: '10:00',
    endTime: '11:00',
    room: 'Data Science Studio',
  },
];

// Generate past completed sessions across 10 distinct working days for each class
function generateSeedSessions(): AttendanceSession[] {
  const sessions: AttendanceSession[] = [];
  const baseTime = Date.now();
  const DAY_MS = 86400000;

  // Student historical attendance rates over 10 working days:
  // MCA (10 students):
  // 1. Arun: 9/10 (90% -> Eligible)
  // 2. Maya: 8/10 (80% -> Eligible)
  // 3. Rahul: 6/10 (60% -> Not Eligible)
  // 4. Ananya: 9/10 (90% -> Eligible)
  // 5. Vikram: 5/10 (50% -> Not Eligible)
  // 6. Swetha: 10/10 (100% -> Eligible)
  // 7. Manoj: 7/10 (70% -> Not Eligible)
  // 8. Harini: 8/10 (80% -> Eligible)
  // 9. Deepak: 8/10 (80% -> Eligible)
  // 10. Kavita: 9/10 (90% -> Eligible)
  // M.Sc (10 students):
  // 1. Dev: 4/10 (40% -> Not Eligible)
  // 2. Zara: 8/10 (80% -> Eligible)
  // 3. Karthik: 8/10 (80% -> Eligible)
  // 4. Preethi: 9/10 (90% -> Eligible)
  // 5. Naveen: 6/10 (60% -> Not Eligible)
  // 6. Aishwarya: 10/10 (100% -> Eligible)
  // 7. Rakesh: 7/10 (70% -> Not Eligible)
  // 8. Shruti: 8/10 (80% -> Eligible)
  // 9. Gautam: 9/10 (90% -> Eligible)
  // 10. Nithya: 8/10 (80% -> Eligible)
  // MDS (10 students):
  // 1. Divya: 9/10 (90% -> Eligible)
  // 2. Sanjay: 5/10 (50% -> Not Eligible)
  // 3. Sneha: 8/10 (80% -> Eligible)
  // 4. Ashwin: 10/10 (100% -> Eligible)
  // 5. Bhavna: 6/10 (60% -> Not Eligible)
  // 6. Chetan: 8/10 (80% -> Eligible)
  // 7. Gayathri: 9/10 (90% -> Eligible)
  // 8. Harish: 5/10 (50% -> Not Eligible)
  // 9. Lavanya: 8/10 (80% -> Eligible)
  // 10. Tarun: 9/10 (90% -> Eligible)
  const studentPresentDays: Record<string, number> = {
    // MCA (10)
    'usr-stu-mca-1': 9,
    'usr-stu-mca-2': 8,
    'usr-stu-mca-3': 6,
    'usr-stu-mca-4': 9,
    'usr-stu-mca-5': 5,
    'usr-stu-mca-6': 10,
    'usr-stu-mca-7': 7,
    'usr-stu-mca-8': 8,
    'usr-stu-mca-9': 8,
    'usr-stu-mca-10': 9,

    // M.Sc (10)
    'usr-stu-msc-1': 4,
    'usr-stu-msc-2': 8,
    'usr-stu-msc-3': 8,
    'usr-stu-msc-4': 9,
    'usr-stu-msc-5': 6,
    'usr-stu-msc-6': 10,
    'usr-stu-msc-7': 7,
    'usr-stu-msc-8': 8,
    'usr-stu-msc-9': 9,
    'usr-stu-msc-10': 8,

    // MDS (10)
    'usr-stu-mds-1': 9,
    'usr-stu-mds-2': 5,
    'usr-stu-mds-3': 8,
    'usr-stu-mds-4': 10,
    'usr-stu-mds-5': 6,
    'usr-stu-mds-6': 8,
    'usr-stu-mds-7': 9,
    'usr-stu-mds-8': 5,
    'usr-stu-mds-9': 8,
    'usr-stu-mds-10': 9,
  };

  const classList = [
    { classId: 'class-mca', assignId: 'assign-mca-1', facId: 'usr-fac-1' },
    { classId: 'class-msc', assignId: 'assign-msc-1', facId: 'usr-fac-1' },
    { classId: 'class-mds', assignId: 'assign-mds-1', facId: 'usr-fac-1' },
  ];

  for (let dayIndex = 10; dayIndex >= 1; dayIndex--) {
    const sessionDate = new Date(baseTime - dayIndex * DAY_MS);
    const dateStr = sessionDate.toISOString();

    classList.forEach((clsItem) => {
      const sessionId = `sess-history-${clsItem.classId}-d${dayIndex}`;
      const records: AttendanceRecord[] = [];
      const classStudents = SEED_USERS.filter(
        (u) => u.role === 'student' && u.classId === clsItem.classId
      );

      classStudents.forEach((stu) => {
        const needed = studentPresentDays[stu._id] ?? 8;
        const isPresent = dayIndex <= needed;

        records.push({
          _id: `rec-${sessionId}-${stu._id}`,
          sessionId,
          studentId: stu._id,
          status: isPresent ? 'present' : 'absent',
          markedAt: isPresent
            ? new Date(sessionDate.getTime() + 120000).toISOString()
            : dateStr,
          method: isPresent ? 'QR Code' : 'Auto-Absent',
          reason: isPresent ? undefined : 'Unmarked during lecture session',
        });
      });

      sessions.push({
        _id: sessionId,
        assignmentId: clsItem.assignId,
        facultyId: clsItem.facId,
        startsAt: dateStr,
        endsAt: new Date(sessionDate.getTime() + 60 * 60000).toISOString(),
        durationMinutes: 60,
        status: 'completed',
        qrToken: `STATIC-TOKEN-${sessionId}`,
        tokenExpiresAt: sessionDate.getTime() + 60 * 60000,
        rotationCount: 0,
        records,
      });
    });
  }

  return sessions;
}

const SEED_AUDIT: AuditLog[] = [
  {
    _id: 'aud-1',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    actor: 'Dr. Elena Vance (ADM001)',
    action: 'SYSTEM_INITIALIZED',
    details: 'Attendly academic system initialized with 1 Admin, 3 Faculty, and 10 Students.',
    ip: '192.168.1.10',
  },
  {
    _id: 'aud-2',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    actor: 'Prof. Alan Turing (FAC101)',
    action: 'SESSION_VERIFIED',
    details: 'Classroom roster synchronized for CS601 lecture period.',
    ip: '192.168.1.45',
  },
];

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    _id: 'notif-1',
    title: 'Semester Examination Eligibility Criteria',
    message: 'Attendance threshold is 75%. Students with >= 75% are Eligible to Exam; below 75% are Not Eligible.',
    date: new Date().toISOString(),
    priority: 'high',
    isRead: false,
  },
  {
    _id: 'notif-2',
    title: 'Faculty Classroom Sessions',
    message: 'Faculty can start attendance sessions with static QR codes. Once session time ends, unmarked students are marked absent automatically.',
    date: new Date(Date.now() - 86400000).toISOString(),
    priority: 'normal',
    isRead: true,
  },
];

class StoreService {
  private db: CampusDatabase;
  private listeners: Set<() => void> = new Set();
  private channel: BroadcastChannel | null = null;

  constructor() {
    this.db = this.loadDatabase();

    if (typeof window !== 'undefined') {
      try {
        this.channel = new BroadcastChannel('attendly_sync_channel_v3');
        this.channel.onmessage = (event) => {
          if (event.data?.type === 'STORE_UPDATED') {
            this.db = this.loadDatabase();
            this.emitChange();
          }
        };
      } catch {
        // Fallback for environments where BroadcastChannel is unavailable
      }

      window.addEventListener('storage', (e) => {
        if (e.key === STORAGE_KEY) {
          this.db = this.loadDatabase();
          this.emitChange();
        }
      });
    }

    // Auto-expire check periodically
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.checkAndExpireSessions();
      }, 5000);
    }
  }

  private loadDatabase(): CampusDatabase {
    if (typeof window === 'undefined') {
      return this.getInitialData();
    }
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.users && parsed.users.length >= 30 && parsed.departments && parsed.sessions) {
          return parsed;
        }
      }
    } catch (err) {
      console.warn('Failed to parse database from localStorage:', err);
    }
    const initial = this.getInitialData();
    this.saveDatabase(initial);
    return initial;
  }

  private getInitialData(): CampusDatabase {
    return {
      users: SEED_USERS,
      departments: SEED_DEPARTMENTS,
      classes: SEED_CLASSES,
      subjects: SEED_SUBJECTS,
      assignments: SEED_ASSIGNMENTS,
      enrollments: SEED_ENROLLMENTS,
      timetable: SEED_TIMETABLE,
      sessions: generateSeedSessions(),
      settings: DEFAULT_SETTINGS,
      audit: SEED_AUDIT,
      notifications: SEED_NOTIFICATIONS,
    };
  }

  private saveDatabase(data: CampusDatabase) {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      this.channel?.postMessage({ type: 'STORE_UPDATED' });
    } catch (err) {
      console.error('Failed to save to localStorage:', err);
    }
  }

  private persistAndNotify() {
    this.saveDatabase(this.db);
    this.emitChange();
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  private emitChange() {
    this.listeners.forEach((fn) => fn());
  }

  // --- GETTERS ---
  public getSnapshot(): CampusDatabase {
    this.checkAndExpireSessions();
    return this.db;
  }

  public getUsers(): User[] {
    return [...this.db.users];
  }

  public getDepartments(): Department[] {
    return [...this.db.departments];
  }

  public getClasses(): ClassRoom[] {
    return [...this.db.classes];
  }

  public getSubjects(): Subject[] {
    return [...this.db.subjects];
  }

  public getAssignments(): TeachingAssignment[] {
    return [...this.db.assignments];
  }

  public getEnrollments(): StudentEnrollment[] {
    return [...this.db.enrollments];
  }

  public getTimetable(): TimetablePeriod[] {
    return [...this.db.timetable];
  }

  public getSessions(): AttendanceSession[] {
    this.checkAndExpireSessions();
    return [...this.db.sessions];
  }

  public getSettings(): CampusSettings {
    return { ...this.db.settings };
  }

  public getAuditLogs(): AuditLog[] {
    return [...this.db.audit];
  }

  public getNotifications(): NotificationItem[] {
    return [...this.db.notifications];
  }

  // --- AUTHENTICATION ---
  // Common login: accepts email, username, or code / register number (e.g. admin, faculty, REG2024-001)
  public authenticateUser(identifier: string): User | null {
    const clean = identifier.trim().toLowerCase();
    if (!clean) return null;

    const user = this.db.users.find((u) => {
      if (!u.isActive) return false;
      if (u.email.toLowerCase() === clean) return true;
      if (u.code.toLowerCase() === clean) return true;
      const username = u.email.split('@')[0].toLowerCase();
      if (username === clean) return true;
      // Role shortcuts:
      if (clean === 'admin' && u.role === 'admin') return true;
      if (clean === 'faculty' && u.code === 'FAC101') return true;
      if (clean === 'student' && u.code === 'MCA2024-001') return true;
      if (clean === 'mca' && u.code === 'MCA2024-001') return true;
      if (clean === 'msc' && u.code === 'MSC2024-001') return true;
      if (clean === 'mds' && u.code === 'MDS2024-001') return true;
      return false;
    });

    if (user) {
      this.addAuditLog(
        `${user.name} (${user.code})`,
        'LOGIN',
        `User logged into ${user.role} workspace.`
      );
      return user;
    }
    return null;
  }

  // --- AUDIT LOGS ---
  public addAuditLog(actor: string, action: string, details: string) {
    const log: AuditLog = {
      _id: 'aud-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      timestamp: new Date().toISOString(),
      actor,
      action,
      details,
      ip: '127.0.0.1 (Campus LAN)',
    };
    this.db.audit.unshift(log);
    if (this.db.audit.length > 200) {
      this.db.audit.pop();
    }
    this.persistAndNotify();
  }

  // --- ATTENDANCE ELIGIBILITY REPORT ENGINE ---
  // Calculates for all students:
  // 1. Student ID (Register Number)
  // 2. Student Name
  // 3. Department
  // 4. Marks (Out of 100)
  // 5. Total Working Days
  // 6. Total Present Days
  // 7. Attendance Percentage = (Total Present Days / Total Working Days) * 100
  // 8. Examination Eligibility Status:
  //    - >= 75%: "Eligible to Exam" (Green)
  //    - < 75%: "Not Eligible" (Red)
  public getAttendanceEligibilityReport(): StudentEligibilityReportItem[] {
    const students = this.db.users.filter((u) => u.role === 'student');
    const threshold = this.db.settings.threshold || 75;

    return students.map((student) => {
      const studentClass = this.db.classes.find((c) => c._id === student.classId);
      const studentDeptId = student.departmentId || studentClass?.departmentId || '';
      const studentDept = this.db.departments.find((d) => d._id === studentDeptId);

      // Student enrolled assignments
      const studentEnrolledAssignmentIds = new Set(
        this.db.enrollments
          .filter((e) => e.studentId === student._id && e.isActive)
          .map((e) => e.assignmentId)
      );

      // If student is in class-1, check assignments for that class
      if (student.classId) {
        this.db.assignments
          .filter((a) => a.classId === student.classId && a.isActive)
          .forEach((a) => studentEnrolledAssignmentIds.add(a._id));
      }

      // Collect all sessions held for this class / assignments
      const relevantSessions = this.db.sessions.filter(
        (s) =>
          studentEnrolledAssignmentIds.has(s.assignmentId) &&
          s.status !== 'cancelled'
      );

      // Distinct calendar dates when sessions took place = Total Working Days
      const workingDateSet = new Set<string>();
      relevantSessions.forEach((s) => {
        const d = s.startsAt.split('T')[0];
        workingDateSet.add(d);
      });
      const totalWorkingDays = workingDateSet.size;

      // Calculate Total Present Days:
      // Includes 'present', 'late', 'on_duty', 'permission'
      const presentDateSet = new Set<string>();
      relevantSessions.forEach((s) => {
        const d = s.startsAt.split('T')[0];
        const record = s.records.find((r) => r.studentId === student._id);
        if (
          record &&
          (record.status === 'present' ||
            record.status === 'late' ||
            record.status === 'on_duty' ||
            record.status === 'permission')
        ) {
          presentDateSet.add(d);
        }
      });
      const totalPresentDays = presentDateSet.size;

      let attendancePercentage = 0;
      if (totalWorkingDays > 0) {
        attendancePercentage =
          Math.round((totalPresentDays / totalWorkingDays) * 1000) / 10;
      }

      const isEligible =
        totalWorkingDays > 0 ? attendancePercentage >= threshold : false;

      return {
        studentId: student.code,
        studentDbId: student._id,
        studentName: student.name,
        department: studentDept ? studentDept.name : 'Department of Computer Science',
        departmentId: studentDeptId || 'dept-cs',
        classId: student.classId,
        className: studentClass ? studentClass.name : 'MCA (Master of Computer Applications)',
        marks: student.marks !== undefined ? student.marks : 80,
        totalWorkingDays,
        totalPresentDays,
        attendancePercentage,
        isEligible,
      };
    });
  }

  // --- AUTOMATIC SESSION EXPIRATION & ABSENT MARKING ---
  public checkAndExpireSessions(): boolean {
    const now = Date.now();
    let changed = false;

    for (const session of this.db.sessions) {
      if (session.status === 'active' && session.tokenExpiresAt && now >= session.tokenExpiresAt) {
        // Mark all unmarked enrolled students as 'absent'
        this.finalizeAbsentForSession(session, 'Time expired - Session concluded automatically');
        session.status = 'completed';
        changed = true;
      }
    }

    if (changed) {
      this.persistAndNotify();
    }
    return changed;
  }

  private finalizeAbsentForSession(session: AttendanceSession, reason: string) {
    const assignment = this.db.assignments.find((a) => a._id === session.assignmentId);
    if (!assignment) return;

    // Get all enrolled students for this assignment / class
    const enrolledStudentIds = new Set<string>();
    this.db.enrollments
      .filter((e) => e.assignmentId === assignment._id && e.isActive)
      .forEach((e) => enrolledStudentIds.add(e.studentId));

    if (assignment.classId) {
      this.db.users
        .filter((u) => u.role === 'student' && u.classId === assignment.classId && u.isActive)
        .forEach((u) => enrolledStudentIds.add(u._id));
    }

    const recordedStudentIds = new Set(session.records.map((r) => r.studentId));

    enrolledStudentIds.forEach((studentId) => {
      if (!recordedStudentIds.has(studentId)) {
        session.records.push({
          _id: 'rec-abs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          sessionId: session._id,
          studentId,
          status: 'absent',
          markedAt: new Date().toISOString(),
          method: 'Auto-Absent',
          reason,
        });
      }
    });
  }

  // --- STATIC QR CODE ATTENDANCE SESSIONS (FACULTY) ---
  public createAttendanceSession(
    assignmentId: string,
    facultyId: string,
    durationMinutes: number = 10
  ): AttendanceSession {
    const assignment = this.db.assignments.find((a) => a._id === assignmentId);
    if (!assignment) {
      throw new Error('Teaching assignment not found.');
    }

    const sessionId = 'sess-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
    const now = Date.now();
    const token = this.generateToken(sessionId, 0);
    const endsAtTime = now + durationMinutes * 60 * 1000;

    const newSession: AttendanceSession = {
      _id: sessionId,
      assignmentId,
      facultyId,
      startsAt: new Date(now).toISOString(),
      endsAt: new Date(endsAtTime).toISOString(),
      durationMinutes,
      status: 'active',
      qrToken: token,
      tokenExpiresAt: endsAtTime,
      rotationCount: 0,
      records: [],
    };

    this.db.sessions.unshift(newSession);

    const faculty = this.db.users.find((u) => u._id === facultyId);
    const subject = this.db.subjects.find((s) => s._id === assignment.subjectId);
    const cls = this.db.classes.find((c) => c._id === assignment.classId);

    this.addAuditLog(
      faculty ? `${faculty.name} (${faculty.code})` : 'Faculty',
      'SESSION_STARTED',
      `Attendance session started for ${subject?.name || 'Subject'} (${cls?.name || 'Class'}). Duration: ${durationMinutes} mins.`
    );

    this.persistAndNotify();
    return newSession;
  }

  private generateToken(sessionId: string, counter: number): string {
    const salt = Math.random().toString(36).substring(2, 8).toUpperCase();
    return `ATND-${sessionId.slice(-6)}-${counter}-${salt}`;
  }

  public endAttendanceSession(sessionId: string, actorName: string): AttendanceSession {
    const session = this.db.sessions.find((s) => s._id === sessionId);
    if (!session) {
      throw new Error('Session not found.');
    }

    // Mark remaining unmarked students as absent
    this.finalizeAbsentForSession(session, 'Unmarked on faculty session closure');
    session.status = 'completed';

    this.addAuditLog(
      actorName,
      'SESSION_ENDED',
      `Attendance session completed with ${session.records.length} records.`
    );

    this.persistAndNotify();
    return session;
  }

  // Mark attendance via QR scanning (Student workflow)
  public markAttendanceViaQR(
    studentId: string,
    qrPayload: string
  ): {
    record: AttendanceRecord;
    alreadyMarked?: boolean;
    session: AttendanceSession;
    subjectName: string;
  } {
    const student = this.db.users.find((u) => u._id === studentId && u.role === 'student');
    if (!student) {
      throw new Error('Valid student profile required.');
    }

    let parsed: { sessionId: string; token: string } | null = null;
    try {
      if (qrPayload.startsWith('{')) {
        parsed = JSON.parse(qrPayload);
      } else {
        const parts = qrPayload.split(':');
        if (parts.length >= 2) {
          parsed = { sessionId: parts[0], token: parts[1] };
        }
      }
    } catch {
      const matchedSession = this.db.sessions.find(
        (s) => s.status === 'active' && s.qrToken === qrPayload.trim()
      );
      if (matchedSession) {
        parsed = { sessionId: matchedSession._id, token: matchedSession.qrToken };
      }
    }

    if (!parsed || !parsed.sessionId || !parsed.token) {
      throw new Error('Invalid QR code format. Please scan the official classroom QR code.');
    }

    const session = this.db.sessions.find((s) => s._id === parsed.sessionId);
    if (!session) {
      throw new Error('Attendance session does not exist.');
    }

    if (session.status !== 'active' || (session.tokenExpiresAt && Date.now() > session.tokenExpiresAt)) {
      if (session.status === 'active') {
        this.finalizeAbsentForSession(session, 'Time expired - Session concluded');
        session.status = 'completed';
        this.persistAndNotify();
      }
      throw new Error('This attendance session has ended and is no longer accepting submissions.');
    }

    // Validate QR code match
    if (session.qrToken !== parsed.token) {
      throw new Error('This QR code is invalid for the active session.');
    }

    // Verify student eligibility / enrollment in this assignment
    const assignment = this.db.assignments.find((a) => a._id === session.assignmentId);
    if (!assignment) {
      throw new Error('Associated academic course assignment not found.');
    }

    const isEnrolled =
      (student.classId && student.classId === assignment.classId) ||
      this.db.enrollments.some(
        (e) => e.studentId === student._id && e.assignmentId === assignment._id && e.isActive
      );

    if (!isEnrolled) {
      throw new Error('You are not enrolled in this subject and class.');
    }

    // Check duplicate attendance:
    const existing = session.records.find((r) => r.studentId === student._id);
    if (existing) {
      const subject = this.db.subjects.find((s) => s._id === assignment.subjectId);
      return {
        record: existing,
        alreadyMarked: true,
        session,
        subjectName: subject?.name || 'Class',
      };
    }

    const newRecord: AttendanceRecord = {
      _id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      sessionId: session._id,
      studentId: student._id,
      status: 'present',
      markedAt: new Date().toISOString(),
      method: 'QR Code',
    };

    session.records.push(newRecord);

    const subject = this.db.subjects.find((s) => s._id === assignment.subjectId);

    this.addAuditLog(
      `${student.name} (${student.code})`,
      'ATTENDANCE_MARKED',
      `Attendance marked as PRESENT via QR code for ${subject?.name || 'Course'}.`
    );

    this.persistAndNotify();

    return {
      record: newRecord,
      alreadyMarked: false,
      session,
      subjectName: subject?.name || 'Class',
    };
  }

  // Manual attendance override (Faculty or Admin)
  // Supports: present, absent, excused, on_duty, permission
  public updateStudentAttendance(
    sessionId: string,
    studentId: string,
    status: AttendanceStatus,
    reason: string = '',
    actorName: string
  ): AttendanceRecord {
    const session = this.db.sessions.find((s) => s._id === sessionId);
    if (!session) {
      throw new Error('Session not found.');
    }

    const student = this.db.users.find((u) => u._id === studentId);
    let record = session.records.find((r) => r.studentId === studentId);

    if (record) {
      record.status = status;
      record.reason = reason;
      record.method = 'Manual';
    } else {
      record = {
        _id: 'rec-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        sessionId: session._id,
        studentId,
        status,
        markedAt: new Date().toISOString(),
        method: 'Manual',
        reason,
      };
      session.records.push(record);
    }

    this.addAuditLog(
      actorName,
      'ATTENDANCE_OVERRIDE',
      `Updated attendance for ${student?.name || 'Student'} to ${status.toUpperCase()}. Reason: "${reason || 'Direct adjustment'}"`
    );

    this.persistAndNotify();
    return record;
  }

  // --- ENTITY MANAGEMENT (ADMIN MODULE) ---
  public addUser(user: Omit<User, '_id'>, actorName: string): User {
    // If attempting to add another admin, verify requirement: Only one admin allowed
    if (user.role === 'admin') {
      const existingAdmin = this.db.users.find((u) => u.role === 'admin');
      if (existingAdmin) {
        throw new Error('Only one administrator account is permitted in the system.');
      }
    }

    const newUser: User = {
      ...user,
      _id: 'usr-' + (user.role === 'student' ? 'stu-' : user.role === 'faculty' ? 'fac-' : 'adm-') + Date.now(),
      marks: user.marks !== undefined ? user.marks : user.role === 'student' ? 75 : undefined,
    };
    this.db.users.push(newUser);

    // If student, automatically enroll into assignments for their class
    if (newUser.role === 'student' && newUser.classId) {
      const classAssignments = this.db.assignments.filter((a) => a.classId === newUser.classId);
      classAssignments.forEach((a) => {
        this.db.enrollments.push({
          _id: 'enr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          studentId: newUser._id,
          assignmentId: a._id,
          isActive: true,
        });
      });
    }

    this.addAuditLog(
      actorName,
      'USER_CREATED',
      `Created ${newUser.role} account for ${newUser.name} (${newUser.code}).`
    );
    this.persistAndNotify();
    return newUser;
  }

  public updateUser(id: string, updates: Partial<User>, actorName: string): User {
    const user = this.db.users.find((u) => u._id === id);
    if (!user) throw new Error('User not found.');
    Object.assign(user, updates);
    this.addAuditLog(actorName, 'USER_UPDATED', `Updated account details for ${user.name} (${user.code}).`);
    this.persistAndNotify();
    return user;
  }

  public deleteUser(id: string, actorName: string): boolean {
    const user = this.db.users.find((u) => u._id === id);
    if (!user) throw new Error('User not found.');

    if (user.role === 'admin') {
      throw new Error('The primary administrator account cannot be deleted.');
    }

    this.db.users = this.db.users.filter((u) => u._id !== id);
    // Clean up enrollments
    this.db.enrollments = this.db.enrollments.filter((e) => e.studentId !== id);

    this.addAuditLog(actorName, 'USER_DELETED', `Deleted ${user.role} account: ${user.name} (${user.code}).`);
    this.persistAndNotify();
    return true;
  }

  public resetUserPassword(id: string, reason: string, actorName: string): string {
    const user = this.db.users.find((u) => u._id === id);
    if (!user) throw new Error('User not found.');
    user.mustChangePassword = true;
    this.addAuditLog(
      actorName,
      'PASSWORD_RESET',
      `Reset credentials for ${user.name}. Reason: ${reason}`
    );
    this.persistAndNotify();
    return 'Password reset link dispatched.';
  }

  public importStudents(
    students: Array<{ name: string; email: string; code: string; marks?: number }>,
    classId: string,
    actorName: string
  ): number {
    const targetClass = this.db.classes.find((c) => c._id === classId);
    let count = 0;
    students.forEach((s) => {
      if (s.name && s.email && s.code) {
        const studentId = 'usr-stu-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6);
        this.db.users.push({
          _id: studentId,
          name: s.name.trim(),
          email: s.email.trim().toLowerCase(),
          role: 'student',
          code: s.code.trim().toUpperCase(),
          classId,
          departmentId: targetClass?.departmentId,
          marks: s.marks !== undefined ? s.marks : 80,
          isActive: true,
          mustChangePassword: true,
        });

        // Auto enroll
        this.db.assignments
          .filter((a) => a.classId === classId)
          .forEach((a) => {
            this.db.enrollments.push({
              _id: 'enr-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
              studentId,
              assignmentId: a._id,
              isActive: true,
            });
          });

        count++;
      }
    });

    this.addAuditLog(
      actorName,
      'BULK_STUDENT_IMPORT',
      `Imported ${count} students into class ${targetClass?.name || classId}.`
    );

    this.persistAndNotify();
    return count;
  }

  // Academics management
  public addDepartment(name: string, code: string, actorName: string): Department {
    const dept: Department = {
      _id: 'dept-' + Date.now(),
      name,
      code: code.toUpperCase(),
    };
    this.db.departments.push(dept);
    this.addAuditLog(actorName, 'DEPARTMENT_CREATED', `Added department ${name} (${code}).`);
    this.persistAndNotify();
    return dept;
  }

  public addClass(data: Omit<ClassRoom, '_id'>, actorName: string): ClassRoom {
    const cls: ClassRoom = {
      ...data,
      _id: 'class-' + Date.now(),
    };
    this.db.classes.push(cls);
    this.addAuditLog(actorName, 'CLASS_CREATED', `Created class ${cls.name}.`);
    this.persistAndNotify();
    return cls;
  }

  public addSubject(data: Omit<Subject, '_id'>, actorName: string): Subject {
    const subj: Subject = {
      ...data,
      _id: 'subj-' + Date.now(),
    };
    this.db.subjects.push(subj);
    this.addAuditLog(actorName, 'SUBJECT_CREATED', `Added subject ${subj.name} (${subj.code}).`);
    this.persistAndNotify();
    return subj;
  }

  public addAssignment(data: Omit<TeachingAssignment, '_id'>, actorName: string): TeachingAssignment {
    const assign: TeachingAssignment = {
      ...data,
      _id: 'assign-' + Date.now(),
    };
    this.db.assignments.push(assign);
    this.addAuditLog(actorName, 'TEACHING_ASSIGNMENT_CREATED', 'New faculty teaching assignment saved.');
    this.persistAndNotify();
    return assign;
  }

  public addEnrollment(data: Omit<StudentEnrollment, '_id'>, actorName: string): StudentEnrollment {
    const enr: StudentEnrollment = {
      ...data,
      _id: 'enr-' + Date.now(),
    };
    this.db.enrollments.push(enr);
    this.addAuditLog(actorName, 'ENROLLMENT_SAVED', 'Student enrolled into course assignment.');
    this.persistAndNotify();
    return enr;
  }

  public addTimetablePeriod(data: Omit<TimetablePeriod, '_id'>, actorName: string): TimetablePeriod {
    const period: TimetablePeriod = {
      ...data,
      _id: 'tt-' + Date.now(),
    };
    this.db.timetable.push(period);
    this.addAuditLog(actorName, 'TIMETABLE_PERIOD_ADDED', `Class scheduled on day ${data.day} in ${data.room}.`);
    this.persistAndNotify();
    return period;
  }

  public deleteTimetablePeriod(id: string, actorName: string) {
    this.db.timetable = this.db.timetable.filter((t) => t._id !== id);
    this.addAuditLog(actorName, 'TIMETABLE_PERIOD_REMOVED', `Removed timetable period ${id}.`);
    this.persistAndNotify();
  }

  public updateSettings(settings: Partial<CampusSettings>, actorName: string) {
    Object.assign(this.db.settings, settings);
    this.addAuditLog(actorName, 'SETTINGS_UPDATED', 'Updated campus attendance policies.');
    this.persistAndNotify();
  }

  public addNotification(title: string, message: string, priority: 'low' | 'normal' | 'high', actorName: string) {
    const notif: NotificationItem = {
      _id: 'notif-' + Date.now(),
      title,
      message,
      date: new Date().toISOString(),
      priority,
      isRead: false,
    };
    this.db.notifications.unshift(notif);
    this.addAuditLog(actorName, 'NOTIFICATION_PUBLISHED', `Broadcasted notice: "${title}".`);
    this.persistAndNotify();
  }

  // Reset database to pristine state if needed
  public resetToDefault(actorName: string) {
    this.db = this.getInitialData();
    this.addAuditLog(actorName, 'DATABASE_RESET', 'Database reset to default seed data.');
    this.persistAndNotify();
  }
}

export const store = new StoreService();
