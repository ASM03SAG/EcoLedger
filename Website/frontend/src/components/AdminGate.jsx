// AdminGate.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function AdminGate() {
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (code === '2025') {
      localStorage.setItem('adminAccessGranted', 'true');
      navigate('/admin-accessed');
    } else {
      setError('Invalid access code');
      setTimeout(() => navigate('/not-authorized'), 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="bg-gray-800 p-8 rounded-lg shadow-lg border border-gray-700 space-y-4 w-80"
      >
        <h2 className="text-xl font-bold text-center text-emerald-400">Admin Access</h2>
        <input
          type="password"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder="Enter Admin Code"
          className="w-full px-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:outline-none"
        />
        {error && <p className="text-red-500 text-sm">{error}</p>}
        <button
          type="submit"
          className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 rounded-lg text-white font-semibold"
        >
          Verify
        </button>
      </form>
    </div>
  );
}
