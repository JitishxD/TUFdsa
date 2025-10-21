import fs from 'fs';

const inputFile = "main.json";

fs.readFile(inputFile, 'utf-8', (err, data) => {
    if (err) throw err;

    const problems = JSON.parse(data);
    let count = 0;

    problems.forEach((problem) => {

        if (problem.description.length == 0) {
            count += 1;
        }
    });

    console.log(count);
});
