import React, { useState } from 'react';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  ArrowRight,
  Check,
  User,
  GraduationCap,
  Briefcase,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Brand } from '../components/Brand';
import { User as UserType } from '../types';
import { store } from '../services/store';

interface LoginProps {
  onLogin: (user: UserType) => void;
  onError: (msg: string) => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [identifier, setIdentifier] = useState('admin@college.edu');
  const [password, setPassword] = useState('Password123!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showQuickRef, setShowQuickRef] = useState(false);

  const users = store.getUsers();
  const faculties = users.filter((u) => u.role === 'faculty');
  const students = users.filter((u) => u.role === 'student');
  const adminUser = users.find((u) => u.role === 'admin');

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setLoading(true);

    try {
      const user = store.authenticateUser(identifier);
      if (user) {
        onLogin(user);
      } else {
        setErrorMessage(
          'Account not found. Please enter a valid username, email, or register number.'
        );
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Authentication error.');
    } finally {
      setLoading(false);
    }
  };

  const handleFillCredentials = (cred: string) => {
    setIdentifier(cred);
    setPassword('Password123!');
    setErrorMessage('');
  };

  return (
    <div className="login">
      {/* Left pane: Story Panel */}
      <section className="login-story">
        <Brand light />

        <div className="story-content">
          <span className="eyebrow light">DEPARTMENT OF COMPUTER SCIENCE</span>
          <h1>
            Less taking attendance.
            <br />
            <em>More being present.</em>
          </h1>
          <p>
            A unified academic workspace connecting MCA, M.Sc, and MDS classrooms with real-time verification and eligibility reports.
          </p>

          <div className="login-illustration">
            <div className="mini-window">
              <span className="mini-label">
                <span className="dot" /> CLASSROOM CONNECTED
              </span>

              <div className="mini-row">
                <span className="avatar">AK</span>
                <div>
                  <b>One scan. You&apos;re here.</b>
                  <small>Verified attendance, in real time.</small>
                </div>
                <span className="check-disc">
                  <Check size={20} />
                </span>
              </div>

              <div className="mini-bars">
                {[45, 70, 54, 86, 66, 92, 78, 100, 84, 96, 88, 100].map((h, i) => (
                  <i key={i} style={{ height: `${h}%` }} />
                ))}
              </div>

              <div className="mini-foot">
                <span>Clarity for MCA, M.Sc & MDS classes.</span>
                <ArrowRight size={18} />
              </div>
            </div>

            <span className="floating-label">
              <ShieldCheck size={17} /> Signed & verified
            </span>
          </div>
        </div>

        <div className="story-footer">
          <span>Thoughtfully built for education.</span>
          <span>01 / 03</span>
        </div>
      </section>

      {/* Right pane: Common Unified Login Form */}
      <section className="login-form">
        <div className="login-form-inner">
          <span className="eyebrow">DEPARTMENT OF COMPUTER SCIENCE</span>
          <h2>Welcome back.</h2>
          <p>Sign in with your campus account (Admin, Faculty, or Student).</p>

          {errorMessage && (
            <div className="alert error" style={{ marginBottom: 20 }}>
              {errorMessage}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="field">
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 500,
                  marginBottom: 7,
                  color: '#3d5c52',
                }}
              >
                Username, Email, or Register No.
              </label>
              <div className="input-icon">
                <User size={17} />
                <input
                  type="text"
                  autoComplete="username"
                  required
                  placeholder="e.g. admin, faculty, or REG2024-001"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                />
              </div>
            </div>

            <div className="field">
              <label
                style={{
                  display: 'block',
                  fontSize: 11,
                  fontWeight: 500,
                  marginBottom: 7,
                  color: '#3d5c52',
                }}
              >
                Password
              </label>
              <div className="input-icon">
                <Lock size={17} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                />
                <button
                  type="button"
                  aria-label="Show or hide password"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            <button
              className="text-button forgot"
              type="button"
              onClick={() => alert('Password reset link sent to your registered department email.')}
            >
              Forgot password?
            </button>

            <button
              className="button primary full"
              type="submit"
              disabled={loading}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                width: '100%',
                marginTop: 6,
              }}
            >
              {loading ? 'Signing in…' : 'Sign in to workspace'}
              <ArrowRight size={16} />
            </button>
          </form>

          {/* Collapsible Demo Credentials Quick Reference */}
          <div
            style={{
              marginTop: 22,
              borderRadius: 8,
              border: '1px solid #dce4d7',
              backgroundColor: '#f8faf7',
              overflow: 'hidden',
            }}
          >
            <button
              type="button"
              onClick={() => setShowQuickRef(!showQuickRef)}
              style={{
                width: '100%',
                padding: '9px 12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: 11,
                fontWeight: 600,
                color: '#466657',
              }}
            >
              <span>Demo Accounts & Logins (Cheat-sheet)</span>
              {showQuickRef ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
            </button>

            {showQuickRef && (
              <div style={{ padding: '10px 12px', borderTop: '1px solid #e2e8dd', fontSize: 11, color: '#314c42' }}>
                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: '#166552', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <ShieldCheck size={12} /> Admin (1):
                  </div>
                  <button
                    type="button"
                    onClick={() => handleFillCredentials('admin@college.edu')}
                    style={{
                      padding: '3px 8px',
                      borderRadius: 4,
                      backgroundColor: '#e6f2ed',
                      border: '1px solid #c2ded2',
                      fontSize: 10,
                      cursor: 'pointer',
                      color: '#165544',
                    }}
                  >
                    Dr. Elena Vance (<code>admin@college.edu</code> or <code>admin</code>)
                  </button>
                </div>

                <div style={{ marginBottom: 8 }}>
                  <div style={{ fontWeight: 600, color: '#166552', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <Briefcase size={12} /> Faculty (3):
                  </div>
                  <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('faculty@college.edu')}
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        backgroundColor: '#ffffff',
                        border: '1px solid #d0ded6',
                        fontSize: 10,
                        cursor: 'pointer',
                        color: '#234438',
                      }}
                    >
                      Prof. Alan Turing (<code>faculty</code>)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('sharma@college.edu')}
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        backgroundColor: '#ffffff',
                        border: '1px solid #d0ded6',
                        fontSize: 10,
                        cursor: 'pointer',
                        color: '#234438',
                      }}
                    >
                      Dr. Priya Sharma (<code>sharma</code>)
                    </button>
                    <button
                      type="button"
                      onClick={() => handleFillCredentials('subramanian@college.edu')}
                      style={{
                        padding: '3px 7px',
                        borderRadius: 4,
                        backgroundColor: '#ffffff',
                        border: '1px solid #d0ded6',
                        fontSize: 10,
                        cursor: 'pointer',
                        color: '#234438',
                      }}
                    >
                      Dr. K. Subramanian (<code>subramanian</code>)
                    </button>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: 600, color: '#166552', display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
                    <GraduationCap size={12} /> Students (30 total · 10 per Class):
                  </div>

                  {/* MCA */}
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#164d40', display: 'block', marginBottom: 2 }}>
                      MCA (10 Students · MCA2024-001 to 010):
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MCA2024-001')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Arun (<code>MCA2024-001</code>)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MCA2024-002')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Maya (<code>MCA2024-002</code>)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MCA2024-003')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Rahul (<code>MCA2024-003</code>)
                      </button>
                    </div>
                  </div>

                  {/* M.Sc */}
                  <div style={{ marginBottom: 6 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#164d40', display: 'block', marginBottom: 2 }}>
                      M.Sc CS (10 Students · MSC2024-001 to 010):
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MSC2024-001')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Dev (<code>MSC2024-001</code>)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MSC2024-002')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Zara (<code>MSC2024-002</code>)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MSC2024-003')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Karthik (<code>MSC2024-003</code>)
                      </button>
                    </div>
                  </div>

                  {/* MDS */}
                  <div style={{ marginBottom: 4 }}>
                    <span style={{ fontSize: 9.5, fontWeight: 700, color: '#164d40', display: 'block', marginBottom: 2 }}>
                      MDS (10 Students · MDS2024-001 to 010):
                    </span>
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MDS2024-001')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Divya (<code>MDS2024-001</code>)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MDS2024-002')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Sanjay (<code>MDS2024-002</code>)
                      </button>
                      <button
                        type="button"
                        onClick={() => handleFillCredentials('MDS2024-003')}
                        style={{
                          padding: '2px 6px',
                          borderRadius: 4,
                          backgroundColor: '#ffffff',
                          border: '1px solid #d0ded6',
                          fontSize: 10,
                          cursor: 'pointer',
                          color: '#234438',
                        }}
                      >
                        Sneha (<code>MDS2024-003</code>)
                      </button>
                    </div>
                  </div>

                  <small style={{ display: 'block', color: '#688277', marginTop: 4, fontSize: 10 }}>
                    Password for all accounts: <code>Password123!</code> · Or login with shortcuts <code>admin</code>, <code>faculty</code>, <code>mca</code>, <code>msc</code>, <code>mds</code>
                  </small>
                </div>
              </div>
            )}
          </div>

          <div className="login-security" style={{ marginTop: 18 }}>
            <ShieldCheck size={14} />
            <span>256-bit encrypted · Role-based session routing</span>
          </div>

          <div className="login-copyright">
            © 2026 Department of Computer Science · Attendly
          </div>
        </div>
      </section>
    </div>
  );
};
