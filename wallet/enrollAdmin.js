console.log("=== DEBUG VERSION ===");

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const path = require('path');
const fs = require('fs');

async function main() {
    try {
        console.log("[1] Setting up paths...");
        const ccpPath = '/home/aanchal/fabric-samples/test-network/organizations/peerOrganizations/org1.example.com/connection-org1.json';
        console.log("Connection profile path:", ccpPath);
        
        if (!fs.existsSync(ccpPath)) {
            throw new Error(`File not found: ${ccpPath}`);
        }

        console.log("[2] Reading connection profile...");
        const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));
        
        console.log("[3] Setting up wallet...");
        const walletPath = path.join(__dirname, 'wallet');
        console.log("Wallet path:", walletPath);
        
        if (!fs.existsSync(walletPath)) {
            fs.mkdirSync(walletPath, { recursive: true });
            console.log("Created wallet directory");
        }

        console.log("[4] Creating CA client...");
        const caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
        if (!caInfo) {
            throw new Error('CA info missing in connection profile');
        }
        console.log("CA URL:", caInfo.url);

        const ca = new FabricCAServices(
            caInfo.url, 
            { 
                trustedRoots: caInfo.tlsCACerts?.pem, 
                verify: false 
            }, 
            caInfo.caName
        );

        console.log("[5] Initializing wallet...");
        const wallet = await Wallets.newFileSystemWallet(walletPath);

        console.log("[6] Checking for existing admin...");
        const adminExists = await wallet.get('admin');
        if (adminExists) {
            console.log("Admin already exists");
            return;
        }

        console.log("[7] Enrolling admin...");
        const enrollment = await ca.enroll({
            enrollmentID: 'admin',
            enrollmentSecret: 'adminpw'
        });

        console.log("[8] Creating identity...");
        const x509Identity = {
            credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes(),
            },
            mspId: 'Org1MSP',
            type: 'X.509',
        };

        console.log("[9] Saving to wallet...");
        await wallet.put('admin', x509Identity);
        console.log("✅ Successfully enrolled admin");

    } catch (error) {
        console.error("❌ FAILED:", error.message);
        if (error.stack) {
            console.error(error.stack.split("\n")[1]); // Show first line of stack trace
        }
        process.exit(1);
    }
}

main();