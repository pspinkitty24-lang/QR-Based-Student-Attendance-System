import React, { useState, useMemo } from 'react';
import {
  FileText,
  Download,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Info,
  Calendar,
  Building2,
  GraduationCap,
  Award,
} from 'lucide-react';
import { User, StudentEligibilityReportItem } from '../types';
import { store } from '../services/store';
import { StatusBadge } from '../components/StatusBadge';

interface ReportsProps {
  user: User;
  notify?: (msg: string) => void;
}

export const Reports: React.FC<ReportsProps> = ({ user, notify }) => {
  // Tabs: 'eligibility', 'summary', 'records'
  const [activeTab, setActiveTab] = useState<'eligibility' | 'summary' | 'records'>('eligibility');

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDeptId, setSelectedDeptId] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<'all' | 'eligible' | 'ineligible'>('all');
  const [selectedClassId, setSelectedClassId] = useState('');
  const [selectedSubjectId, setSelectedSubjectId] = useState('');

  const [version, setVersion] = useState(0);

  React.useEffect(() => {
    return store.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, []);

  const departments = store.getDepartments();
  const classes = store.getClasses();
  const subjects = store.getSubjects();
  const sessions = store.getSessions();
  const settings = store.getSettings();
  const users = store.getUsers();

  // 1. Fetch Eligibility Data (Reactivity: updates whenever sessions or records change)
  const rawEligibilityData = useMemo(() => {
    return store.getAttendanceEligibilityReport();
  }, [sessions, users, version]);

  // If student is viewing, filter to only their own record
  const eligibilityData = useMemo(() => {
    if (user.role === 'student') {
      return rawEligibilityData.filter((item) => item.studentDbId === user._id);
    }
    return rawEligibilityData;
  }, [rawEligibilityData, user]);

  // Filtered Eligibility Data
  const filteredEligibility = useMemo(() => {
    return eligibilityData.filter((item) => {
      // Department filter
      if (selectedDeptId && item.departmentId !== selectedDeptId) {
        return false;
      }
      // Class filter
      if (selectedClassId && item.classId !== selectedClassId) {
        return false;
      }
      // Status filter
      if (selectedStatus === 'eligible' && !item.isEligible) {
        return false;
      }
      if (selectedStatus === 'ineligible' && item.isEligible) {
        return false;
      }
      // Search query (Student Name, Student ID, or Department)
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchName = item.studentName.toLowerCase().includes(query);
        const matchId = item.studentId.toLowerCase().includes(query);
        const matchDept = item.department.toLowerCase().includes(query);
        const matchClass = item.className?.toLowerCase().includes(query);
        if (!matchName && !matchId && !matchDept && !matchClass) return false;
      }
      return true;
    });
  }, [eligibilityData, selectedDeptId, selectedClassId, selectedStatus, searchQuery]);

  // 2. Subject Summary Data
  const summaryData = useMemo(() => {
    const rows: Array<{
      key: string;
      studentName: string;
      studentCode: string;
      subjectName: string;
      attended: number;
      total: number;
      excused: number;
      percentage: number;
      standing: 'on track' | 'at risk';
    }> = [];

    const students = users.filter((u) => u.role === 'student');

    students.forEach((student) => {
      if (user.role === 'student' && student._id !== user._id) return;

      subjects.forEach((subj) => {
        const assignmentsForSubj = store
          .getAssignments()
          .filter((a) => a.subjectId === subj._id);
        const assignIds = new Set(assignmentsForSubj.map((a) => a._id));

        const relevantSessions = sessions.filter(
          (s) => assignIds.has(s.assignmentId) && s.status === 'completed'
        );

        if (relevantSessions.length === 0) return;

        let attended = 0;
        let excused = 0;

        relevantSessions.forEach((s) => {
          const rec = s.records.find((r) => r.studentId === student._id);
          if (rec) {
            if (
              rec.status === 'present' ||
              rec.status === 'late' ||
              rec.status === 'on_duty' ||
              rec.status === 'permission'
            ) {
              attended++;
            }
            if (rec.status === 'excused') excused++;
          }
        });

        const effectiveTotal = Math.max(1, relevantSessions.length - excused);
        const pct = Math.round((attended / effectiveTotal) * 1000) / 10;

        rows.push({
          key: `${student._id}-${subj._id}`,
          studentName: student.name,
          studentCode: student.code,
          subjectName: subj.name,
          attended,
          total: relevantSessions.length,
          excused,
          percentage: pct,
          standing: pct >= settings.threshold ? 'on track' : 'at risk',
        });
      });
    });

    return rows;
  }, [sessions, users, subjects, user, settings.threshold]);

  const filteredSummary = useMemo(() => {
    return summaryData.filter((r) => {
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (
          !r.studentName.toLowerCase().includes(q) &&
          !r.studentCode.toLowerCase().includes(q) &&
          !r.subjectName.toLowerCase().includes(q)
        ) {
          return false;
        }
      }
      return true;
    });
  }, [summaryData, searchQuery]);

  // 3. Detailed Records Data
  const detailedRecords = useMemo(() => {
    const list: Array<{
      _id: string;
      date: string;
      studentName: string;
      studentCode: string;
      subjectName: string;
      status: string;
      method: string;
      reason?: string;
    }> = [];

    sessions.forEach((s) => {
      const a = store.getAssignments().find((item) => item._id === s.assignmentId);
      const subj = subjects.find((sub) => sub._id === a?.subjectId);

      s.records.forEach((r) => {
        const student = users.find((u) => u._id === r.studentId);
        if (!student) return;
        if (user.role === 'student' && student._id !== user._id) return;

        list.push({
          _id: r._id,
          date: s.startsAt,
          studentName: student.name,
          studentCode: student.code,
          subjectName: subj?.name || 'Class Lecture',
          status: r.status,
          method: r.method,
          reason: r.reason,
        });
      });
    });

    return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [sessions, users, subjects, user]);

  // CSV Export utility
  const exportToCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,';

    if (activeTab === 'eligibility') {
      csvContent += 'Student ID,Student Name,Class,Department,Marks (100),Total Working Days,Total Present Days,Attendance Percentage,Examination Eligibility Status\n';
      filteredEligibility.forEach((row) => {
        const statusText = row.isEligible ? 'Eligible to Exam' : 'Not Eligible';
        csvContent += `"${row.studentId}","${row.studentName}","${row.className || 'Class'}","${row.department}",${row.marks},${row.totalWorkingDays},${row.totalPresentDays},${row.attendancePercentage}%,${statusText}\n`;
      });
    } else if (activeTab === 'summary') {
      csvContent += 'Student Name,Student Code,Subject,Attended,Total,Excused,Attendance %,Standing\n';
      filteredSummary.forEach((row) => {
        csvContent += `"${row.studentName}","${row.studentCode}","${row.subjectName}",${row.attended},${row.total},${row.excused},${row.percentage}%,${row.standing}\n`;
      });
    } else {
      csvContent += 'Date,Student Name,Student Code,Subject,Status,Method,Reason\n';
      detailedRecords.forEach((row) => {
        csvContent += `"${row.date}","${row.studentName}","${row.studentCode}","${row.subjectName}","${row.status}","${row.method}","${row.reason || ''}"\n`;
      });
    }

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `attendly_${activeTab}_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    if (notify) notify('Report exported as CSV successfully.');
  };

  const handlePrint = () => {
    window.print();
  };

  // Eligibility summary metrics (reacts to filtered list e.g. chosen class)
  const totalStudents = filteredEligibility.length;
  const eligibleCount = filteredEligibility.filter((s) => s.isEligible).length;
  const ineligibleCount = totalStudents - eligibleCount;
  const eligibilityPercentage =
    totalStudents > 0 ? Math.round((eligibleCount / totalStudents) * 100) : 0;

  const avgMarks =
    totalStudents > 0
      ? Math.round(
          filteredEligibility.reduce((acc, curr) => acc + (curr.marks || 0), 0) / totalStudents
        )
      : 0;

  const selectedClassObj = classes.find((c) => c._id === selectedClassId);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMIC AUDIT & INSIGHTS</span>
          <h1>
            {user.role === 'student'
              ? 'Your attendance & exam eligibility'
              : selectedClassObj
              ? `${selectedClassObj.name} · Reports & exam eligibility`
              : 'Reports & exam eligibility'}
          </h1>
          <p>
            Attendance percentages, academic marks, and examination eligibility status (Minimum requirement: {settings.threshold}%).
          </p>
        </div>

        <div className="heading-actions">
          <button className="button" onClick={handlePrint}>
            <FileText size={16} />
            <span>PDF Print</span>
          </button>
          <button className="button primary" onClick={exportToCSV}>
            <Download size={16} />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Prominent Class Selector Bar for Admin & Faculty */}
      {user.role !== 'student' && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            flexWrap: 'wrap',
            padding: '12px 18px',
            backgroundColor: '#ffffff',
            borderRadius: 8,
            border: '1px solid #dce4d7',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginRight: 6 }}>
            <GraduationCap size={18} color="#164d40" />
            <span style={{ fontSize: 13, fontWeight: 700, color: '#164d40', letterSpacing: '0.2px' }}>
              Select Class:
            </span>
          </div>

          <button
            type="button"
            onClick={() => setSelectedClassId('')}
            style={{
              padding: '7px 15px',
              borderRadius: 6,
              fontSize: 12,
              fontWeight: 600,
              cursor: 'pointer',
              border: selectedClassId === '' ? '1.5px solid #164d40' : '1px solid #dce4d7',
              backgroundColor: selectedClassId === '' ? '#164d40' : '#f8faf7',
              color: selectedClassId === '' ? '#ffffff' : '#314c42',
              transition: 'all 0.15s ease',
              display: 'flex',
              alignItems: 'center',
              gap: 6,
            }}
          >
            <span>All Classes</span>
            <span
              style={{
                fontSize: 11,
                padding: '1px 6px',
                borderRadius: 10,
                backgroundColor: selectedClassId === '' ? 'rgba(255,255,255,0.25)' : '#e4ece0',
                color: selectedClassId === '' ? '#ffffff' : '#234438',
                fontWeight: 700,
              }}
            >
              {rawEligibilityData.length}
            </span>
          </button>

          {classes.map((cls) => {
            const isSelected = selectedClassId === cls._id;
            const count = rawEligibilityData.filter((i) => i.classId === cls._id).length;
            return (
              <button
                key={cls._id}
                type="button"
                onClick={() => setSelectedClassId(cls._id)}
                style={{
                  padding: '7px 15px',
                  borderRadius: 6,
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                  border: isSelected ? '1.5px solid #164d40' : '1px solid #dce4d7',
                  backgroundColor: isSelected ? '#164d40' : '#f8faf7',
                  color: isSelected ? '#ffffff' : '#314c42',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s ease',
                }}
              >
                <span>{cls.name}</span>
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 10,
                    backgroundColor: isSelected ? 'rgba(255,255,255,0.25)' : '#e4ece0',
                    color: isSelected ? '#ffffff' : '#234438',
                    fontWeight: 700,
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      )}

      {/* Filter Bar */}
      {user.role !== 'student' && (
        <div className="panel filters">
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Department
            </label>
            <select
              value={selectedDeptId}
              onChange={(e) => setSelectedDeptId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All departments</option>
              {departments.map((d) => (
                <option key={d._id} value={d._id}>
                  {d.name} ({d.code})
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Eligibility status
            </label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value as any)}
              style={{ width: '100%' }}
            >
              <option value="all">All statuses</option>
              <option value="eligible">Eligible to Exam (≥ 75%)</option>
              <option value="ineligible">Not Eligible (&lt; 75%)</option>
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Class section
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All classes</option>
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Subject
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              style={{ width: '100%' }}
            >
              <option value="">All subjects</option>
              {subjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.code})
                </option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'eligibility' ? 'active' : ''}
          onClick={() => setActiveTab('eligibility')}
        >
          Exam eligibility & marks
        </button>
        <button
          className={activeTab === 'summary' ? 'active' : ''}
          onClick={() => setActiveTab('summary')}
        >
          Subject summary
        </button>
        <button
          className={activeTab === 'records' ? 'active' : ''}
          onClick={() => setActiveTab('records')}
        >
          Detailed records
        </button>
      </div>

      {/* TAB 1: ATTENDANCE & EXAM ELIGIBILITY REPORT */}
      {activeTab === 'eligibility' && (
        <section className="panel">
          {/* Quick Stats Ribbon */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
              gap: 16,
              padding: '18px 24px',
              backgroundColor: '#fafbf9',
              borderBottom: '1px solid #e6ebe5',
            }}
          >
            <div>
              <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Total Students
              </span>
              <strong style={{ display: 'block', fontSize: 24, color: '#164d40', marginTop: 2 }}>
                {totalStudents}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Eligible to Exam (≥ 75%)
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 2 }}>
                <strong style={{ fontSize: 24, color: '#166534' }}>{eligibleCount}</strong>
                <span
                  style={{
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 12,
                    backgroundColor: '#dcfce7',
                    color: '#166534',
                  }}
                >
                  {eligibilityPercentage}%
                </span>
              </div>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Not Eligible (&lt; 75%)
              </span>
              <strong style={{ display: 'block', fontSize: 24, color: '#991b1b', marginTop: 2 }}>
                {ineligibleCount}
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Average Marks
              </span>
              <strong style={{ display: 'block', fontSize: 24, color: '#0369a1', marginTop: 2 }}>
                {avgMarks} / 100
              </strong>
            </div>

            <div>
              <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                Mandatory Policy
              </span>
              <span style={{ display: 'block', fontSize: 13, color: '#3d5c52', fontWeight: 600, marginTop: 4 }}>
                ≥ {settings.threshold}% Working Days
              </span>
            </div>
          </div>

          <div className="panel-title">
            <div>
              <h2>Examination eligibility & marks roster</h2>
              <p>
                Displaying student marks, working days, attendance percentage, and exam eligibility status.
              </p>
            </div>
            {user.role !== 'student' && (
              <div className="search-box">
                <Search size={16} />
                <input
                  aria-label="Search eligibility report"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search student ID, name or department…"
                />
              </div>
            )}
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT ID (REG NO)</th>
                  <th>STUDENT NAME</th>
                  <th>DEPARTMENT</th>
                  <th>MARKS (100)</th>
                  <th>WORKING DAYS</th>
                  <th>PRESENT DAYS</th>
                  <th>ATTENDANCE %</th>
                  <th>EXAM ELIGIBILITY STATUS</th>
                </tr>
              </thead>
              <tbody>
                {filteredEligibility.length === 0 ? (
                  <tr>
                    <td colSpan={8} style={{ textAlign: 'center', padding: '36px 20px', color: '#89948e' }}>
                      No student records found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filteredEligibility.map((item) => {
                    const isEligible = item.isEligible;
                    return (
                      <tr key={item.studentDbId}>
                        <td>
                          <span className="mono" style={{ fontWeight: 600, color: '#164d40' }}>
                            {item.studentId}
                          </span>
                        </td>
                        <td>
                          <strong>{item.studentName}</strong>
                          <small style={{ display: 'block', color: '#89948e' }}>
                            {item.className}
                          </small>
                        </td>
                        <td>{item.department}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Award size={14} color="#0369a1" />
                            <strong style={{ color: '#0369a1', fontSize: 13 }}>
                              {item.marks} / 100
                            </strong>
                          </div>
                        </td>
                        <td>
                          <strong>{item.totalWorkingDays} days</strong>
                        </td>
                        <td>
                          <strong>{item.totalPresentDays} days</strong>
                        </td>
                        <td>
                          <div className="percentage">
                            <div className="progress-track">
                              <i
                                style={{
                                  width: `${Math.min(100, item.attendancePercentage)}%`,
                                  backgroundColor: isEligible ? '#287964' : '#dc2626',
                                }}
                              />
                            </div>
                            <strong>
                              {item.totalWorkingDays === 0
                                ? '0.0%'
                                : `${item.attendancePercentage.toFixed(1)}%`}
                            </strong>
                          </div>
                        </td>
                        <td>
                          {/* Green for Eligible to Exam, Red for Not Eligible */}
                          <span
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: 6,
                              padding: '5px 12px',
                              borderRadius: 16,
                              fontSize: 12,
                              fontWeight: 600,
                              backgroundColor: isEligible ? '#dcfce7' : '#fee2e2',
                              color: isEligible ? '#166534' : '#991b1b',
                              border: isEligible ? '1px solid #86efac' : '1px solid #fca5a5',
                            }}
                          >
                            {isEligible ? (
                              <CheckCircle2 size={14} color="#166534" />
                            ) : (
                              <XCircle size={14} color="#991b1b" />
                            )}
                            {isEligible ? 'Eligible to Exam' : 'Not Eligible'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="info-strip">
            <Info size={18} />
            <span>
              <strong>Examination Policy:</strong> Students with attendance percentage &ge; {settings.threshold}% are marked <strong>Eligible to Exam</strong> in green.
              Students with attendance below {settings.threshold}% are marked <strong>Not Eligible</strong> in red.
            </span>
          </div>
        </section>
      )}

      {/* TAB 2: SUBJECT SUMMARY */}
      {activeTab === 'summary' && (
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Attendance by student & subject</h2>
              <p>{filteredSummary.length} academic course records</p>
            </div>
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Search summary"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search records…"
              />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>SUBJECT</th>
                  <th>ATTENDED</th>
                  <th>EXCUSED</th>
                  <th>ATTENDANCE</th>
                  <th>STANDING</th>
                </tr>
              </thead>
              <tbody>
                {filteredSummary.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: '#89948e' }}>
                      No summary records available for current selection.
                    </td>
                  </tr>
                ) : (
                  filteredSummary.map((row) => (
                    <tr key={row.key}>
                      <td>
                        <strong>{row.studentName}</strong>
                        <small style={{ display: 'block', color: '#89948e' }}>
                          {row.studentCode}
                        </small>
                      </td>
                      <td>{row.subjectName}</td>
                      <td>
                        {row.attended} / {row.total}
                      </td>
                      <td>{row.excused}</td>
                      <td>
                        <div className="percentage">
                          <div className="progress-track">
                            <i style={{ width: `${Math.min(100, row.percentage)}%` }} />
                          </div>
                          <strong>{row.percentage}%</strong>
                        </div>
                      </td>
                      <td>
                        <StatusBadge status={row.standing} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* TAB 3: DETAILED RECORDS */}
      {activeTab === 'records' && (
        <section className="panel">
          <div className="panel-title">
            <div>
              <h2>Verified attendance records</h2>
              <p>{detailedRecords.length} timestamped logs</p>
            </div>
            <div className="search-box">
              <Search size={16} />
              <input
                aria-label="Search detailed logs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search logs…"
              />
            </div>
          </div>

          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>STUDENT</th>
                  <th>SUBJECT</th>
                  <th>STATUS</th>
                  <th>METHOD</th>
                  <th>REASON</th>
                </tr>
              </thead>
              <tbody>
                {detailedRecords.length === 0 ? (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '36px 20px', color: '#89948e' }}>
                      No verified attendance records yet.
                    </td>
                  </tr>
                ) : (
                  detailedRecords.slice(0, 50).map((r) => (
                    <tr key={r._id}>
                      <td>
                        {new Date(r.date).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                        })}
                      </td>
                      <td>
                        <strong>{r.studentName}</strong>
                        <small style={{ display: 'block', color: '#89948e' }}>
                          {r.studentCode}
                        </small>
                      </td>
                      <td>{r.subjectName}</td>
                      <td>
                        <StatusBadge status={r.status} />
                      </td>
                      <td>{r.method}</td>
                      <td>{r.reason || '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
};
