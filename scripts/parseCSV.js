const fs = require('fs');
const path = require('path');

const csvPath = path.join(__dirname, '..', 'Gym Exercises Dataset - Sheet1 export 2026-04-11 08-12-21.csv');
const csv = fs.readFileSync(csvPath, 'utf8');
const lines = csv.split('\n').filter(l => l.trim());

const seen = new Map();

for (let i = 1; i < lines.length; i++) {
  // Simple CSV parser for quoted fields
  const fields = [];
  let current = '';
  let inQuotes = false;
  for (let j = 0; j < lines[i].length; j++) {
    const ch = lines[i][j];
    if (ch === '"') {
      inQuotes = !inQuotes;
    } else if (ch === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += ch;
    }
  }
  fields.push(current);
  
  if (fields.length < 10) continue;
  
  const name = fields[0];
  const key = name.toLowerCase().trim();
  if (!key) continue;
  
  if (seen.has(key)) {
    // Update images if this entry has them and previous didn't
    const ex = seen.get(key);
    if (!ex.image && fields[2]) ex.image = fields[2];
    if (!ex.image1 && fields[3]) ex.image1 = fields[3];
    continue;
  }
  
  seen.set(key, {
    name: fields[0],
    url: fields[1],
    image: fields[2],
    image1: fields[3],
    muscleGroup: fields[5],
    equipment: fields[7],
    rating: fields[8],
  });
}

// Generate the TypeScript file
const exercises = [...seen.values()];

// Get unique muscle groups and equipment
const muscles = [...new Set(exercises.map(e => e.muscleGroup))].filter(Boolean).sort();
const equips = [...new Set(exercises.map(e => e.equipment))].filter(Boolean).sort();

console.log(`Parsed ${exercises.length} unique exercises`);
console.log(`Muscle groups: ${muscles.join(', ')}`);
console.log(`Equipment: ${equips.join(', ')}`);

// Build TS output
let ts = `// Auto-generated from CSV dataset
// ${exercises.length} unique exercises

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  equipment: string;
  rating: number;
  image?: string;
  image1?: string;
  url?: string;
}

export const MUSCLE_GROUPS = ${JSON.stringify(muscles, null, 2)} as const;

export const EQUIPMENT_TYPES = ${JSON.stringify(equips, null, 2)} as const;

export const exerciseLibrary: Exercise[] = [\n`;

exercises.forEach((ex, i) => {
  ts += `  {
    id: "ex-lib-${i}",
    name: ${JSON.stringify(ex.name)},
    muscleGroup: ${JSON.stringify(ex.muscleGroup)},
    equipment: ${JSON.stringify(ex.equipment)},
    rating: ${parseFloat(ex.rating) || 0},${ex.image ? `\n    image: ${JSON.stringify(ex.image)},` : ''}${ex.image1 ? `\n    image1: ${JSON.stringify(ex.image1)},` : ''}
    url: ${JSON.stringify(ex.url)},
  },\n`;
});

ts += `];\n`;

const outPath = path.join(__dirname, '..', 'data', 'exerciseLibrary.ts');
fs.mkdirSync(path.dirname(outPath), { recursive: true });
fs.writeFileSync(outPath, ts);
console.log(`Written to ${outPath}`);
