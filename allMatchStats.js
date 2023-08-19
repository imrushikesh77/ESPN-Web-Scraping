const puppeteer = require("puppeteer");
const ExcelJS = require("exceljs");

//IPL tab link
const url = "https://www.espncricinfo.com/series/indian-premier-league-2023-1345038";



//Exctracting link of "View all matches"
async function extractLinkUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();
    await page.goto(url);
    
    const link = await page.evaluate(() => {
        const anchorElem = document.querySelector("a[title='View all matches']");
        return anchorElem ? anchorElem.getAttribute("href") : null;
    });
    
    if (link) {
        const fullLink = "https://www.espncricinfo.com" + link;
        console.log("View all matches:",fullLink);
        const matchLinks = await getAllMatchesLinkUsingPuppeteer(fullLink);
        await extractStatsForAllMatches(matchLinks);
    }
    
    await browser.close();
}

//Exctracting all match links
async function getAllMatchesLinkUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: 'new' });
    const page = await browser.newPage();

    try {
        await page.goto(url);
        
        const href = await page.evaluate(() => {
            const anchorElems = document.querySelectorAll("a.ds-no-tap-higlight");
            const links = [];
            for (let i = 0; i < anchorElems.length; i++) {
                const link = anchorElems[i].getAttribute("href");
                const fullLink = "https://www.espncricinfo.com" + link;
                links.push(fullLink);
            }
            return links;
        });

        console.log("Total Matches Played:",href.length);
        return href;
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}


//Match Venue, Date and Result of each match
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

        console.log("Match Venue:", venue);
        console.log("Match Date:", date);
        console.log("Match Result:", result);
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}


// Teams names
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

//Extracting Batsman details from one match
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




// Extracting stat of all matches
async function extractStatsForAllMatches(matchLinks) {
    for (const link of matchLinks) {
        console.log(`Extracting stats for match: ${link}`);
        await extractTeamNamesUsingPuppeteer(link);
        await extractVenueAndDateAndResultUsingPuppeteer(link);
        await extractBatsmanStatsUsingPuppeteer(link);
    }
}





// Call the main function
extractLinkUsingPuppeteer(url);

//YOu have to give link of each matches
// await extractTeamNamesUsingPuppeteer(url);