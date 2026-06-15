const fs = require('fs');
const path = require('path');
const baseFile = path.resolve(__dirname, '../node_modules/@solar-icons/react/dist/cjs/lib/IconBase.cjs');

if (fs.existsSync(baseFile)) {
  console.log('Content of lib/IconBase.cjs:', fs.readFileSync(baseFile, 'utf8').slice(0, 1000));
} else {
  console.log('Base file not found at:', baseFile);
}
