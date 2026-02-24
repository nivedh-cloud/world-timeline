import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const filePath = path.join(__dirname, 'public/assets/World/-100To0-WorldEvents.json');

console.log(`Processing: ${filePath}`);

try {
  // Read with explicit UTF-8 encoding
  const buffer = fs.readFileSync(filePath);
  let content = buffer.toString('utf-8');
  
  // Try to clean up any encoding issues
  content = content.trimStart().trimEnd();
  
  console.log('Attempting JSON parse...');
  const events = JSON.parse(content);
  
  // Convert to new format
  const convertedEvents = events.map(event => ({
    year: String(event.startYear !== undefined ? event.startYear : event.endYear || event.year),
    name_en: event.name_en || '',
    name_te: event.name_te || '',
    location: {
      lat: Number(event.lat || event.location?.lat || 0),
      lng: Number(event.lon || event.location?.lng || 0)
    },
    desc_en: event.desc_en || '',
    desc_te: event.desc_te || '',
    ...(event.image && { image: event.image })
  }));
  
  // Write back with proper formatting
  fs.writeFileSync(filePath, JSON.stringify(convertedEvents, null, '\t'), 'utf-8');
  console.log(`✓ Successfully converted ${filePath}`);
  console.log(`  ${convertedEvents.length} events converted`);
  
} catch (error) {
  console.error(`✗ Error: ${error.message}`);
  process.exit(1);
}
