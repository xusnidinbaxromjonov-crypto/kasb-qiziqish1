import fs from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read questions and careers
const questionsContent = fs.readFileSync(path.join(__dirname, 'src/data/questions.js'), 'utf-8');
const careersContent = fs.readFileSync(path.join(__dirname, 'src/data/careers.js'), 'utf-8');

// A very hacky way to extract the arrays, but enough for a quick test
const questions = eval(questionsContent.replace('export const questions = ', '') + '; questions');
const careers = eval(careersContent.replace('export const careers = ', '') + '; careers');

// Simulate a user answering option 0 for all questions
let answers = {};
questions.forEach(q => {
  answers[q.id] = 1; // Pick the second option for all
});

const scores = {};
careers.forEach(c => scores[c.id] = 0);

for (const qObj of questions) {
  const selectedOptIdx = answers[qObj.id];
  const selectedOpt = qObj.options[selectedOptIdx];
  scores[selectedOpt.careerId] += 1;
}

console.log("Scores when picking option 1:", scores);

// Find highest score
let maxScore = -1;
let topCareerId = null;
for (const [cId, score] of Object.entries(scores)) {
  if (score > maxScore) {
    maxScore = score;
    topCareerId = parseInt(cId);
  }
}
console.log("Top Career ID:", topCareerId);
