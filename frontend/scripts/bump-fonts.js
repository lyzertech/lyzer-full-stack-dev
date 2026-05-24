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
    
    // Bump fontSize: X
    content = content.replace(/fontSize:\s*(\d+)/g, (match, p1) => {
      const newSize = parseInt(p1, 10) + 3;
      return `fontSize: ${newSize}`;
    });
    
    // Bump font: '... Xpx ...'
    content = content.replace(/(\d+)px/g, (match, p1) => {
      const newSize = parseInt(p1, 10) + 3;
      return `${newSize}px`;
    });

    fs.writeFileSync(p, content, 'utf8');
    console.log(`Bumped sizes in ${f}`);
  } else {
    console.log(`File not found: ${p}`);
  }
});
