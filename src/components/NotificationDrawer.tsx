import React from 'react';
import { 
  X, 
  Bell, 
  Check, 
  Trash2, 
  AlertTriangle, 
  Info, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { SmartNotification } from '../types';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  notifications: SmartNotification[];
  onMarkAsRead: (id: string) => void;
  onClearAll: () => void;
  onTriggerCheck: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({
  isOpen,
  onClose,
  notifications,
  onMarkAsRead,
  onClearAll,
  onTriggerCheck,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex justify-end animate-fadeIn">
      <div className="bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 w-full max-w-md h-full flex flex-col shadow-2xl animate-slideLeft">
        
        {/* Drawer Header */}
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-600" />
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              Smart Budget Notifications
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Drawer Action Bar */}
        <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/40 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
          <button
            onClick={onTriggerCheck}
            className="text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
          >
            + Run Instant Budget Check
          </button>
          {notifications.length > 0 && (
            <button
              onClick={onClearAll}
              className="text-slate-500 hover:text-rose-600 dark:hover:text-rose-400 font-medium flex items-center gap-1"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear All
            </button>
          )}
        </div>

        {/* Notification List */}
        <div className="flex-1 overflow-y-auto p-5 space-y-3">
          {notifications.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <Bell className="w-10 h-10 mx-auto mb-2 opacity-30" />
              <p className="text-sm font-medium">No active notifications</p>
            </div>
          ) : (
            notifications.map((notif) => {
              let icon = <Info className="w-4 h-4 text-blue-500" />;
              let borderClass = 'border-slate-200 dark:border-slate-800';

              if (notif.type === 'alert' || notif.threshold === 100) {
                icon = <ShieldAlert className="w-4 h-4 text-rose-500" />;
                borderClass = 'border-rose-200 dark:border-rose-900 bg-rose-50/30 dark:bg-rose-950/20';
              } else if (notif.type === 'warning' || (notif.threshold && notif.threshold >= 75)) {
                icon = <AlertTriangle className="w-4 h-4 text-amber-500" />;
                borderClass = 'border-amber-200 dark:border-amber-900 bg-amber-50/30 dark:bg-amber-950/20';
              } else if (notif.type === 'success') {
                icon = <CheckCircle2 className="w-4 h-4 text-emerald-500" />;
                borderClass = 'border-emerald-200 dark:border-emerald-900 bg-emerald-50/30 dark:bg-emerald-950/20';
              }

              return (
                <div
                  key={notif.id}
                  className={`p-4 rounded-2xl border ${borderClass} transition-all relative group ${
                    notif.read ? 'opacity-70' : ''
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 shrink-0">{icon}</div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {notif.title}
                        </h4>
                        <span className="text-[10px] text-slate-400">{notif.date}</span>
                      </div>
                      <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                        {notif.message}
                      </p>
                    </div>
                  </div>

                  {!notif.read && (
                    <button
                      onClick={() => onMarkAsRead(notif.id)}
                      className="mt-2 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
                    >
                      <Check className="w-3 h-3" /> Mark as Read
                    </button>
                  )}
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
};
