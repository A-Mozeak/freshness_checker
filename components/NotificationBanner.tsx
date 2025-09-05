
import React from 'react';
import type { FoodItem } from '../types';

interface NotificationBannerProps {
  notifications: FoodItem[];
  onDismiss: (id: string) => void;
}

const NotificationBanner: React.FC<NotificationBannerProps> = ({ notifications, onDismiss }) => {
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="w-full max-w-4xl mx-auto my-4 space-y-2">
      {notifications.map(item => (
        <div key={item.id} className="bg-yellow-500/20 border border-yellow-500 text-yellow-200 px-4 py-3 rounded-lg relative flex items-center justify-between" role="alert">
          <div>
            <strong className="font-bold">Reminder: </strong>
            <span className="block sm:inline ml-1">Your {item.name} is spoiling soon (by {item.spoilageDate})!</span>
          </div>
          <button onClick={() => onDismiss(item.id)} className="ml-4 p-1 rounded-full hover:bg-yellow-500/30 transition-colors">
            <svg className="fill-current h-6 w-6 text-yellow-300" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
};

export default NotificationBanner;
