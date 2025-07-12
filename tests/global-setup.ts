import { mkdir } from 'fs/promises';
import path from 'path';

async function globalSetup() {
  // Create screenshots directory
  const screenshotsDir = path.join(__dirname, 'screenshots');
  try {
    await mkdir(screenshotsDir, { recursive: true });
  } catch (error) {
    // Directory might already exist
  }
  
  console.log('🎭 Playwright setup complete');
  console.log('📸 Screenshots will be saved to:', screenshotsDir);
}

export default globalSetup;
