import React, { useState } from 'react';
import { Bell, Plus, CheckCircle, AlertTriangle, Info, Calendar } from 'lucide-react';
import { User, NotificationItem } from '../types';
import { store } from '../services/store';
import { Modal } from '../components/Modal';

interface NotificationsProps {
  user: User;
  notify?: (msg: string) => void;
}

export const Notifications: React.FC<NotificationsProps> = ({ user, notify }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() =>
    store.getNotifications()
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newNotice, setNewNotice] = useState({
    title: '',
    message: '',
    priority: 'normal' as 'low' | 'normal' | 'high',
  });

  const handleCreateNotice = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      store.addNotification(
        newNotice.title.trim(),
        newNotice.message.trim(),
        newNotice.priority,
        user.name
      );
      setNotifications(store.getNotifications());
      setIsModalOpen(false);
      setNewNotice({ title: '', message: '', priority: 'normal' });
      if (notify) notify('Campus notice published to all workspaces.');
    } catch (err: any) {
      alert(err.message || 'Failed to publish notice.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">CAMPUS BROADCASTS</span>
          <h1>Notifications & notices</h1>
          <p>Official academic alerts, examination notices, and attendance advisories.</p>
        </div>

        {user.role === 'admin' && (
          <div className="heading-actions">
            <button className="button primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={16} />
              <span>Broadcast notice</span>
            </button>
          </div>
        )}
      </div>

      <section className="panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {notifications.map((item) => (
            <div
              key={item._id}
              className="notice-row"
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 16,
                padding: '16px 20px',
                borderRadius: 10,
                backgroundColor: item.priority === 'high' ? '#fffaf5' : '#ffffff',
                border: item.priority === 'high' ? '1px solid #fcd34d' : '1px solid #e6ebe5',
              }}
            >
              <div
                style={{
                  width: 38,
                  height: 38,
                  borderRadius: '50%',
                  backgroundColor: item.priority === 'high' ? '#fee2e2' : '#f0f4ee',
                  color: item.priority === 'high' ? '#dc2626' : '#166552',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  marginTop: 2,
                }}
              >
                {item.priority === 'high' ? <AlertTriangle size={18} /> : <Bell size={18} />}
              </div>

              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: '#164d40', margin: 0 }}>
                    {item.title}
                  </h3>
                  {item.priority === 'high' && (
                    <span
                      style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: 10,
                        backgroundColor: '#fee2e2',
                        color: '#991b1b',
                        textTransform: 'uppercase',
                      }}
                    >
                      High priority
                    </span>
                  )}
                </div>
                <p style={{ fontSize: 13, color: '#4a5d54', lineHeight: 1.5, margin: 0 }}>
                  {item.message}
                </p>
                <small style={{ display: 'block', fontSize: 11, color: '#89948e', marginTop: 8 }}>
                  <Calendar size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 4 }} />
                  {new Date(item.date).toLocaleDateString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </small>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Broadcast Modal */}
      <Modal
        title="Broadcast campus notice"
        subtitle="This notification will be visible to students, faculty, and administrators."
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleCreateNotice} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Notice headline
            </label>
            <input
              type="text"
              required
              value={newNotice.title}
              onChange={(e) => setNewNotice({ ...newNotice, title: e.target.value })}
              placeholder="e.g. End-Semester Examination Schedule"
              style={{ width: '100%' }}
            />
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Priority level
            </label>
            <select
              value={newNotice.priority}
              onChange={(e) => setNewNotice({ ...newNotice, priority: e.target.value as any })}
              style={{ width: '100%' }}
            >
              <option value="normal">Normal announcement</option>
              <option value="high">High priority (Alert banner)</option>
              <option value="low">Low priority (Informational)</option>
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Notice message
            </label>
            <textarea
              required
              rows={4}
              value={newNotice.message}
              onChange={(e) => setNewNotice({ ...newNotice, message: e.target.value })}
              placeholder="Detail the announcement for students and faculty..."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 8 }}>
            <button type="button" className="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Publish notice
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
