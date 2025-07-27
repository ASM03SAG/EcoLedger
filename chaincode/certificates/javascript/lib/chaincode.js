'use strict';

const { Contract } = require('fabric-contract-api');

class CarbonCreditContract extends Contract {
    
    // ============== Certificate Lifecycle Functions ==============
    
    async CreateCertificate(ctx, id, projectID, projectName, vintage, amount, issuanceDate, registry, category, issuedTo, owner, carbonmarkId, carbonmarkName, fileHash, authStatus = 'pending') {
        if (await this.CertificateExists(ctx, id)) {
            throw new Error(`Certificate ${id} already exists`);
        }

        const certificate = {
            docType: 'carbonCredit',
            id,
            projectID,
            projectName,
            vintage,
            amount,
            issuanceDate,
            registry,
            category,
            issuedTo,
            owner,
            carbonmarkId,
            carbonmarkName,
            fileHash,
            authStatus,
            lifecycleStatus: 'active', // 'active'/'retired'
        };

        // Store the main certificate
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
        
        // Create composite keys for efficient LevelDB queries
        await this._createCompositeKeys(ctx, certificate);
        
        return certificate;
    }

    async UpdateAuthStatus(ctx, id, newAuthStatus) {
        const cert = await this.GetCertificateById(ctx, id);
        
        if (!['authenticated', 'unauthenticated', 'pending'].includes(newAuthStatus)) {
            throw new Error('Invalid auth status');
        }
        
        // Delete old composite keys
        await this._deleteCompositeKeys(ctx, cert);
        
        // Update certificate
        cert.authStatus = newAuthStatus;
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        
        // Store updated certificate
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
        
        // Create new composite keys
        await this._createCompositeKeys(ctx, cert);
        
        return cert;
    }

    async RetireCertificate(ctx, id) {
        const cert = await this.GetCertificateById(ctx, id);
        
        if (cert.lifecycleStatus === 'retired') {
            throw new Error('Certificate already retired');
        }
        
        // Delete old composite keys
        await this._deleteCompositeKeys(ctx, cert);
        
        // Update certificate
        cert.lifecycleStatus = 'retired';
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        
        // Store updated certificate
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
        
        // Create new composite keys
        await this._createCompositeKeys(ctx, cert);
        
        return cert;
    }

    // ============== Marketplace Functions ==============
    
    async ListCertificateOnMarketplace(
        ctx, 
        id, 
        pricePerCredit, 
        description = ''
    ) {
        const cert = await this.GetCertificateById(ctx, id);
        
        // Validate status
        if (cert.authStatus !== 'authenticated') {
            throw new Error('Only authenticated certificates can be listed');
        }
        
        if (cert.lifecycleStatus !== 'active') {
            throw new Error('Only active certificates can be listed');
        }
        
        // Delete old composite keys
        await this._deleteCompositeKeys(ctx, cert);
        
        // Update listing details
        cert.marketplace = {
            pricePerCredit: parseFloat(pricePerCredit),
            totalValue: parseFloat(pricePerCredit) * cert.amount,
            description,
            listedAt: ctx.stub.getTxTimestamp().seconds.toString()
        };
        
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
        
        // Create new composite keys (now with marketplace status)
        await this._createCompositeKeys(ctx, cert);
        
        return cert;
    }

    async UnlistCertificateFromMarketplace(ctx, id) {
        const cert = await this.GetCertificateById(ctx, id);
        
        if (!cert.marketplace) {
            throw new Error('Certificate not currently listed');
        }
        
        // Delete old composite keys
        await this._deleteCompositeKeys(ctx, cert);
        
        // Remove marketplace listing
        delete cert.marketplace;
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
        
        // Create new composite keys (now without marketplace status)
        await this._createCompositeKeys(ctx, cert);
        
        return cert;
    }

    // ============== Core Query Functions ==============
    
    async GetCertificateById(ctx, id) {
        const certJSON = await ctx.stub.getState(id);
        if (!certJSON || certJSON.length === 0) {
            throw new Error(`Certificate ${id} does not exist`);
        }
        return JSON.parse(certJSON.toString());
    }

    async CertificateExists(ctx, id) {
        const certJSON = await ctx.stub.getState(id);
        return certJSON && certJSON.length > 0;
    }

    // ============== LevelDB Compatible Query Functions ==============
    
    async GetCertificatesByOwner(ctx, owner) {
        const ownerKey = 'owner~' + owner;
        const iterator = await ctx.stub.getStateByPartialCompositeKey(ownerKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                results.push(cert);
            } catch (err) {
                // Certificate might have been deleted, skip
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }

    async GetMarketplaceListings(ctx) {
        const marketplaceKey = 'marketplace~listed';
        const iterator = await ctx.stub.getStateByPartialCompositeKey(marketplaceKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                // Double-check that it still has marketplace data
                if (cert.marketplace) {
                    results.push(cert);
                }
            } catch (err) {
                // Certificate might have been deleted, skip
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }

    async GetCertificatesByAuthStatus(ctx, authStatus) {
        if (!['authenticated', 'unauthenticated', 'pending'].includes(authStatus)) {
            throw new Error('Invalid auth status');
        }
        
        const authKey = 'auth~' + authStatus;
        const iterator = await ctx.stub.getStateByPartialCompositeKey(authKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                // Double-check that it still has the correct auth status
                if (cert.authStatus === authStatus) {
                    results.push(cert);
                }
            } catch (err) {
                // Certificate might have been deleted, skip
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }

    async GetAllCertificates(ctx) {
        // Use range query to get all certificates
        const iterator = await ctx.stub.getStateByRange('', '');
        const results = [];
        
        let res = await iterator.next();
        while (!res.done) {
            // Only process keys that don't contain composite key separators
            if (!res.value.key.includes('\u0000')) {
                try {
                    const cert = JSON.parse(res.value.value.toString('utf8'));
                    // Only include carbon credit documents
                    if (cert.docType === 'carbonCredit') {
                        results.push(cert);
                    }
                } catch (err) {
                    // Skip any invalid JSON entries
                    console.log(`Skipping invalid entry: ${res.value.key}`);
                }
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }

    // ============== Helper Functions ==============
    
    async _createCompositeKeys(ctx, certificate) {
        // Create composite key for owner-based queries
        const ownerKey = ctx.stub.createCompositeKey('owner~' + certificate.owner, [certificate.id]);
        await ctx.stub.putState(ownerKey, Buffer.from(''));
        
        // Create composite key for auth status queries
        const authKey = ctx.stub.createCompositeKey('auth~' + certificate.authStatus, [certificate.id]);
        await ctx.stub.putState(authKey, Buffer.from(''));
        
        // Create composite key for lifecycle status queries
        const lifecycleKey = ctx.stub.createCompositeKey('lifecycle~' + certificate.lifecycleStatus, [certificate.id]);
        await ctx.stub.putState(lifecycleKey, Buffer.from(''));
        
        // Create composite key for marketplace listings
        if (certificate.marketplace) {
            const marketplaceKey = ctx.stub.createCompositeKey('marketplace~listed', [certificate.id]);
            await ctx.stub.putState(marketplaceKey, Buffer.from(''));
        }
        
        // Create composite key for project-based queries
        const projectKey = ctx.stub.createCompositeKey('project~' + certificate.projectID, [certificate.id]);
        await ctx.stub.putState(projectKey, Buffer.from(''));
        
        // Create composite key for registry-based queries
        const registryKey = ctx.stub.createCompositeKey('registry~' + certificate.registry, [certificate.id]);
        await ctx.stub.putState(registryKey, Buffer.from(''));
        
        // Create composite key for vintage-based queries
        const vintageKey = ctx.stub.createCompositeKey('vintage~' + certificate.vintage, [certificate.id]);
        await ctx.stub.putState(vintageKey, Buffer.from(''));
    }
    
    async _deleteCompositeKeys(ctx, certificate) {
        // Delete all composite keys for this certificate
        const keysToDelete = [
            ctx.stub.createCompositeKey('owner~' + certificate.owner, [certificate.id]),
            ctx.stub.createCompositeKey('auth~' + certificate.authStatus, [certificate.id]),
            ctx.stub.createCompositeKey('lifecycle~' + certificate.lifecycleStatus, [certificate.id]),
            ctx.stub.createCompositeKey('project~' + certificate.projectID, [certificate.id]),
            ctx.stub.createCompositeKey('registry~' + certificate.registry, [certificate.id]),
            ctx.stub.createCompositeKey('vintage~' + certificate.vintage, [certificate.id])
        ];
        
        // Delete marketplace key if it exists
        if (certificate.marketplace) {
            keysToDelete.push(ctx.stub.createCompositeKey('marketplace~listed', [certificate.id]));
        }
        
        // Delete all keys
        for (const key of keysToDelete) {
            await ctx.stub.delState(key);
        }
    }
    
    async GetCertificateHistory(ctx, id) {
        const iterator = await ctx.stub.getHistoryForKey(id);
        const history = [];
        
        let res = await iterator.next();
        while (!res.done) {
            const historyItem = {
                txId: res.value.txId,
                timestamp: new Date(res.value.timestamp.seconds * 1000).toISOString(),
                isDelete: res.value.isDelete,
                data: res.value.value ? JSON.parse(res.value.value.toString('utf8')) : null
            };
            history.push(historyItem);
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(history);
    }

    // ============== Additional Query Functions for Enhanced Functionality ==============
    
    async GetCertificatesByProject(ctx, projectID) {
        const projectKey = 'project~' + projectID;
        const iterator = await ctx.stub.getStateByPartialCompositeKey(projectKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                results.push(cert);
            } catch (err) {
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }
    
    async GetCertificatesByRegistry(ctx, registry) {
        const registryKey = 'registry~' + registry;
        const iterator = await ctx.stub.getStateByPartialCompositeKey(registryKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                results.push(cert);
            } catch (err) {
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }
    
    async GetCertificatesByVintage(ctx, vintage) {
        const vintageKey = 'vintage~' + vintage;
        const iterator = await ctx.stub.getStateByPartialCompositeKey(vintageKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                results.push(cert);
            } catch (err) {
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }
    
    async GetCertificatesByLifecycleStatus(ctx, lifecycleStatus) {
        if (!['active', 'retired'].includes(lifecycleStatus)) {
            throw new Error('Invalid lifecycle status');
        }
        
        const lifecycleKey = 'lifecycle~' + lifecycleStatus;
        const iterator = await ctx.stub.getStateByPartialCompositeKey(lifecycleKey, []);
        
        const results = [];
        let res = await iterator.next();
        while (!res.done) {
            const splitKey = ctx.stub.splitCompositeKey(res.value.key);
            const certId = splitKey.attributes[1];
            try {
                const cert = await this.GetCertificateById(ctx, certId);
                if (cert.lifecycleStatus === lifecycleStatus) {
                    results.push(cert);
                }
            } catch (err) {
                console.log(`Certificate ${certId} not found, skipping`);
            }
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
    }
}

module.exports = CarbonCreditContract;