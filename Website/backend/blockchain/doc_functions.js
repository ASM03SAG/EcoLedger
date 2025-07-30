const { Gateway, Wallets } = require('fabric-network');
const path = require('path');
const fs = require('fs');

// Load connection profile and wallet path
const walletPath = path.join(__dirname, 'wallet');
const ccpPath = path.resolve(__dirname, 'connection-org1.json');

async function connectToNetwork() {
  const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
  const wallet = await Wallets.newFileSystemWallet(walletPath);

  const gateway = new Gateway();
  await gateway.connect(ccp, {
    wallet,
    identity: 'appUser',
    discovery: { enabled: true, asLocalhost: true },
  });

  const network = await gateway.getNetwork('mychannel');
  const contract = network.getContract('carbonCredits'); // Chaincode name

  return { gateway, contract };
}

async function handleBlockchainListing(creditData) {
  const { gateway, contract } = await connectToNetwork();
  const fileHash = creditData.file_hash;

  try {
    const result = await contract.submitTransaction(
      'upsertCarbonCredit',
      fileHash,
      JSON.stringify(creditData)
    );
    console.log(`✅ Blockchain record for file_hash: ${fileHash} added/updated.`);
    return JSON.parse(result.toString());
  } catch (error) {
    console.error('❌ Blockchain listing failed:', error);
    throw error;
  } finally {
    gateway.disconnect();
  }
}

async function getBlockchainCredit(fileHash) {
  const { gateway, contract } = await connectToNetwork();

  try {
    const result = await contract.evaluateTransaction('readCarbonCredit', fileHash);
    return JSON.parse(result.toString());
  } catch (error) {
    console.error(`❌ Error reading credit ${fileHash}:`, error);
    throw error;
  } finally {
    gateway.disconnect();
  }
}

async function getAllCreditsFromBlockchain() {
  const { gateway, contract } = await connectToNetwork();

  try {
    const result = await contract.evaluateTransaction('getAllCredits');
    return JSON.parse(result.toString());
  } catch (error) {
    console.error('❌ Error fetching all blockchain credits:', error);
    throw error;
  } finally {
    gateway.disconnect();
  }
}

module.exports = {
  handleBlockchainListing,
  getBlockchainCredit,
  getAllCreditsFromBlockchain,
};
