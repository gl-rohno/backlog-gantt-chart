import { useState, useCallback } from 'react';

interface UseModalOptions<T = any> {
  onOpen?: (data?: T) => void;
  onClose?: () => void;
}

export const useModal = <T = any>(options: UseModalOptions<T> = {}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [data, setData] = useState<T | null>(null);

  const openModal = useCallback((modalData?: T) => {
    setData(modalData || null);
    setIsOpen(true);
    options.onOpen?.(modalData);
  }, [options]);

  const closeModal = useCallback(() => {
    setIsOpen(false);
    setData(null);
    options.onClose?.();
  }, [options]);

  const toggleModal = useCallback((modalData?: T) => {
    if (isOpen) {
      closeModal();
    } else {
      openModal(modalData);
    }
  }, [isOpen, openModal, closeModal]);

  return {
    isOpen,
    data,
    openModal,
    closeModal,
    toggleModal,
  };
};