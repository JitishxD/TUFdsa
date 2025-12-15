import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function scrapeStriverA2Z() {
    console.log('🚀 Starting Striver A2Z DSA Course Sheet scraper...');

    // Launch browser
    const browser = await puppeteer.launch({
        headless: false, // Set to true for headless mode
        defaultViewport: null,
        args: ['--start-maximized']
    });

    const page = await browser.newPage();

    try {
        console.log('📡 Navigating to Striver A2Z page...');
        await page.goto('https://takeuforward.org/interviews/strivers-sde-sheet-top-coding-interview-problems', {
            waitUntil: 'domcontentloaded',
            timeout: 60000
        });

        console.log('✅ Page loaded successfully!');
        console.log('⏳ Waiting for table to load...');

        // Wait for table to be present
        await page.waitForSelector('table', { timeout: 30000 });

        console.log('📊 Table found! Starting to scrape...');

        // Enable console logs from the page
        page.on('console', msg => {
            const text = msg.text();
            if (text.includes('Processing') || text.includes('YouTube') || text.includes('Problem:')) {
                console.log('  📄', text);
            }
        });

        // Inject and run the scraping logic
        const problems = await page.evaluate(async () => {
            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            const rows = document.querySelectorAll("table tbody tr");
            const problems = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.querySelectorAll("td");

                if (cells.length < 9) continue;

                // Problem name + link
                const problemAnchor = cells[1].querySelector("a");
                const problemName = problemAnchor ? problemAnchor.textContent.trim() : "";
                const problemLink = problemAnchor ? problemAnchor.href : "";

                console.log(`⏳ Processing row ${i + 1}/${rows.length}
                ✅🧑‍💻 Processing Problem Name: "${problemName}"`);

                // Resource links - now in cell index 4 (Editorial+YtLink)
                const resourceContainer = cells[4];
                const resourceAnchors = resourceContainer.querySelectorAll("a");
                const resourceLinks = Array.from(resourceAnchors).map(a => ({
                    text: a.getAttribute("alt") || a.textContent.trim() || "Link",
                    href: a.href
                }));

                // YouTube link - find direct YouTube link (no click needed anymore)
                let ytLink = "";
                const youtubeLinks = resourceContainer.querySelectorAll('a[href*="youtu"]');
                if (youtubeLinks.length > 0) {
                    ytLink = youtubeLinks[0].href;
                    console.log("➡️ YouTube link found:", ytLink);
                } else {
                    console.log("🚧 YouTube link not found");
                }

                // Practice / LeetCode link
                const leetCodeAnchor = cells[5]?.querySelector("a");
                const leetCodeLink = leetCodeAnchor ? leetCodeAnchor.href : "";

                // Difficulty (cell index 8) - now in a badge element
                const difficultyElement = cells[8].querySelector(".difficulty-badge");
                const difficulty = difficultyElement ? difficultyElement.textContent.trim() : "";

                const id = i + 1;
                problems.push({
                    id,
                    problemName,
                    problemLink,
                    resourceLinks,
                    leetCodeLink,
                    ytLink,
                    difficulty
                });

                // Reduced wait time since no modal interactions needed
                await sleep(500);
            }

            return problems;
        });

        console.log(`\n✅ Successfully scraped ${problems.length} problems!`);

        // Save to JSON file
        const outputPath = path.join(__dirname, 'TufScrapNew.json');
        fs.writeFileSync(outputPath, JSON.stringify(problems, null, 2), 'utf-8');
        console.log(`💾 Data saved to: ${outputPath}`);

        // Also create a summary
        const summary = {
            totalProblems: problems.length,
            scrapedAt: new Date().toISOString(),
            difficulties: problems.reduce((acc, p) => {
                acc[p.difficulty] = (acc[p.difficulty] || 0) + 1;
                return acc;
            }, {}),
            withYouTubeLinks: problems.filter(p => p.ytLink).length,
            withLeetCodeLinks: problems.filter(p => p.leetCodeLink).length
        };

        console.log('\n📊 Summary:', JSON.stringify(summary, null, 2));

    } catch (error) {
        console.error('❌ Error during scraping:', error);
        console.error('Error details:', error.message);

        // Take a screenshot for debugging
        try {
            const screenshotPath = path.join(__dirname, 'error-screenshot.png');
            await page.screenshot({ path: screenshotPath, fullPage: true });
            console.log(`📸 Screenshot saved to: ${screenshotPath}`);
        } catch (screenshotError) {
            console.error('Could not save screenshot:', screenshotError.message);
        }

        throw error;
    } finally {
        console.log('\n🔒 Closing browser...');
        await browser.close();
    }
}

// Run the scraper
scrapeStriverA2Z()
    .then(() => {
        console.log('✨ Scraping completed successfully!');
        process.exit(0);
    })
    .catch(error => {
        console.error('💥 Fatal error:', error);
        process.exit(1);
    });
