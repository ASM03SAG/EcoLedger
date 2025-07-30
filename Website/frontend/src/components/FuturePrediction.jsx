// src/App.jsx
import React, { useState } from 'react';

const FuturePrediction = () => {
    const [inputScenario, setInputScenario] = useState('');
    const [predictionResult, setPredictionResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getFuturePrediction = async () => {
        if (inputScenario.trim() === '') {
            setPredictionResult("Please describe a scenario to get a future prediction.");
            return;
        }

        setIsLoading(true);
        setPredictionResult('');

        const prompt = `Based on the following scenario related to carbon credits, green initiatives, or environmental policies, provide a prediction about future outcomes or impacts. Focus on plausible scenarios and potential implications. Scenario: "${inputScenario}"`;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "YOUR_API_KEY_HERE"; // REPLACE THIS WITH A VALID API KEY
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setPredictionResult(result.candidates[0].content.parts[0].text);
            } else {
                console.error("Unexpected API response structure:", result);
                setPredictionResult("Sorry, I couldn't generate the future prediction. Please try again.");
            }
        } catch (error) {
            console.error("Error calling Gemini API:", error);
            setPredictionResult("There was an error connecting to the AI. Please try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-900 p-6">
            <div className="w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden p-6">
                <h2 className="text-xl font-bold text-green-400 mb-4">Future Prediction</h2>
                <p className="text-gray-400 mb-4">Describe a scenario to get a prediction about future environmental or carbon credit trends.</p>

                <textarea
                    className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-green-500 transition-all duration-200 mb-4 h-32 resize-y"
                    placeholder="e.g., 'What will be the impact on carbon credit prices if major economies adopt stricter emission caps by 2030?'"
                    value={inputScenario}
                    onChange={(e) => setInputScenario(e.target.value)}
                    disabled={isLoading}
                ></textarea>

                <button
                    onClick={getFuturePrediction}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                    disabled={isLoading || inputScenario.trim() === ''}
                >
                    {isLoading ? 'Predicting...' : 'Get Prediction'}
                </button>

                {predictionResult && (
                    <div className="bg-gray-700 p-4 rounded-lg shadow-md text-gray-100 mt-4 overflow-y-auto max-h-64 custom-scrollbar">
                        <h3 className="font-semibold text-green-300 mb-2">Prediction Result:</h3>
                        <p className="whitespace-pre-wrap">{predictionResult}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default FuturePrediction;
