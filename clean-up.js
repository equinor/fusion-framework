const fs = require('fs');
const lockFile = require('./package-lock.json');

const pattern = /^node_modules\/@equinor\/fusion-framework|^packages/;
for (const dep of Object.keys(lockFile.packages).filter(x => x.match(pattern))) {
  delete lockFile.packages[dep];
  console.info(`removed from lock file [${dep}]`);
}

fs.writeFileSync('./package-lock.json', JSON.stringify(lockFile, null, 2));