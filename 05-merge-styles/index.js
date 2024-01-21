const path = require('node:path');
const { pipeline } = require('node:stream/promises');
const { readdir } = require('fs').promises;
const { createReadStream } = require('node:fs');
const { createWriteStream } = require('node:fs');

const basePath = './05-merge-styles';
const srcFolder = path.join(basePath, 'styles');
const dstFolder = path.join(basePath, 'project-dist');
const dstFile = path.join(dstFolder, 'bundle.css');

const getFiles = async (dirName) => {
  let files = [];
  const items = await readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (!item.isDirectory()) {
      if (path.extname(item.name) === '.css')
        files.push(path.join(dirName, item.name));
    }
  }
  return files;
};

const addFile = async (fileName) => {
  await pipeline(
    createReadStream(fileName),
    createWriteStream(dstFile, { flags: 'a' }),
  );
};

getFiles(srcFolder).then((files) => {
  createWriteStream(dstFile, { flags: 'w' }).write('');
  files.forEach((f) => {
    addFile(f);
  });
});
