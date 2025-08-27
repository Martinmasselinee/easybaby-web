"use client";

import { useState, useEffect } from "react";
import { CheckCircle, AlertCircle, X } from "lucide-react";

export type NotificationType = "success" | "error" | "info";

interface NotificationProps {
  type: NotificationType;
  message: string;
  duration?: number;
  onClose?: () => void;
}

export const Notification = ({
  type,
  message,
  duration = 5000,
  onClose
}: NotificationProps) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false);
      if (onClose) onClose();
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, onClose]);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  const bgColor = 
    type === "success" ? "bg-green-50 border-green-200" :
    type === "error" ? "bg-red-50 border-red-200" :
    "bg-blue-50 border-blue-200";

  const textColor = 
    type === "success" ? "text-green-700" :
    type === "error" ? "text-red-700" :
    "text-blue-700";

  const Icon = 
    type === "success" ? CheckCircle :
    type === "error" ? AlertCircle :
    CheckCircle;

  return (
    <div className={`fixed top-4 right-4 z-50 max-w-sm w-full shadow-md rounded-lg border ${bgColor} ${textColor}`}>
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          <Icon className="h-5 w-5 mr-3" />
          <p>{message}</p>
        </div>
        <button 
          onClick={handleClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState<{
    id: string;
    type: NotificationType;
    message: string;
  }[]>([]);

  const showNotification = (type: NotificationType, message: string) => {
    const id = Date.now().toString();
    setNotifications(prev => [...prev, { id, type, message }]);
    return id;
  };

  const hideNotification = (id: string) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  };

  const NotificationsContainer = () => (
    <>
      {notifications.map(notification => (
        <Notification
          key={notification.id}
          type={notification.type}
          message={notification.message}
          onClose={() => hideNotification(notification.id)}
        />
      ))}
    </>
  );

  return {
    showNotification,
    hideNotification,
    NotificationsContainer
  };
};
