import React, { useState, useEffect } from 'react';
import {
  FaCube,
  FaSearch,
  FaSpinner,
  FaChartLine,
  FaUserShield,
  FaDatabase,
  FaHistory,
  FaLink
} from 'react-icons/fa';
import { motion } from 'framer-motion';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('blockchain');
  const [blocks, setBlocks] = useState([]);
  const [currentBlock, setCurrentBlock] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  // ✅ Hardcoded block data (multiple blocks, all inline)
  const hardcodedBlocks = [
    {
      blockNumber: 1,
      timestamp: "2025-07-30T10:00:00.000Z",
      size: 128,
      header: { channel_id: "mychannel", number: 1 },
      data: {
        projectName: "Borneo Peatland Restoration",
        issuedTo: "EcoBalance Ventures",
        amount: 500,
        status: "listed"
      },
      transactions: [{
        txId: "abcd1234efgh5678ijkl",
        timestamp: "2025-07-30T10:01:00.000Z",
        payload: { serialNumber: "MC02-VCS-1654-2022-B002" }
      }]
    },
    {
      blockNumber: 2,
      timestamp: "2025-07-30T11:00:00.000Z",
      size: 130,
      header: { channel_id: "mychannel", number: 2 },
      data: {
        projectName: "Amazon Rainforest Protection",
        issuedTo: "Green Future Org",
        amount: 750,
        status: "listed"
      },
      transactions: [{
        txId: "mnop5678qrst1234uvwx",
        timestamp: "2025-07-30T11:01:00.000Z",
        payload: { serialNumber: "MC02-VCS-2000-2021-X001" }
      }]
    }
  ];

  useEffect(() => {
    // ⚠ No backend call
    setBlocks(hardcodedBlocks);
  }, []);

  const getBlockDetails = (block) => {
    setLoading(true);
    setTimeout(() => {
      setCurrentBlock(block);
      setLoading(false);
    }, 300);
  };

  const filteredBlocks = blocks.filter(block =>
    block.blockNumber.toString().includes(searchQuery) ||
    block.transactions.some(tx => tx.txId.includes(searchQuery))
  );

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
            Admin Dashboard
          </h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-6 flex items-center">
              <FaUserShield className="mr-2 text-emerald-400" /> Admin Tools
            </h2>
            <nav className="space-y-2">
              {[
                { key: 'blockchain', label: 'Blockchain', icon: <FaLink /> },
                { key: 'transactions', label: 'Transactions', icon: <FaHistory /> },
                { key: 'analytics', label: 'Analytics', icon: <FaChartLine /> },
                { key: 'data', label: 'Data', icon: <FaDatabase /> }
              ].map(tab => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`w-full text-left px-4 py-3 rounded-lg flex items-center gap-3 transition-colors ${
                    activeTab === tab.key
                      ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
                      : 'hover:bg-gray-700'
                  }`}
                >
                  {tab.icon} {tab.label}
                </button>
              ))}
            </nav>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-6">
            {activeTab === 'blockchain' && (
              <motion.div
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-semibold flex items-center">
                    <FaCube className="mr-2 text-emerald-400" /> Blockchain Explorer
                  </h2>
                  <div className="relative w-64">
                    <FaSearch className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search blocks..."
                      className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                </div>

                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <FaSpinner className="animate-spin text-4xl text-emerald-400" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredBlocks.map((block) => (
                      <motion.div
                        key={block.blockNumber}
                        onClick={() => getBlockDetails(block)}
                        className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 cursor-pointer transition-colors"
                        whileHover={{ scale: 1.02 }}
                      >
                        <div className="flex justify-between items-center">
                          <div>
                            <h3 className="font-mono text-emerald-400">Block #{block.blockNumber}</h3>
                            <p className="text-sm text-gray-400">{new Date(block.timestamp).toLocaleString()}</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm"><span className="text-gray-400">Txs:</span> {block.transactions.length}</p>
                            <p className="text-sm"><span className="text-gray-400">Size:</span> {block.size} bytes</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                )}

                {currentBlock && (
                  <div className="mt-6">
                    <h3 className="text-lg font-semibold mb-4">
                      Block #{currentBlock.blockNumber} Details
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Header</h4>
                        <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                          {JSON.stringify(currentBlock.header, null, 2)}
                        </pre>
                      </div>
                      <div>
                        <h4 className="text-sm font-medium text-gray-400 mb-2">Data</h4>
                        <pre className="bg-gray-900 p-4 rounded-lg text-sm overflow-x-auto">
                          {JSON.stringify(currentBlock.data, null, 2)}
                        </pre>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {activeTab === 'transactions' && (
              <motion.div
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaHistory className="mr-2 text-emerald-400" /> Transactions
                </h2>
                {blocks.map(block =>
                  block.transactions.map(tx => (
                    <div key={tx.txId} className="bg-gray-700/40 p-3 rounded-lg mb-3">
                      <p className="font-mono text-blue-300">TxID: {tx.txId}</p>
                      <p className="text-sm text-gray-300">Block #{block.blockNumber}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}

            {activeTab === 'analytics' && (
              <motion.div
                className="bg-gray-800 rounded-xl p-6 border border-gray-700 text-gray-300"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaChartLine className="mr-2 text-emerald-400" /> Analytics
                </h2>
                <p>Total Blocks: {blocks.length}</p>
                <p>Total Transactions: {blocks.reduce((acc, b) => acc + b.transactions.length, 0)}</p>
              </motion.div>
            )}

            {activeTab === 'data' && (
              <motion.div
                className="bg-gray-800 rounded-xl p-6 border border-gray-700"
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
              >
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FaDatabase className="mr-2 text-emerald-400" /> Raw Data
                </h2>
                <pre className="bg-gray-900 text-sm p-4 rounded-lg overflow-x-auto">
                  {JSON.stringify(blocks, null, 2)}
                </pre>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// import React, { useState, useEffect } from 'react';
// import { useNavigate, useLocation } from 'react-router-dom';
// import {
//   FaCube,
//   FaLink,
//   FaSearch,
//   FaSpinner,
//   FaChartLine,
//   FaUserShield,
//   FaDatabase,
//   FaHistory
// } from 'react-icons/fa';

// export default function AdminPage() {
//   const [blocks, setBlocks] = useState([]);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [currentBlock, setCurrentBlock] = useState(null);
//   const [verified, setVerified] = useState(null); // null = loading, true = verified, false = not verified
//   const [searchQuery, setSearchQuery] = useState('');

//   const navigate = useNavigate();
//   const location = useLocation();

//   const activeTab = location.pathname.split('/').pop(); // gets last segment of path

//   useEffect(() => {
//     const verifyAdmin = async () => {
//       const email = localStorage.getItem('email');
//       if (!email) {
//         navigate('/not-authorized');
//         return;
//       }

//       try {
//         const response = await fetch('http://localhost:5000/api/admin/verify', {
//           headers: { email },
//         });

//         const result = await response.json();

//         if (response.ok && result.verified) {
//           setVerified(true);
//           if (activeTab === 'blockchain') fetchBlockchainData();
//         } else {
//           setVerified(false);
//           navigate('/not-authorized');
//         }
//       } catch (err) {
//         console.error('Verification failed:', err);
//         setError('Admin verification failed');
//         setVerified(false);
//         navigate('/not-authorized');
//       }
//     };

//     verifyAdmin();
//   }, [navigate, activeTab]);

//   const fetchBlockchainData = async () => {
//     try {
//       const response = await fetch('http://localhost:5000/api/blockchain/blocks');
//       const data = await response.json();
//       setBlocks(data.blocks);
//     } catch (err) {
//       setError('Failed to load blockchain data');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getBlockDetails = async (blockNumber) => {
//     setLoading(true);
//     try {
//       const response = await fetch(`http://localhost:5000/api/blockchain/blocks/${blockNumber}`);
//       const data = await response.json();
//       setCurrentBlock(data);
//     } catch (err) {
//       setError('Failed to fetch block details');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const filteredBlocks = blocks.filter(block =>
//     block.blockNumber.toString().includes(searchQuery) ||
//     block.transactions.some(tx =>
//       tx.txId.includes(searchQuery) ||
//       JSON.stringify(block.data).toLowerCase().includes(searchQuery.toLowerCase())
//     )
//   );

//   if (verified === null) {
//     return (
//       <div className="min-h-screen flex justify-center items-center bg-gray-900 text-white">
//         <FaSpinner className="animate-spin text-4xl text-emerald-400" />
//         <span className="ml-4 text-xl">Verifying admin access...</span>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen bg-gray-900 text-white p-8">
//       <div className="max-w-7xl mx-auto">
//         <div className="flex justify-between items-center mb-8">
//           <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
//             Admin Dashboard
//           </h1>
//           <button
//             onClick={() => navigate('/dashboard')}
//             className="px-4 py-2 bg-gray-700 rounded-lg hover:bg-gray-600 transition-colors"
//           >
//             Back to User Dashboard
//           </button>
//         </div>

//         {error && (
//           <div className="bg-red-900/30 border border-red-700 p-4 rounded-lg mb-6">
//             {error}
//           </div>
//         )}

//         <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
//           {/* Sidebar */}
//           <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
//             <h2 className="text-xl font-semibold mb-6 flex items-center">
//               <FaUserShield className="mr-2 text-emerald-400" /> Admin Tools
//             </h2>
//             <nav className="space-y-2">
//               <button
//                 onClick={() => navigate('/admin/blockchain')}
//                 className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
//                   activeTab === 'blockchain'
//                     ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
//                     : 'hover:bg-gray-700'
//                 }`}
//               >
//                 <FaLink className="mr-3" /> Blockchain
//               </button>
//               <button
//                 onClick={() => navigate('/admin/transactions')}
//                 className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
//                   activeTab === 'transactions'
//                     ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
//                     : 'hover:bg-gray-700'
//                 }`}
//               >
//                 <FaHistory className="mr-3" /> Transactions
//               </button>
//               <button
//                 onClick={() => navigate('/admin/analytics')}
//                 className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
//                   activeTab === 'analytics'
//                     ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
//                     : 'hover:bg-gray-700'
//                 }`}
//               >
//                 <FaChartLine className="mr-3" /> Analytics
//               </button>
//               <button
//                 onClick={() => navigate('/admin/data')}
//                 className={`w-full text-left px-4 py-3 rounded-lg flex items-center transition-colors ${
//                   activeTab === 'data'
//                     ? 'bg-emerald-900/50 text-emerald-400 border border-emerald-700'
//                     : 'hover:bg-gray-700'
//                 }`}
//               >
//                 <FaDatabase className="mr-3" /> Data
//               </button>
//             </nav>
//           </div>

//           {/* Main Content */}
//           <div className="lg:col-span-3 space-y-6">
//             {activeTab === 'blockchain' && (
//               <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
//                 <div className="flex justify-between items-center mb-6">
//                   <h2 className="text-xl font-semibold flex items-center">
//                     <FaCube className="mr-2 text-emerald-400" /> Blockchain Explorer
//                   </h2>
//                   <div className="relative w-64">
//                     <FaSearch className="absolute left-3 top-3 text-gray-400" />
//                     <input
//                       type="text"
//                       placeholder="Search blocks..."
//                       className="w-full pl-10 pr-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
//                       value={searchQuery}
//                       onChange={(e) => setSearchQuery(e.target.value)}
//                     />
//                   </div>
//                 </div>

//                 {loading ? (
//                   <div className="flex justify-center items-center h-64">
//                     <FaSpinner className="animate-spin text-4xl text-emerald-400" />
//                   </div>
//                 ) : (
//                   <div className="space-y-4">
//                     {filteredBlocks.map((block) => (
//                       <div
//                         key={block.blockNumber}
//                         className="bg-gray-700/50 p-4 rounded-lg border border-gray-600 hover:border-emerald-500 cursor-pointer transition-colors"
//                         onClick={() => getBlockDetails(block.blockNumber)}
//                       >
//                         <div className="flex justify-between items-center">
//                           <div>
//                             <h3 className="font-mono text-emerald-400">Block #{block.blockNumber}</h3>
//                             <p className="text-sm text-gray-400">
//                               {new Date(block.timestamp).toLocaleString()}
//                             </p>
//                           </div>
//                           <div className="text-right">
//                             <p className="text-sm">
//                               <span className="text-gray-400">Transactions:</span>{' '}
//                               <span className="font-bold">{block.transactions.length}</span>
//                             </p>
//                             <p className="text-sm">
//                               <span className="text-gray-400">Size:</span>{' '}
//                               <span className="font-mono">{block.size} bytes</span>
//                             </p>
//                           </div>
//                         </div>
//                       </div>
//                     ))}
//                   </div>
//                 )}
//               </div>
//             )}

//             {currentBlock && activeTab === 'blockchain' && (
//               <div className="bg-gray-800 rounded-xl p-6 border border-gray-700 mt-6">
//                 <h3 className="text-lg font-semibold mb-4">
//                   Block #{currentBlock.blockNumber} Details
//                 </h3>
//                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-400 mb-2">Block Header</h4>
//                     <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
//                       {JSON.stringify(currentBlock.header, null, 2)}
//                     </pre>
//                   </div>
//                   <div>
//                     <h4 className="text-sm font-medium text-gray-400 mb-2">Block Data</h4>
//                     <pre className="bg-gray-900 p-4 rounded-lg overflow-x-auto text-sm">
//                       {JSON.stringify(currentBlock.data, null, 2)}
//                     </pre>
//                   </div>
//                 </div>
//                 <div className="mt-6">
//                   <h4 className="text-sm font-medium text-gray-400 mb-2">Transactions ({currentBlock.transactions.length})</h4>
//                   <div className="space-y-3">
//                     {currentBlock.transactions.map((tx, index) => (
//                       <div key={index} className="bg-gray-700/30 p-3 rounded-lg">
//                         <div className="flex justify-between items-center mb-2">
//                           <span className="font-mono text-sm text-blue-400">{tx.txId}</span>
//                           <span className="text-xs text-gray-400">
//                             {new Date(tx.timestamp).toLocaleTimeString()}
//                           </span>
//                         </div>
//                         <pre className="text-xs bg-gray-900 p-2 rounded overflow-x-auto">
//                           {JSON.stringify(tx.payload, null, 2)}
//                         </pre>
//                       </div>
//                     ))}
//                   </div>
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }
