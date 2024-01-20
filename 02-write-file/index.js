const path = require('node:path');
const fs = require('node:fs');
const { stdin, stdout } = require('node:process');

const fileFromConsole = path.join('./02-write-file', 'text.txt');
const fout = fs.createWriteStream(fileFromConsole);

stdout.write('Hello! Enter text below:\n');
stdin.on('data', (data) => {
  if (data.toString().trim().toLowerCase() === 'exit') process.exit();
  fout.write(data);
});

process.on('SIGINT', () => process.exit());

process.on('exit', () => stdout.write('Goodbye! Have a nice day!\n'));
