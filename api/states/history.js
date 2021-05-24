const Base = require('./base');

/**
 * Data structure
 * - tokenId: String
 * - userDid: String
 * - amount: Number
 * - type: String
 * - nextTimeMs: Number
 * - hash: String
 */

class History extends Base {
  constructor() {
    super('history');
  }
}

module.exports = new History();
