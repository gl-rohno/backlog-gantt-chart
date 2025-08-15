import { useState, useCallback } from 'react';
import { Notification } from '../types/common';
import { 
  createSuccessNotification, 
  createErrorNotification, 
  createWarningNotification, 
  createInfoNotification 
} from '../utils/notificationUtils';

export const useNotification = () => {
  const [notification, setNotification] = useState<Notification | null>(null);

  const showNotification = useCallback((newNotification: Notification) => {
    setNotification(newNotification);
    
    const duration = newNotification.duration || 3000;
    setTimeout(() => {
      setNotification(null);
    }, duration);
  }, []);

  const showSuccess = useCallback((message: string) => {
    showNotification(createSuccessNotification(message));
  }, [showNotification]);

  const showError = useCallback((message: string) => {
    showNotification(createErrorNotification(message));
  }, [showNotification]);

  const showWarning = useCallback((message: string) => {
    showNotification(createWarningNotification(message));
  }, [showNotification]);

  const showInfo = useCallback((message: string) => {
    showNotification(createInfoNotification(message));
  }, [showNotification]);

  const hideNotification = useCallback(() => {
    setNotification(null);
  }, []);

  return {
    notification,
    showNotification,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    hideNotification
  };
};