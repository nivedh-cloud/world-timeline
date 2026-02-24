#!/usr/bin/env node

/**
 * Convert Event JSON files from old format to new format
 * Old: startYear, endYear, lat, lon
 * New: year, location: { lat, lng }
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Directories to convert
const directories = [
  'public/assets/World',
  'public/assets/Bible'
];

/**
 * Convert a single event from old format to new format
 */
function convertEvent(event) {
  // Use startYear as the primary year, or endYear if startYear doesn't exist
  const year = event.startYear !== undefined ? String(event.startYear) : (event.endYear !== undefined ? String(event.endYear) : event.year);
  
  return {
    year,
    name_en: event.name_en,
    name_te: event.name_te,
    location: {
      lat: event.lat || event.location?.lat,
      lng: event.lon || event.location?.lng
    },
    desc_en: event.desc_en,
    desc_te: event.desc_te,
    ...(event.image && { image: event.image })
  };
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
  try {
    console.log(`Processing: ${filePath}`);
    
    const rawData = fs.readFileSync(filePath, 'utf-8');
    const events = JSON.parse(rawData);
    
    // Check if it's already in new format
    if (Array.isArray(events) && events.length > 0) {
      const firstEvent = events[0];
      if (firstEvent.year !== undefined && firstEvent.location && typeof firstEvent.location === 'object') {
        console.log(`  ✓ Already in new format - skipping`);
        return;
      }
    }
    
    // Convert events
    const convertedEvents = events.map(convertEvent);
    
    // Write back
    fs.writeFileSync(filePath, JSON.stringify(convertedEvents, null, '\t'), 'utf-8');
    console.log(`  ✓ Converted successfully (${convertedEvents.length} events)`);
  } catch (error) {
    console.error(`  ✗ Error processing ${filePath}:`, error.message);
  }
}

/**
 * Process all JSON files in a directory
 */
function processDirectory(dirPath) {
  const fullPath = path.join(process.cwd(), dirPath);
  
  if (!fs.existsSync(fullPath)) {
    console.warn(`Directory not found: ${fullPath}`);
    return;
  }
  
  console.log(`\nConverting files in: ${dirPath}`);
  console.log('='.repeat(60));
  
  const files = fs.readdirSync(fullPath).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('  No JSON files found');
    return;
  }
  
  files.forEach(file => {
    const filePath = path.join(fullPath, file);
    processFile(filePath);
  });
}

// Main execution
console.log('🔄 Event JSON Format Converter');
console.log('='.repeat(60));

directories.forEach(dir => {
  processDirectory(dir);
});

console.log('\n' + '='.repeat(60));
console.log('✅ Conversion complete!');
