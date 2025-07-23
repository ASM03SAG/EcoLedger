/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const CarbonCreditContract = require('./lib/chaincode');

module.exports.CarbonCreditContract = CarbonCreditContract;
module.exports.contracts = [CarbonCreditContract];
