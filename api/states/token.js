const Base = require('./base');

/**
 * Data structure
 * - chainHost: String
 * - chainId: String
 * - name: !String
 * - address: String
 * - symbol: !String
 * - decimal: !String
 * - faucetAmount: Number
 */

class Token extends Base {
  constructor() {
    super('token');
  }
}

module.exports = new Token();
