import React from 'react';
import { formatDate } from '../../../utils/ganttUtils';

interface TaskDateFieldProps {
  value: Date | null;
  isEditing: boolean;
  onChange: (value: Date | null) => void;
}

export const TaskDateField: React.FC<TaskDateFieldProps> = ({
  value,
  isEditing,
  onChange
}) => {
  if (!isEditing) {
    return <span>{value ? formatDate(value) : '-'}</span>;
  }

  return (
    <input
      type="date"
      value={value ? value.toISOString().split('T')[0] : ''}
      onChange={(e) => {
        const dateValue = e.target.value;
        onChange(dateValue ? new Date(dateValue) : null);
      }}
      className="modal-input"
    />
  );
};