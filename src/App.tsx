import React, { useState, useEffect } from 'react';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { User, Role } from './types';
import { store } from './services/store';
import { Sidebar } from './components/Sidebar';
import { Topbar } from './components/Topbar';
import { Login } from './pages/Login';
import { Overview } from './pages/Overview';
import { StudentsFaculty } from './pages/StudentsFaculty';
import { Academics } from './pages/Academics';
import { Timetable } from './pages/Timetable';
import { Attendance } from './pages/Attendance';
import { ScanQR } from './pages/ScanQR';
import { Reports } from './pages/Reports';
import { Notifications } from './pages/Notifications';
import { AuditTrail } from './pages/AuditTrail';
import { Settings } from './pages/Settings';
import { Profile } from './pages/Profile';
import { MobileBottomNav } from './components/MobileBottomNav';

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    // Check localStorage for logged-in user session
    const saved = localStorage.getItem('attendly_auth_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch {
        return null;
      }
    }
    // Default: Start at Login page for clean authentic experience
    return null;
  });

  const [currentPage, setCurrentPage] = useState<string>('Overview');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [globalError, setGlobalError] = useState<string>('');

  const settings = store.getSettings();

  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => {
      setToastMessage('');
    }, 3200);
  };

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    localStorage.setItem('attendly_auth_user', JSON.stringify(user));
    setCurrentPage('Overview');
    showToast(`Welcome back, ${user.name}!`);
  };

  const handleLogout = () => {
    if (currentUser) {
      store.addAuditLog(
        `${currentUser.name} (${currentUser.code})`,
        'LOGOUT',
        'User signed out of campus workspace.'
      );
    }
    setCurrentUser(null);
    localStorage.removeItem('attendly_auth_user');
    setCurrentPage('Overview');
  };

  // Ensure user cannot navigate to pages not allowed for their role
  useEffect(() => {
    if (!currentUser) return;

    if (currentUser.role === 'student') {
      const allowed = ['Overview', 'Scan QR', 'Attendance', 'Reports', 'Notifications', 'Profile'];
      if (!allowed.includes(currentPage)) {
        setCurrentPage('Overview');
      }
    } else if (currentUser.role === 'faculty') {
      const allowed = ['Overview', 'Timetable', 'Attendance', 'Reports', 'Notifications', 'Profile'];
      if (!allowed.includes(currentPage)) {
        setCurrentPage('Overview');
      }
    }
  }, [currentUser, currentPage]);

  // If not logged in, render the reference Login page
  if (!currentUser) {
    return (
      <>
        <Login onLogin={handleLogin} onError={setGlobalError} />
        {toastMessage && (
          <div className="toast" role="status">
            <CheckCircle2 size={19} />
            <span>{toastMessage}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <div className="app">
      {/* Sidebar Navigation */}
      <Sidebar
        user={currentUser}
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
        onLogout={handleLogout}
        isOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Shell */}
      <div className="main-shell">
        <Topbar
          user={currentUser}
          onToggleSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
          collegeName={settings.collegeName}
          onNavigate={setCurrentPage}
        />

        <main>
          {/* Main Route Switcher */}
          {currentPage === 'Overview' && (
            <Overview user={currentUser} onNavigate={setCurrentPage} />
          )}

          {currentPage === 'Students' && (
            <StudentsFaculty role="student" currentUser={currentUser} notify={showToast} />
          )}

          {currentPage === 'Faculty' && (
            <StudentsFaculty role="faculty" currentUser={currentUser} notify={showToast} />
          )}

          {currentPage === 'Academics' && (
            <Academics user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Timetable' && (
            <Timetable user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Attendance' && (
            <Attendance user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Scan QR' && (
            <ScanQR user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Reports' && (
            <Reports user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Notifications' && (
            <Notifications user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Audit trail' && (
            <AuditTrail user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Settings' && (
            <Settings user={currentUser} notify={showToast} />
          )}

          {currentPage === 'Profile' && (
            <Profile user={currentUser} onLogout={handleLogout} notify={showToast} />
          )}

          {/* Footer matching reference app */}
          <footer>
            <span>
              Attendly <b>•</b> A clear view of every classroom.
            </span>
            <span>
              <CheckCircle2 size={13} style={{ display: 'inline', marginRight: 4 }} />
              Secure campus workspace
            </span>
          </footer>
        </main>
      </div>

      {/* Mobile Bottom Navigation Bar (Visible on smartphones, hidden on laptops) */}
      <MobileBottomNav
        user={currentUser}
        currentPage={currentPage}
        onSelectPage={setCurrentPage}
      />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="toast" role="status">
          <CheckCircle2 size={19} />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
