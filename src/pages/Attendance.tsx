import React, { useState, useEffect, useMemo } from 'react';
import QRCode from 'qrcode';
import {
  QrCode,
  Play,
  Square,
  Clock,
  ShieldCheck,
  Users,
  Copy,
  Check,
  GraduationCap,
  BookOpen,
  Timer,
  XCircle,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import { User, AttendanceSession, AttendanceStatus, ExcuseType } from '../types';
import { store } from '../services/store';
import { StatusBadge } from '../components/StatusBadge';
import { Modal } from '../components/Modal';

interface AttendanceProps {
  user: User;
  notify?: (msg: string) => void;
}

export const Attendance: React.FC<AttendanceProps> = ({ user, notify }) => {
  const classes = store.getClasses();
  const allSubjects = store.getSubjects();
  const allAssignments = store.getAssignments();
  const allUsers = store.getUsers();
  const sessions = store.getSessions();

  // 1. Class selection: MCA, M.Sc, MDS
  const [selectedClassId, setSelectedClassId] = useState<string>(
    classes[0]?._id || 'class-mca'
  );

  // 2. Filter subjects that belong to the selected class
  const classAssignments = useMemo(() => {
    return allAssignments.filter((a) => a.classId === selectedClassId);
  }, [allAssignments, selectedClassId]);

  const availableSubjects = useMemo(() => {
    // Collect subjects linked to this class's assignments
    const subjIds = new Set(classAssignments.map((a) => a.subjectId));
    const matched = allSubjects.filter((s) => subjIds.has(s._id));
    if (matched.length > 0) return matched;
    // Fallback: match by code prefix (MCA, MSC, MDS)
    const codePrefix = selectedClassId.replace('class-', '').toUpperCase();
    return allSubjects.filter((s) => s.code.startsWith(codePrefix));
  }, [classAssignments, allSubjects, selectedClassId]);

  // 3. Subject selection (defaults to first subject of chosen class)
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>(() => {
    return availableSubjects[0]?._id || 'subj-mca-1';
  });

  // Whenever class changes, reset selected subject to the first subject of that class
  useEffect(() => {
    if (availableSubjects.length > 0) {
      const exists = availableSubjects.some((s) => s._id === selectedSubjectId);
      if (!exists) {
        setSelectedSubjectId(availableSubjects[0]._id);
      }
    }
  }, [availableSubjects, selectedSubjectId]);

  // 4. Session duration (Time)
  const [sessionDuration, setSessionDuration] = useState<number>(5); // 5 mins default

  // Active session tracking
  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(() => {
    const active = sessions.find((s) => s.status === 'active');
    return active || null;
  });

  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copiedCode, setCopiedCode] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  // Manual correction / Excuse modal
  const [editingStudent, setEditingStudent] = useState<{
    studentId: string;
    studentName: string;
    studentCode: string;
    currentStatus: AttendanceStatus;
  } | null>(null);
  const [manualStatus, setManualStatus] = useState<AttendanceStatus>('present');
  const [manualReason, setManualReason] = useState('');

  // Keep active session in sync with store changes
  useEffect(() => {
    const unsubscribe = store.subscribe(() => {
      const currentSessions = store.getSessions();
      if (activeSession) {
        const refreshed = currentSessions.find((s) => s._id === activeSession._id);
        if (refreshed) {
          setActiveSession({ ...refreshed });
        } else {
          setActiveSession(null);
        }
      } else {
        const foundActive = currentSessions.find((s) => s.status === 'active');
        if (foundActive) setActiveSession({ ...foundActive });
      }
    });
    return unsubscribe;
  }, [activeSession]);

  // Generate STATIC QR code whenever activeSession starts
  // CRITICAL: The QR is completely static and stable, does not change per second
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      setQrDataUrl('');
      return;
    }

    const currentAssignment = allAssignments.find((a) => a._id === activeSession.assignmentId);
    const targetClassId = currentAssignment?.classId || activeSession.classId || selectedClassId;
    const targetSubjId = currentAssignment?.subjectId || activeSession.subjectId || selectedSubjectId;
    const currentClass = classes.find((c) => c._id === targetClassId);
    const currentSubject = allSubjects.find((s) => s._id === targetSubjId);
    const currentFaculty = allUsers.find((u) => u._id === activeSession.facultyId) || user;

    const payload = JSON.stringify({
      type: 'ATTENDLY_QR_SESSION',
      sessionId: activeSession._id,
      classId: targetClassId,
      className: currentClass?.name || 'Classroom',
      subjectId: targetSubjId,
      subjectName: currentSubject?.name || 'Lecture',
      facultyId: currentFaculty._id,
      facultyName: currentFaculty.name,
      token: activeSession.qrToken,
      pinCode: activeSession.pinCode,
      tokenExpiresAt: activeSession.tokenExpiresAt,
      startedAt: activeSession.startsAt,
    });

    QRCode.toDataURL(payload, {
      width: 320,
      margin: 2,
      color: {
        dark: '#164d40',
        light: '#ffffff',
      },
    })
      .then((url) => setQrDataUrl(url))
      .catch((err) => console.error('Failed to generate QR:', err));
  }, [
    activeSession?.qrToken,
    activeSession?._id,
    activeSession?.status,
    activeSession?.pinCode,
    activeSession?.classId,
    activeSession?.subjectId,
    activeSession?.tokenExpiresAt,
    allAssignments,
    classes,
    allSubjects,
    allUsers,
    user,
    selectedClassId,
    selectedSubjectId,
  ]);

  // Live countdown timer for active session
  useEffect(() => {
    if (!activeSession || activeSession.status !== 'active') {
      setRemainingSeconds(0);
      return;
    }

    const updateTimer = () => {
      const now = Date.now();
      const left = Math.max(0, Math.ceil((activeSession.tokenExpiresAt - now) / 1000));
      setRemainingSeconds(left);

      // When timer hits 0, auto-close session and mark remaining students absent
      if (left <= 0 && activeSession.status === 'active') {
        const ended = store.endAttendanceSession(activeSession._id, 'System Timer');
        setActiveSession({ ...ended });
        if (notify) notify('Session time completed. Unmarked students recorded as Absent.');
      }
    };

    updateTimer();
    const timerInterval = setInterval(updateTimer, 1000);
    return () => clearInterval(timerInterval);
  }, [activeSession?._id, activeSession?.tokenExpiresAt, activeSession?.status, notify]);

  // Format seconds into MM:SS
  const formatTimer = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Start Session handler
  const handleStartSession = () => {
    // Find assignment for the selected class and subject
    let targetAssignment = allAssignments.find(
      (a) => a.classId === selectedClassId && a.subjectId === selectedSubjectId
    );

    // If no assignment exists yet, create one on the fly
    if (!targetAssignment) {
      targetAssignment = store.addAssignment(
        {
          facultyId: user._id,
          subjectId: selectedSubjectId,
          classId: selectedClassId,
          isActive: true,
        },
        user.name
      );
    }

    try {
      const newSession = store.createAttendanceSession(
        targetAssignment._id,
        user._id,
        sessionDuration
      );
      setActiveSession(newSession);
      const chosenSubj = allSubjects.find((s) => s._id === selectedSubjectId);
      const chosenClass = classes.find((c) => c._id === selectedClassId);
      if (notify) {
        notify(
          `Session active for ${chosenClass?.name || 'Class'} · ${chosenSubj?.name || 'Subject'} (${sessionDuration} mins)`
        );
      }
    } catch (err: any) {
      alert(err.message || 'Failed to start session.');
    }
  };

  // End Session handler
  const handleEndSession = () => {
    if (!activeSession) return;
    if (
      confirm(
        'End this attendance session now? Students who have not scanned will be marked as Absent.'
      )
    ) {
      const ended = store.endAttendanceSession(activeSession._id, user.name);
      setActiveSession({ ...ended });
      if (notify) notify('Attendance session ended. Remaining students marked Absent.');
    }
  };

  // Quick One-Click Status Change (Present, Absent, Excused, On Duty, Permission)
  const handleQuickStatusChange = (
    studentId: string,
    status: AttendanceStatus,
    reason: string = 'Updated by faculty'
  ) => {
    if (!activeSession) {
      alert('Please start or select an attendance session first.');
      return;
    }

    store.updateStudentAttendance(
      activeSession._id,
      studentId,
      status,
      reason,
      `${user.name} (${user.role})`
    );

    const refreshed = store.getSessions().find((s) => s._id === activeSession._id);
    if (refreshed) setActiveSession({ ...refreshed });
    if (notify) notify(`Status updated to ${status.toUpperCase().replace('_', ' ')}.`);
  };

  // Save manual record with excuse reason
  const handleSaveManualRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeSession || !editingStudent) return;

    store.updateStudentAttendance(
      activeSession._id,
      editingStudent.studentId,
      manualStatus,
      manualReason.trim() || 'Faculty verified adjustment',
      `${user.name} (${user.role})`
    );

    const refreshed = store.getSessions().find((s) => s._id === activeSession._id);
    if (refreshed) setActiveSession({ ...refreshed });
    setEditingStudent(null);
    setManualReason('');
    if (notify) notify('Student record updated with excuse note.');
  };

  // Copy token
  const handleCopyCode = () => {
    if (!activeSession) return;
    navigator.clipboard.writeText(activeSession.qrToken);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Active or target class & students
  const activeAssignment = allAssignments.find(
    (a) => a._id === activeSession?.assignmentId
  );
  const targetClassId = activeAssignment
    ? activeAssignment.classId
    : selectedClassId;

  const targetClass = classes.find((c) => c._id === targetClassId);
  const enrolledStudents = allUsers.filter(
    (u) => u.role === 'student' && u.classId === targetClassId && u.isActive
  );

  // Compute live counts
  const targetSession = activeSession || sessions[0];
  let presentCount = 0;
  let absentCount = 0;
  let excusedCount = 0;

  enrolledStudents.forEach((student) => {
    const rec = targetSession?.records.find((r) => r.studentId === student._id);
    if (rec) {
      if (rec.status === 'present' || rec.status === 'late') presentCount++;
      else if (rec.status === 'absent') absentCount++;
      else if (
        rec.status === 'excused' ||
        rec.status === 'on_duty' ||
        rec.status === 'permission'
      )
        excusedCount++;
    } else {
      if (targetSession?.status === 'completed') absentCount++;
    }
  });

  const getStudentStatus = (
    studentId: string
  ): {
    status: AttendanceStatus;
    method: string;
    time?: string;
    reason?: string;
    requestStatus?: 'pending' | 'approved' | 'rejected';
    requestedType?: ExcuseType;
  } => {
    if (!targetSession) return { status: 'absent', method: '—' };
    const rec = targetSession.records.find((r) => r.studentId === studentId);
    const req = targetSession.excuseRequests?.find((r) => r.studentId === studentId);
    if (rec) {
      return {
        status: rec.status,
        method: rec.method,
        reason: rec.reason || req?.reason,
        requestStatus: rec.requestStatus || req?.status,
        requestedType: rec.requestedType || req?.type,
        time: new Date(rec.markedAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
        }),
      };
    }
    if (req) {
      return {
        status: req.type as AttendanceStatus,
        method: 'Student Request',
        reason: req.reason,
        requestStatus: req.status,
        requestedType: req.type,
        time: new Date(req.requestedAt).toLocaleTimeString('en-IN', {
          hour: '2-digit',
          minute: '2-digit',
        }),
      };
    }
    return {
      status: targetSession.status === 'completed' ? 'absent' : 'absent',
      method: targetSession.status === 'completed' ? 'Auto-Absent' : 'Pending Scan',
    };
  };

  const handleReviewExcuse = (
    studentId: string,
    decision: 'approved' | 'rejected',
    sessionId: string,
    requestedType?: ExcuseType
  ) => {
    try {
      const student = enrolledStudents.find((s) => s._id === studentId);
      store.reviewStudentExcuseRequest(
        sessionId,
        studentId,
        decision,
        user.name,
        decision === 'approved'
          ? `Approved ${requestedType?.replace('_', ' ').toUpperCase() || 'excuse'} by ${user.name}`
          : `Rejected by ${user.name}`
      );
      if (notify) {
        notify(
          `${decision === 'approved' ? 'Approved' : 'Rejected'} ${requestedType?.replace('_', ' ').toUpperCase() || 'request'} for ${student?.name || 'student'}.`
        );
      }
    } catch (err: any) {
      if (notify) notify(err.message || 'Action failed.');
    }
  };

  const pendingRequestsCount = enrolledStudents.filter((student) => {
    const info = getStudentStatus(student._id);
    return info.requestStatus === 'pending';
  }).length;

  const getActiveSubjectName = () => {
    if (activeSession) {
      const a = allAssignments.find((item) => item._id === activeSession.assignmentId);
      const s = allSubjects.find((sub) => sub._id === a?.subjectId);
      const c = classes.find((cls) => cls._id === a?.classId);
      return `${s?.name || 'Subject'} (${c?.name || 'Class'})`;
    }
    const s = allSubjects.find((sub) => sub._id === selectedSubjectId);
    const c = classes.find((cls) => cls._id === selectedClassId);
    return `${s?.name || 'Subject'} (${c?.name || 'Class'})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">FACULTY ATTENDANCE MODULE</span>
          <h1>Start session & QR attendance</h1>
          <p>
            Select Class (MCA, M.Sc, MDS), Subject, and Time. Open the static QR code for students to scan. Unmarked students will be recorded as Absent when time ends.
          </p>
        </div>

        <div className="heading-actions">
          {activeSession?.status === 'active' ? (
            <button className="button danger-light" onClick={handleEndSession}>
              <Square size={16} />
              <span>End session now</span>
            </button>
          ) : (
            <button className="button primary" onClick={handleStartSession}>
              <Play size={16} />
              <span>Start session & open QR</span>
            </button>
          )}
        </div>
      </div>

      {/* Session Controls: Class, Subject & Time Selection */}
      <div className="panel" style={{ padding: '20px 24px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16 }}>
          {/* 1. Class Dropdown: MCA / M.Sc / MDS */}
          <div className="field">
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#3d5c52',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <GraduationCap size={14} color="#166552" />
              1. Which Class?
            </label>
            <select
              value={selectedClassId}
              onChange={(e) => setSelectedClassId(e.target.value)}
              disabled={activeSession?.status === 'active'}
              style={{ width: '100%', fontWeight: 500 }}
            >
              {classes.map((cls) => (
                <option key={cls._id} value={cls._id}>
                  {cls.name}
                </option>
              ))}
            </select>
          </div>

          {/* 2. Subject Dropdown: Filtered to that selected class */}
          <div className="field">
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#3d5c52',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <BookOpen size={14} color="#166552" />
              2. Which Subject?
            </label>
            <select
              value={selectedSubjectId}
              onChange={(e) => setSelectedSubjectId(e.target.value)}
              disabled={activeSession?.status === 'active'}
              style={{ width: '100%', fontWeight: 500 }}
            >
              {availableSubjects.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.code} - {s.name}
                </option>
              ))}
            </select>
          </div>

          {/* 3. Duration / Time Dropdown */}
          <div className="field">
            <label
              style={{
                fontSize: 11,
                fontWeight: 600,
                color: '#3d5c52',
                marginBottom: 6,
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}
            >
              <Timer size={14} color="#166552" />
              3. Session Duration (Time)
            </label>
            <select
              value={sessionDuration}
              onChange={(e) => setSessionDuration(Number(e.target.value))}
              disabled={activeSession?.status === 'active'}
              style={{ width: '100%', fontWeight: 500 }}
            >
              <option value={2}>2 minutes (Quick roll-call)</option>
              <option value={5}>5 minutes (Standard attendance window)</option>
              <option value={10}>10 minutes (Lecture window)</option>
              <option value={15}>15 minutes (Extended window)</option>
              <option value={30}>30 minutes</option>
              <option value={60}>60 minutes (Full period)</option>
            </select>
          </div>

          {/* Live Session Status Indicator */}
          <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 14px',
                borderRadius: 8,
                backgroundColor: activeSession?.status === 'active' ? '#eaf4eb' : '#f4f6f2',
                border: activeSession?.status === 'active' ? '1px solid #c2e2c8' : '1px solid #e1e7dc',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: activeSession?.status === 'active' ? '#166534' : '#89948e',
                  }}
                />
                <span style={{ fontSize: 12, fontWeight: 600, color: '#233b34' }}>
                  {activeSession?.status === 'active' ? 'QR Active' : 'Session Inactive'}
                </span>
              </div>

              {activeSession?.status === 'active' && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 700, fontSize: 14 }}>
                  <Clock size={16} />
                  <span>{formatTimer(remainingSeconds)}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Real-time Summary Counters */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #166552' }}>
          <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Total in {targetClass?.name?.split(' ')[0] || 'Class'}
          </span>
          <strong style={{ display: 'block', fontSize: 26, color: '#164d40', marginTop: 2 }}>
            {enrolledStudents.length} Students
          </strong>
        </div>

        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #166534' }}>
          <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Present
          </span>
          <strong style={{ display: 'block', fontSize: 26, color: '#166534', marginTop: 2 }}>
            {presentCount}
          </strong>
        </div>

        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #dc2626' }}>
          <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            Absent
          </span>
          <strong style={{ display: 'block', fontSize: 26, color: '#dc2626', marginTop: 2 }}>
            {absentCount}
          </strong>
        </div>

        <div className="panel" style={{ padding: '16px 20px', borderLeft: '4px solid #0284c7' }}>
          <span style={{ fontSize: 11, color: '#89948e', textTransform: 'uppercase', letterSpacing: '0.6px' }}>
            OD / Permission / Excused
          </span>
          <strong style={{ display: 'block', fontSize: 26, color: '#0284c7', marginTop: 2 }}>
            {excusedCount}
          </strong>
        </div>
      </div>

      {/* Main Section: Static QR Display + Roster List */}
      <div className="session-grid">
        {/* Left: Static Classroom QR Code */}
        <section className="panel qr-panel">
          <div className="panel-title">
            <div>
              <h2>Classroom QR</h2>
              <p>Static & stable code for the active session.</p>
            </div>
            <QrCode size={20} />
          </div>

          {activeSession?.status === 'active' && qrDataUrl ? (
            <div style={{ padding: '0 24px 20px', textAlign: 'center' }}>
              <div className="qr-image" style={{ margin: '0 auto 14px', maxWidth: 280 }}>
                <img
                  src={qrDataUrl}
                  alt="Static classroom attendance QR code"
                  style={{
                    width: '100%',
                    height: 'auto',
                    display: 'block',
                    borderRadius: 8,
                    boxShadow: '0 4px 12px rgba(0,0,0,0.06)',
                  }}
                />
              </div>

              {/* Static indicator + Countdown remaining */}
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '6px 14px',
                  borderRadius: 16,
                  backgroundColor: '#eaf4eb',
                  color: '#166534',
                  fontSize: 12,
                  fontWeight: 600,
                  marginBottom: 10,
                }}
              >
                <span className="dot" style={{ backgroundColor: '#166534' }} />
                <span>Static QR Active · Closes in {formatTimer(remainingSeconds)}</span>
              </div>

              <p className="hint" style={{ fontSize: 11, color: '#89948e', margin: '0 0 14px' }}>
                This QR code remains static throughout the entire session. Students scan using their student portal.
              </p>

              {/* Backup PIN Code & Token Code */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
                  gap: 10,
                  marginBottom: 10,
                }}
              >
                {activeSession.pinCode && (
                  <div
                    style={{
                      padding: '10px 14px',
                      backgroundColor: '#eef8f2',
                      borderRadius: 8,
                      border: '1.5px solid #a3dcbb',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <div>
                      <small style={{ display: 'block', fontSize: 10, color: '#166534', fontWeight: 600, textTransform: 'uppercase' }}>
                        Session PIN (6-Digit):
                      </small>
                      <strong style={{ fontSize: 18, fontFamily: 'monospace', letterSpacing: '2px', color: '#164d40' }}>
                        {activeSession.pinCode}
                      </strong>
                    </div>
                    <button
                      className="icon-button"
                      onClick={() => {
                        if (activeSession.pinCode) {
                          navigator.clipboard?.writeText(activeSession.pinCode);
                          setCopiedCode(true);
                          setTimeout(() => setCopiedCode(false), 2000);
                        }
                      }}
                      title="Copy 6-digit PIN"
                      style={{ padding: 6, color: copiedCode ? '#166534' : '#166552' }}
                    >
                      {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                )}

                <div
                  style={{
                    padding: '10px 14px',
                    backgroundColor: '#f7f8f5',
                    borderRadius: 8,
                    border: '1px dashed #ced8c9',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <small style={{ display: 'block', fontSize: 10, color: '#89948e', textTransform: 'uppercase' }}>
                      Token Code:
                    </small>
                    <strong style={{ fontSize: 12, fontFamily: 'monospace', color: '#164d40' }}>
                      {activeSession.qrToken}
                    </strong>
                  </div>
                  <button
                    className="icon-button"
                    onClick={handleCopyCode}
                    title="Copy session code"
                    style={{ padding: 6, color: copiedCode ? '#166534' : '#89948e' }}
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
              </div>

              {/* Multi-Device Live Sync Status */}
              <div
                style={{
                  fontSize: 11,
                  color: '#406354',
                  backgroundColor: '#f2f7f4',
                  borderRadius: 6,
                  padding: '5px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                }}
              >
                <span
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: '50%',
                    backgroundColor: '#16a34a',
                    display: 'inline-block',
                  }}
                />
                <span>Live Multi-Device Sync Active · Students can scan from any mobile or laptop</span>
              </div>
            </div>
          ) : (
            <div style={{ padding: '48px 24px', textAlign: 'center', color: '#89948e' }}>
              <div
                style={{
                  width: 64,
                  height: 64,
                  borderRadius: '50%',
                  backgroundColor: '#f0f4ee',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 14px',
                  color: '#719283',
                }}
              >
                <QrCode size={32} />
              </div>
              <h3 style={{ fontSize: 15, fontWeight: 600, color: '#164d40', margin: '0 0 6px' }}>
                QR is currently closed
              </h3>
              <p style={{ fontSize: 12, margin: 0, maxWidth: 260, marginInline: 'auto' }}>
                Select Class, Subject, and Time above, then click &quot;Start session & open QR&quot; to project the QR code.
              </p>
            </div>
          )}

          <div className="qr-notice">
            <ShieldCheck size={19} />
            <p>
              When the timer expires, any student who hasn&apos;t marked attendance is automatically recorded as Absent.
            </p>
          </div>
        </section>

        {/* Right: Live Roster & Quick Excuse/OD Actions */}
        <section className="panel live-panel">
          <div className="panel-title">
            <div>
              <h2>Class roster & attendance status</h2>
              <p>
                Showing {enrolledStudents.length} students enrolled in {getActiveSubjectName()}
              </p>
            </div>
            <span className="pill">
              <Users size={13} style={{ display: 'inline', marginRight: 4, verticalAlign: -1 }} />
              {enrolledStudents.length} Students
            </span>
          </div>

          <div className="table-wrap">
            {pendingRequestsCount > 0 && (
              <div
                style={{
                  margin: '12px 16px',
                  padding: '10px 16px',
                  borderRadius: 8,
                  backgroundColor: '#fffbeb',
                  border: '1px solid #fde68a',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: 12,
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Bell size={16} color="#b45309" />
                  <span style={{ fontSize: 13, fontWeight: 600, color: '#92400e' }}>
                    {pendingRequestsCount} Student Excuse / OD Request{pendingRequestsCount > 1 ? 's' : ''} awaiting review
                  </span>
                </div>
                <span style={{ fontSize: 11, color: '#78350f' }}>
                  Review submitted reasons and click Approve or Reject below
                </span>
              </div>
            )}

            <table>
              <thead>
                <tr>
                  <th>REG NO</th>
                  <th>STUDENT NAME</th>
                  <th>STATUS</th>
                  <th>VERIFIED METHOD</th>
                  <th>QUICK ACTIONS / EXCUSE</th>
                </tr>
              </thead>
              <tbody>
                {enrolledStudents.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px', color: '#89948e' }}>
                      No students found for this class section.
                    </td>
                  </tr>
                ) : (
                  enrolledStudents.map((student) => {
                    const info = getStudentStatus(student._id);
                    return (
                      <tr
                        key={student._id}
                        style={{
                          backgroundColor: info.requestStatus === 'pending' ? '#fffdf0' : undefined,
                        }}
                      >
                        <td>
                          <span className="mono" style={{ fontWeight: 600, color: '#164d40' }}>
                            {student.code}
                          </span>
                        </td>
                        <td>
                          <strong>{student.name}</strong>
                          {info.reason && (
                            <div
                              style={{
                                marginTop: 4,
                                padding: '4px 8px',
                                backgroundColor: info.requestStatus === 'pending' ? '#fef3c7' : '#f4f6f4',
                                border: info.requestStatus === 'pending' ? '1px solid #fde68a' : '1px solid #e1e7dc',
                                borderRadius: 6,
                                fontSize: 11,
                                display: 'inline-block',
                                maxWidth: '100%',
                              }}
                            >
                              <span
                                style={{
                                  fontWeight: 600,
                                  color: info.requestStatus === 'pending' ? '#b45309' : '#166534',
                                  display: 'block',
                                }}
                              >
                                {info.requestStatus === 'pending'
                                  ? `🔔 Requested ${info.requestedType?.replace('_', ' ').toUpperCase() || 'EXCUSE'}:`
                                  : 'Note:'}
                              </span>
                              <span style={{ color: '#294339', fontStyle: 'italic' }}>
                                &quot;{info.reason}&quot;
                              </span>
                            </div>
                          )}
                        </td>
                        <td>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                            {info.requestStatus === 'pending' && (
                              <span
                                style={{
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                  padding: '2px 7px',
                                  borderRadius: 10,
                                  fontSize: 10,
                                  fontWeight: 700,
                                  backgroundColor: '#fef3c7',
                                  color: '#b45309',
                                  border: '1px solid #fde68a',
                                  width: 'fit-content',
                                }}
                              >
                                <Clock size={11} />
                                PENDING REVIEW
                              </span>
                            )}
                            <StatusBadge status={info.status} />
                          </div>
                        </td>
                        <td>
                          <span style={{ fontSize: 11, color: '#556960' }}>
                            {info.method} {info.time ? `(${info.time})` : ''}
                          </span>
                        </td>
                        <td>
                          {/* Approve / Reject pending student excuse request */}
                          {info.requestStatus === 'pending' && (
                            <div style={{ display: 'flex', gap: 5, marginBottom: 6, flexWrap: 'wrap' }}>
                              <button
                                type="button"
                                className="button primary"
                                style={{
                                  padding: '4px 10px',
                                  fontSize: 11,
                                  backgroundColor: '#166534',
                                  color: '#ffffff',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 4,
                                }}
                                onClick={() =>
                                  handleReviewExcuse(
                                    student._id,
                                    'approved',
                                    targetSession._id,
                                    info.requestedType
                                  )
                                }
                                title="Approve student request"
                              >
                                <Check size={13} />
                                Approve{' '}
                                {info.requestedType === 'on_duty'
                                  ? 'OD'
                                  : info.requestedType === 'permission'
                                  ? 'Permission'
                                  : 'Excuse'}
                              </button>
                              <button
                                type="button"
                                className="button"
                                style={{
                                  padding: '4px 8px',
                                  fontSize: 11,
                                  backgroundColor: '#fee2e2',
                                  color: '#991b1b',
                                  border: '1px solid #fca5a5',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                  gap: 3,
                                }}
                                onClick={() =>
                                  handleReviewExcuse(student._id, 'rejected', targetSession._id)
                                }
                                title="Reject request and mark Absent"
                              >
                                <XCircle size={13} />
                                Reject
                              </button>
                            </div>
                          )}

                          {/* Quick action buttons for Present, Absent, Excused, On Duty (OD), Permission */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, flexWrap: 'wrap' }}>
                            <button
                              type="button"
                              className="button"
                              style={{
                                padding: '3px 7px',
                                fontSize: 10,
                                backgroundColor: info.status === 'present' ? '#dcfce7' : '#ffffff',
                                color: info.status === 'present' ? '#166534' : '#3d5c52',
                              }}
                              onClick={() =>
                                handleQuickStatusChange(student._id, 'present', 'Marked present by faculty')
                              }
                              title="Mark Present"
                            >
                              Present
                            </button>

                            <button
                              type="button"
                              className="button"
                              style={{
                                padding: '3px 7px',
                                fontSize: 10,
                                backgroundColor: info.status === 'absent' ? '#fee2e2' : '#ffffff',
                                color: info.status === 'absent' ? '#991b1b' : '#3d5c52',
                              }}
                              onClick={() =>
                                handleQuickStatusChange(student._id, 'absent', 'Marked absent by faculty')
                              }
                              title="Mark Absent"
                            >
                              Absent
                            </button>

                            <button
                              type="button"
                              className="button"
                              style={{
                                padding: '3px 7px',
                                fontSize: 10,
                                backgroundColor: info.status === 'on_duty' ? '#e0f2fe' : '#ffffff',
                                color: info.status === 'on_duty' ? '#0369a1' : '#3d5c52',
                              }}
                              onClick={() =>
                                handleQuickStatusChange(student._id, 'on_duty', 'College On-Duty authorized')
                              }
                              title="Mark On Duty"
                            >
                              OD
                            </button>

                            <button
                              type="button"
                              className="button"
                              style={{
                                padding: '3px 7px',
                                fontSize: 10,
                                backgroundColor: info.status === 'permission' ? '#f3e8ff' : '#ffffff',
                                color: info.status === 'permission' ? '#7e22ce' : '#3d5c52',
                              }}
                              onClick={() =>
                                handleQuickStatusChange(student._id, 'permission', 'Prior permission granted')
                              }
                              title="Mark Permission"
                            >
                              Permission
                            </button>

                            <button
                              type="button"
                              className="button"
                              style={{
                                padding: '3px 7px',
                                fontSize: 10,
                                backgroundColor: info.status === 'excused' ? '#fef3c7' : '#ffffff',
                                color: info.status === 'excused' ? '#b45309' : '#3d5c52',
                              }}
                              onClick={() => {
                                setEditingStudent({
                                  studentId: student._id,
                                  studentName: student.name,
                                  studentCode: student.code,
                                  currentStatus: info.status,
                                });
                                setManualStatus('excused');
                                setManualReason('Medical / Official leave');
                              }}
                              title="Add custom Excuse / Note"
                            >
                              Excuse…
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>

      {/* Manual Override / Excuse Note Dialog */}
      <Modal
        title={`Excuse / Status adjustment for ${editingStudent?.studentName}`}
        subtitle={`Register Number: ${editingStudent?.studentCode}`}
        isOpen={!!editingStudent}
        onClose={() => setEditingStudent(null)}
      >
        <form onSubmit={handleSaveManualRecord} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Attendance status
            </label>
            <select
              value={manualStatus}
              onChange={(e) => setManualStatus(e.target.value as AttendanceStatus)}
              style={{ width: '100%' }}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
              <option value="excused">Excused (Medical Leave)</option>
              <option value="on_duty">On Duty (OD - Official Event/Symposium)</option>
              <option value="permission">Permission (Approved Early Exit/Tardy)</option>
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Reason / Permission notes <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={manualReason}
              onChange={(e) => setManualReason(e.target.value)}
              placeholder="e.g. Participated in inter-college hackathon with HOD permission."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="button" onClick={() => setEditingStudent(null)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Save adjustment
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
