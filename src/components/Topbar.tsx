import React from 'react';
import { Menu, Calendar, Building2, Bell, Shield } from 'lucide-react';
import { User } from '../types';

interface TopbarProps {
  user: User;
  onToggleSidebar: () => void;
  collegeName: string;
  onNavigate: (page: string) => void;
  unreadCount?: number;
}

export const Topbar: React.FC<TopbarProps> = ({
  user,
  onToggleSidebar,
  collegeName,
  onNavigate,
  unreadCount = 1,
}) => {
  const todayStr = new Intl.DateTimeFormat('en-IN', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date());

  const initials = (user.name || '?')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <header className="topbar">
      <div className="crumb">
        <button
          className="mobile-toggle icon-button"
          onClick={onToggleSidebar}
          aria-label="Toggle navigation menu"
        >
          <Menu size={20} />
        </button>
        <span className="institution" title={collegeName}>
          <Building2 size={14} style={{ display: 'inline', marginRight: 6, verticalAlign: -2 }} />
          {collegeName}
        </span>
      </div>

      <div className="top-actions">
        <span className="today">
          <Calendar size={13} style={{ display: 'inline', marginRight: 5, verticalAlign: -1 }} />
          {todayStr}
        </span>

        <span className="divider" />

        <button
          className="icon-button"
          onClick={() => onNavigate('Notifications')}
          title="Notifications"
          style={{ position: 'relative' }}
        >
          <Bell size={18} />
          {unreadCount > 0 && (
            <span
              style={{
                position: 'absolute',
                top: 4,
                right: 4,
                width: 7,
                height: 7,
                borderRadius: '50%',
                backgroundColor: '#166552',
              }}
            />
          )}
        </button>

        <button
          onClick={() => onNavigate('Profile')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 8,
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            padding: '4px 8px',
            borderRadius: 8,
          }}
          title="View profile"
        >
          <div className="avatar small">{initials}</div>
          <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--green-dark)' }}>
            {user.name.split(' ')[0]}
          </span>
          <span
            style={{
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              padding: '2px 6px',
              borderRadius: 4,
              backgroundColor: '#e6ebe5',
              color: '#3d5c52',
              fontWeight: 600,
            }}
          >
            {user.role}
          </span>
        </button>
      </div>
    </header>
  );
};
