// SettingsPage.jsx
import React, { useState } from 'react';
import { Settings } from 'lucide-react';

const SettingsPage = () => {
  const [displayName, setDisplayName] = useState("Shanvi");
  const [emailNotifications, setEmailNotifications] = useState("Enabled");
  const [darkMode, setDarkMode] = useState(true);
  const [saved, setSaved] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="bg-gradient-to-br from-gray-800 to-gray-900 rounded-2xl shadow-2xl border border-gray-700 p-6">
        <h2 className="text-2xl font-bold mb-6 text-emerald-400 flex items-center"><Settings className="mr-2" /> Settings</h2>
        <form className="space-y-6 max-w-lg" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-2 text-sm text-gray-400">Display Name</label>
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
            />
          </div>
          <div>
            <label className="block mb-2 text-sm text-gray-400">Email Notifications</label>
            <select
              value={emailNotifications}
              onChange={(e) => setEmailNotifications(e.target.value)}
              className="w-full p-3 rounded bg-gray-700 text-white border border-gray-600"
            >
              <option>Enabled</option>
              <option>Disabled</option>
            </select>
          </div>
          <div className="flex items-center space-x-4">
            <label className="block text-sm text-gray-400">Dark Mode</label>
            <input
              type="checkbox"
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              className="accent-green-500 scale-150"
            />
          </div>
          <button
            type="submit"
            className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white px-6 py-2 rounded-lg font-semibold"
          >
            Save Settings
          </button>
          {saved && <p className="text-green-400 text-sm">Settings saved successfully.</p>}
        </form>
      </div>
    </div>
  );
};

export default SettingsPage;