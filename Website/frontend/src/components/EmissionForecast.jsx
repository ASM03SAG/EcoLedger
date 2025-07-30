import React, { useState } from 'react';

const EmissionForecast = () => {
  const [inputData, setInputData] = useState('');
  const [forecastResult, setForecastResult] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const getEmissionForecast = async () => {
    if (inputData.trim() === '') {
      setForecastResult("Please provide some data or a scenario to forecast emissions.");
      return;
    }

    setIsLoading(true);
    setForecastResult('');

    const prompt = `Based on the following data or scenario, provide an emission forecast. If specific numbers are given, try to quantify the forecast. Otherwise, provide a qualitative analysis and potential trends. Data/Scenario: "${inputData}"`;

    try {
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      };

      const apiKey = "AIzaSyCOjle9xtSeNsCzL4CXbGvAa8Vl5I6NOXI"; // For Canvas demo only
      const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (
        result?.candidates?.[0]?.content?.parts?.[0]?.text
      ) {
        setForecastResult(result.candidates[0].content.parts[0].text);
      } else {
        console.error("Unexpected API response structure:", result);
        setForecastResult("Sorry, I couldn't generate the emission forecast. Please try again.");
      }
    } catch (error) {
      console.error("Error calling Gemini API for emission forecast:", error);
      setForecastResult("There was an error connecting to the AI. Please check your network or try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl bg-gray-800 rounded-b-lg shadow-lg flex flex-col overflow-hidden p-6">
      <h2 className="text-xl font-bold text-green-400 mb-4">Emission Forecast</h2>
      <p className="text-gray-400 mb-4">Enter data or a scenario to get an emission forecast.</p>

      <textarea
        className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-green-500 transition-all duration-200 mb-4 h-32 resize-y"
        placeholder="e.g., 'Our company's energy consumption increased by 10% last quarter...' or 'Data: 2023 emissions: 500 tCO2e, 2024: 550 tCO2e. Forecast for 2025?'"
        value={inputData}
        onChange={(e) => setInputData(e.target.value)}
        disabled={isLoading}
      ></textarea>

      <button
        onClick={getEmissionForecast}
        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
        disabled={isLoading || inputData.trim() === ''}
      >
        {isLoading ? 'Forecasting...' : 'Get Forecast'}
      </button>

      {forecastResult && (
        <div className="bg-gray-700 p-4 rounded-lg shadow-md text-gray-100 mt-4 overflow-y-auto max-h-64 custom-scrollbar">
          <h3 className="font-semibold text-green-300 mb-2">Forecast Result:</h3>
          <p className="whitespace-pre-wrap">{forecastResult}</p>
        </div>
      )}
    </div>
  );
};

export default EmissionForecast;
