import { Notification } from '../types/common';
import { TIMING } from '../constants/app';

/**
 * 通知を作成
 */
export const createNotification = (
  type: Notification['type'],
  message: string,
  duration: number = TIMING.NOTIFICATION_DISPLAY_DURATION
): Notification => {
  return {
    id: `notification-${Date.now()}-${Math.random()}`,
    type,
    message,
    duration
  };
};

/**
 * 成功通知を作成
 */
export const createSuccessNotification = (message: string): Notification => {
  return createNotification('success', message);
};

/**
 * エラー通知を作成
 */
export const createErrorNotification = (message: string): Notification => {
  return createNotification('error', message);
};

/**
 * 警告通知を作成
 */
export const createWarningNotification = (message: string): Notification => {
  return createNotification('warning', message);
};

/**
 * 情報通知を作成
 */
export const createInfoNotification = (message: string): Notification => {
  return createNotification('info', message);
};