import { useState, useCallback } from 'react';
import { MESSAGES, TIMING } from '../constants/app';

interface UseClipboardReturn {
  copied: boolean;
  copyToClipboard: (text: string) => Promise<boolean>;
  resetCopied: () => void;
}

export const useClipboard = (): UseClipboardReturn => {
  const [copied, setCopied] = useState(false);

  const copyToClipboard = useCallback(async (text: string): Promise<boolean> => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), TIMING.COPY_FEEDBACK_DURATION);
      return true;
    } catch (error) {
      console.error(MESSAGES.COPY_FAILED, error);
      return false;
    }
  }, []);

  const resetCopied = useCallback(() => {
    setCopied(false);
  }, []);

  return {
    copied,
    copyToClipboard,
    resetCopied,
  };
};