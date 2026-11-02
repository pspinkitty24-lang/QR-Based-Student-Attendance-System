import React, { useState } from 'react';
import { User as UserIcon, Shield, KeyRound, CheckCircle2, LogOut } from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';

interface ProfileProps {
  user: User;
  onLogout: () => void;
  notify?: (msg: string) => void;
}

export const Profile: React.FC<ProfileProps> = ({ user, onLogout, notify }) => {
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);
  const [passError, setPassError] = useState('');

  const initials = (user.name || '?')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPassError('');

    if (newPass.length < 8) {
      setPassError('New password must be at least 8 characters long.');
      return;
    }

    if (newPass !== confirmPass) {
      setPassError('Password confirmation does not match.');
      return;
    }

    store.addAuditLog(
      `${user.name} (${user.code})`,
      'PASSWORD_CHANGED',
      'User successfully changed their account password.'
    );

    setPassUpdated(true);
    setCurrentPass('');
    setNewPass('');
    setConfirmPass('');
    setTimeout(() => setPassUpdated(false), 3000);

    if (notify) notify('Password updated successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACCOUNT & SECURITY</span>
          <h1>User profile</h1>
          <p>Personal profile details, authenticated campus role, and security credentials.</p>
        </div>

        <div className="heading-actions">
          <button className="button danger-light" onClick={onLogout}>
            <LogOut size={16} />
            <span>Sign out of workspace</span>
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: 24 }}>
        {/* Profile Card */}
        <section className="panel" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 18, marginBottom: 24 }}>
            <div className="avatar big" style={{ width: 64, height: 64, fontSize: 22 }}>
              {initials}
            </div>
            <div>
              <h2 style={{ fontSize: 20, color: '#164d40', margin: '0 0 4px', fontWeight: 600 }}>
                {user.name}
              </h2>
              <span
                style={{
                  display: 'inline-block',
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: 'uppercase',
                  letterSpacing: '0.6px',
                  padding: '3px 8px',
                  borderRadius: 6,
                  backgroundColor: '#e6ebe5',
                  color: '#166552',
                }}
              >
                {user.role} workspace
              </span>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 14, borderTop: '1px solid #f0f3ef', paddingTop: 18 }}>
            <div>
              <small style={{ display: 'block', fontSize: 11, color: '#89948e', textTransform: 'uppercase' }}>
                {user.role === 'student' ? 'Register Number' : 'Employee Identification Number'}
              </small>
              <strong style={{ fontSize: 14, color: '#164d40', fontFamily: 'monospace' }}>
                {user.code}
              </strong>
            </div>

            <div>
              <small style={{ display: 'block', fontSize: 11, color: '#89948e', textTransform: 'uppercase' }}>
                Registered Campus Email
              </small>
              <strong style={{ fontSize: 14, color: '#233b34' }}>{user.email}</strong>
            </div>

            <div>
              <small style={{ display: 'block', fontSize: 11, color: '#89948e', textTransform: 'uppercase' }}>
                Account Security Status
              </small>
              <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#166534', fontWeight: 600, fontSize: 13, marginTop: 2 }}>
                <CheckCircle2 size={16} /> Verified Active Account
              </span>
            </div>
          </div>
        </section>

        {/* Change Password Card */}
        <section className="panel" style={{ padding: '28px' }}>
          <div className="panel-title" style={{ padding: 0, marginBottom: 18 }}>
            <div>
              <h2>Change password</h2>
              <p>Keep your account secure with a strong password.</p>
            </div>
            <KeyRound size={18} style={{ color: '#89948e' }} />
          </div>

          {passUpdated && (
            <div className="alert success" style={{ marginBottom: 16 }}>
              <CheckCircle2 size={16} />
              <span>Password successfully updated.</span>
            </div>
          )}

          {passError && (
            <div className="alert error" style={{ marginBottom: 16 }}>
              {passError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Current password
              </label>
              <input
                type="password"
                required
                value={currentPass}
                onChange={(e) => setCurrentPass(e.target.value)}
                placeholder="Enter current password"
                style={{ width: '100%' }}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                New password
              </label>
              <input
                type="password"
                required
                value={newPass}
                onChange={(e) => setNewPass(e.target.value)}
                placeholder="At least 8 characters"
                style={{ width: '100%' }}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Confirm new password
              </label>
              <input
                type="password"
                required
                value={confirmPass}
                onChange={(e) => setConfirmPass(e.target.value)}
                placeholder="Re-enter new password"
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ marginTop: 6, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="button primary">
                Update password
              </button>
            </div>
          </form>
        </section>
      </div>
    </div>
  );
};
