import React from 'react';

interface FormFieldProps {
  label: string;
  children: React.ReactNode;
  className?: string;
}

export const FormField: React.FC<FormFieldProps> = ({
  label,
  children,
  className = ''
}) => {
  return (
    <div className={`modal-row ${className}`}>
      <label className="modal-label">{label}</label>
      <div className="modal-value">
        {children}
      </div>
    </div>
  );
};