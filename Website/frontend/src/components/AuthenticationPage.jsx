// src/components/AuthenticationPage.jsx

import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle, FaInfoCircle, FaScroll, FaProjectDiagram, FaBalanceScale, FaCubes, FaStore, FaArrowLeft } from 'react-icons/fa';

export default function AuthenticationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const [authResult, setAuthResult] = useState(null);
    const [uploadedFileName, setUploadedFileName] = useState('');
    const [message, setMessage] = useState('');
    const [isListing, setIsListing] = useState(false);
    const [listingPrice, setListingPrice] = useState('');
    const [listingDescription, setListingDescription] = useState('');

    useEffect(() => {
        if (location.state && location.state.authResult) {
            setAuthResult(location.state.authResult);
            setUploadedFileName(location.state.uploadedFileName || 'N/A');
            
            // Auto-redirect for unauthenticated certificates after 10 seconds
            if (location.state.authResult.authenticated === false) {
                setTimeout(() => {
                    navigate('/dashboard', { 
                        state: { 
                            message: 'Certificate authentication failed. Please try again with a valid certificate.',
                            messageType: 'error'
                        }
                    });
                }, 10000);
            }
        } else {
            setMessage('No authentication data provided. Please upload a certificate first.');
            setAuthResult({ status: 'error', message: 'No authentication data provided.' });
        }
    }, [location.state, navigate]);


    if (!authResult) {
        return (
            <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 font-sans">
                <div className="flex flex-col items-center space-y-4">
                    <FaSpinner className="animate-spin text-blue-400" size={50} />
                    <p className="text-xl text-gray-300">Loading authentication results...</p>
                </div>
            </div>
        );
    }

    const isSuccess = authResult.authenticated === true;
    const isUnauthenticated = authResult.authenticated === false && authResult.status === 'unauthenticated';
    const isError = authResult.status === 'error';
    const displayMessage = authResult.message || "No specific message provided.";

    const getStatusIcon = () => {
        if (isSuccess) return <FaCheckCircle className="text-emerald-400" size={60} />;
        if (isUnauthenticated) return <FaTimesCircle className="text-yellow-400" size={60} />;
        if (isError) return <FaTimesCircle className="text-red-400" size={60} />;
        return <FaInfoCircle className="text-gray-400" size={60} />;
    };

    const getTitle = () => {
        if (isSuccess) return "Authentication Successful!";
        if (isUnauthenticated) return "Authentication Failed!";
        if (isError) return "Authentication Error!";
        return "Authentication Details";
    };

    const getTitleColor = () => {
        if (isSuccess) return "from-emerald-400 to-teal-400";
        if (isUnauthenticated) return "from-yellow-400 to-orange-400";
        if (isError) return "from-red-400 to-pink-400";
        return "from-blue-400 to-indigo-400";
    };

    const DetailRow = ({ icon, label, value }) => (
        <div className="flex items-center p-3 bg-gray-700/50 rounded-lg shadow-sm">
            {icon && <span className="mr-3 text-lg text-gray-400">{icon}</span>}
            <span className="text-gray-400 text-md font-medium">{label}:</span>
            <span className="ml-auto font-semibold text-white">{value || "N/A"}</span>
        </div>
    );

    const ExtractedDetailRow = ({ icon, label, value }) => (
        <div className="flex items-start p-3 bg-gray-700/50 rounded-lg shadow-sm">
            {icon && <span className="mr-3 text-lg text-gray-400 mt-1">{icon}</span>}
            <div className="flex flex-col">
                <span className="text-gray-400 text-md font-medium">{label}:</span>
                <span className="font-semibold text-white break-words">{value || "N/A"}</span>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 font-sans">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-4xl transform transition-all duration-300 hover:scale-[1.01]">
                <div className="flex flex-col items-center mb-8 text-center">
                    {getStatusIcon()}
                    <h2 className={`text-4xl font-bold bg-gradient-to-r ${getTitleColor()} bg-clip-text text-transparent mt-4 mb-2`}>
                        {getTitle()}
                    </h2>
                    <p className={`text-lg mb-4 ${isSuccess ? 'text-emerald-300' : isUnauthenticated ? 'text-yellow-300' : 'text-red-300'}`}>
                        {displayMessage}
                    </p>
                    <p className="text-gray-400 text-sm italic">
                        Processing results for: <span className="font-semibold text-gray-300">{uploadedFileName}</span>
                    </p>
                    
                    {/* Auto-redirect message for unauthenticated certificates */}
                    {isUnauthenticated && (
                        <div className="mt-4 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg">
                            <p className="text-yellow-200 text-sm">
                                🔄 Redirecting to dashboard in 3 seconds...
                            </p>
                        </div>
                    )}
                </div>

                {authResult.extracted_data && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-300 mb-4 flex items-center">
                            <FaScroll className="mr-3 text-blue-400" /> Extracted Certificate Data
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ExtractedDetailRow icon="🆔" label="Project ID" value={authResult.extracted_data.project_id} />
                            <ExtractedDetailRow icon="🏷️" label="Project Name" value={authResult.extracted_data.project_name} />
                            <ExtractedDetailRow icon="🗓️" label="Vintage" value={authResult.extracted_data.vintage} />
                            <ExtractedDetailRow icon="🔢" label="Serial Number" value={authResult.extracted_data.serial_number} />
                            <ExtractedDetailRow icon="⚖️" label="Amount (tonnes)" value={authResult.extracted_data.amount} />
                            <ExtractedDetailRow icon="📅" label="Issuance Date" value={authResult.extracted_data.issuance_date} />
                            <ExtractedDetailRow icon="🏛️" label="Registry" value={authResult.extracted_data.registry} />
                            <ExtractedDetailRow icon="🗂️" label="Category" value={authResult.extracted_data.category} />
                            <ExtractedDetailRow icon="👤" label="Issued To" value={authResult.extracted_data.issued_to} />
                        </div>
                    </div>
                )}

                {isSuccess && authResult.carbonmark_details && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-300 mb-4 flex items-center">
                            <FaBalanceScale className="mr-3 text-emerald-400" /> Carbonmark Verification
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailRow icon="📝" label="Carbonmark Product ID" value={authResult.carbonmark_details.id} />
                            <DetailRow icon="🌳" label="Product Name" value={authResult.carbonmark_details.name} />
                        </div>
                    </div>
                )}

                {isSuccess && authResult.blockchain_status && (
                    <div className="mb-8">
                        <h3 className="text-2xl font-bold text-gray-300 mb-4 flex items-center">
                            <FaCubes className="mr-3 text-purple-400" /> Blockchain Status
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <DetailRow icon="🔗" label="Status" value={authResult.blockchain_status} />
                            <DetailRow icon="📃" label="Fabric Tx ID" value={authResult.fabric_tx_id} />
                        </div>
                    </div>
                )}


                {/* Troubleshooting section for failed authentications */}
                {(isUnauthenticated || isError) && (
                    <div className="p-4 bg-red-900/30 border border-red-700 rounded-xl mb-6 text-red-200 text-sm">
                        <p className="font-semibold mb-2">Troubleshooting Tips:</p>
                        <ul className="list-disc list-inside space-y-1">
                            <li>Ensure the PDF is a valid, searchable document, not just an image.</li>
                            <li>Verify the certificate format matches the expected regex patterns in `app.py`.</li>
                            <li>Check your Carbonmark API key and base URL in Flask's `.env` file.</li>
                            <li>Review your Flask `app.py` console for detailed errors.</li>
                        </ul>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex flex-col gap-4 mt-6 w-full">
                <button
                    onClick={() =>
                    navigate('/enter-listing', {
                        state: {
                        authResult,
                        uploadedFileName,
                        creditId: authResult.credit?._id || authResult.credit_id,
                        fileHash: authResult.file_hash || authResult.credit?.file_hash
                        },
                    })
                    }
                    className="bg-emerald-600 text-white py-2 px-4 rounded w-full hover:bg-emerald-700 transition"
                >
                    Enter Listing Details
                </button>

                <button
                    onClick={() => navigate('/dashboard')}
                    className="bg-gray-600 text-white py-2 px-4 rounded w-full hover:bg-gray-700 transition"
                >
                    ← Back to Dashboard
                </button>

                {/* Only show "Try Another Certificate" for failed authentications */}
                {(isUnauthenticated || isError) && (
                    <button
                    onClick={() => navigate('/upload')}
                    className="w-full py-3 rounded-xl font-semibold text-md bg-gradient-to-r from-blue-500 to-indigo-500 text-white hover:from-blue-600 hover:to-indigo-600 transition-all duration-300 transform hover:scale-105 shadow-lg"
                    >
                    Try Another Certificate
                    </button>
                )}
                </div>
            </div>
        </div>
    );
}