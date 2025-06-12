/**
 * @fileoverview Google Secret Manager integration for App Engine
 * @description Loads sensitive environment variables from Secret Manager in production
 */

import { SecretManagerServiceClient } from '@google-cloud/secret-manager';

export async function loadSecrets(): Promise<void> {
  // Only load secrets in production
  if (process.env.NODE_ENV !== 'production') {
    console.log('⚠️ Skipping Secret Manager (not in production)');
    return;
  }

  const client = new SecretManagerServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'nutri-bruin-cs144';

  // Define secrets to load
  const secrets = [
    'MONGODB_URI',
    'REDIS_HOST',
    'REDIS_PORT',
    'REDIS_USERNAME',
    'REDIS_PASSWORD',
    'JWT_SECRET',
    'COOKIE_SECRET'
  ];

  console.log('🔐 Loading secrets from Secret Manager...');

  for (const secretName of secrets) {
    try {
      const name = `projects/${projectId}/secrets/${secretName}/versions/latest`;
      const [version] = await client.accessSecretVersion({ name });
      
      const payload = version.payload?.data?.toString();
      if (payload) {
        process.env[secretName] = payload;
        console.log(`✅ Loaded secret: ${secretName}`);
      }
    } catch (error) {
      console.error(`❌ Failed to load secret ${secretName}:`, error);
      // Don't fail startup if secret doesn't exist (might use defaults)
    }
  }

  console.log('✅ Secret loading complete');
}

/**
 * Create a secret in Secret Manager
 * This is a utility function for setup, not used in production
 */
export async function createSecret(secretId: string, secretValue: string): Promise<void> {
  const client = new SecretManagerServiceClient();
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'nutri-bruin-cs144';

  try {
    // Create the secret
    const [secret] = await client.createSecret({
      parent: `projects/${projectId}`,
      secretId,
      secret: {
        replication: {
          automatic: {},
        },
      },
    });

    console.log(`Created secret: ${secret.name}`);

    // Add a version with the secret value
    const [version] = await client.addSecretVersion({
      parent: secret.name,
      payload: {
        data: Buffer.from(secretValue, 'utf8'),
      },
    });

    console.log(`Added secret version: ${version.name}`);
  } catch (error) {
    console.error(`Error creating secret ${secretId}:`, error);
    throw error;
  }
}

