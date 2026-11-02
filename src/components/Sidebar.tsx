import React from 'react';
import {
  LayoutDashboard,
  Users,
  Briefcase,
  BookOpen,
  Calendar,
  QrCode,
  BarChart3,
  Bell,
  ShieldCheck,
  Settings,
  User as UserIcon,
  Scan,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { Brand } from './Brand';
import { User } from '../types';

interface SidebarProps {
  user: User;
  currentPage: string;
  onSelectPage: (page: string) => void;
  onLogout: () => void;
  isOpen: boolean;
  onCloseMobile: () => void;
}

const PAGE_ICONS: Record<string, React.ElementType> = {
  Overview: LayoutDashboard,
  Students: Users,
  Faculty: Briefcase,
  Academics: BookOpen,
  Timetable: Calendar,
  Attendance: QrCode,
  Reports: BarChart3,
  'Scan QR': Scan,
  Notifications: Bell,
  'Audit trail': ShieldCheck,
  Settings: Settings,
  Profile: UserIcon,
};

export const Sidebar: React.FC<SidebarProps> = ({
  user,
  currentPage,
  onSelectPage,
  onLogout,
  isOpen,
  onCloseMobile,
}) => {
  // Navigation order matching reference website
  const workspaceNavItems =
    user.role === 'admin'
      ? ['Overview', 'Students', 'Faculty', 'Academics', 'Timetable', 'Attendance', 'Reports']
      : user.role === 'faculty'
      ? ['Overview', 'Timetable', 'Attendance', 'Reports']
      : ['Overview', 'Scan QR', 'Attendance', 'Reports'];

  const manageNavItems = [
    'Notifications',
    ...(user.role === 'admin' ? ['Audit trail', 'Settings'] : []),
    'Profile',
  ];

  const handleNavClick = (page: string) => {
    onSelectPage(page);
    onCloseMobile();
  };

  const initials = (user.name || '?')
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <>
      {isOpen && <div className="scrim" onClick={onCloseMobile} />}
      <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          <Brand />
          <div className="workspace-label">
            <span className="workspace-icon">
              <Sparkles size={14} />
            </span>
            <div>
              <strong>Campus workspace</strong>
              <small>
                {user.role === 'admin'
                  ? 'Administration'
                  : user.role === 'faculty'
                  ? 'Faculty workspace'
                  : 'Student workspace'}
              </small>
            </div>
          </div>
        </div>

        <span className="nav-caption">WORKSPACE</span>
        <nav>
          {workspaceNavItems.map((item) => {
            const Icon = PAGE_ICONS[item] || LayoutDashboard;
            const isSelected = currentPage === item;
            return (
              <button
                key={item}
                className={isSelected ? 'selected' : ''}
                onClick={() => handleNavClick(item)}
              >
                <Icon size={19} />
                <span>{item}</span>
                {isSelected && <span className="nav-active-dot" />}
              </button>
            );
          })}
        </nav>

        <span className="nav-caption" style={{ marginTop: 22 }}>
          MANAGE
        </span>
        <nav>
          {manageNavItems.map((item) => {
            const Icon = PAGE_ICONS[item] || UserIcon;
            const isSelected = currentPage === item;
            return (
              <button
                key={item}
                className={isSelected ? 'selected' : ''}
                onClick={() => handleNavClick(item)}
              >
                <Icon size={18} />
                <span>{item}</span>
                {isSelected && <span className="nav-active-dot" />}
              </button>
            );
          })}
        </nav>

        <div className="sidebar-bottom">
          <div className="sidebar-note">
            <ShieldCheck size={18} />
            <div>
              <strong>Attendance, with confidence.</strong>
              <p>Static session QR codes & real-time roster verification.</p>
            </div>
          </div>

          <div className="user-card">
            <div className="avatar">{initials}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {user.name}
              </strong>
              <small style={{ color: 'var(--muted)', display: 'block' }}>
                {user.code} · {user.role.toUpperCase()}
              </small>
            </div>
            <button
              className="icon-button"
              onClick={onLogout}
              title="Sign out of workspace"
              style={{ padding: 6, color: '#89948e' }}
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
