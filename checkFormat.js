import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const worldDir = path.join(__dirname, 'public/assets/World');

const files = fs.readdirSync(worldDir).filter(f => f.endsWith('.json'));

console.log('Checking World event files:');
for (const file of files.slice(0, 10)) {
  try {
    const filePath = path.join(worldDir, file);
    const data = fs.readFileSync(filePath, 'utf-8');
    const parsed = JSON.parse(data);
    if (parsed.length > 0) {
      const firstEvent = parsed[0];
      const isNewFormat = firstEvent.year !== undefined && firstEvent.location;
      console.log(`  ${file}: ${isNewFormat ? 'NEW FORMAT' : 'OLD FORMAT'}`);
    }
  } catch (e) {
    console.log(`  ${file}: ERROR`);
  }
}
