import fs from 'fs';

try {
  // Ensure the destination directory exists
  if (!fs.existsSync('dist')) {
    fs.mkdirSync('dist', { recursive: true });
  }
  
  if (fs.existsSync('.env')) {
    fs.copyFileSync('.env', 'dist/.env');
    console.log('Successfully copied .env file into dist/ output directory.');
  } else {
    console.warn('Warning: .env file not found at the server root. Skipping copy.');
  }
} catch (err) {
  console.error('Error copying .env file:', err);
}
