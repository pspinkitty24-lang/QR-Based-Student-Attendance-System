import React, { useState, useEffect, useRef } from 'react';
import jsQR from 'jsqr';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  AlertCircle,
  QrCode,
  ShieldCheck,
  SwitchCamera,
  Keyboard,
  ArrowRight,
  Clock,
  Sparkles,
  Calendar,
  Check,
} from 'lucide-react';
import { User, AttendanceRecord, AttendanceSession } from '../types';
import { store } from '../services/store';
import { realtimeSync } from '../services/realtimeSync';
import { StatusBadge } from '../components/StatusBadge';

interface ScanQRProps {
  user: User;
  notify?: (msg: string) => void;
}

export const ScanQR: React.FC<ScanQRProps> = ({ user, notify }) => {
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState<string>('');
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [scanResult, setScanResult] = useState<{
    record: AttendanceRecord;
    alreadyMarked?: boolean;
    subjectName: string;
  } | null>(null);

  // Manual code input fallback for restricted iframe or webcam-less testing
  const [manualCode, setManualCode] = useState('');
  const [showManualInput, setShowManualInput] = useState(false);
  const [processing, setProcessing] = useState(false);

  const [activeSession, setActiveSession] = useState<AttendanceSession | null>(() => {
    return store.getSessions().find((s) => s.status === 'active') || null;
  });

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  // Synchronize active session state and request live sessions from faculty across devices
  useEffect(() => {
    const updateSession = () => {
      const live = store.getSessions().find((s) => s.status === 'active');
      setActiveSession(live || null);
    };

    updateSession();
    const unsubscribe = store.subscribe(updateSession);

    // Request active session from any faculty laptop online
    realtimeSync.send('REQUEST_ACTIVE_SESSION', {});

    return unsubscribe;
  }, []);

  // Clean up camera stream on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    setCameraError('');
    setScanResult(null);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setCameraError('Camera access is not supported by your browser. Please enter the backup code manually below.');
      setShowManualInput(true);
      return;
    }

    try {
      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.setAttribute('playsinline', 'true');
        await videoRef.current.play();
        setCameraActive(true);
        requestAnimationFrame(tickScanner);
      }
    } catch (err: any) {
      console.warn('Camera permission denied or unavailable:', err);
      setCameraError(
        'Could not access camera. Please allow camera permissions or enter the code displayed on the classroom screen below.'
      );
      setCameraActive(false);
      setShowManualInput(true);
    }
  };

  const stopCamera = () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraActive(false);
  };

  const toggleCameraFacing = async () => {
    stopCamera();
    setFacingMode((prev) => (prev === 'environment' ? 'user' : 'environment'));
    setTimeout(() => {
      startCamera();
    }, 200);
  };

  // Continuous frame scanner via hidden canvas and jsQR
  const tickScanner = () => {
    if (videoRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
      const video = videoRef.current;
      const canvas = canvasRef.current;

      if (canvas) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d', { willReadFrequently: true });

        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const code = jsQR(imageData.data, imageData.width, imageData.height, {
            inversionAttempts: 'dontInvert',
          });

          if (code && code.data) {
            handleCodeScanned(code.data);
            return;
          }
        }
      }
    }

    animationFrameRef.current = requestAnimationFrame(tickScanner);
  };

  // Process scanned or entered code
  const handleCodeScanned = (payload: string) => {
    stopCamera();
    setProcessing(true);
    setCameraError('');

    try {
      const result = store.markAttendanceViaQR(user._id, payload);
      setScanResult(result);
      if (result.session) {
        setActiveSession(result.session);
      }

      if (result.alreadyMarked) {
        if (notify) notify('Notice: Your attendance is already recorded for this session.');
      } else {
        if (notify) notify(`Success: Attendance marked for ${result.subjectName}!`);
        try {
          const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
          const osc = audioCtx.createOscillator();
          const gain = audioCtx.createGain();
          osc.connect(gain);
          gain.connect(audioCtx.destination);
          osc.frequency.setValueAtTime(587.33, audioCtx.currentTime); // D5
          osc.frequency.setValueAtTime(880, audioCtx.currentTime + 0.1); // A5
          gain.gain.setValueAtTime(0.15, audioCtx.currentTime);
          gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
          osc.start();
          osc.stop(audioCtx.currentTime + 0.35);
        } catch {
          // Ignore audio error
        }
      }
    } catch (err: any) {
      setCameraError(err.message || 'Verification failed.');
    } finally {
      setProcessing(false);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualCode.trim()) {
      setCameraError('Please enter the 6-digit PIN or token code shown on screen.');
      return;
    }
    handleCodeScanned(manualCode.trim());
  };

  // Student's personal attendance report
  const studentEligibility = store
    .getAttendanceEligibilityReport()
    .find((r) => r.studentDbId === user._id);

  // Recent attendance sessions for this student
  const studentSessions = store.getSessions().filter((s) => {
    return s.records.some((r) => r.studentId === user._id);
  });

  const getActiveSubjectName = () => {
    if (!activeSession) return 'Lecture Session';
    const a = store.getAssignments().find((item) => item._id === activeSession.assignmentId);
    const subj = store.getSubjects().find((s) => s._id === (a?.subjectId || activeSession.subjectId));
    const cls = store.getClasses().find((c) => c._id === (a?.classId || activeSession.classId));
    return `${subj?.name || 'Classroom Lecture'} (${cls?.name?.split(' ')[0] || ''})`;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">STUDENT VERIFICATION · {user.code}</span>
          <h1>One scan. You’re present.</h1>
          <p>Open the camera and scan the static QR code displayed on the classroom screen.</p>
        </div>
      </div>

      {/* Live Session Alert Banner if active */}
      {activeSession ? (
        <div
          style={{
            padding: '16px 20px',
            borderRadius: 10,
            backgroundColor: '#eaf4eb',
            border: '1px solid #b7dfbe',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: 12,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              style={{
                width: 12,
                height: 12,
                borderRadius: '50%',
                backgroundColor: '#166534',
                animation: 'pulse 1.5s infinite',
              }}
            />
            <div>
              <strong style={{ fontSize: 14, color: '#164d40' }}>
                Live Session Active: {getActiveSubjectName()}
              </strong>
              <p style={{ fontSize: 12, color: '#406354', margin: '2px 0 0' }}>
                Scan the classroom QR now to record your verified attendance before the session ends.
              </p>
            </div>
          </div>

          <span
            style={{
              padding: '6px 12px',
              borderRadius: 6,
              backgroundColor: '#166534',
              color: '#ffffff',
              fontSize: 12,
              fontWeight: 600,
            }}
          >
            Accepting Check-Ins
          </span>
        </div>
      ) : (
        <div
          style={{
            padding: '14px 20px',
            borderRadius: 10,
            backgroundColor: '#f7f8f5',
            border: '1px solid #e6ebe5',
            fontSize: 13,
            color: '#667970',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <Clock size={16} color="#89948e" />
          <span>
            No attendance session is currently open. When your faculty starts a session, the QR code will be projected on screen.
          </span>
        </div>
      )}

      {/* Scanner & Guide Split */}
      <div className="scanner-layout">
        {/* Left: Camera Scanner Panel */}
        <section className="panel scanner-panel">
          <div className="panel-title">
            <div>
              <h2>Scan attendance QR</h2>
              <p>Keep the entire code inside the frame.</p>
            </div>
            {cameraActive && (
              <button
                className="icon-button"
                onClick={toggleCameraFacing}
                title="Switch Camera"
                style={{ padding: 6, color: '#166552' }}
              >
                <SwitchCamera size={19} />
              </button>
            )}
          </div>

          <div style={{ position: 'relative', overflow: 'hidden', minHeight: 320, backgroundColor: '#0c1f17', borderRadius: 8 }}>
            <canvas ref={canvasRef} style={{ display: 'none' }} />

            {/* Live Video feed */}
            <video
              ref={videoRef}
              style={{
                width: '100%',
                height: 340,
                objectFit: 'cover',
                display: cameraActive ? 'block' : 'none',
              }}
            />

            {/* Viewfinder Target Graphic (when camera is on) */}
            {cameraActive && (
              <div
                style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  pointerEvents: 'none',
                }}
              >
                <div
                  style={{
                    width: 220,
                    height: 220,
                    border: '2px solid rgba(255, 255, 255, 0.75)',
                    borderRadius: 16,
                    boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.45)',
                    position: 'relative',
                  }}
                >
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      left: -2,
                      width: 22,
                      height: 22,
                      borderTop: '4px solid #4ade80',
                      borderLeft: '4px solid #4ade80',
                      borderTopLeftRadius: 16,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      top: -2,
                      right: -2,
                      width: 22,
                      height: 22,
                      borderTop: '4px solid #4ade80',
                      borderRight: '4px solid #4ade80',
                      borderTopRightRadius: 16,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      left: -2,
                      width: 22,
                      height: 22,
                      borderBottom: '4px solid #4ade80',
                      borderLeft: '4px solid #4ade80',
                      borderBottomLeftRadius: 16,
                    }}
                  />
                  <span
                    style={{
                      position: 'absolute',
                      bottom: -2,
                      right: -2,
                      width: 22,
                      height: 22,
                      borderBottom: '4px solid #4ade80',
                      borderRight: '4px solid #4ade80',
                      borderBottomRightRadius: 16,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Camera Inactive Placeholder */}
            {!cameraActive && !scanResult && (
              <div
                className="scanner-placeholder"
                style={{
                  height: 340,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#e4ede7',
                  textAlign: 'center',
                  padding: 24,
                }}
              >
                <div
                  style={{
                    width: 72,
                    height: 72,
                    borderRadius: '50%',
                    backgroundColor: 'rgba(255, 255, 255, 0.08)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 16,
                    color: '#a3c2b3',
                  }}
                >
                  <QrCode size={36} />
                </div>
                <h3 style={{ fontSize: 18, color: '#f5f7f5', margin: '0 0 6px', fontWeight: 600 }}>
                  Ready to scan.
                </h3>
                <p style={{ fontSize: 12, color: '#9bb0a5', maxWidth: 280, margin: 0 }}>
                  Click below to enable your camera and scan the static classroom QR.
                </p>
              </div>
            )}

            {/* Scan Success State */}
            {scanResult && (
              <div
                className="scan-success"
                style={{
                  height: 340,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  backgroundColor: '#f6f9f5',
                  padding: 24,
                  textAlign: 'center',
                }}
              >
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: '50%',
                    backgroundColor: scanResult.alreadyMarked ? '#fef3c7' : '#dcfce7',
                    color: scanResult.alreadyMarked ? '#d97706' : '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 14,
                  }}
                >
                  <CheckCircle2 size={36} />
                </div>

                <h2 style={{ fontSize: 20, color: '#164d40', margin: '0 0 4px', fontWeight: 600 }}>
                  {scanResult.alreadyMarked
                    ? 'Your attendance is already recorded.'
                    : 'You’re present!'}
                </h2>

                <p style={{ fontSize: 13, color: '#4a6b5d', margin: '0 0 12px' }}>
                  {scanResult.subjectName}
                </p>

                <StatusBadge status={scanResult.record.status} />

                <small style={{ marginTop: 12, color: '#89948e', fontSize: 11 }}>
                  Verified: {new Date(scanResult.record.markedAt).toLocaleTimeString('en-IN', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })} · Saved in campus database
                </small>
              </div>
            )}
          </div>

          {/* Error feedback */}
          {cameraError && (
            <div className="alert error" style={{ margin: '18px 24px 0' }}>
              <AlertCircle size={17} style={{ flexShrink: 0, marginTop: 1 }} />
              <div>{cameraError}</div>
            </div>
          )}

          {/* Action Controls */}
          <div className="scanner-controls" style={{ padding: '20px 24px', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              className="button primary"
              disabled={processing}
              onClick={cameraActive ? stopCamera : startCamera}
              style={{ flex: 1, minWidth: 160 }}
            >
              {cameraActive ? (
                <>
                  <CameraOff size={16} />
                  <span>Stop camera</span>
                </>
              ) : scanResult ? (
                <>
                  <Camera size={16} />
                  <span>Scan another session</span>
                </>
              ) : (
                <>
                  <Camera size={16} />
                  <span>Enable camera</span>
                </>
              )}
            </button>

            <button
              className="button"
              type="button"
              onClick={() => setShowManualInput(!showManualInput)}
              style={{ display: 'flex', alignItems: 'center', gap: 6 }}
            >
              <Keyboard size={16} />
              <span>{showManualInput ? 'Hide manual code' : 'Enter code'}</span>
            </button>
          </div>

          {/* Manual Token Code Entry Fallback */}
          {showManualInput && (
            <div
              style={{
                padding: '0 24px 20px',
                borderTop: '1px solid #f0f3ef',
                paddingTop: 16,
              }}
            >
              <form onSubmit={handleManualSubmit}>
                <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#166552', marginBottom: 6 }}>
                  Session PIN (6-Digit) or Token Code:
                </label>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    type="text"
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    placeholder="e.g. 839120 or ATND-..."
                    style={{ flex: 1, padding: '9px 12px', fontSize: 13, fontFamily: 'monospace' }}
                  />
                  <button type="submit" className="button primary" disabled={processing}>
                    Verify code
                  </button>
                </div>
                <small style={{ display: 'block', fontSize: 10, color: '#89948e', marginTop: 6 }}>
                  If camera access is blocked in your mobile browser, simply enter the 6-digit PIN shown on the classroom screen.
                </small>
              </form>
            </div>
          )}
        </section>

        {/* Right: Personal Status Card & Guide */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Student Standing Card */}
          {studentEligibility && (
            <section className="panel" style={{ padding: '22px 24px' }}>
              <span className="eyebrow">YOUR ATTENDANCE STANDING</span>
              <h2 style={{ fontSize: 18, color: '#164d40', margin: '4px 0 14px' }}>
                {studentEligibility.studentName} ({studentEligibility.studentId})
              </h2>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginBottom: 14 }}>
                <div style={{ padding: '10px 12px', backgroundColor: '#fafbf9', borderRadius: 8, border: '1px solid #e6ebe5' }}>
                  <small style={{ fontSize: 10, color: '#89948e', textTransform: 'uppercase' }}>Present Days</small>
                  <strong style={{ display: 'block', fontSize: 18, color: '#166534', marginTop: 2 }}>
                    {studentEligibility.totalPresentDays} / {studentEligibility.totalWorkingDays}
                  </strong>
                </div>

                <div style={{ padding: '10px 12px', backgroundColor: '#fafbf9', borderRadius: 8, border: '1px solid #e6ebe5' }}>
                  <small style={{ fontSize: 10, color: '#89948e', textTransform: 'uppercase' }}>Attendance %</small>
                  <strong style={{ display: 'block', fontSize: 18, color: '#164d40', marginTop: 2 }}>
                    {studentEligibility.attendancePercentage}%
                  </strong>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid #f0f3ef', paddingTop: 12 }}>
                <span style={{ fontSize: 12, color: '#52665e' }}>Examination Status:</span>
                <span
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 14,
                    fontSize: 12,
                    fontWeight: 600,
                    backgroundColor: studentEligibility.isEligible ? '#dcfce7' : '#fee2e2',
                    color: studentEligibility.isEligible ? '#166534' : '#991b1b',
                  }}
                >
                  {studentEligibility.isEligible ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />}
                  {studentEligibility.isEligible ? 'Eligible to Exam' : 'Not Eligible'}
                </span>
              </div>
            </section>
          )}

          {/* Guide Steps */}
          <section className="panel scanner-guide">
            <span className="eyebrow">A SIMPLE CHECK-IN</span>
            <h2>Made for the classroom.</h2>

            {[
              ['01', 'Find your class QR', 'Your faculty starts the session and displays the static QR code on screen.'],
              ['02', 'Point your camera', 'Sign in using your own verified student account to prevent proxy marking.'],
              ['03', 'Look for confirmation', 'A green confirmation pill means your attendance record is saved.'],
            ].map(([num, heading, text]) => (
              <div key={num} className="guide-step">
                <span>{num}</span>
                <div>
                  <h3>{heading}</h3>
                  <p>{text}</p>
                </div>
              </div>
            ))}

            <div className="tip">
              <span>HAVING TROUBLE?</span>
              <p>
                Ask your faculty for an audited manual excuse / permission / on-duty adjustment if your camera is unavailable.
              </p>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
