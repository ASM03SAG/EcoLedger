import React, { useState } from 'react';
import Chatbot from './Chatbot';
import EmissionForecast from './EmissionForecast';
import FuturePrediction from './FuturePrediction';
import SustainabilityScore from './SustainabilityScore';
// import './AInsights.css'; // Custom scrollbar styles here

const AInsights = () => {
  const [currentPage, setCurrentPage] = useState('chatbot');

  const renderPage = () => {
    switch (currentPage) {
      case 'chatbot':
        return <Chatbot />;
      case 'emission-forecast':
        return <EmissionForecast />;
      case 'future-prediction':
        return <FuturePrediction />;
      case 'sustainability-score':
        return <SustainabilityScore />;
      default:
        return <Chatbot />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-inter flex flex-col items-center justify-center p-4 custom-scrollbar">
      <header className="w-full max-w-2xl bg-gray-800 p-4 rounded-t-lg shadow-lg mb-4">
        <h1 className="text-2xl font-bold text-green-400 text-center">EcoLedger AI Dashboard</h1>
        <p className="text-gray-400 text-center text-sm mt-1">AI-Powered Insights for Green Initiatives</p>
      </header>

      <nav className="w-full max-w-2xl bg-gray-800 p-2 rounded-lg shadow-lg mb-4 flex justify-around flex-wrap gap-2">
        <button
          onClick={() => setCurrentPage('chatbot')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === 'chatbot' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          AI Chat Assistant
        </button>
        <button
          onClick={() => setCurrentPage('emission-forecast')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === 'emission-forecast' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Emission Forecast
        </button>
        <button
          onClick={() => setCurrentPage('future-prediction')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === 'future-prediction' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Future Prediction
        </button>
        <button
          onClick={() => setCurrentPage('sustainability-score')}
          className={`px-4 py-2 rounded-lg transition-all duration-200 ${currentPage === 'sustainability-score' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
        >
          Sustainability Score
        </button>
      </nav>

      {renderPage()}
    </div>
  );
};

export default AInsights;
