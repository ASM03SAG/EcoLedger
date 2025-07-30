'use strict';

const { Contract } = require('fabric-contract-api');

class CarbonCreditContract extends Contract {
    
    async initLedger(ctx) {
        console.info('✅ Ledger initialized');
    }

    // Upsert (insert or update) a carbon credit
    async upsertCarbonCredit(ctx, file_hash, carbonCreditDataJson) {
        const exists = await this.carbonCreditExists(ctx, file_hash);
        const data = JSON.parse(carbonCreditDataJson);

        if (exists) {
            console.info(`🔄 Updating existing record for file_hash: ${file_hash}`);
        } else {
            console.info(`➕ Creating new record for file_hash: ${file_hash}`);
        }

        await ctx.stub.putState(file_hash, Buffer.from(JSON.stringify(data)));
        return JSON.stringify({ success: true, file_hash });
    }

    // Read a carbon credit by file_hash
    async readCarbonCredit(ctx, file_hash) {
        const dataBuffer = await ctx.stub.getState(file_hash);
        if (!dataBuffer || dataBuffer.length === 0) {
            throw new Error(`❌ Carbon credit with file_hash ${file_hash} not found`);
        }
        return dataBuffer.toString();
    }

    // Check if a carbon credit exists
    async carbonCreditExists(ctx, file_hash) {
        const data = await ctx.stub.getState(file_hash);
        return !!data && data.length > 0;
    }

    // Fetch all carbon credit records
    async getAllCredits(ctx) {
        const allResults = [];
        const iterator = await ctx.stub.getStateByRange('', '');

        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                const record = JSON.parse(res.value.value.toString());
                allResults.push(record);
            }
            if (res.done) {
                await iterator.close();
                break;
            }
        }

        return JSON.stringify(allResults);
    }
}

module.exports = CarbonCreditContract;
