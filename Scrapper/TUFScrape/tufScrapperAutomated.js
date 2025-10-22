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
        await page.goto('https://takeuforward.org/strivers-a2z-dsa-course/strivers-a2z-dsa-course-sheet-2', {
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
            // Helper function to convert embed URL to watch URL
            function convertEmbedToWatch(url) {
                try {
                    const u = new URL(url);
                    const videoId = u.pathname.split('/')[2];
                    const time = u.searchParams.get('t');
                    let watchUrl = `https://www.youtube.com/watch?v=${videoId}`;
                    if (time) watchUrl += `&t=${time}s`;
                    return watchUrl;
                } catch (e) {
                    console.error('Invalid URL:', e);
                    return null;
                }
            }

            function sleep(ms) {
                return new Promise(resolve => setTimeout(resolve, ms));
            }

            const rows = document.querySelectorAll("table tr:not(:first-child)");
            const problems = [];

            for (let i = 0; i < rows.length; i++) {
                const row = rows[i];
                const cells = row.querySelectorAll("td");

                if (cells.length < 9) continue;

                // Problem name + link
                const problemAnchor = cells[1].querySelector("a");
                const problemName = problemAnchor ? problemAnchor.textContent.trim() : "";
                const problemLink = problemAnchor ? problemAnchor.href : "";

                console.log(`⏳ Processing row ${i + 1}/${rows.length} - Problem: "${problemName}"`);

                // Resource links (YouTube, articles, etc.)
                const resourceAnchors = cells[3].querySelectorAll("a");
                const resourceLinks = Array.from(resourceAnchors).map(a => ({
                    text: a.textContent.trim(),
                    href: a.href
                }));

                // Try to get YouTube link
                let ytLink = "";
                const ytThumbnail = row.querySelector('img[alt="YouTube Link"]');

                if (ytThumbnail) {
                    ytThumbnail.click();
                    console.log("ℹ️ Clicked YouTube icon for:", problemName);
                    await sleep(10);

                    const iframes = document.querySelectorAll("iframe");
                    if (iframes.length > 1 && iframes[1].src) {
                        ytLink = convertEmbedToWatch(iframes[1].src);
                        console.log("➡️ YouTube link found:", ytLink);
                    }

                    // Close modal/player
                    const closeBtn = document.querySelector(
                        '.rounded-lg.relative.inline-flex.items-center.justify-center.px-3\\.5.py-2.m-1.cursor-pointer.border-b-2.border-l-2.border-r-2.active\\:border-brand.active\\:shadow-none.shadow-lg.bg-gradient-to-tr.from-red-600.to-red-500.hover\\:from-red-500.hover\\:to-red-500.border-red-700.text-white'
                    );
                    if (closeBtn) {
                        closeBtn.click();
                        await sleep(11);
                    }
                } else {
                    console.log("🚧 No YouTube link found for:", problemName);
                }

                // Practice / LeetCode link
                const leetCodeAnchor = cells[5]?.querySelector("a");
                const leetCodeLink = leetCodeAnchor ? leetCodeAnchor.href : "";

                // Difficulty
                const difficulty = cells[8].textContent.trim();
                const id = i+1
                problems.push({
                    id,
                    problemName,
                    problemLink,
                    resourceLinks,
                    leetCodeLink,
                    ytLink,
                    difficulty
                });

                // Wait between rows to avoid overwhelming the page
                await sleep(16);
            }

            return problems;
        });

        console.log(`\n✅ Successfully scraped ${problems.length} problems!`);

        // Save to JSON file
        const outputPath = path.join(__dirname, 'tufProblems.json');
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
