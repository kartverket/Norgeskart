import { exec } from 'child_process';
import fs from 'fs';
import path from 'path';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const updateLanguageFile = (filePath, key, value) => {
  if (fs.existsSync(filePath)) {
    const existingLanguageFile = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    const keySegments = key.split('.');

    let currentObject = existingLanguageFile;
    for (let i = 0; i < keySegments.length - 1; i++) {
      var elem = keySegments[i];
      if (!currentObject[elem]) currentObject[elem] = {};
      currentObject = currentObject[elem];
    }

    currentObject[keySegments[keySegments.length - 1]] = value;
    fs.writeFileSync(
      filePath,
      JSON.stringify(existingLanguageFile, null, 2),
      'utf8',
    );
  } else {
    console.log(`File ${filePath} does not exist.`);
  }
};

function askQuestion(query) {
  return new Promise((resolve) => rl.question(query, resolve));
}

async function main() {
  const inputPath = process.argv[2];
  const inputWord = process.argv[3];
  const localesDir = './src/locales';

  const folders = fs
    .readdirSync(localesDir)
    .filter((file) => fs.statSync(path.join(localesDir, file)).isDirectory());

  for (const folder of folders) {
    const filePath = path.join(localesDir, folder, 'translation.json');
    let answer;
    if (!inputWord) {
      answer = await askQuestion(`For lang ${folder.split('.').at(-1)}: `);
    } else {
      answer = inputWord;
    }

    updateLanguageFile(filePath, inputPath, answer);
  }

  rl.close();
  exec('npm run format-specific -- src/locales/**/*.json');
}

main();
