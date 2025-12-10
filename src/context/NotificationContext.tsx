import { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { notificationsAPI } from '../services/api';
import { useAuth } from './AuthContext';

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  timestamp: Date | string;
  discount?: number;
  category?: string;
  provider?: string;
}

interface NotificationContextType {
  notifications: Notification[];
  unreadCount: number;
  isLoading: boolean;
  addNotification: (notification: Omit<Notification, 'id' | 'read' | 'timestamp'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  removeNotification: (id: string) => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Cargar notificaciones personalizadas desde el backend cuando el usuario esté autenticado
  useEffect(() => {
    const loadNotifications = async () => {
      if (!user) {
        // Si no hay usuario, mantener notificaciones vacías o usar notificaciones predeterminadas
        setNotifications([]);
        return;
      }

      setIsLoading(true);
      try {
        const data = await notificationsAPI.getAll();
        const formattedNotifications = (data.notifications || []).map((notif: any) => ({
          ...notif,
          timestamp: notif.timestamp ? new Date(notif.timestamp) : new Date(),
          read: notif.read || false
        }));
        setNotifications(formattedNotifications);
      } catch (error) {
        console.error('Error al cargar notificaciones:', error);
        // En caso de error, mantener notificaciones vacías
        setNotifications([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadNotifications();
    
    // Recargar notificaciones cada 5 minutos si el usuario está autenticado
    const interval = setInterval(() => {
      if (user) {
        loadNotifications();
      }
    }, 5 * 60 * 1000); // 5 minutos

    return () => clearInterval(interval);
  }, [user]);

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
        isLoading,
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

