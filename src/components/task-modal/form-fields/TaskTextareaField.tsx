import React from 'react';

interface TaskTextareaFieldProps {
  value: string;
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
  rows?: number;
}

export const TaskTextareaField: React.FC<TaskTextareaFieldProps> = ({
  value,
  isEditing,
  onChange,
  placeholder = '',
  rows = 3
}) => {
  if (!isEditing) {
    return <span>{value || '-'}</span>;
  }

  return (
    <textarea
      value={value || ''}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
    />
  );
};