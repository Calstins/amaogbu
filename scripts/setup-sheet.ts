import { createSheetHeaders } from '../lib/google-sheets';

async function setup() {
  try {
    console.log('Creating Google Sheet headers...');
    await createSheetHeaders();
    console.log('Setup complete! Your Google Sheet is ready.');
  } catch (error) {
    console.error('Setup failed:', error);
  }
}

setup();

// Run with: npx tsx scripts/setup-sheet.ts