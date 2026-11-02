import React, { useState } from 'react';
import {
  Users,
  Search,
  Plus,
  Upload,
  KeyRound,
  Edit2,
  Trash2,
  CheckCircle,
  XCircle,
  GraduationCap,
  Briefcase,
  Award,
} from 'lucide-react';
import { User, Role } from '../types';
import { store } from '../services/store';
import { Modal } from '../components/Modal';

interface StudentsFacultyProps {
  role: 'student' | 'faculty';
  currentUser: User;
  notify?: (msg: string) => void;
}

export const StudentsFaculty: React.FC<StudentsFacultyProps> = ({
  role,
  currentUser,
  notify,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<User[]>(() => store.getUsers());
  const classes = store.getClasses();
  const departments = store.getDepartments();

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = useState(false);

  // Form states for Add
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    code: '',
    classId: classes[0]?._id || '',
    departmentId: departments[0]?._id || '',
    marks: 75,
  });

  // Editing state
  const [editingUser, setEditingUser] = useState<User | null>(null);

  // Import state
  const [importJson, setImportJson] = useState(`[
  { "name": "Gokul Nath", "email": "gokul@college.edu", "code": "REG2024-011", "marks": 84 },
  { "name": "Meena Kumari", "email": "meena@college.edu", "code": "REG2024-012", "marks": 79 }
]`);
  const [importClassId, setImportClassId] = useState(classes[0]?._id || '');

  // Reset pass state
  const [resetTargetUser, setResetTargetUser] = useState<User | null>(null);
  const [resetReason, setResetReason] = useState('');

  const [selectedClassFilter, setSelectedClassFilter] = useState('');

  const refreshList = () => {
    setUsers(store.getUsers());
  };

  const filteredUsers = users
    .filter((u) => u.role === role)
    .filter((u) => {
      if (role === 'student' && selectedClassFilter && u.classId !== selectedClassFilter) {
        return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        u.code.toLowerCase().includes(q)
      );
    });

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      store.addUser(
        {
          name: formData.name.trim(),
          email: formData.email.trim().toLowerCase(),
          code: formData.code.trim().toUpperCase(),
          role,
          classId: role === 'student' ? formData.classId : undefined,
          departmentId: formData.departmentId,
          marks: role === 'student' ? Number(formData.marks) : undefined,
          isActive: true,
        },
        currentUser.name
      );
      setIsAddModalOpen(false);
      setFormData({
        name: '',
        email: '',
        code: '',
        classId: classes[0]?._id || '',
        departmentId: departments[0]?._id || '',
        marks: 75,
      });
      refreshList();
      if (notify) notify(`${role === 'student' ? 'Student' : 'Faculty'} account created.`);
    } catch (err: any) {
      alert(err.message || 'Failed to add user.');
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    try {
      store.updateUser(
        editingUser._id,
        {
          name: editingUser.name.trim(),
          email: editingUser.email.trim().toLowerCase(),
          code: editingUser.code.trim().toUpperCase(),
          departmentId: editingUser.departmentId,
          classId: role === 'student' ? editingUser.classId : undefined,
          marks: role === 'student' ? Number(editingUser.marks) : undefined,
          isActive: editingUser.isActive,
        },
        currentUser.name
      );
      setIsEditModalOpen(false);
      setEditingUser(null);
      refreshList();
      if (notify) notify('Account details updated successfully.');
    } catch (err: any) {
      alert(err.message || 'Failed to update user.');
    }
  };

  const handleDeleteUser = (u: User) => {
    if (confirm(`Are you sure you want to delete ${u.name} (${u.code})?`)) {
      try {
        store.deleteUser(u._id, currentUser.name);
        refreshList();
        if (notify) notify(`${u.name} removed from campus directory.`);
      } catch (err: any) {
        alert(err.message || 'Failed to delete user.');
      }
    }
  };

  const handleImportSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const parsed = JSON.parse(importJson);
      if (!Array.isArray(parsed)) throw new Error('Input must be a JSON array of student objects.');
      const count = store.importStudents(parsed, importClassId, currentUser.name);
      setIsImportModalOpen(false);
      refreshList();
      if (notify) notify(`Imported ${count} students successfully.`);
    } catch (err: any) {
      alert('Invalid JSON format: ' + err.message);
    }
  };

  const handleResetSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!resetTargetUser) return;
    try {
      store.resetUserPassword(resetTargetUser._id, resetReason, currentUser.name);
      setIsResetModalOpen(false);
      setResetTargetUser(null);
      setResetReason('');
      if (notify) notify(`Temporary credentials issued for ${resetTargetUser.name}.`);
    } catch (err: any) {
      alert(err.message || 'Failed to reset password.');
    }
  };

  const getClassName = (classId?: string) => {
    if (!classId) return '—';
    const c = classes.find((item) => item._id === classId);
    return c?.name || 'Unassigned';
  };

  const getDepartmentName = (deptId?: string) => {
    if (!deptId) return '—';
    const d = departments.find((item) => item._id === deptId);
    return d?.name || '—';
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">
            {role === 'student' ? 'STUDENT DIRECTORY' : 'FACULTY ROSTER'}
          </span>
          <h1>{role === 'student' ? 'Student directory' : 'Faculty directory'}</h1>
          <p>
            {role === 'student'
              ? 'Manage enrolled campus students, register numbers, academic marks, and classes.'
              : 'Academic faculty members, employee IDs, and departmental assignments.'}
          </p>
        </div>

        {currentUser.role === 'admin' && (
          <div className="heading-actions">
            {role === 'student' && (
              <button className="button" onClick={() => setIsImportModalOpen(true)}>
                <Upload size={16} />
                <span>Import students (JSON)</span>
              </button>
            )}
            <button className="button primary" onClick={() => setIsAddModalOpen(true)}>
              <Plus size={16} />
              <span>{role === 'student' ? 'Add student' : 'Add faculty'}</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table Panel */}
      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>{role === 'student' ? 'Enrolled students' : 'Active faculty members'}</h2>
            <p>{filteredUsers.length} total verified accounts</p>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="Search users"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={`Search ${role} name, ID, or email…`}
            />
          </div>
        </div>

        {role === 'student' && (
          <div
            style={{
              display: 'flex',
              gap: 8,
              padding: '10px 20px',
              backgroundColor: '#fafbf9',
              borderBottom: '1px solid #e6ebe5',
              flexWrap: 'wrap',
              alignItems: 'center',
            }}
          >
            <span style={{ fontSize: 11, fontWeight: 600, color: '#3d5c52', marginRight: 4 }}>
              Filter by class:
            </span>
            <button
              type="button"
              onClick={() => setSelectedClassFilter('')}
              style={{
                padding: '4px 10px',
                borderRadius: 4,
                fontSize: 11,
                fontWeight: 600,
                cursor: 'pointer',
                border: selectedClassFilter === '' ? '1px solid #164d40' : '1px solid #dce4d7',
                backgroundColor: selectedClassFilter === '' ? '#164d40' : '#ffffff',
                color: selectedClassFilter === '' ? '#ffffff' : '#314c42',
              }}
            >
              All Classes ({users.filter((u) => u.role === 'student').length})
            </button>
            {classes.map((cls) => {
              const isSelected = selectedClassFilter === cls._id;
              const count = users.filter((u) => u.role === 'student' && u.classId === cls._id).length;
              return (
                <button
                  key={cls._id}
                  type="button"
                  onClick={() => setSelectedClassFilter(cls._id)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: 4,
                    fontSize: 11,
                    fontWeight: 600,
                    cursor: 'pointer',
                    border: isSelected ? '1px solid #164d40' : '1px solid #dce4d7',
                    backgroundColor: isSelected ? '#164d40' : '#ffffff',
                    color: isSelected ? '#ffffff' : '#314c42',
                  }}
                >
                  {cls.name} ({count})
                </button>
              );
            })}
          </div>
        )}

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{role === 'student' ? 'REGISTER NUMBER' : 'EMPLOYEE ID'}</th>
                <th>FULL NAME</th>
                <th>EMAIL ADDRESS</th>
                <th>{role === 'student' ? 'CLASS' : 'DEPARTMENT'}</th>
                {role === 'student' && <th>MARKS (100)</th>}
                <th>STATUS</th>
                <th>ACTIONS</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={role === 'student' ? 7 : 6} style={{ textAlign: 'center', padding: '36px 20px', color: '#89948e' }}>
                    No {role} records found matching your search.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <span className="mono" style={{ fontWeight: 600, color: '#164d40' }}>
                        {u.code}
                      </span>
                    </td>
                    <td>
                      <strong>{u.name}</strong>
                    </td>
                    <td>
                      <span style={{ color: '#52665e' }}>{u.email}</span>
                    </td>
                    <td>
                      {role === 'student' ? getClassName(u.classId) : getDepartmentName(u.departmentId)}
                    </td>
                    {role === 'student' && (
                      <td>
                        <span style={{ fontWeight: 600, color: '#0369a1' }}>
                          {u.marks !== undefined ? u.marks : 80} / 100
                        </span>
                      </td>
                    )}
                    <td>
                      <span
                        className="badge"
                        style={{
                          backgroundColor: u.isActive ? '#dcfce7' : '#fee2e2',
                          color: u.isActive ? '#166534' : '#991b1b',
                          border: u.isActive ? '1px solid #86efac' : '1px solid #fca5a5',
                        }}
                      >
                        {u.isActive ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>
                      <div className="row-actions" style={{ display: 'flex', gap: 6 }}>
                        {currentUser.role === 'admin' && (
                          <>
                            <button
                              className="button"
                              onClick={() => {
                                setEditingUser({ ...u });
                                setIsEditModalOpen(true);
                              }}
                              style={{ fontSize: 11, padding: '4px 8px' }}
                              title="Edit user details"
                            >
                              <Edit2 size={13} style={{ display: 'inline', marginRight: 4 }} />
                              Edit
                            </button>
                            <button
                              className="button danger-light"
                              onClick={() => handleDeleteUser(u)}
                              style={{ fontSize: 11, padding: '4px 8px' }}
                              title="Delete user"
                            >
                              <Trash2 size={13} />
                            </button>
                          </>
                        )}
                        <button
                          className="button"
                          onClick={() => {
                            setResetTargetUser(u);
                            setIsResetModalOpen(true);
                          }}
                          style={{ fontSize: 11, padding: '4px 8px' }}
                        >
                          <KeyRound size={13} style={{ display: 'inline', marginRight: 4 }} />
                          Pass
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Add User Modal */}
      <Modal
        title={role === 'student' ? 'Add student account' : 'Add faculty member'}
        subtitle="Credentials will be created and verified on campus database."
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      >
        <form onSubmit={handleAddSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Full name
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder={role === 'student' ? 'e.g. Gokul Nath' : 'e.g. Dr. K. Subramanian'}
              style={{ width: '100%' }}
            />
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Email address
            </label>
            <input
              type="email"
              required
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="user@college.edu"
              style={{ width: '100%' }}
            />
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              {role === 'student' ? 'Register number (Reg No)' : 'Employee ID'}
            </label>
            <input
              type="text"
              required
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder={role === 'student' ? 'e.g. REG2024-011' : 'e.g. FAC104'}
              style={{ width: '100%' }}
            />
          </div>

          {role === 'student' && (
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Academic Marks (Out of 100)
              </label>
              <input
                type="number"
                min={0}
                max={100}
                required
                value={formData.marks}
                onChange={(e) => setFormData({ ...formData, marks: Number(e.target.value) })}
                style={{ width: '100%' }}
              />
            </div>
          )}

          {role === 'student' ? (
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Class section
              </label>
              <select
                value={formData.classId}
                onChange={(e) => setFormData({ ...formData, classId: e.target.value })}
                style={{ width: '100%' }}
              >
                {classes.map((c) => (
                  <option key={c._id} value={c._id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Department
              </label>
              <select
                value={formData.departmentId}
                onChange={(e) => setFormData({ ...formData, departmentId: e.target.value })}
                style={{ width: '100%' }}
              >
                {departments.map((d) => (
                  <option key={d._id} value={d._id}>
                    {d.name} ({d.code})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
            <button type="button" className="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Save {role}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit User Modal */}
      <Modal
        title={`Edit ${role === 'student' ? 'Student' : 'Faculty'} Information`}
        subtitle="Update account info, department, class, or marks."
        isOpen={isEditModalOpen && !!editingUser}
        onClose={() => {
          setIsEditModalOpen(false);
          setEditingUser(null);
        }}
      >
        {editingUser && (
          <form onSubmit={handleEditSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Full name
              </label>
              <input
                type="text"
                required
                value={editingUser.name}
                onChange={(e) => setEditingUser({ ...editingUser, name: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Email address
              </label>
              <input
                type="email"
                required
                value={editingUser.email}
                onChange={(e) => setEditingUser({ ...editingUser, email: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                {role === 'student' ? 'Register number (Reg No)' : 'Employee ID'}
              </label>
              <input
                type="text"
                required
                value={editingUser.code}
                onChange={(e) => setEditingUser({ ...editingUser, code: e.target.value })}
                style={{ width: '100%' }}
              />
            </div>

            {role === 'student' && (
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Academic Marks (Out of 100)
                </label>
                <input
                  type="number"
                  min={0}
                  max={100}
                  required
                  value={editingUser.marks !== undefined ? editingUser.marks : 80}
                  onChange={(e) => setEditingUser({ ...editingUser, marks: Number(e.target.value) })}
                  style={{ width: '100%' }}
                />
              </div>
            )}

            {role === 'student' ? (
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Class section
                </label>
                <select
                  value={editingUser.classId || classes[0]?._id}
                  onChange={(e) => setEditingUser({ ...editingUser, classId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {classes.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>
            ) : (
              <div className="field">
                <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                  Department
                </label>
                <select
                  value={editingUser.departmentId || departments[0]?._id}
                  onChange={(e) => setEditingUser({ ...editingUser, departmentId: e.target.value })}
                  style={{ width: '100%' }}
                >
                  {departments.map((d) => (
                    <option key={d._id} value={d._id}>
                      {d.name} ({d.code})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="field">
              <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
                Account Status
              </label>
              <select
                value={editingUser.isActive ? 'active' : 'disabled'}
                onChange={(e) => setEditingUser({ ...editingUser, isActive: e.target.value === 'active' })}
                style={{ width: '100%' }}
              >
                <option value="active">Active</option>
                <option value="disabled">Disabled</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10, marginTop: 10 }}>
              <button
                type="button"
                className="button"
                onClick={() => {
                  setIsEditModalOpen(false);
                  setEditingUser(null);
                }}
              >
                Cancel
              </button>
              <button type="submit" className="button primary">
                Save changes
              </button>
            </div>
          </form>
        )}
      </Modal>

      {/* Bulk Import JSON Modal */}
      <Modal
        title="Import students in bulk"
        subtitle="Paste JSON formatted roster to enroll multiple students at once."
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        maxWidth={600}
      >
        <form onSubmit={handleImportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Destination class
            </label>
            <select
              value={importClassId}
              onChange={(e) => setImportClassId(e.target.value)}
              style={{ width: '100%' }}
            >
              {classes.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Student records (JSON)
            </label>
            <textarea
              rows={8}
              value={importJson}
              onChange={(e) => setImportJson(e.target.value)}
              style={{ width: '100%', fontFamily: 'monospace', fontSize: 12 }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="button" onClick={() => setIsImportModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Import students
            </button>
          </div>
        </form>
      </Modal>

      {/* Password Reset Modal */}
      <Modal
        title={`Reset ${resetTargetUser?.name}'s password`}
        subtitle="Mandatory first-login password change will be enforced."
        isOpen={isResetModalOpen}
        onClose={() => setIsResetModalOpen(false)}
      >
        <form onSubmit={handleResetSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="field">
            <label style={{ fontSize: 11, fontWeight: 500, color: '#3d5c52', marginBottom: 6, display: 'block' }}>
              Reason for reset <span style={{ color: '#dc2626' }}>*</span>
            </label>
            <textarea
              required
              rows={3}
              value={resetReason}
              onChange={(e) => setResetReason(e.target.value)}
              placeholder="e.g. Student requested password recovery."
              style={{ width: '100%' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
            <button type="button" className="button" onClick={() => setIsResetModalOpen(false)}>
              Cancel
            </button>
            <button type="submit" className="button primary">
              Dispatch reset link
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
