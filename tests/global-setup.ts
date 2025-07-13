import { FullConfig } from '@playwright/test';

async function globalSetup(config: FullConfig) {
  // Global setup can be used for authentication, seeding data, etc.
  console.log('Global setup started');
}

export default globalSetup;
