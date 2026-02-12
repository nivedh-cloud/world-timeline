// Script to restructure events.json into grouped year ranges (CommonJS)
const fs = require('fs');
const path = require('path');

const YEAR_STEP = 50; // Group by 50-year ranges
const inputPath = path.join(__dirname, '../public/assets/events.json');
const outputPath = path.join(__dirname, '../public/assets/events_grouped.json');

function getRangeKey(start, end) {
  // Always use the lower bound of the range
  const min = Math.floor(start / YEAR_STEP) * YEAR_STEP;
  const max = min + YEAR_STEP;
  return `${min}-${max}`;
}

function groupEvents(events) {
  const grouped = {};
  for (const event of events) {
    const key = getRangeKey(event.startYear, event.endYear);
    if (!grouped[key]) grouped[key] = [];
    grouped[key].push(event);
  }
  return grouped;
}

function main() {
  const raw = fs.readFileSync(inputPath, 'utf-8');
  let data;
  try {
    data = JSON.parse(raw);
  } catch (e) {
    // Try to recover from trailing commas or invalid JSON
    data = eval('(' + raw + ')');
  }
  const result = {};
  for (const key of Object.keys(data)) {
    if (Array.isArray(data[key])) {
      result[key + '_BY_YEAR_RANGE'] = groupEvents(data[key]);
    }
  }
  fs.writeFileSync(outputPath, JSON.stringify(result, null, 2));
  console.log('Restructured events written to', outputPath);
}

main();
