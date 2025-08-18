import React from 'react';

interface TaskSelectFieldProps {
  value: string;
  options: string[];
  isEditing: boolean;
  onChange: (value: string) => void;
  placeholder?: string;
}

export const TaskSelectField: React.FC<TaskSelectFieldProps> = ({
  value,
  options,
  isEditing,
  onChange,
  placeholder = '選択してください'
}) => {
  if (!isEditing) {
    return <span>{value || '-'}</span>;
  }

  return (
    <select 
      value={value || ''} 
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option} value={option}>
          {option}
        </option>
      ))}
    </select>
  );
};