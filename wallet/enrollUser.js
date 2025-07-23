const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

module.exports = async function(username) {
    const ccpPath = path.resolve(__dirname, '../../fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json');
    const walletPath = path.join(__dirname, '../wallet');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create CA client
    const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
    const caTLSCACerts = caInfo.tlsCACerts.pem;
    const ca = new FabricCAServices(caInfo.url, { 
        trustedRoots: caTLSCACerts, 
        verify: false 
    }, caInfo.caName);

    // Create wallet
    const wallet = await Wallets.newFileSystemWallet(walletPath);

    // Check if user already exists
    const userExists = await wallet.get(username);
    if (userExists) {
        console.log(`User ${username} already exists in wallet`);
        return;
    }

    // Check if admin exists
    const adminExists = await wallet.get('admin');
    if (!adminExists) {
        throw new Error('Admin identity not found in wallet. Enroll admin first.');
    }

    // Register and enroll new user
    const secret = await ca.register({
        affiliation: 'org1.department1',
        enrollmentID: username,
        role: 'client'
    }, adminExists);

    const enrollment = await ca.enroll({
        enrollmentID: username,
        enrollmentSecret: secret
    });

    // Create identity
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    // Save to wallet
    await wallet.put(username, x509Identity);
    console.log(`Successfully enrolled user ${username} and imported to wallet`);
};
