import React, { useState } from 'react';
import { ShieldCheck, Search, Download, FileText } from 'lucide-react';
import { User, AuditLog } from '../types';
import { store } from '../services/store';

interface AuditTrailProps {
  user: User;
  notify?: (msg: string) => void;
}

export const AuditTrail: React.FC<AuditTrailProps> = ({ user, notify }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const auditLogs = store.getAuditLogs();

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.actor.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.details.toLowerCase().includes(q)
    );
  });

  const exportAuditCSV = () => {
    let csv = 'data:text/csv;charset=utf-8,Timestamp,Actor,Action,Details,IP Address\n';
    filteredLogs.forEach((l) => {
      csv += `"${l.timestamp}","${l.actor}","${l.action}","${l.details.replace(/"/g, '""')}","${l.ip || ''}"\n`;
    });
    const uri = encodeURI(csv);
    const link = document.createElement('a');
    link.href = uri;
    link.download = `attendly_audit_trail_${Date.now()}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    if (notify) notify('Audit trail exported successfully.');
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      {/* Page Heading */}
      <div className="page-heading">
        <div>
          <span className="eyebrow">SECURITY & INTEGRITY</span>
          <h1>Audit trail</h1>
          <p>Immutable log of every attendance mark, correction, login, and administrative action.</p>
        </div>

        <div className="heading-actions">
          <button className="button" onClick={exportAuditCSV}>
            <Download size={16} />
            <span>Export audit log</span>
          </button>
        </div>
      </div>

      <section className="panel">
        <div className="panel-title">
          <div>
            <h2>Verified event logs</h2>
            <p>{filteredLogs.length} total recorded operations</p>
          </div>
          <div className="search-box">
            <Search size={16} />
            <input
              aria-label="Search audit trail"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search actor, action, or details…"
            />
          </div>
        </div>

        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>TIMESTAMP</th>
                <th>ACTOR</th>
                <th>ACTION</th>
                <th>OPERATION DETAILS</th>
                <th>IP / DEVICE</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '36px 20px', color: '#89948e' }}>
                    No audit records match your search.
                  </td>
                </tr>
              ) : (
                filteredLogs.map((log) => (
                  <tr key={log._id}>
                    <td>
                      <span className="mono" style={{ fontSize: 11, color: '#556960' }}>
                        {new Date(log.timestamp).toLocaleString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                          second: '2-digit',
                        })}
                      </span>
                    </td>
                    <td>
                      <strong>{log.actor}</strong>
                    </td>
                    <td>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: 6,
                          backgroundColor: '#e6ebe5',
                          color: '#164d40',
                          fontFamily: 'monospace',
                        }}
                      >
                        {log.action}
                      </span>
                    </td>
                    <td>
                      <span style={{ fontSize: 12, color: '#233b34' }}>{log.details}</span>
                    </td>
                    <td>
                      <span className="mono" style={{ fontSize: 11, color: '#89948e' }}>
                        {log.ip || 'LAN Session'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};
