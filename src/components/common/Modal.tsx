import React from 'react';

interface ModalProps {
  show: boolean;
  onClose: (e: React.MouseEvent) => void;
  children: React.ReactNode;
  className?: string;
}

export const Modal: React.FC<ModalProps> = ({
  show,
  onClose,
  children,
  className = ''
}) => {
  if (!show) return null;

  return (
    <>
      <div className="gantt-modal-overlay" onClick={onClose} />
      <div 
        className={`gantt-modal show ${className}`}
        onClick={(e) => e.stopPropagation()}
      >
        {children}
      </div>
    </>
  );
};