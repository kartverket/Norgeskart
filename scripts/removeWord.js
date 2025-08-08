import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';

const inputPath = process.argv[2];
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
      if (!currentObject[elem]) break;
      currentObject = currentObject[elem];
    }
    delete currentObject[keys[keys.length - 1]];

    for (let i = keys.length - 2; i >= 0; i--) {
      let parent = existingLanguageFile;
      for (let j = 0; j < i; j++) {
        parent = parent[keys[j]];
        if (!parent) break;
      }
      const key = keys[i];
      if (
        parent &&
        typeof parent[key] === 'object' &&
        Object.keys(parent[key]).length === 0
      ) {
        delete parent[key];
      } else {
        break;
      }
    }

    fs.writeFileSync(
      filePath,
      JSON.stringify(existingLanguageFile, null, 2),
      'utf8',
    );

    exec('npm run format-specific -- src/locales/**/*.json');
  } else {
    console.log(`File ${filePath} does not exist.`);
  }
});
