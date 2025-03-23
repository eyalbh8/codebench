#!/usr/bin/env ts-node

import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';
import fs from 'fs';
import path from 'path';

// Stage from CLI args or default to 'dev'
const stage = process.env.STAGE || process.argv[2] || 'dev';

// Secret name pattern
const secretName = `igeo-${stage}`;
const region = 'eu-central-1'; // adjust if needed

async function fetchSecrets() {
  const client = new SecretsManagerClient({ region });
  const command = new GetSecretValueCommand({ SecretId: secretName });

  try {
    const response = await client.send(command);
    if (!response.SecretString) {
      throw new Error('SecretString is empty');
    }

    const currentEnv = fs.readFileSync(
      path.resolve(process.cwd(), '.env'),
      'utf8',
    );
    const currentEnvLines = currentEnv.split('\n');
    const newEnvLines = currentEnvLines.filter((line) => !line.startsWith('#'));
    const currentEnvSecretJson = {};
    for (const line of newEnvLines) {
      const [key, value] = line.split('=');
      if (key && value) {
        currentEnvSecretJson[key] = value;
      }
    }
    const secretJson = JSON.parse(response.SecretString);
    const envLines = Object.entries(secretJson).map(
      ([key, value]) => `${key}=${value}`,
    );
    for (const [key, value] of Object.entries(currentEnvSecretJson)) {
      if (
        !secretJson[key] &&
        (key in ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'])
      ) {
        throw new Error(
          `Secret ${key} is not found in the secret ${secretName}`,
        );
      }
    }
    const envFilePath = path.resolve(process.cwd(), `.env.${stage}`);

    fs.writeFileSync(envFilePath, envLines.join('\n'));
    console.log(
      `✅ .env file generated for stage '${stage}' at ${envFilePath}`,
    );
  } catch (err) {
    console.error('❌ Failed to fetch secrets:', err);
    process.exit(1);
  }
}

fetchSecrets();
