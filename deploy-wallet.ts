#!/usr/bin/env tsx
/**
 * Deploy a PasskeyKit smart wallet contract using PasskeyClient
 *
 * Usage: tsx deploy-wallet.ts <wasm_hash>
 */

import { Keypair } from '@stellar/stellar-sdk';
import { basicNodeSigner } from '@stellar/stellar-sdk/contract';
import { Buffer } from 'buffer';

// Import the generated wallet client
import { Client as PasskeyClient } from 'passkey-kit-sdk';

async function deployWallet() {
  console.log('🚀 Deploying PasskeyKit Wallet Contract\n');

  // Get WASM hash from args or use default
  const wasmHash = process.argv[2];
  if (!wasmHash) {
    console.error('❌ Error: WASM hash required');
    console.error('Usage: pnpm deploy-passkey <wasm_hash>');
    console.error('\nTo get WASM hash, first upload the wallet WASM:');
    console.error('  stellar contract upload --wasm wallet.wasm --source your-key --network testnet');
    process.exit(1);
  }

  // Get deployer keypair from environment or stellar CLI
  const secretKey = process.env.DEPLOYER_SECRET || 'YOUR_DEPLOYER_SECRET_KEY';
  if (secretKey === 'YOUR_DEPLOYER_SECRET_KEY') {
    console.error('❌ Error: DEPLOYER_SECRET environment variable not set');
    console.error('Set it with: export DEPLOYER_SECRET=SXXXXXXXXXXXXXXX');
    process.exit(1);
  }

  const deployer = Keypair.fromSecret(secretKey);

  console.log('Deployer:', deployer.publicKey());
  console.log('Network: Test SDF Network ; September 2015');
  console.log('RPC: https://soroban-testnet.stellar.org');
  console.log('WASM Hash:', wasmHash);
  console.log();

  try {
    // Create a dummy Ed25519 signer for testing (instead of real passkey)
    const dummyKey = Keypair.random();
    const dummyPublicKey = dummyKey.rawPublicKey();

    console.log('📦 Deploying wallet contract with Ed25519 signer...');
    console.log('Signer Public Key:', dummyKey.publicKey());
    console.log();

    // Deploy using PasskeyClient.deploy
    const assembledTx = await PasskeyClient.deploy(
      {
        signer: {
          tag: 'Ed25519',
          values: [
            dummyPublicKey,
            [undefined], // SignerExpiration - no expiration
            [undefined], // SignerLimits - no limits
            { tag: 'Persistent', values: undefined }, // SignerStorage
          ]
        }
      },
      {
        rpcUrl: 'https://soroban-testnet.stellar.org',
        networkPassphrase: 'Test SDF Network ; September 2015',
        wasmHash: Buffer.from(wasmHash, 'hex'),
        publicKey: deployer.publicKey(),
        salt: Buffer.from(Keypair.random().rawPublicKey()), // Random salt
        timeoutInSeconds: 30,
      }
    );

    const contractId = assembledTx.result.options.contractId;

    console.log('Contract ID (pre-simulation):', contractId);
    console.log('Signing and sending transaction...');

    // Sign and send
    await assembledTx.sign({
      signTransaction: basicNodeSigner(deployer, 'Test SDF Network ; September 2015').signTransaction
    });

    const result = await assembledTx.send();

    console.log('\n✅ Wallet Deployed Successfully!\n');
    console.log('Wallet Contract ID:', contractId);
    console.log('Transaction Hash:', result.hash);
    console.log('Signer Public Key:', dummyKey.publicKey());
    console.log('Signer Secret Key:', dummyKey.secret());

    console.log('\n📝 Add these to your .env file:');
    console.log(`WALLET_WASM_HASH=${wasmHash}`);
    console.log(`WALLET_CONTRACT_ID=${contractId}`);
    console.log(`WALLET_SIGNER_SECRET=${dummyKey.secret()}`);

  } catch (error) {
    console.error('\n❌ Deployment failed:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  }
}

deployWallet();
