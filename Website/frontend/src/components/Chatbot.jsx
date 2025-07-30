import React, { useState, useEffect, useRef } from 'react';

const Chatbot = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isGeneratingInsights, setIsGeneratingInsights] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const API_KEY = "AIzaSyCOjle9xtSeNsCzL4CXbGvAa8Vl5I6NOXI"; // Replace with your Gemini API key
  const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`;

  const sendMessage = async (e) => {
    e.preventDefault();
    if (input.trim() === '') return;

    const userMessage = { text: input, sender: 'user' };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const chatHistory = [
        ...messages.map((msg) => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }],
        })),
        { role: 'user', parts: [{ text: input }] },
      ];

      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: chatHistory }),
      });

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const botText = result.candidates[0].content.parts[0].text;
        setMessages((prev) => [...prev, { text: botText, sender: 'bot' }]);
      } else {
        throw new Error('Empty or malformed response');
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'There was an error connecting to the AI. Please check your network or try again later.',
          sender: 'bot',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const generateInsights = async () => {
    if (messages.length === 0) {
      setMessages((prev) => [
        ...prev,
        {
          text: "There's no conversation history to generate insights from yet. Start by chatting!",
          sender: 'bot',
        },
      ]);
      return;
    }

    setIsGeneratingInsights(true);

    const insightsPrompt =
      'Based on the following conversation about carbon credits and green initiatives, please provide a concise summary or key insights. Focus on actionable takeaways or important concepts discussed:\n\n' +
      messages
        .map((msg) => `${msg.sender === 'user' ? 'User' : 'Assistant'}: ${msg.text}`)
        .join('\n');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: insightsPrompt }] }],
        }),
      });

      const result = await response.json();

      if (result.candidates?.[0]?.content?.parts?.[0]?.text) {
        const insightsText = result.candidates[0].content.parts[0].text;
        setMessages((prev) => [
          ...prev,
          {
            text: `✨ Here are some insights based on our conversation:\n\n${insightsText}`,
            sender: 'bot',
          },
        ]);
      } else {
        throw new Error('No insights generated');
      }
    } catch (error) {
      console.error('Error generating insights:', error);
      setMessages((prev) => [
        ...prev,
        {
          text: 'There was an error generating insights. Please try again later.',
          sender: 'bot',
        },
      ]);
    } finally {
      setIsGeneratingInsights(false);
    }
  };

  return (
    <div className="flex-1 w-full max-w-2xl bg-gray-800 rounded-lg shadow-lg flex flex-col overflow-hidden font-inter">
      {/* Chat Messages */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar max-h-[60vh]">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <p>Hello! I'm your EcoLedger AI Assistant.</p>
            <p>Ask me anything about carbon credits, green initiatives, or provide your data for insights!</p>
          </div>
        )}

        {messages.map((msg, index) => (
          <div key={index} className={`flex mb-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div
              className={`max-w-[70%] p-3 rounded-lg shadow-md whitespace-pre-wrap ${
                msg.sender === 'user'
                  ? 'bg-green-600 text-white rounded-br-none'
                  : 'bg-gray-700 text-gray-100 rounded-bl-none'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}

        {(isLoading || isGeneratingInsights) && (
          <div className="flex justify-start mb-4">
            <div className="max-w-[70%] p-3 rounded-lg shadow-md bg-gray-700 text-gray-100 rounded-bl-none whitespace-pre-wrap">
              <div className="flex items-center">
                <span className="animate-pulse mr-2">...</span> Thinking
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <form onSubmit={sendMessage} className="p-4 border-t border-gray-700 flex items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type your message here..."
          className="flex-1 p-3 rounded-lg bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:border-green-500 transition-all duration-200"
          disabled={isLoading || isGeneratingInsights}
        />
        <button
          type="submit"
          className="ml-4 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isGeneratingInsights || input.trim() === ''}
        >
          Send
        </button>
        <button
          type="button"
          onClick={generateInsights}
          className="ml-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isGeneratingInsights || messages.length === 0}
        >
          ✨ Get Insights
        </button>
      </form>
    </div>
  );
};

export default Chatbot;
