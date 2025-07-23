const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Configuration
const ccpPath = path.resolve(__dirname, '/home/aanchal/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
const walletPath = path.join(__dirname, '../wallet/org1');
const contractName = 'carboncredit';
const channelName = 'mychannel';

async function connectToNetwork() {
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    const gateway = new Gateway();
    await gateway.connect(ccp, {
        wallet,
        identity: 'appUser',
        discovery: { enabled: true, asLocalhost: true },
    });

    const network = await gateway.getNetwork(channelName);
    return { 
        contract: network.getContract(contractName),
        gateway 
    };
}

// Certificate Operations
exports.CreateCertificate = async (certData) => {
    const { contract, gateway } = await connectToNetwork();
    
    try {
        await contract.submitTransaction('CreateCertificate',
            certData.serialNumber,
            certData.projectId,
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
            certData.fileHash
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
