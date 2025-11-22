import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: '1',
      title: '¡Pedido en camino!',
      message: 'Tu pedido de Pizzería Roma está en camino. Llegará en aproximadamente 20 minutos.',
      type: 'success',
      read: false,
      timestamp: new Date(Date.now() - 5 * 60000) // 5 minutos atrás
    },
    {
      id: '2',
      title: 'Oferta especial',
      message: '20% de descuento en todos los platos de Sushi Express. Válido hasta mañana.',
      type: 'info',
      read: false,
      timestamp: new Date(Date.now() - 30 * 60000) // 30 minutos atrás
    },
    {
      id: '3',
      title: 'Pedido entregado',
      message: 'Tu pedido #ORD-001 ha sido entregado. ¡Esperamos que lo hayas disfrutado!',
      type: 'success',
      read: true,
      timestamp: new Date(Date.now() - 2 * 60 * 60000) // 2 horas atrás
    }
  ]);

  const addNotification = (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => {
    const newNotification: Notification = {
      ...notification,
      id: Date.now().toString(),
      read: false,
      timestamp: new Date()
    };
    setNotifications(prev => [newNotification, ...prev]);
  };

  const markAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(notif => notif.id === id ? { ...notif, read: true } : notif)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(notif => ({ ...notif, read: true })));
  };

  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        removeNotification,
        clearAll
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }
  return context;
};

