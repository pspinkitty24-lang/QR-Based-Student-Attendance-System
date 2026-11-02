import React from 'react';
import {
  LayoutDashboard,
  QrCode,
  Scan,
  BarChart3,
  Users,
  User as UserIcon,
} from 'lucide-react';
import { User } from '../types';

interface MobileBottomNavProps {
  user: User;
  currentPage: string;
  onSelectPage: (page: string) => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  user,
  currentPage,
  onSelectPage,
}) => {
  // Navigation tabs customized per role for quick mobile access
  const navTabs =
    user.role === 'student'
      ? [
          { id: 'Overview', label: 'Home', icon: LayoutDashboard },
          { id: 'Scan QR', label: 'Scan QR', icon: Scan },
          { id: 'Reports', label: 'Eligibility', icon: BarChart3 },
          { id: 'Profile', label: 'Profile', icon: UserIcon },
        ]
      : user.role === 'faculty'
      ? [
          { id: 'Overview', label: 'Home', icon: LayoutDashboard },
          { id: 'Attendance', label: 'QR Session', icon: QrCode },
          { id: 'Reports', label: 'Reports', icon: BarChart3 },
          { id: 'Profile', label: 'Profile', icon: UserIcon },
        ]
      : [
          { id: 'Overview', label: 'Home', icon: LayoutDashboard },
          { id: 'Attendance', label: 'Attendance', icon: QrCode },
          { id: 'Students', label: 'Students', icon: Users },
          { id: 'Reports', label: 'Reports', icon: BarChart3 },
          { id: 'Profile', label: 'Profile', icon: UserIcon },
        ];

  return (
    <nav className="mobile-bottom-nav" aria-label="Mobile Navigation">
      {navTabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentPage === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            className={isActive ? 'active' : ''}
            onClick={() => onSelectPage(tab.id)}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon size={20} />
            <span>{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
};
