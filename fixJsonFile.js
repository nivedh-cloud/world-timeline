import fs from 'fs';

const filePath = 'public/assets/World/-100To0-WorldEvents.json';

// Read the raw file
let content = fs.readFileSync(filePath, 'utf-8');

// Fix embedded line breaks within quoted strings
// This pattern finds quotes with newlines and replaces the newlines with spaces
content = content.replace(/"([^"]*"\s*:)\s*"([^"]*\n[^"]*)*"/g, (match) => {
  // Remove actual newlines within strings, keeping the escaped ones
  return match.replace(/\n\s*/g, ' ');
});

// Try a more aggressive approach - normalize line endings and fix formatting
const lines = content.split('\n');
let fixedContent = '';
let inString = false;
let escaped = false;

for (const line of lines) {
  let processLine = '';
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    
    if (char === '\\' && inString) {
      escaped = true;
      processLine += char;
    } else if ((char === '"') && !escaped) {
      inString = !inString;
      processLine += char;
    } else {
      escaped = false;
      processLine += char;
    }
  }
  
  // If we're still in a string at the end of the line, add a space to continue
  if (inString) {
    fixedContent += processLine + ' ';
  } else {
    fixedContent += processLine + '\n';
  }
}

console.log('Attempting to parse fixed JSON...');
try {
  const events = JSON.parse(fixedContent);
  console.log('✓ JSON is now valid!');
  console.log(`  Found ${events.length} events`);
  
  // Convert to new format
  const convertedEvents = events.map(event => ({
    year: String(event.startYear !== undefined ? event.startYear : event.endYear),
    name_en: event.name_en,
    name_te: event.name_te,
    location: {
      lat: event.lat,
      lng: event.lon
    },
    desc_en: event.desc_en,
    desc_te: event.desc_te,
    ...(event.image && { image: event.image })
  }));
  
  // Write back
  fs.writeFileSync(filePath, JSON.stringify(convertedEvents, null, '\t'), 'utf-8');
  console.log(`✓ Converted successfully (${convertedEvents.length} events)`);
  
} catch (error) {
  console.error('✗ Still invalid JSON:', error.message);
  console.log('Writing fixed content for inspection...');
  fs.writeFileSync('debug-fixed.json', fixedContent, 'utf-8');
}
