import React, { useState } from 'react';
import { Calendar, Clock, MapPin, Plus, Trash2, BookOpen } from 'lucide-react';
import { User, TimetablePeriod } from '../types';
import { store } from '../services/store';
import { Modal } from '../components/Modal';

interface TimetableProps {
  user: User;
  notify?: (msg: string) => void;
}

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export const Timetable: React.FC<TimetableProps> = ({ user, notify }) => {
  // Current day of week (0-6)
  const [selectedDay, setSelectedDay] = useState<number>(() => {
    const today = new Date().getDay();
    return today === 0 ? 1 : today; // Default to Monday if Sunday
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formData, setFormData] = useState({
    assignmentId: '',
    day: 1,
    startTime: '09:00',
    endTime: '10:00',
    room: 'Hall 301 - Academic Block',
  });

  const timetable = store.getTimetable();
  const assignments = store.getAssignments();
  const subjects = store.getSubjects();
  const classes = store.getClasses();
  const users = store.getUsers();
  const settings = store.getSettings();

  // Filter periods for user role:
  // Faculty: only periods where assignment faculty matches
  // Student: only periods where student's class matches assignment class
  const filteredPeriods = timetable.filter((period) => {
    if (period.day !== selectedDay) return false;

    const assign = assignments.find((a) => a._id === period.assignmentId);
    if (!assign) return false;

    if (user.role === 'faculty') {
      return assign.facultyId === user._id;
    }
    if (user.role === 'student' && user.classId) {
      return assign.classId === user.classId;
    }
    return true;
  });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      store.addTimetablePeriod(
        {
          assignmentId: formData.assignmentId || assignments[0]?._id,
          day: Number(formData.day),
          startTime: formData.startTime,
          endTime: formData.endTime,
          room: formData.room.trim(),
        },
        user.name
      );
      setIsAddModalOpen(false);
      if (notify) notify('Lecture period scheduled into weekly timetable.');
    } catch (err: any) {
      alert(err.message || 'Failed to schedule period.');
    }
  };

  const handleDelete = (id: string) => {
    if (confirm('Remove this timetable period?')) {
      store.deleteTimetablePeriod(id, user.name);
      if (notify) notify('Timetable period removed.');
    }
  };

  const getPeriodDetails = (assignmentId: string) => {
    const a = assignments.find((item) => item._id === assignmentId);
    if (!a) return { subjectName: 'Lecture Period', className: '—', facultyName: '—' };
    const s = subjects.find((sub) => sub._id === a.subjectId);
    const c = classes.find((cls) => cls._id === a.classId);
    const f = users.find((u) => u._id === a.facultyId);
    return {
      subjectName: s?.name || 'Subject',
      className: c?.name || 'Class',
      facultyName: f?.name || 'Faculty Member',
    };
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">ACADEMIC SCHEDULE · {settings.timezone}</span>
          <h1>Teaching timetable</h1>
          <p>Structured daily lectures, laboratory sessions, and room allocations.</p>
        </div>

        {user.role === 'admin' && (
          <div className="heading-actions">
            <button className="button primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              <span>Add class period</span>
            </button>
          </div>
        )}
      </div>

      {/* Weekday Tabs */}
      <div className="weekday-tabs">
        {WEEKDAYS.map((dayName, dayIndex) => {
          const count = timetable.filter((t) => t.day === dayIndex).length;
          const isSelected = selectedDay === dayIndex;
          return (
            <button
              key={dayName}
              className={isSelected ? 'active' : ''}
              onClick={() => setSelectedDay(dayIndex)}
            >
              <span>{dayName.slice(0, 3)}</span>
              <small>{count} classes</small>
            </button>
          );
        })}
      </div>

      {/* Schedule Cards for Selected Day */}
      <section className="panel" style={{ padding: '24px' }}>
        <div className="panel-title" style={{ padding: 0, marginBottom: 20 }}>
          <div>
            <h2>{WEEKDAYS[selectedDay]} Schedule</h2>
            <p>{filteredPeriods.length} scheduled instructional slots</p>
          </div>
        </div>

        {filteredPeriods.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '48px 20px', color: '#89948e' }}>
            <Calendar size={36} style={{ margin: '0 auto 12px', color: '#a0b3a8' }} />
            <h3 style={{ fontSize: 16, color: '#164d40', margin: '0 0 6px' }}>
              No classes scheduled on this day
            </h3>
            <p style={{ fontSize: 12, margin: 0 }}>
              {user.role === 'admin'
                ? 'Click "Add class period" above to schedule a lecture slot.'
                : 'Enjoy your free period or check other weekdays.'}
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {filteredPeriods.map((period) => {
              const details = getPeriodDetails(period.assignmentId);
              return (
                <div
                  key={period._id}
                  className="schedule-card"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '16px 20px',
                    borderRadius: 10,
                    border: '1px solid #e6ebe5',
                    backgroundColor: '#ffffff',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 18 }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        padding: '8px 12px',
                        borderRadius: 8,
                        backgroundColor: '#f2f6f1',
                        color: '#166552',
                        fontWeight: 600,
                        fontSize: 13,
                        minWidth: 135,
                      }}
                    >
                      <Clock size={15} />
                      <span>
                        {period.startTime} – {period.endTime}
                      </span>
                    </div>

                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 600, color: '#164d40', margin: '0 0 3px' }}>
                        {details.subjectName}
                      </h3>
                      <p style={{ fontSize: 12, color: '#667970', margin: 0 }}>
                        {details.className} · {details.facultyName} ·{' '}
                        <span style={{ color: '#166552', fontWeight: 500 }}>
                          <MapPin size={12} style={{ display: 'inline', verticalAlign: -1, marginRight: 2 }} />
                          {period.room}
                        </span>
                      </p>
                    </div>
                  </div>

                  {user.role === 'admin' && (
                    <div className="row-actions">
                      <button
                        className="button danger-light"
                        onClick={() => handleDelete(period._id)}
                        style={{ fontSize: 11, padding: '5px 10px' }}
                      >
                        <Trash2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                        Remove
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* Add Period Modal */}
      <Modal
        title="Schedule timetable period"
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Subject & class assignment
            </label>
            <select
              value={formData.assignmentId}
              onChange={(e) => setFormData({ ...formData, assignmentId: e.target.value })}
              style={{ width: '100%' }}
            >
              {assignments.map((a) => {
                const s = subjects.find((sub) => sub._id === a.subjectId);
                const c = classes.find((cls) => cls._id === a.classId);
                return (
                  <option key={a._id} value={a._id}>
                    {s?.name} · {c?.name}
                  </option>
                );
              })}
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Day of week
            </label>
            <select
              value={formData.day}
              onChange={(e) => setFormData({ ...formData, day: Number(e.target.value) })}
              style={{ width: '100%' }}
            >
              {WEEKDAYS.map((name, idx) => (
                <option key={name} value={idx}>
                  {name}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Starts at
              </label>
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Ends at
              </label>
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Lecture hall / Room
            </label>
            <input
              type="text"
              required
              value={formData.room}
              onChange={(e) => setFormData({ ...formData, room: e.target.value })}
              placeholder="e.g. Hall 301 - Turing Wing"
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Schedule period
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
