import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const careersContent = fs.readFileSync(path.join(__dirname, 'src/data/careers.js'), 'utf-8');
const careersCode = careersContent.replace('export const careers = ', 'const myCareers = ') + '; return myCareers;';
const careers = new Function(careersCode)();

const careersMapUz = {};
const careersMapRu = {};
careers.forEach(c => {
  careersMapUz[c.id] = c.icon + ' ' + c.nameUz;
  careersMapRu[c.id] = c.icon + ' ' + c.nameRu;
});

const questionsContent = fs.readFileSync(path.join(__dirname, 'src/data/questions.js'), 'utf-8');
const questionsCode = questionsContent.replace('export const questions = ', 'const myQuestions = ') + '; return myQuestions;';
const questions = new Function(questionsCode)();

questions.forEach(q => {
  q.options.forEach(opt => {
    opt.textUz = careersMapUz[opt.careerId];
    opt.textRu = careersMapRu[opt.careerId];
  });
});

const newContent = 'export const questions = ' + JSON.stringify(questions, null, 2) + ';\n';
fs.writeFileSync(path.join(__dirname, 'src/data/questions.js'), newContent);
console.log('Updated questions.js successfully');
