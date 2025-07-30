// NotificationsPage.jsx
import React from 'react';
import { Bell, Trash2 } from 'lucide-react';

const NotificationsPage = () => {
  const notifications = [
    { id: 1, message: 'Your carbon credit was successfully verified.', date: '2025-07-29' },
    { id: 2, message: 'New credit uploaded to your account.', date: '2025-07-28' },
  ];

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 flex items-center"><Bell className="mr-2" /> Notifications</h2>
        <ul className="space-y-4">
          {notifications.map((note) => (
            <li key={note.id} className="bg-gray-700/50 p-4 rounded-xl shadow flex justify-between items-center border border-gray-600">
              <div>
                <p>{note.message}</p>
                <span className="text-sm text-gray-400">{note.date}</span>
              </div>
              <button className="text-red-400 hover:text-red-500">
                <Trash2 size={20} />
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default NotificationsPage;