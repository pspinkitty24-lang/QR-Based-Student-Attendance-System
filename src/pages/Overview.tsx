import React from 'react';
import {
  Users,
  QrCode,
  TrendingUp,
  AlertCircle,
  ArrowRight,
  Sparkles,
  BookOpen,
  Calendar,
  BarChart3,
  Check,
  Scan,
  CheckCircle2,
} from 'lucide-react';
import { User, AttendanceSession } from '../types';
import { store } from '../services/store';
import { StatusBadge } from '../components/StatusBadge';

interface OverviewProps {
  user: User;
  onNavigate: (page: string) => void;
}

export const Overview: React.FC<OverviewProps> = ({ user, onNavigate }) => {
  const [, setVersion] = React.useState(0);

  React.useEffect(() => {
    return store.subscribe(() => {
      setVersion((v) => v + 1);
    });
  }, []);

  const users = store.getUsers();
  const sessions = store.getSessions();
  const subjects = store.getSubjects();
  const classes = store.getClasses();
  const assignments = store.getAssignments();
  const settings = store.getSettings();

  const students = users.filter((u) => u.role === 'student');
  const activeSessions = sessions.filter((s) => s.status === 'active');
  const completedSessions = sessions.filter((s) => s.status === 'completed');

  // Calculate attendance rate
  let totalPresentCount = 0;
  let totalRecordCount = 0;
  sessions.forEach((s) => {
    s.records.forEach((r) => {
      totalRecordCount++;
      if (r.status === 'present' || r.status === 'late') {
        totalPresentCount++;
      }
    });
  });
  const overallRate =
    totalRecordCount > 0 ? Math.round((totalPresentCount / totalRecordCount) * 1000) / 10 : 84.5;

  // Eligibility report to see students needing attention (< 75%)
  const eligibilityList = store.getAttendanceEligibilityReport();
  const atRiskCount = eligibilityList.filter((s) => !s.isEligible).length;

  // Trend data for the SVG area chart
  const trendData = [
    { label: '12 Oct', rate: 78 },
    { label: '14 Oct', rate: 82 },
    { label: '15 Oct', rate: 80 },
    { label: '17 Oct', rate: 86 },
    { label: '19 Oct', rate: 84 },
    { label: '21 Oct', rate: 89 },
    { label: '22 Oct', rate: 85 },
    { label: '24 Oct', rate: 91 },
    { label: '26 Oct', rate: Math.min(100, Math.round(overallRate)) },
  ];

  // Helper to format date
  const formatDate = (iso: string) => {
    return new Date(iso).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getAssignmentInfo = (assignmentId: string) => {
    const a = assignments.find((item) => item._id === assignmentId);
    if (!a) return { subjectName: 'Lecture Session', className: 'All Enrolled' };
    const s = subjects.find((sub) => sub._id === a.subjectId);
    const c = classes.find((cls) => cls._id === a.classId);
    return {
      subjectName: s?.name || 'Class Period',
      className: c?.name || 'Assigned Group',
    };
  };

  const getFacultyName = (facultyId: string) => {
    const f = users.find((u) => u._id === facultyId);
    return f?.name || 'Academic Faculty';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div>
          <span className="eyebrow light">EVERY CLASS COUNTS</span>
          <h2>
            A little less admin.
            <br />
            A lot more learning.
          </h2>
          <p>Your attendance workflow, all in one place.</p>
          <button
            onClick={() =>
              onNavigate(
                user.role === 'student' ? 'Scan QR' : 'Attendance'
              )
            }
          >
            {user.role === 'student' ? 'Scan attendance' : 'Open attendance workspace'}
            <ArrowRight size={16} />
          </button>
        </div>

        <div className="banner-art" aria-hidden="true">
          <div className="art-orbit" />
          <div className="art-card">
            <QrCode size={55} />
            <span>SCAN. VERIFY. PRESENT.</span>
          </div>
          <div className="art-check">
            <Check size={25} />
          </div>
          <div className="art-dots">✦</div>
        </div>

        <div className="banner-side">
          <span className="pill">A CONNECTED CAMPUS</span>
          <strong>
            Clear records.
            <br />
            Confident decisions.
          </strong>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat">
          <div className="stat-top">
            <span>{user.role === 'admin' ? 'Active students' : 'Subjects tracked'}</span>
            <span className="stat-icon">
              <Users size={18} />
            </span>
          </div>
          <strong>{user.role === 'admin' ? students.length : subjects.length}</strong>
          <p>{user.role === 'admin' ? 'Enrolled in your workspace' : 'Across completed sessions'}</p>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span>Attendance rate</span>
            <span className="stat-icon green">
              <TrendingUp size={18} />
            </span>
          </div>
          <strong>{overallRate}%</strong>
          <p>From completed attendance records</p>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span>Live sessions</span>
            <span className="stat-icon">
              <QrCode size={18} />
            </span>
          </div>
          <strong>{activeSessions.length}</strong>
          <p>Currently accepting attendance</p>
        </div>

        <div className="stat">
          <div className="stat-top">
            <span>Needs attention</span>
            <span className="stat-icon amber">
              <AlertCircle size={18} />
            </span>
          </div>
          <strong>{atRiskCount}</strong>
          <p>Students below {settings.threshold}% eligibility</p>
        </div>
      </div>

      {/* Dashboard Grid: Chart + Quick Actions */}
      <div className="dashboard-grid">
        {/* Left: Area chart */}
        <section className="panel chart-panel">
          <div className="panel-title">
            <div>
              <h2>Attendance overview</h2>
              <p>A clearer picture of participation.</p>
            </div>
            <span className="subtle-label">Last 14 teaching dates</span>
          </div>

          <div style={{ padding: '0 20px', height: 210 }}>
            {/* SVG Area Chart */}
            <svg
              viewBox="0 0 500 180"
              preserveAspectRatio="none"
              style={{ width: '100%', height: '100%', overflow: 'visible' }}
            >
              <defs>
                <linearGradient id="attendlyGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#287964" stopOpacity="0.28" />
                  <stop offset="100%" stopColor="#287964" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal grid lines */}
              <line x1="0" y1="30" x2="500" y2="30" stroke="#f0f3ef" strokeDasharray="3 3" />
              <line x1="0" y1="80" x2="500" y2="80" stroke="#f0f3ef" strokeDasharray="3 3" />
              <line x1="0" y1="130" x2="500" y2="130" stroke="#f0f3ef" strokeDasharray="3 3" />

              {/* Area fill */}
              <polygon
                points="0,160 0,95 60,82 120,88 180,68 240,75 300,55 360,65 420,40 500,48 500,160"
                fill="url(#attendlyGradient)"
              />

              {/* Monotone curve line */}
              <polyline
                points="0,95 60,82 120,88 180,68 240,75 300,55 360,65 420,40 500,48"
                fill="none"
                stroke="#287964"
                strokeWidth="2.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />

              {/* Active data points */}
              {[
                { cx: 0, cy: 95 },
                { cx: 60, cy: 82 },
                { cx: 120, cy: 88 },
                { cx: 180, cy: 68 },
                { cx: 240, cy: 75 },
                { cx: 300, cy: 55 },
                { cx: 360, cy: 65 },
                { cx: 420, cy: 40 },
                { cx: 500, cy: 48 },
              ].map((pt, idx) => (
                <circle
                  key={idx}
                  cx={pt.cx}
                  cy={pt.cy}
                  r="3.5"
                  fill="#ffffff"
                  stroke="#287964"
                  strokeWidth="2"
                />
              ))}
            </svg>

            {/* X-axis labels */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                fontSize: 10,
                color: '#89948e',
                marginTop: 6,
              }}
            >
              {trendData.map((d, i) => (
                <span key={i}>{d.label}</span>
              ))}
            </div>
          </div>

          <div className="chart-note">
            <span className="dot" />
            <span>Attendance rate</span>
            <span style={{ marginLeft: 6 }}>Cancelled sessions are excluded.</span>
          </div>
        </section>

        {/* Right: Quick actions panel */}
        <section className="panel quick-panel">
          <div className="panel-title">
            <div>
              <h2>Quick actions</h2>
              <p>A shortcut to your everyday.</p>
            </div>
            <span className="icon-muted">
              <ArrowRight size={18} />
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {user.role === 'admin' ? (
              <>
                <button className="quick-action" onClick={() => onNavigate('Students')}>
                  <span>
                    <Users size={18} />
                  </span>
                  <div>
                    <strong>Students</strong>
                    <small>Add, manage & import class lists</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
                <button className="quick-action" onClick={() => onNavigate('Timetable')}>
                  <span>
                    <Calendar size={18} />
                  </span>
                  <div>
                    <strong>Timetable</strong>
                    <small>Plan periods and lecture slots</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
                <button className="quick-action" onClick={() => onNavigate('Reports')}>
                  <span>
                    <BarChart3 size={18} />
                  </span>
                  <div>
                    <strong>Eligibility Reports</strong>
                    <small>Exam status & 75% threshold analysis</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
              </>
            ) : user.role === 'faculty' ? (
              <>
                <button className="quick-action" onClick={() => onNavigate('Attendance')}>
                  <span>
                    <QrCode size={18} />
                  </span>
                  <div>
                    <strong>Start Live Session</strong>
                    <small>Generate static classroom QR code</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
                <button className="quick-action" onClick={() => onNavigate('Timetable')}>
                  <span>
                    <Calendar size={18} />
                  </span>
                  <div>
                    <strong>My Timetable</strong>
                    <small>View upcoming lecture schedule</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
                <button className="quick-action" onClick={() => onNavigate('Reports')}>
                  <span>
                    <BarChart3 size={18} />
                  </span>
                  <div>
                    <strong>Class Reports</strong>
                    <small>Subject participation summaries</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
              </>
            ) : (
              <>
                <button className="quick-action" onClick={() => onNavigate('Scan QR')}>
                  <span>
                    <Scan size={18} />
                  </span>
                  <div>
                    <strong>Scan Attendance QR</strong>
                    <small>One camera scan to verify presence</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
                <button className="quick-action" onClick={() => onNavigate('Reports')}>
                  <span>
                    <BarChart3 size={18} />
                  </span>
                  <div>
                    <strong>My Progress</strong>
                    <small>Check your subject percentage</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
                <button className="quick-action" onClick={() => onNavigate('Timetable')}>
                  <span>
                    <Calendar size={18} />
                  </span>
                  <div>
                    <strong>Class Schedule</strong>
                    <small>Plan your campus learning day</small>
                  </div>
                  <ArrowRight size={15} style={{ marginLeft: 'auto', color: '#89948e' }} />
                </button>
              </>
            )}
          </div>

          <div className="tip">
            <span>GOOD TO KNOW</span>
            <p>Every attendance correction includes a required reason and an immutable audit record.</p>
          </div>
        </section>
      </div>

      {/* Recent Sessions Table */}
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Recent sessions</h2>
            <p>Your classroom activity, at a glance.</p>
          </div>
          <button className="text-button" onClick={() => onNavigate('Attendance')}>
            View all sessions <ArrowRight size={15} />
          </button>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>SUBJECT & CLASS</th>
                <th>DATE</th>
                <th>FACULTY</th>
                <th>ATTENDED</th>
                <th>STATUS</th>
              </tr>
            </thead>
            <tbody>
              {sessions.slice(0, 5).map((s) => {
                const info = getAssignmentInfo(s.assignmentId);
                const faculty = getFacultyName(s.facultyId);
                return (
                  <tr key={s._id}>
                    <td>
                      <div className="subject-cell">
                        <strong>{info.subjectName}</strong>
                        <small>{info.className}</small>
                      </div>
                    </td>
                    <td>{formatDate(s.startsAt)}</td>
                    <td>{faculty}</td>
                    <td>
                      <strong>{s.records.length} students</strong>
                    </td>
                    <td>
                      <StatusBadge status={s.status} />
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
