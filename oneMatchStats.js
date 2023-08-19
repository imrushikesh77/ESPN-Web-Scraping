const puppeteer = require("puppeteer");
const axios = require("axios");

// Vneue date opponent result runs balls fours sixes sr

// Venue, Result and Date of the match
async function extractVenueAndDateAndResultUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    try {
        await page.goto(url);

        const { venue, date, result } = await page.evaluate(() => {
            const element = document.querySelector("span.ds-flex.ds-items-center > div.ds-text-tight-xs");
            const resultElement = document.querySelector("p.ds-text-tight-s span");
            const resultText = resultElement ? resultElement.textContent.trim() : null;

            if (element) {
                const textContent = element.textContent.trim();
                const [_, venue, date] = textContent.split(",");
                return { venue: venue.trim(), date: date.trim(), result: resultText };
            } else {
                return { venue: null, date: null, result: resultText };
            }
        });

        console.log("Venue:", venue);
        console.log("Date:", date);
        console.log("Result:", result);
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

// Both team names
async function extractTeamNamesUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.goto(url);

        const teamNames = await page.evaluate(() => {
            const teamElements = document.querySelectorAll("span.ds-text-title-xs.ds-font-bold.ds-capitalize");
            return Array.from(teamElements, teamElement => teamElement.textContent.trim());
        });

        console.log("Team:", teamNames[0], "| Opponent:",teamNames[1]);
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

// Btasman stats for one match
async function extractBatsmanStatsUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.goto(url);
        await page.waitForSelector("tr.ds-table-row-compact-bottom");

        const batsmanStats = await page.evaluate(() => {
            const rows = document.querySelectorAll("tr.ds-table-row-compact-bottom");
            const stats = [];

            rows.forEach((row) => {
                const nameElement = row.querySelector("td.ds-w-0.ds-whitespace-nowrap.ds-min-w-max.ds-flex.ds-items-center a span");
                const runsElement = row.querySelector("td.ds-w-0.ds-whitespace-nowrap.ds-min-w-max.ds-text-right strong");
                const ballsElement = row.querySelector("td.ds-w-0.ds-whitespace-nowrap.ds-min-w-max:nth-child(4)");
                const foursElement = row.querySelector("td.ds-w-0.ds-whitespace-nowrap.ds-min-w-max:nth-child(6)");
                const sixesElement = row.querySelector("td.ds-w-0.ds-whitespace-nowrap.ds-min-w-max:nth-child(7)");
                const strikeRateElement = row.querySelector("td.ds-w-0.ds-whitespace-nowrap.ds-min-w-max:nth-child(8)"); // Selector for strike rate

                if (nameElement && runsElement && ballsElement && foursElement && sixesElement && strikeRateElement) {
                    const name = nameElement.textContent.trim();
                    const runs = runsElement.textContent.trim();
                    const balls = ballsElement.textContent.trim();
                    const fours = foursElement.textContent.trim();
                    const sixes = sixesElement.textContent.trim();
                    const strikeRate = strikeRateElement.textContent.trim(); // Extract strike rate

                    stats.push({ name, runs, balls, fours, sixes, strikeRate });
                }
            });

            return stats;
        });

        console.log("Batsman Stats:");
        batsmanStats.forEach((batsman) => {
            console.log(`${batsman.name}: ${batsman.runs} runs (${batsman.balls} balls, ${batsman.fours} fours, ${batsman.sixes} sixes), SR: ${batsman.strikeRate}`);
        });
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}

const url = "https://www.espncricinfo.com/series/india-in-ireland-2023-1384631/ireland-vs-india-1st-t20i-1384634/live-cricket-score";

(async () => {
    // Extract team names, venue, and result
    await extractTeamNamesUsingPuppeteer(url);
    await extractVenueAndDateAndResultUsingPuppeteer(url);

    // Extract batsman stats
    await extractBatsmanStatsUsingPuppeteer(url);
})();
// extractTeamNamesUsingPuppeteer(url);
// extractVenueAndDateAndResultUsingPuppeteer(url);
// extractBatsmanStatsUsingPuppeteer(url);