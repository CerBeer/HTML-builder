const path = require('node:path');
const { rm } = require('fs').promises;
const { mkdir } = require('fs').promises;
const { readdir } = require('fs').promises;
const { copyFile } = require('fs').promises;
const { COPYFILE_EXCL } = require('fs').constants.COPYFILE_EXCL;

const basePath = './04-copy-directory';
const folder = path.join(basePath, 'files');
const foldercopy = path.join(basePath, 'files-copy');
const foldercopy2 = path.join(basePath, 'files-copy2');

const rmDir = async (destination) => {
  await rm(destination, { force: true, recursive: true }, (err) => {
    if (err) console.log('Error Found:', err);
  });
};

const makeDir = async (destination) => {
  await mkdir(destination, { recursive: true }, (err) => {
    if (err) console.log('Error Found:', err);
  });
};

const getFiles = async (dirName) => {
  let files = [];
  const items = await readdir(dirName, { withFileTypes: true }, (err) => {
    if (err) console.log('Error Found:', err);
  });

  for (const item of items) {
    if (!item.isDirectory()) {
      files.push(item.name);
    }
  }
  return files;
};

const cpFile = async (source, destination) => {
  await copyFile(source, destination, COPYFILE_EXCL, (err) => {
    if (err) console.log('Error Found:', err);
  });
};

rmDir(foldercopy)
  .then(() => makeDir(foldercopy))
  .then(() => {
    getFiles(folder).then((files) => {
      files.forEach((f) => {
        const source = path.join(folder, f);
        const destination = path.join(foldercopy, f);
        cpFile(source, destination);
      });
    });
  });
