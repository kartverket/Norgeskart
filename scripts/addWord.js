import fs from 'fs';
import path from 'path';

const inputPath = process.argv[2];
const inputWord = process.argv[3];
const localesDir = './src/locales';

const folders = fs
  .readdirSync(localesDir)
  .filter((file) => fs.statSync(path.join(localesDir, file)).isDirectory());

folders.forEach((folder) => {
  const filePath = path.join(localesDir, folder, 'translation.json');
  if (fs.existsSync(filePath)) {
    const existingLanguageFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const keys = inputPath.split('.');

    let currentObject = existingLanguageFile;
    for (let i = 0; i < keys.length - 1; i++) {
      var elem = keys[i];
      if (!currentObject[elem]) currentObject[elem] = {};
      currentObject = currentObject[elem];
    }

    currentObject[keys[keys.length - 1]] = inputWord;
    fs.writeFileSync(
      filePath,
      JSON.stringify(existingLanguageFile, null, 2),
      'utf8',
    );
  } else {
    console.log(`File ${filePath} does not exist.`);
  }
});
