import React, { useState } from 'react';
import {
  BookOpen,
  Building2,
  GraduationCap,
  Layers,
  Plus,
  Search,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { User } from '../types';
import { store } from '../services/store';
import { Modal } from '../components/Modal';

interface AcademicsProps {
  user: User;
  notify?: (msg: string) => void;
}

export const Academics: React.FC<AcademicsProps> = ({ user, notify }) => {
  const [activeTab, setActiveTab] = useState<
    'departments' | 'classes' | 'subjects' | 'assignments' | 'enrollments'
  >('departments');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [deptForm, setDeptForm] = useState({ name: '', code: '' });
  const [classForm, setClassForm] = useState({
    name: '',
    departmentId: '',
    academicYear: '2025-2026',
    semester: 1,
  });
  const [subjForm, setSubjForm] = useState({ name: '', code: '', departmentId: '' });
  const [assignForm, setAssignForm] = useState({ facultyId: '', subjectId: '', classId: '' });
  const [enrForm, setEnrForm] = useState({ studentId: '', assignmentId: '' });

  const departments = store.getDepartments();
  const classes = store.getClasses();
  const subjects = store.getSubjects();
  const assignments = store.getAssignments();
  const enrollments = store.getEnrollments();
  const users = store.getUsers();

  const faculties = users.filter((u) => u.role === 'faculty');
  const students = users.filter((u) => u.role === 'student');

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (activeTab === 'departments') {
        store.addDepartment(deptForm.name.trim(), deptForm.code.trim(), user.name);
        setDeptForm({ name: '', code: '' });
        if (notify) notify('Department created.');
      } else if (activeTab === 'classes') {
        store.addClass(
          {
            name: classForm.name.trim(),
            departmentId: classForm.departmentId || departments[0]?._id,
            academicYear: classForm.academicYear,
            semester: Number(classForm.semester),
          },
          user.name
        );
        setClassForm({ name: '', departmentId: '', academicYear: '2025-2026', semester: 1 });
        if (notify) notify('Class created.');
      } else if (activeTab === 'subjects') {
        store.addSubject(
          {
            name: subjForm.name.trim(),
            code: subjForm.code.trim().toUpperCase(),
            departmentId: subjForm.departmentId || departments[0]?._id,
          },
          user.name
        );
        setSubjForm({ name: '', code: '', departmentId: '' });
        if (notify) notify('Subject created.');
      } else if (activeTab === 'assignments') {
        store.addAssignment(
          {
            facultyId: assignForm.facultyId || faculties[0]?._id,
            subjectId: assignForm.subjectId || subjects[0]?._id,
            classId: assignForm.classId || classes[0]?._id,
            isActive: true,
          },
          user.name
        );
        setAssignForm({ facultyId: '', subjectId: '', classId: '' });
        if (notify) notify('Teaching assignment registered.');
      } else if (activeTab === 'enrollments') {
        store.addEnrollment(
          {
            studentId: enrForm.studentId || students[0]?._id,
            assignmentId: enrForm.assignmentId || assignments[0]?._id,
            isActive: true,
          },
          user.name
        );
        setEnrForm({ studentId: '', assignmentId: '' });
        if (notify) notify('Student enrollment recorded.');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Operation failed.');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">CURRICULUM & ENROLLMENTS</span>
          <h1>Academics architecture</h1>
          <p>Configure academic departments, classes, courses, and teaching assignments.</p>
        </div>

        <div className="heading-actions">
          <button className="button primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={16} />
            <span>Add new {activeTab.slice(0, -1)}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button
          className={activeTab === 'departments' ? 'active' : ''}
          onClick={() => setActiveTab('departments')}
        >
          Departments
        </button>
        <button
          className={activeTab === 'classes' ? 'active' : ''}
          onClick={() => setActiveTab('classes')}
        >
          Classes
        </button>
        <button
          className={activeTab === 'subjects' ? 'active' : ''}
          onClick={() => setActiveTab('subjects')}
        >
          Subjects
        </button>
        <button
          className={activeTab === 'assignments' ? 'active' : ''}
          onClick={() => setActiveTab('assignments')}
        >
          Teaching assignments
        </button>
        <button
          className={activeTab === 'enrollments' ? 'active' : ''}
          onClick={() => setActiveTab('enrollments')}
        >
          Student enrollments
        </button>
      </div>

      {/* Panels */}
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>
              {activeTab === 'departments' && 'Academic Departments'}
              {activeTab === 'classes' && 'Class Sections'}
              {activeTab === 'subjects' && 'Course Subjects'}
              {activeTab === 'assignments' && 'Faculty Teaching Assignments'}
              {activeTab === 'enrollments' && 'Student Course Enrollments'}
            </h2>
            <p>Master curriculum catalog for attendance tracking.</p>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="Search academics"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog…"
            />
          </div>
        </div>

        <div className="table-wrap">
          {activeTab === 'departments' && (
            <table>
              <thead>
                <tr>
                  <th>DEPARTMENT NAME</th>
                  <th>DEPARTMENT CODE</th>
                </tr>
              </thead>
              <tbody>
                {departments
                  .filter((d) => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || d.code.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((d) => (
                    <tr key={d._id}>
                      <td>
                        <strong>{d.name}</strong>
                      </td>
                      <td>
                        <span className="mono" style={{ fontWeight: 600, color: '#164d40' }}>
                          {d.code}
                        </span>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          )}

          {activeTab === 'classes' && (
            <table>
              <thead>
                <tr>
                  <th>CLASS NAME</th>
                  <th>DEPARTMENT</th>
                  <th>ACADEMIC YEAR</th>
                  <th>SEMESTER</th>
                </tr>
              </thead>
              <tbody>
                {classes
                  .filter((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((c) => {
                    const dept = departments.find((d) => d._id === c.departmentId);
                    return (
                      <tr key={c._id}>
                        <td>
                          <strong>{c.name}</strong>
                        </td>
                        <td>{dept?.name || '—'}</td>
                        <td>{c.academicYear}</td>
                        <td>Semester {c.semester}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {activeTab === 'subjects' && (
            <table>
              <thead>
                <tr>
                  <th>SUBJECT NAME</th>
                  <th>CODE</th>
                  <th>DEPARTMENT</th>
                </tr>
              </thead>
              <tbody>
                {subjects
                  .filter((s) => s.name.toLowerCase().includes(searchQuery.toLowerCase()) || s.code.toLowerCase().includes(searchQuery.toLowerCase()))
                  .map((s) => {
                    const dept = departments.find((d) => d._id === s.departmentId);
                    return (
                      <tr key={s._id}>
                        <td>
                          <strong>{s.name}</strong>
                        </td>
                        <td>
                          <span className="mono" style={{ fontWeight: 600, color: '#164d40' }}>
                            {s.code}
                          </span>
                        </td>
                        <td>{dept?.name || '—'}</td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          )}

          {activeTab === 'assignments' && (
            <table>
              <thead>
                <tr>
                  <th>SUBJECT</th>
                  <th>CLASS</th>
                  <th>ASSIGNED FACULTY</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {assignments.map((a) => {
                  const subj = subjects.find((s) => s._id === a.subjectId);
                  const cls = classes.find((c) => c._id === a.classId);
                  const fac = users.find((u) => u._id === a.facultyId);
                  return (
                    <tr key={a._id}>
                      <td>
                        <strong>{subj?.name || '—'}</strong>
                        <small style={{ display: 'block', color: '#89948e' }}>{subj?.code}</small>
                      </td>
                      <td>{cls?.name || '—'}</td>
                      <td>{fac?.name || '—'}</td>
                      <td>
                        <span className="badge present">Active</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}

          {activeTab === 'enrollments' && (
            <table>
              <thead>
                <tr>
                  <th>STUDENT</th>
                  <th>SUBJECT & CLASS</th>
                  <th>STATUS</th>
                </tr>
              </thead>
              <tbody>
                {enrollments.map((e) => {
                  const stu = users.find((u) => u._id === e.studentId);
                  const a = assignments.find((item) => item._id === e.assignmentId);
                  const subj = subjects.find((s) => s._id === a?.subjectId);
                  const cls = classes.find((c) => c._id === a?.classId);
                  return (
                    <tr key={e._id}>
                      <td>
                        <strong>{stu?.name || 'Student'}</strong>
                        <small style={{ display: 'block', color: '#89948e' }}>{stu?.code}</small>
                      </td>
                      <td>
                        {subj?.name} · {cls?.name}
                      </td>
                      <td>
                        <span className="badge present">Enrolled</span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      {/* Creation Modal */}
      <Modal
        title={`Add ${activeTab.slice(0, -1)}`}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      >
        <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {activeTab === 'departments' && (
            <>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Department name
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.name}
                  onChange={(e) => setDeptForm({ ...deptForm, name: e.target.value })}
                  placeholder="e.g. Mechanical Engineering"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Department code
                </label>
                <input
                  type="text"
                  required
                  value={deptForm.code}
                  onChange={(e) => setDeptForm({ ...deptForm, code: e.target.value })}
                  placeholder="e.g. MECH"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {activeTab === 'classes' && (
            <>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Class name
                </label>
                <input
                  type="text"
                  required
                  value={classForm.name}
                  onChange={(e) => setClassForm({ ...classForm, name: e.target.value })}
                  placeholder="e.g. B.Tech ME - Section A"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Department
                </label>
                <select
                  value={classForm.departmentId}
                  onChange={(e) => setClassForm({ ...classForm, departmentId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Semester
                </label>
                <input
                  type="number"
                  min={1}
                  max={12}
                  value={classForm.semester}
                  onChange={(e) => setClassForm({ ...classForm, semester: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {activeTab === 'subjects' && (
            <>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Subject name
                </label>
                <input
                  type="text"
                  required
                  value={subjForm.name}
                  onChange={(e) => setSubjForm({ ...subjForm, name: e.target.value })}
                  placeholder="e.g. Thermodynamics & Heat Transfer"
                  style={{ width: '100%' }}
                />
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Subject code
                </label>
                <input
                  type="text"
                  required
                  value={subjForm.code}
                  onChange={(e) => setSubjForm({ ...subjForm, code: e.target.value })}
                  placeholder="e.g. ME401"
                  style={{ width: '100%' }}
                />
              </div>
            </>
          )}

          {activeTab === 'assignments' && (
            <>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Assigned faculty
                </label>
                <select
                  value={assignForm.facultyId}
                  onChange={(e) => setAssignForm({ ...assignForm, facultyId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {faculties.map((f) => (
                    <option key={f._id} value={f._id}>
                      {f.name} ({f.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Subject
                </label>
                <select
                  value={assignForm.subjectId}
                  onChange={(e) => setAssignForm({ ...assignForm, subjectId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {subjects.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Target class
                </label>
                <select
                  value={assignForm.classId}
                  onChange={(e) => setAssignForm({ ...assignForm, classId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            </>
          )}

          {activeTab === 'enrollments' && (
            <>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Student
                </label>
                <select
                  value={enrForm.studentId}
                  onChange={(e) => setEnrForm({ ...enrForm, studentId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {students.map((s) => (
                    <option key={s._id} value={s._id}>
                      {s.name} ({s.code})
                    </option>
                  ))}
                </select>
              </div>
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Subject & class assignment
                </label>
                <select
                  value={enrForm.assignmentId}
                  onChange={(e) => setEnrForm({ ...enrForm, assignmentId: e.target.value })}
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
            </>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="button" onClick={() => setIsModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Save record
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
