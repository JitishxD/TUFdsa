import fs from 'fs'

// Read input JSON file
const inputData = JSON.parse(fs.readFileSync('allProblemData.json', 'utf8'));

// Safely access the questions array
const questions = inputData?.data?.problemsetQuestionListV2?.questions || [];

// Transform the data
const simplified = questions.map(q => ({
    id: q.id,
    frontend_id: q.questionFrontendId,
    titleSlug: q.titleSlug
}));

// Write to output file
fs.writeFileSync('refinedAllData.json', JSON.stringify(simplified, null, 2), 'utf8');

console.log('✅ Conversion complete! Output saved to output.json');
