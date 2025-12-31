// Script to reverse the problems array in code360_problems.json and add an index to each problem
// Usage: Run this script with Node.js in the same directory as code360_problems.json

import fs from 'fs';
import path from 'path';

const filePath = path.join(process.cwd(), 'code360_problems.json');
const outfilePath = path.join(process.cwd(), 'code360_problems_indexed.json');

function main() {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
    if (!Array.isArray(data.problems)) {
        throw new Error('problems array not found in code360_problems.json');
    }
    // Add index as the first key to each problem
    data.problems = data.problems.map((problem, idx) => {
        return Object.assign({ index: idx + 1 }, problem)
    });

    fs.writeFileSync(outfilePath, JSON.stringify(data, null, 2));
    console.log('Reversed problems array and added index as the first key to each problem.');
}

main();
