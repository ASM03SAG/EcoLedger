const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');

async function enrollUser(username = 'user1@test.com') {
    try {
        console.log(`=== Starting enrollment for ${username} ===`);

        // 1. Load connection profile
        const ccpPath = '/home/aanchal/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
        console.log('Using connection profile:', ccpPath);
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

        // 2. Create CA client
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        const ca = new FabricCAServices(
            caInfo.url, 
            { trustedRoots: caInfo.tlsCACerts?.pem, verify: false }, 
            caInfo.caName
        );

        // 3. Setup wallet
        const walletPath = '/home/aanchal/Project2/Eco2/EcoLedger/wallet/wallet';
        console.log('Using wallet at:', walletPath);
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        // 4. Check if user already exists
        const existingIdentity = await wallet.get(username);
        if (existingIdentity) {
            console.log(`User ${username} already exists in wallet`);
            return { success: true, message: 'User already enrolled' };
        }

        // 5. Get admin identity properly
        const adminIdentity = await wallet.get('admin');
        if (!adminIdentity) {
            throw new Error('Admin identity not found. Run enrollAdmin.js first.');
        }

        // 6. Get admin user context
        const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
        const adminUser = await provider.getUserContext(adminIdentity, 'admin');

        // 7. Register new user
        console.log(`Registering ${username}...`);
        const secret = await ca.register({
            affiliation: 'org1.department1',
            enrollmentID: username,
            role: 'client',
            attrs: [{ name: 'email', value: username, ecert: true }]
        }, adminUser);

        // 8. Enroll new user
        console.log(`Enrolling ${username}...`);
        const enrollment = await ca.enroll({
            enrollmentID: username,
            enrollmentSecret: secret
        });

        // 9. Create and store identity
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };
        await wallet.put(username, x509Identity);
        console.log(`✅ Successfully enrolled ${username} in wallet`);
        return { success: true, username };

    } catch (error) {
        console.error(`❌ Failed to enroll ${username}: ${error.message}`);
        if (error.stack) {
            console.error(error.stack.split('\n')[0]);
        }
        return { 
            success: false, 
            error: error.message,
            username
        };
    }
}

// Handle command line execution
if (require.main === module) {
    (async () => {
        const username = process.argv[2] || 'defaultUser@test.com';
        console.log(`Starting enrollment for ${username}`);
        const result = await enrollUser(username);
        console.log('Final result:', result);
        if (!result.success) {
            process.exit(1);
        }
    })();
}

module.exports = enrollUser;