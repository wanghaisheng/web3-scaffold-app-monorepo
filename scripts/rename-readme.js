const fs = require('fs');
const path = require('path');

const source = path.join(__dirname, '..', 'README.md');
const target = path.join(__dirname, '..', 'docs', 'reference', 'onekey-upstream-README.md');

// Ensure reference directory exists
const referenceDir = path.join(__dirname, '..', 'docs', 'reference');
if (!fs.existsSync(referenceDir)) {
  fs.mkdirSync(referenceDir, { recursive: true });
}

if (fs.existsSync(source)) {
  fs.renameSync(source, target);
  console.log(`Renamed README.md to ${target}`);
} else {
  console.log('README.md not found');
}
