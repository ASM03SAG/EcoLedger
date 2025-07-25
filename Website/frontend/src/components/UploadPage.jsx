// src/components/UploadPage.jsx

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaUpload, FaFilePdf, FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

export default function UploadPage() {
    const [selectedFile, setSelectedFile] = useState(null);
    const [message, setMessage] = useState('');
    const [uploading, setUploading] = useState(false);
    const [authProcessing, setAuthProcessing] = useState(false);
    const [uploadStatus, setUploadStatus] = useState(null);
    const navigate = useNavigate();
    const email = localStorage.getItem('email');
    console.log('Email from localStorage:', email);

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/pdf') {
            setSelectedFile(file);
            setMessage(`Selected: ${file.name}`);
            setUploadStatus(null);
        } else {
            setSelectedFile(null);
            setMessage('Please select a PDF file.');
            setUploadStatus('error');
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) {
            setMessage('No file selected.');
            setUploadStatus('error');
            return;
        }

        setUploading(true);
        setMessage('Uploading and authenticating...');
        setUploadStatus(null);

        const formData = new FormData();
        formData.append('certificate', selectedFile);

        try {
            // Single API call that handles both upload AND authentication
            const response = await fetch('http://localhost:5000/api/credits/upload', {
                method: 'POST',
                headers: {
                    email: email,
                },
                body: formData,
            });

            // Add debugging to see what we're getting back
            console.log('Response status:', response.status);
            console.log('Response headers:', response.headers);
            
            const responseText = await response.text();
            console.log('Raw response:', responseText);

            // Try to parse the response
            let data;
            try {
                data = JSON.parse(responseText);
            } catch (parseError) {
                console.error('JSON parse error:', parseError);
                console.error('Response text:', responseText);
                throw new Error('Invalid response format from server');
            }

            if (!response.ok) {
                if (response.status === 409) {
                    setMessage(data.message || 'Duplicate certificate detected.');
                    setUploadStatus('duplicate');
                } else {
                    setMessage(data.message || 'File upload failed.');
                    setUploadStatus('error');
                }
                setUploading(false);
                return;
            }

            setMessage('Upload and authentication successful!');
            setUploadStatus('success');
            setUploading(false);

            // Navigate to results page with the authentication result
            navigate('/authenticate-result', {
                state: {
                    authResult: data.authenticationResult || data,
                    uploadedFileName: selectedFile.name,
                    serialNumber: data.serialNumber
                },
            });

        } catch (error) {
            console.error('Error during upload or authentication:', error);
            setMessage(`Failed to process certificate: ${error.message}`);
            setUploadStatus('error');
            setUploading(false);
        }
    };

    const getStatusIcon = () => {
        if (uploading || authProcessing) return <FaSpinner className="animate-spin text-blue-400" />;
        if (uploadStatus === 'success') return <FaCheckCircle className="text-emerald-400" />;
        if (uploadStatus === 'error') return <FaTimesCircle className="text-red-400" />;
        if (uploadStatus === 'duplicate') return <FaTimesCircle className="text-yellow-400" />;
        return <FaUpload className="text-gray-400" />;
    };

    const getButtonText = () => {
        if (authProcessing) return 'Authenticating...';
        if (uploading) return 'Uploading...';
        return 'Upload & Authenticate';
    };

    const isButtonDisabled = uploading || authProcessing || !selectedFile;

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 font-sans">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-xl transform transition-all duration-300 hover:scale-[1.01]">
                <div className="flex flex-col items-center mb-8 text-center">
                    <div className="text-6xl mb-4">{getStatusIcon()}</div>
                    <h2 className="text-4xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        Upload Carbon Credit Certificate
                    </h2>
                    <p className="text-gray-300 text-lg mb-6">
                        Select a PDF file to begin the authentication process.
                    </p>
                </div>

                <div className="mb-6">
                    <label
                        htmlFor="file-upload"
                        className="flex items-center justify-center w-full p-4 border-2 border-dashed border-gray-600 rounded-lg cursor-pointer bg-gray-700 hover:bg-gray-600 transition-colors duration-300 text-gray-300 font-semibold text-lg"
                    >
                        <FaFilePdf className="mr-3 text-red-400" size={24} />
                        {selectedFile ? selectedFile.name : 'Choose PDF File'}
                        <input
                            id="file-upload"
                            type="file"
                            accept="application/pdf"
                            onChange={handleFileChange}
                            className="hidden"
                        />
                    </label>
                </div>

                {message && (
                    <div
                        className={`mb-6 p-3 rounded-lg text-center font-medium ${
                            uploadStatus === 'success'
                                ? 'bg-emerald-800/30 text-emerald-300'
                                : uploadStatus === 'error'
                                ? 'bg-red-800/30 text-red-300'
                                : uploadStatus === 'duplicate'
                                ? 'bg-yellow-800/30 text-yellow-300'
                                : 'bg-gray-700/30 text-gray-300'
                        }`}
                    >
                        {message}
                    </div>
                )}

                <button
                    onClick={handleUpload}
                    disabled={isButtonDisabled}
                    className={`w-full py-4 rounded-xl font-bold text-xl transition-all duration-300 ${
                        isButtonDisabled
                            ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                            : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:from-blue-700 hover:to-indigo-700'
                    }`}
                >
                    {getButtonText()}
                </button>
            </div>
        </div>
    );
}
