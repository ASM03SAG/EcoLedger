// src/components/SustainabilityScore.jsx

import React, { useState } from 'react';

const SustainabilityScore = () => {
    const [inputDescription, setInputDescription] = useState('');
    const [scoreResult, setScoreResult] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const getSustainabilityScore = async () => {
        if (inputDescription.trim() === '') {
            setScoreResult("Please describe your initiatives or data to get a sustainability score.");
            return;
        }

        setIsLoading(true);
        setScoreResult('');

        const prompt = `Analyze the following description of sustainability initiatives or data and provide a qualitative sustainability score or assessment. Highlight strengths, weaknesses, and areas for improvement. Description: "${inputDescription}"`;

        try {
            const payload = { contents: [{ role: "user", parts: [{ text: prompt }] }] };
            const apiKey = "YOUR_API_KEY"; // Replace with secure environment variable in real projects
            const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`;

            const response = await fetch(apiUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const result = await response.json();

            if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
                setScoreResult(result.candidates[0].content.parts[0].text);
            } else {
                console.error("Unexpected API response structure:", result);
                setScoreResult("Sorry, I couldn't generate the sustainability score. Please try again.");
            }
        } catch (error) {
            console.error("Error calling Gemini API for sustainability score:", error);
            setScoreResult("There was an error connecting to the AI. Please check your network or try again later.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex-1 w-full max-w-2xl bg-gray-800 rounded-b-lg shadow-lg flex flex-col overflow-hidden p-6">
            <h2 className="text-xl font-bold text-green-400 mb-4">Sustainability Score</h2>
            <p className="text-gray-400 mb-4">Describe your sustainability initiatives or provide relevant data to get an assessment.</p>

            <textarea
                className="w-full p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-green-500 transition-all duration-200 mb-4 h-32 resize-y"
                placeholder="e.g., 'We implemented a new recycling program and reduced water usage by 15%. Assess our sustainability.'"
                value={inputDescription}
                onChange={(e) => setInputDescription(e.target.value)}
                disabled={isLoading}
            ></textarea>

            <button
                onClick={getSustainabilityScore}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed mb-4"
                disabled={isLoading || inputDescription.trim() === ''}
            >
                {isLoading ? 'Scoring...' : 'Get Score'}
            </button>

            {scoreResult && (
                <div className="bg-gray-700 p-4 rounded-lg shadow-md text-gray-100 mt-4 overflow-y-auto max-h-64 custom-scrollbar">
                    <h3 className="font-semibold text-green-300 mb-2">Sustainability Assessment:</h3>
                    <p className="whitespace-pre-wrap">{scoreResult}</p>
                </div>
            )}
        </div>
    );
};

export default SustainabilityScore;
