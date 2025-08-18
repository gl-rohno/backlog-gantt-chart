import { useCallback } from 'react';
import { GanttTask } from '../types/backlog';

export const useTaskForm = (onFormChange: (updates: Partial<GanttTask>) => void) => {
  const handleFormChange = useCallback((field: keyof GanttTask, value: any) => {
    onFormChange({ [field]: value });
  }, [onFormChange]);

  return { handleFormChange };
};