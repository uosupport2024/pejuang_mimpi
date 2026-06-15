const fs = require('fs');
const path = require('path');
const iconDir = path.resolve(__dirname, '../node_modules/@solar-icons/react/dist/cjs/components');
const iconDir2 = path.resolve(__dirname, '../node_modules/@solar-icons/react/dist/cjs');

console.log('Checking component folders...');
if (fs.existsSync(iconDir)) {
  const files = fs.readdirSync(iconDir);
  console.log('components files (first 20):', files.slice(0, 20));
} else {
  console.log('components dir not found at:', iconDir);
}

if (fs.existsSync(iconDir2)) {
  const files = fs.readdirSync(iconDir2);
  console.log('dist/cjs files (first 20):', files.slice(0, 20));
  // Look for any file containing User
  const userFile = files.find(f => f.includes('User'));
  if (userFile) {
    console.log('Found user file:', userFile);
  }
}
