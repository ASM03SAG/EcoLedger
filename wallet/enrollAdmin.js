const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

module.exports = async function() {
    const ccpPath = path.resolve(__dirname, '../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
    const walletPath = path.join(__dirname, '../wallet');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new CA client for interacting with the CA
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { 
        trustedRoots: caTLSCACerts, 
        verify: false 
    }, caInfo.caName);

    // Create a new wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if admin already exists
    const adminExists = await wallet.get('admin');
    if (adminExists) {
        console.log('Admin already exists in wallet');
        return;
    }

    // Enroll the admin user
    const enrollment = await ca.enroll({
        enrollmentID: 'admin',
        enrollmentSecret: 'adminpw'
    });

    // Create X.509 identity
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    // Save to wallet
    await wallet.put('admin', x509Identity);
    console.log('Successfully enrolled admin and imported to wallet');
};
