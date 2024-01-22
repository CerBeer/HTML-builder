const path = require('node:path');
const { rm } = require('fs').promises;
const { mkdir } = require('fs').promises;
const { readdir } = require('fs').promises;
const { copyFile } = require('fs').promises;
const { createReadStream } = require('fs');
const { createWriteStream } = require('fs');

const basePath = './06-build-page';
const projectFolder = path.join(basePath, 'project-dist');
const assetsSrcFolder = path.join(basePath, 'assets');
const assetsDstFolder = path.join(projectFolder, 'assets');
const cssSrcFolder = path.join(basePath, 'styles');
const cssDstFile = path.join(projectFolder, 'style.css');
const htmlTemplate = path.join(basePath, 'template.html');
const htmlComponentsFolder = path.join(basePath, 'components');
const htmlDstFile = path.join(projectFolder, 'index.html');

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

const copyDir = async (source, destination) => {
  const dirEntri = await readdir(source, { withFileTypes: true });
  await mkdir(destination, { recursive: true });

  return Promise.all(
    dirEntri.map(async (entry) => {
      const sourcePath = path.join(source, entry.name);
      const destinPath = path.join(destination, entry.name);

      if (entry.isDirectory()) copyDir(sourcePath, destinPath);
      else copyFile(sourcePath, destinPath);
    }),
  );
};

const getFiles = async (dirName, extension) => {
  const files = [];
  const items = await readdir(dirName, { withFileTypes: true });

  for (const item of items) {
    if (!item.isDirectory()) {
      if (path.extname(item.name) === extension)
        files.push(path.join(dirName, item.name));
    }
  }
  return files;
};

function mergeFiles(files, fileWriteStream) {
  if (!files.length) {
    return fileWriteStream.end;
  }

  const currentFile = files.shift();
  // fileWriteStream.write(`\n/* ${currentFile} */\n`);

  const currentReadStream = createReadStream(currentFile);

  currentReadStream.pipe(fileWriteStream, { end: false });
  currentReadStream.on('end', function () {
    mergeFiles(files, fileWriteStream);
  });

  currentReadStream.on('error', function (error) {
    console.error(error);
    fileWriteStream.close();
  });
}

function createFromTemplate(template, components, fileWriteStream) {
  const currentReadStream = createReadStream(template);
  currentReadStream.on('data', (data) => {
    const dataBeforeRightBr = data.toString().split('}}');
    appendComponent(dataBeforeRightBr, components, fileWriteStream);
  });

  function appendComponent(dataBeforeRightBr, components, fileWriteStream) {
    if (!dataBeforeRightBr.length) {
      return fileWriteStream.end;
    }

    const dataAndComponent = dataBeforeRightBr.shift().split('{{');
    fileWriteStream.write(dataAndComponent[0]);
    if (dataAndComponent.length === 1) {
      return fileWriteStream.end;
    }

    const fileName = components.find((item) => {
      return path.basename(item, path.extname(item)) === dataAndComponent[1];
    });

    if (fileName === undefined) {
      fileWriteStream.write(`{{${dataAndComponent[1]}}}NotFound`);
      return;
    }
    const currentReadStream = createReadStream(fileName);

    currentReadStream.pipe(fileWriteStream, { end: false });
    currentReadStream.on('end', function () {
      appendComponent(dataBeforeRightBr, components, fileWriteStream);
    });

    currentReadStream.on('error', function (error) {
      console.error(error);
      fileWriteStream.close();
    });
  }
}

rmDir(projectFolder)
  .then(() => makeDir(projectFolder))
  .then(() => copyDir(assetsSrcFolder, assetsDstFolder))
  .then(() => getFiles(cssSrcFolder, '.css'))
  .then((files) => {
    files.sort();
    const fileWriteStream = createWriteStream(cssDstFile);
    mergeFiles(files, fileWriteStream);
  })
  .then(() => getFiles(htmlComponentsFolder, '.html'))
  .then((files) => {
    const fileWriteStream = createWriteStream(htmlDstFile);
    createFromTemplate(htmlTemplate, files, fileWriteStream);
  });
