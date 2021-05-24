/* eslint-disable no-console */
const Client = require('@ocap/client');

const env = require('../libs/env');

// Check for application account
const ensureAccountDeclared = async () => {
  const { chainHost, wallet } = env;
  const client = new Client(env.chainHost);

  const { state } = await client.getAccountState({ address: wallet.toAddress() }, { ignoreFields: ['context'] });
  if (!state) {
    const hash = await client.declare({ moniker: 'faucet-webapp-service', wallet });
    console.log(`Application declared on chain ${chainHost}`, hash);
  } else {
    console.log(`Application already declared on chain ${chainHost}`);
  }
};

(async () => {
  try {
    await ensureAccountDeclared();
    process.exit(0);
  } catch (err) {
    console.error('faucet-webapp pre-start error', err.message);
    process.exit(1);
  }
})();
