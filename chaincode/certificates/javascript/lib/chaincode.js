'use strict';

const { Contract } = require('fabric-contract-api');

class CarbonCreditContract extends Contract {
    
    // ============== Certificate Lifecycle Functions ==============
    
    async CreateCertificate(
        ctx, 
        id, 
        projectID, 
        projectName, 
        vintage, 
        amount, 
        registry, 
        category, 
        owner, 
        fileHash,
        authStatus = 'pending' // 'authenticated'/'unauthenticated'/'pending'
    ) {
        if (await this.CertificateExists(ctx, id)) {
            throw new Error(`Certificate ${id} already exists`);
        }

        const certificate = {
            docType: 'carbonCredit',
            id,
            projectID,
            projectName,
            vintage,
            amount: parseFloat(amount),
            registry,
            category,
            owner,
            fileHash,
            authStatus,
            lifecycleStatus: 'active', // 'active'/'retired'
            createdAt: ctx.stub.getTxTimestamp().seconds.toString(),
            updatedAt: ctx.stub.getTxTimestamp().seconds.toString()
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(certificate)));
        return certificate;
    }

    async UpdateAuthStatus(ctx, id, newAuthStatus) {
        const cert = await this.GetCertificateById(ctx, id);
        
        if (!['authenticated', 'unauthenticated', 'pending'].includes(newAuthStatus)) {
            throw new Error('Invalid auth status');
        }
        
        cert.authStatus = newAuthStatus;
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
        return cert;
    }

    async RetireCertificate(ctx, id) {
        const cert = await this.GetCertificateById(ctx, id);
        
        if (cert.lifecycleStatus === 'retired') {
            throw new Error('Certificate already retired');
        }
        
        cert.lifecycleStatus = 'retired';
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
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
        
        // Update listing details
        cert.marketplace = {
            pricePerCredit: parseFloat(pricePerCredit),
            totalValue: parseFloat(pricePerCredit) * cert.amount,
            description,
            listedAt: ctx.stub.getTxTimestamp().seconds.toString()
        };
        
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
        return cert;
    }

    async UnlistCertificateFromMarketplace(ctx, id) {
        const cert = await this.GetCertificateById(ctx, id);
        
        if (!cert.marketplace) {
            throw new Error('Certificate not currently listed');
        }
        
        delete cert.marketplace;
        cert.updatedAt = ctx.stub.getTxTimestamp().seconds.toString();
        
        await ctx.stub.putState(id, Buffer.from(JSON.stringify(cert)));
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

    // ============== Advanced Query Functions ==============
    
    async GetCertificatesByOwner(ctx, owner) {
        const query = {
            selector: {
                docType: 'carbonCredit',
                owner: owner
            }
        };
        return await this._getQueryResults(ctx, query);
    }

    async GetMarketplaceListings(ctx) {
        const query = {
            selector: {
                docType: 'carbonCredit',
                'marketplace': { '$exists': true }
            }
        };
        return await this._getQueryResults(ctx, query);
    }

    async GetCertificatesByAuthStatus(ctx, authStatus) {
        if (!['authenticated', 'unauthenticated', 'pending'].includes(authStatus)) {
            throw new Error('Invalid auth status');
        }
        
        const query = {
            selector: {
                docType: 'carbonCredit',
                authStatus: authStatus
            }
        };
        return await this._getQueryResults(ctx, query);
    }

    async GetAllCertificates(ctx) {
        const query = {
            selector: {
                docType: 'carbonCredit'
            }
        };
        return await this._getQueryResults(ctx, query);
    }

    // ============== Helper Functions ==============
    
    async _getQueryResults(ctx, query) {
        const iterator = await ctx.stub.getQueryResult(JSON.stringify(query));
        const results = [];
        
        let res = await iterator.next();
        while (!res.done) {
            results.push(JSON.parse(res.value.value.toString('utf8')));
            res = await iterator.next();
        }
        
        await iterator.close();
        return JSON.stringify(results);
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
}

module.exports = CarbonCreditContract;
