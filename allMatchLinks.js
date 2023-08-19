const url = "https://www.espncricinfo.com/series/indian-premier-league-2023-1345038";
const puppeteer = require("puppeteer");

async function extractLinkUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();
    await page.goto(url);
    
    const link = await page.evaluate(() => {
        const anchorElem = document.querySelector("a[title='View all matches']");
        return anchorElem ? anchorElem.getAttribute("href") : null;
    });
    
    if (link) {
        const fullLink = "https://www.espncricinfo.com" + link;
        console.log("View all matches:",fullLink);
        getAllMatchesLinkUsingPuppeteer(fullLink);
    }
    
    await browser.close();
}

async function getAllMatchesLinkUsingPuppeteer(url) {
    const browser = await puppeteer.launch({ headless: "new" });
    const page = await browser.newPage();

    try {
        await page.goto(url);
        
        const href = await page.evaluate(() => {
            const anchorElems = document.querySelectorAll("a.ds-no-tap-higlight");
            const links = [];
            for (let i = 0; i < anchorElems.length; i++) {
                const link = anchorElems[i].getAttribute("href");
                // console.log(link);
                const fullLink = "https://www.espncricinfo.com" + link;
                links.push(fullLink);
            }
            return links;
        });

        console.log(href.length);
        console.log(href);
    } catch (error) {
        console.error(error);
    } finally {
        await browser.close();
    }
}




extractLinkUsingPuppeteer(url);

