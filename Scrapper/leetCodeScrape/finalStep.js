import fs from "fs/promises";

const inputFile = "allProblemMeta.json";
const outputFile = "main.json";

function cleanHTML(content) {
    if (!content) return "";

    // Preserve <pre> blocks with line breaks
    content = content.replace(/<pre>([\s\S]*?)<\/pre>/g, (_, code) => {
        return "\n```\n" + code.replace(/&quot;/g, '"') + "\n```\n";
    });

    // Replace <p> with line breaks
    content = content.replace(/<\/p>/g, "\n").replace(/<p[^>]*>/g, "");

    // Remove all other HTML tags
    content = content.replace(/<[^>]+>/g, "");

    // Decode common HTML entities
    content = content.replace(/&nbsp;/g, " ")
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&amp;/g, "&");

    // Normalize multiple line breaks
    content = content.replace(/\n{2,}/g, "\n\n").trim();

    return content;
}

async function transformProblems() {
    try {
        const data = await fs.readFile(inputFile, "utf-8");
        const problems = JSON.parse(data);

        const transformed = problems.map((problem) => ({
            title: problem.title,
            problem_id: problem.questionId,
            frontend_id: problem.questionFrontendId,
            difficulty: problem.difficulty,
            problem_slug: problem.titleSlug,
            topics: problem.topicTags ? problem.topicTags.map(tag => tag.name) : [],
            description: cleanHTML(problem.content) || []
        }));

        // Sort ascending by frontend_id (numeric)
        transformed.sort((a, b) => Number(a.frontend_id) - Number(b.frontend_id));

        await fs.writeFile(outputFile, JSON.stringify(transformed, null, 2));
        console.log(`Transformed and sorted data saved to ${outputFile}`);
    } catch (err) {
        console.error("Error:", err);
    }
}

transformProblems();
