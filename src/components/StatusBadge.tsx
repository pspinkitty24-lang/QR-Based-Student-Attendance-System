import React from 'react';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const s = (status || '').toLowerCase().replace(/_/g, ' ');

  let className = 'badge';
  let label = status;
  let customStyle: React.CSSProperties | undefined = undefined;

  if (s === 'present') {
    className += ' present';
    label = 'Present';
  } else if (s === 'late') {
    className += ' late';
    label = 'Late';
  } else if (s === 'absent') {
    className += ' absent';
    label = 'Absent';
  } else if (s === 'excused') {
    className += ' excused';
    label = 'Excused';
  } else if (s === 'on duty' || s === 'od') {
    label = 'On Duty (OD)';
    customStyle = {
      backgroundColor: '#e0f2fe',
      color: '#0369a1',
      border: '1px solid #bae6fd',
    };
  } else if (s === 'permission') {
    label = 'Permission';
    customStyle = {
      backgroundColor: '#f3e8ff',
      color: '#7e22ce',
      border: '1px solid #e9d5ff',
    };
  } else if (s === 'active') {
    className += ' active';
    label = 'Active';
  } else if (s === 'completed') {
    className += ' track';
    label = 'Completed';
  } else if (s === 'cancelled') {
    className += ' cancelled';
    label = 'Cancelled';
  } else if (s === 'on track') {
    className += ' track';
    label = 'On track';
  } else if (s === 'at risk') {
    className += ' risk';
    label = 'At risk';
  } else if (s === 'eligible' || s.includes('eligible to exam') || s.includes('eligible for exam')) {
    className += ' present';
    label = 'Eligible to Exam';
  } else if (s === 'ineligible' || s.includes('not eligible') || s.includes('ineligible')) {
    className += ' absent';
    label = 'Not Eligible';
  } else {
    className += ' pending';
    label = status;
  }

  return (
    <span className={className} style={customStyle}>
      {label}
    </span>
  );
};
