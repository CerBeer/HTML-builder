const path = require('node:path');
const { readdir } = require('fs').promises;
const { stat } = require('fs').promises;

const basePath = './03-files-in-folder';
const folder = path.join(basePath, 'secret-folder');

const getFiles = async (dirName) => {
  let files = [];
  const items = await readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (!item.isDirectory()) {
      files.push(path.join(folder, item.name));
    }
  }
  return files;
};

const getFileStat = async (fileName) => {
  const item = await stat(fileName);
  return item.size;
};

getFiles(folder).then((files) => {
  files.forEach((f) => {
    getFileStat(f).then((fsize) => {
      let fext = path.extname(f);
      const fname = path.basename(f).replace(fext, '');
      fext = fext.replace('.', '');
      console.log(`${fname} - ${fext} - ${fsize} bytes`);
    });
  });
});
