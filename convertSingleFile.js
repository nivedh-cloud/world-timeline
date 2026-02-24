import fs from 'fs';

const filePath = 'public/assets/World/-100To0-WorldEvents.json';
const rawData = fs.readFileSync(filePath, 'utf-8');
const events = JSON.parse(rawData);

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

fs.writeFileSync(filePath, JSON.stringify(convertedEvents, null, '\t'), 'utf-8');
console.log('✓ Converted: ' + filePath + ' (' + convertedEvents.length + ' events)');
