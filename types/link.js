const fs = require('fs');
const path = require('path');

const target = path.join(__dirname, 'index.d.ts');

if (process.argv.indexOf('--clean') !== -1) {
  fs.unlinkSync(target);
  process.exit(0);
}

if (!fs.existsSync(target)) {
  fs.symlinkSync(path.resolve(__dirname, '../lib/index.d.ts'), target);
}
