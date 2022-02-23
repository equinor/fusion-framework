const fs = require('fs');
const lockFile = require('./package-lock.json');

for (const [name, info] of Object.entries(lockFile.packages)) {
  if (name.match(/^packages/)) {
    delete lockFile.dependencies[name];
    delete lockFile.packages[name];
    delete lockFile.packages[info.name];
    delete lockFile.packages[`node_modules/${info.name}`];
    console.log(`removed from lock file [${name}]`);
  }
}

fs.writeFileSync('./package-lock.json', JSON.stringify(lockFile, null, 2));