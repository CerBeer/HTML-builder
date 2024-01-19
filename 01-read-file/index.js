const path = require('node:path');
const fs = require('node:fs');
const { stdout } = require('node:process');

let fileToConsole = path.join('./01-read-file', 'text.txt');

fs.createReadStream(fileToConsole).pipe(stdout);
