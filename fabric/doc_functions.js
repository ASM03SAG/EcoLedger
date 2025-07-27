const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configuration
const ccpPath = '../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
const walletPath = '../Website/wallet';
const contractName = 'carboncredit';
const channelName = 'mychannel';

async function connectToNetwork() {
    const userId = 'appUser';
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    const identity = await wallet.get(userId);
    if (!identity) {
        throw new Error(`Identity for user not found in wallet`);
    }
    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: false, asLocalhost: true },
    });
    const network = await gateway.getNetwork(channelName);
    const contract = network.getContract(contractName);
    return { contract, gateway };
}

// Certificate Operations
exports.CreateCertificate = async (certData) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        await contract.submitTransaction('CreateCertificate',
            certData.serialNumber,
            certData.projectId || certData.projectID,  // Handle both formats
            certData.projectName,
            certData.vintage,
            certData.amount.toString(),
            certData.issuanceDate,
            certData.registry,
            certData.category,
            certData.issuedTo,
            certData.owner,
            certData.carbonmarkId || '',
            certData.carbonmarkName || '',
            certData.fileHash,
            certData.authStatus || 'pending'  // Optional parameter with default
        );
        console.log(`✅ Certificate ${certData.serialNumber} stored on blockchain`);
    } finally {
        gateway.disconnect();
    }
};

// Query Operations
exports.GetCertificateById = async (serialNumber) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificateById', serialNumber);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificatesByOwner = async (owner) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificatesByOwner', owner);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetMarketplaceListings = async () => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetMarketplaceListings');
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetAllCertificates = async () => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetAllCertificates');
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

// Additional functions you can now use with the enhanced LevelDB chaincode
exports.UpdateAuthStatus = async (serialNumber, newAuthStatus) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        await contract.submitTransaction('UpdateAuthStatus', serialNumber, newAuthStatus);
        console.log(`✅ Certificate ${serialNumber} auth status updated to ${newAuthStatus}`);
    } finally {
        gateway.disconnect();
    }
};

exports.RetireCertificate = async (serialNumber) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        await contract.submitTransaction('RetireCertificate', serialNumber);
        console.log(`✅ Certificate ${serialNumber} retired successfully`);
    } finally {
        gateway.disconnect();
    }
};

exports.ListCertificateOnMarketplace = async (serialNumber, pricePerCredit, description = '') => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        await contract.submitTransaction('ListCertificateOnMarketplace', 
            serialNumber, 
            pricePerCredit.toString(), 
            description
        );
        console.log(`✅ Certificate ${serialNumber} listed on marketplace`);
    } finally {
        gateway.disconnect();
    }
};

exports.UnlistCertificateFromMarketplace = async (serialNumber) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        await contract.submitTransaction('UnlistCertificateFromMarketplace', serialNumber);
        console.log(`✅ Certificate ${serialNumber} unlisted from marketplace`);
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificatesByAuthStatus = async (authStatus) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificatesByAuthStatus', authStatus);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificatesByProject = async (projectID) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificatesByProject', projectID);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificatesByRegistry = async (registry) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificatesByRegistry', registry);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificatesByVintage = async (vintage) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificatesByVintage', vintage);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificatesByLifecycleStatus = async (lifecycleStatus) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificatesByLifecycleStatus', lifecycleStatus);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};

exports.GetCertificateHistory = async (serialNumber) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        const result = await contract.evaluateTransaction('GetCertificateHistory', serialNumber);
        return JSON.parse(result.toString());
    } finally {
        gateway.disconnect();
    }
};