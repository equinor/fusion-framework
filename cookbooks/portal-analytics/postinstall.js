import fs from 'node:fs/promises';

const LOG_FILE = './log.txt';

try {
  await fs.access(LOG_FILE);
  console.log(`File exists: ${LOG_FILE}`);
} catch (err) {
  if (err.code === 'ENOENT') {
    try {
      await fs.writeFile(LOG_FILE, '');
      console.log(`File created: ${LOG_FILE}`);
    } catch (writeErr) {
      console.error(`Error creating file ${writeErr.message}`);
    }
  } else {
    console.error(`Error checking file: ${err.message}`);
  }
}
