import React, { useState } from 'react';
import { Settings as SettingsIcon, Save, RotateCcw, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { User, CampusSettings } from '../types';
import { store } from '../services/store';

interface SettingsProps {
  user: User;
  notify?: (msg: string) => void;
}

export const Settings: React.FC<SettingsProps> = ({ user, notify }) => {
  const currentSettings = store.getSettings();
  const [formData, setFormData] = useState<CampusSettings>({ ...currentSettings });
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    store.updateSettings(
      {
        collegeName: formData.collegeName.trim(),
        timezone: formData.timezone.trim(),
        threshold: Number(formData.threshold),
        qrSeconds: Number(formData.qrSeconds),
        lateMinutes: Number(formData.lateMinutes),
        sessionMinutes: Number(formData.sessionMinutes),
      },
      user.name
    );
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
    if (notify) notify('Campus settings updated successfully.');
  };

  const handleResetData = () => {
    if (
      confirm(
        'Are you sure you want to restore default seed data? All custom sessions and records will be reinitialized.'
      )
    ) {
      store.resetToDefault(user.name);
      setFormData(store.getSettings());
      if (notify) notify('Database reloaded with default campus seed data.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">CAMPUS CONFIGURATION</span>
          <h1>System settings</h1>
          <p>Configure institutional attendance rules, threshold percentages, and QR rotations.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 600px)', gap: 24 }}>
        <form onSubmit={handleSave} className="panel" style={{ padding: '24px' }}>
          <div className="panel-title" style={{ padding: 0, marginBottom: 20 }}>
            <div>
              <h2>Attendance policies</h2>
              <p>Rules applied globally across all classrooms.</p>
            </div>
            {savedSuccess && (
              <span
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 5,
                  fontSize: 12,
                  color: '#166534',
                  fontWeight: 600,
                }}
              >
                <CheckCircle2 size={16} /> Saved
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Institution name
              </label>
              <input
                type="text"
                required
                value={formData.collegeName}
                onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Campus timezone
              </label>
              <input
                type="text"
                required
                value={formData.timezone}
                onChange={(e) => setFormData({ ...formData, timezone: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Shortage threshold (%)
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={formData.threshold}
                  onChange={(e) => setFormData({ ...formData, threshold: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <small style={{ fontSize: 10, color: '#89948e', marginTop: 4, display: 'block' }}>
                  Standard criterion: 75%
                </small>
              </div>

              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  QR rotation interval (seconds)
                </label>
                <input
                  type="number"
                  min={5}
                  max={120}
                  required
                  value={formData.qrSeconds}
                  onChange={(e) => setFormData({ ...formData, qrSeconds: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <small style={{ fontSize: 10, color: '#89948e', marginTop: 4, display: 'block' }}>
                  Recommended: 15 seconds
                </small>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Late threshold (minutes)
                </label>
                <input
                  type="number"
                  min={1}
                  max={60}
                  required
                  value={formData.lateMinutes}
                  onChange={(e) => setFormData({ ...formData, lateMinutes: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
                <small style={{ fontSize: 10, color: '#89948e', marginTop: 4, display: 'block' }}>
                  Scans after this are marked Late
                </small>
              </div>

              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Default period duration (mins)
                </label>
                <input
                  type="number"
                  min={15}
                  max={240}
                  required
                  value={formData.sessionMinutes}
                  onChange={(e) => setFormData({ ...formData, sessionMinutes: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </div>

            <div style={{ marginTop: 10, display: 'flex', justifyContent: 'flex-end' }}>
              <button type="submit" className="button primary" style={{ minWidth: 140 }}>
                <Save size={15} />
                <span>Save settings</span>
              </button>
            </div>
          </div>
        </form>

        {/* Database Management Card */}
        <section className="panel" style={{ padding: '24px' }}>
          <div className="panel-title" style={{ padding: 0, marginBottom: 14 }}>
            <div>
              <h2>Database operations</h2>
              <p>Data persistence and state synchronization.</p>
            </div>
            <RotateCcw size={18} style={{ color: '#89948e' }} />
          </div>

          <p style={{ fontSize: 13, color: '#4a5d54', lineHeight: 1.5, margin: '0 0 16px' }}>
            All operations are stored in local persistent storage and automatically synchronized across browser tabs.
            You can restore default seed records to test attendance calculation workflows.
          </p>

          <button
            type="button"
            className="button danger-light"
            onClick={handleResetData}
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
          >
            <RotateCcw size={15} />
            <span>Reset database to demo seed data</span>
          </button>
        </section>
      </div>
    </div>
  );
};
