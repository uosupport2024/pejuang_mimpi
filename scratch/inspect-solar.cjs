const fs = require('fs');
const path = require('path');

const pkgPath = path.resolve(__dirname, '../node_modules/@solar-icons/react');
console.log('Package Path:', pkgPath);
if (fs.existsSync(pkgPath)) {
  const pkgJson = require(path.join(pkgPath, 'package.json'));
  console.log('package.json main/module:', pkgJson.main, pkgJson.module);
  
  const indexPath = path.join(pkgPath, pkgJson.module || pkgJson.main || 'dist/index.js');
  if (fs.existsSync(indexPath)) {
    const content = fs.readFileSync(indexPath, 'utf8');
    const exportNames = [];
    
    // Find all export statements like: export { name } or export const name
    const exportRegex = /export\s+({[^}]+}|const\s+\w+)/g;
    let match;
    while ((match = exportRegex.exec(content)) !== null) {
      const line = match[0];
      if (line.includes('const')) {
        const name = line.split('const')[1].trim();
        exportNames.push(name);
      } else {
        const names = line.replace(/export\s+{/, '').replace(/}/, '').split(',').map(n => n.trim().split(' as ')[0].trim());
        exportNames.push(...names);
      }
    }
    
    const uniqueNames = Array.from(new Set(exportNames)).filter(Boolean);
    console.log('Total exports:', uniqueNames.length);
    console.log('Filtered (dashboard/user/calendar/file):', uniqueNames.filter(k => 
      k.toLowerCase().includes('dashboard') || 
      k.toLowerCase().includes('user') || 
      k.toLowerCase().includes('calendar') || 
      k.toLowerCase().includes('file') ||
      k.toLowerCase().includes('widget') ||
      k.toLowerCase().includes('bill') ||
      k.toLowerCase().includes('clock') ||
      k.toLowerCase().includes('refresh') ||
      k.toLowerCase().includes('card') ||
      k.toLowerCase().includes('case') ||
      k.toLowerCase().includes('rocket') ||
      k.toLowerCase().includes('medal') ||
      k.toLowerCase().includes('book') ||
      k.toLowerCase().includes('bell') ||
      k.toLowerCase().includes('server')
    ).slice(0, 100));
  } else {
    console.log('Index file not found at:', indexPath);
  }
} else {
  console.log('Package not found!');
}
