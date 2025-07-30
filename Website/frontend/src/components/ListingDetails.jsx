// src/components/ListingDetails.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FaSpinner, FaStore, FaUser, FaEnvelope, FaDollarSign, FaArrowLeft, FaCheckCircle } from 'react-icons/fa';

export default function ListingDetails() {
    const navigate = useNavigate();
    const location = useLocation();
    const { authResult, uploadedFileName, creditId, fileHash } = location.state || {};
    
    const [ownershipType, setOwnershipType] = useState('original');
    const [ownerName, setOwnerName] = useState('');
    const [ownerEmail, setOwnerEmail] = useState('');
    const [pricePerCredit, setPricePerCredit] = useState('');
    const [isListing, setIsListing] = useState(false);

    if (!authResult) {
        navigate('/dashboard', {
            state: {
                message: 'No authentication data provided. Please authenticate a certificate first.',
                messageType: 'error'
            }
        });
        return null;
    }

    const totalValue = pricePerCredit && authResult.extracted_data.amount 
        ? (parseFloat(pricePerCredit) * parseFloat(authResult.extracted_data.amount)).toFixed(2)
        : '0.00';

    const handleListOnMarketplace = async () => {
        setIsListing(true);
        try {
            // 1. Get email from localStorage
            const userEmail = localStorage.getItem('email');
            if (!userEmail) {
                alert('User not logged in. Please log in to list credits.');
                setIsListing(false);
                return;
            }

            // 2. Prepare listingData
            const listingData = {
                fileHash,
                creditId,
                pricePerCredit: parseFloat(pricePerCredit),
                description: `Carbon credits from ${authResult.extracted_data.project_name}`,
                ownershipType,
                ownerName,
                ownerEmail,
                totalValue: parseFloat(totalValue),
                certificateData: authResult.extracted_data
            };

            // Call your backend API to list the credit on marketplace
            const response = await fetch('http://localhost:5000/api/marketplace/list', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'email': userEmail,
                },
                body: JSON.stringify(listingData)
            });

            if (response.ok) {
                const result = await response.json();
                navigate('/dashboard', {
                    state: {
                        message: `Credit ${authResult.extracted_data.project_id} successfully listed on marketplace!`,
                        messageType: 'success',
                        newListing: result
                    }
                });
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to list credit on marketplace');
            }
        } catch (error) {
            console.error('Error listing credit:', error);
            alert(`Failed to list credit on marketplace: ${error.message}. Please try again.`);
        } finally {
            setIsListing(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center p-8 font-sans">
            <div className="bg-gradient-to-br from-gray-800 to-gray-900 p-10 rounded-3xl shadow-2xl border border-gray-700 w-full max-w-2xl">
                <div className="flex items-center mb-6">
                    <button 
                        onClick={() => navigate(-1)}
                        className="mr-4 p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors"
                    >
                        <FaArrowLeft />
                    </button>
                    <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-teal-400 bg-clip-text text-transparent">
                        Listing Details
                    </h2>
                </div>

                <div className="mb-6 p-4 bg-gray-700/30 rounded-lg border border-gray-600">
                    <h3 className="text-xl font-semibold text-gray-300 mb-2">Certificate Summary</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                        <div>
                            <span className="text-gray-400">Project:</span>
                            <p className="font-medium">{authResult.extracted_data.project_name || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Amount:</span>
                            <p className="font-medium">{authResult.extracted_data.amount} tonnes</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Vintage:</span>
                            <p className="font-medium">{authResult.extracted_data.vintage || 'N/A'}</p>
                        </div>
                        <div>
                            <span className="text-gray-400">Serial #:</span>
                            <p className="font-medium">{authResult.extracted_data.serial_number || 'N/A'}</p>
                        </div>
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Ownership Type Selection */}
                    <div>
                        <h3 className="text-lg font-semibold text-gray-300 mb-3">Ownership Type</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                onClick={() => setOwnershipType('original')}
                                className={`p-4 rounded-xl border-2 transition-all ${ownershipType === 'original' ? 'border-green-500 bg-green-900/20' : 'border-gray-600 hover:border-gray-500'}`}
                            >
                                <div className="flex flex-col items-center">
                                    <FaUser className={`mb-2 ${ownershipType === 'original' ? 'text-green-400' : 'text-gray-400'}`} size={20} />
                                    <span className={ownershipType === 'original' ? 'text-green-300 font-medium' : 'text-gray-400'}>Original Owner</span>
                                </div>
                            </button>
                            <button
                                onClick={() => setOwnershipType('modified')}
                                className={`p-4 rounded-xl border-2 transition-all ${ownershipType === 'modified' ? 'border-blue-500 bg-blue-900/20' : 'border-gray-600 hover:border-gray-500'}`}
                            >
                                <div className="flex flex-col items-center">
                                    <FaUser className={`mb-2 ${ownershipType === 'modified' ? 'text-blue-400' : 'text-gray-400'}`} size={20} />
                                    <span className={ownershipType === 'modified' ? 'text-blue-300 font-medium' : 'text-gray-400'}>Modified Ownership</span>
                                </div>
                            </button>
                        </div>
                    </div>

                    {/* Owner Details */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                                <FaUser className="mr-2" /> Current Owner's Name
                            </label>
                            <input
                                type="text"
                                placeholder="Enter owner's full name"
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                value={ownerName}
                                onChange={(e) => setOwnerName(e.target.value)}
                            />
                        </div>

                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                                <FaEnvelope className="mr-2" /> Owner's Email
                            </label>
                            <input
                                type="email"
                                placeholder="Enter owner's email address"
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
                                value={ownerEmail}
                                onChange={(e) => setOwnerEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Pricing */}
                    <div className="space-y-4">
                        <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2 flex items-center">
                                <FaDollarSign className="mr-2" /> Price per Credit (USD)
                            </label>
                            <input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="e.g., 25.00"
                                className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-green-500"
                                value={pricePerCredit}
                                onChange={(e) => setPricePerCredit(e.target.value)}
                            />
                        </div>

                        <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                            <div className="flex justify-between items-center">
                                <span className="text-gray-400">Total Value:</span>
                                <span className="text-2xl font-bold text-green-400">${totalValue}</span>
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                                {authResult.extracted_data.amount} credits × ${pricePerCredit || '0.00'} each
                            </div>
                        </div>
                    </div>

                    {/* List Button */}
                    <button
                        onClick={handleListOnMarketplace}
                        disabled={isListing || !pricePerCredit || !ownerName || !ownerEmail}
                        className="w-full bg-gradient-to-r from-green-500 to-teal-500 text-white py-4 px-6 rounded-xl font-semibold hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center justify-center"
                    >
                        {isListing ? (
                            <>
                                <FaSpinner className="animate-spin mr-2" />
                                Listing on Marketplace...
                            </>
                        ) : (
                            <>
                                <FaStore className="mr-2" />
                                List on Marketplace
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}