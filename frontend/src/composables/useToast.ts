import { ref } from 'vue';

export interface Toast {
  id: number;
  type: 'success' | 'error' | 'warning' | 'info';
  title?: string;
  message: string;
  duration?: number;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export const useToast = () => {
  const addToast = (
    message: string,
    type: 'success' | 'error' | 'warning' | 'info' = 'info',
    title?: string,
    duration: number = 3000
  ) => {
    const id = ++toastId;
    const toast: Toast = {
      id,
      type,
      title,
      message,
      duration
    };
    
    toasts.value.push(toast);
    
    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }
    
    return id;
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex(t => t.id === id);
    if (index !== -1) {
      toasts.value.splice(index, 1);
    }
  };

  const success = (message: string, title?: string, duration?: number) => {
    return addToast(message, 'success', title, duration);
  };

  const error = (message: string, title?: string, duration?: number) => {
    return addToast(message, 'error', title, duration);
  };

  const warning = (message: string, title?: string, duration?: number) => {
    return addToast(message, 'warning', title, duration);
  };

  const info = (message: string, title?: string, duration?: number) => {
    return addToast(message, 'info', title, duration);
  };

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  };
};
