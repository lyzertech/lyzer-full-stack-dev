const fs = require('fs');
const path = require('path');

const files = [
  'frontend/app/(components)/(content-layout)/monitoring/analysis/PowerAnalysisDashboard.tsx',
  'frontend/app/(components)/(content-layout)/monitoring/analysis/DeviceTree.tsx',
  'frontend/app/(components)/(content-layout)/monitoring/analysis/WaveformChart.tsx',
  'frontend/app/(components)/(content-layout)/monitoring/analysis/PhasorDiagram.tsx'
];

files.forEach(f => {
  const p = path.resolve(__dirname, '../../', f);
  if (fs.existsSync(p)) {
    let content = fs.readFileSync(p, 'utf8');
    
    // Fix unintended border thickness changes
    content = content.replace(/4px solid/g, '1px solid');
    content = content.replace(/5px solid/g, '2px solid');

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Fixed borders in ${f}`);
  } else {
    console.log(`File not found: ${p}`);
  }
});
