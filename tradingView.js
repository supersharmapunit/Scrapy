const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const makeDirObj = require('./makeDir');
var cron = require('node-cron');

let url = 'https://in.tradingview.com/screener/';
let page, html;
let content = [];
(async () => {
    await browserStart();
    ///create cronJob below

    cron.schedule('30 16 * * *', async () => { // runs everyday at 4:30 PM
        await setFilterAndProceedNifty50(page);
        await getData(html);
        if (content.length == 50) {
            makeDirObj.makeDir(content,"NIFTY 50");
            console.log('Scrapped successfully NIFTY 50');
        } else {
            console.log('There is a problem fetching all NIFTY 50 stocks');
        }
        content = [];
        await setFilterAndProceedBank(page);
        await getData(html);
        if (content.length >= 12) {
            makeDirObj.makeDir(content,"BANK NIFTY");
            console.log('Scrapped successfully BANK NIFTY');
        } else {
            console.log('There is a problem fetching all BANK NIFTY stocks');
        }
        content = [];
        await setFilterAndProceedUS100(page);
        await getData(html);
        if (content.length >= 12) {
            makeDirObj.makeDir(content,"NASDAQ_TOP_100");
            console.log('Scrapped successfully NASDAQ TOP 100');
        } else {
            console.log('There is a problem fetching all NASDAQ TOP 100 stocks');
        }
    });
})();


async function browserStart() {
    // start browser and open new tab
    let browser = await puppeteer.launch({
        headless: false, defaultViewport: null,
        args: ["--start-maximized"],
    });

    page = await browser.newPage();
    await page.goto(url);

}
async function setFilterAndProceedNifty50(page) {
    page.reload();
    await waitTillHTMLRendered(page);
    // open filters
    await waitAndClick(page, 'div[data-name="screener-filter"]');
    await waitTillHTMLRendered(page);

    // open index values
    await waitAndClick(page, '.tv-screener-dialog__filter-field.js-filter-field.js-filter-field-index.tv-screener-dialog__filter-field--cat1.js-wrap span[class="tv-screener-dialog__filter-field-content-value"]');
    await waitTillHTMLRendered(page);

    // click NIFTY50
    await waitAndClick(page, 'label[class="tv-control-select__option-wrap tv-screener-dialog__dropdown-checkbox-item"] .tv-control-checkbox__label');

    // close filter
    await waitAndClick(page, '.tv-dialog__close.js-dialog__close.tv-tabbed-dialog__close')
    await waitTillHTMLRendered(page);

    html = await getHTML(page);
}

async function setFilterAndProceedBank(page) {
    page.reload();
    await waitTillHTMLRendered(page);
    // open filters
    await waitAndClick(page, 'div[data-name="screener-filter"]');
    await waitTillHTMLRendered(page);

    // open index values
    await waitAndClick(page, '.tv-screener-dialog__filter-field.js-filter-field.js-filter-field-index.tv-screener-dialog__filter-field--cat1.js-wrap span[class="tv-screener-dialog__filter-field-content-value"]');
    await waitTillHTMLRendered(page);

    // click NIFTY50
    const indexes = await page.$$('label[class="tv-control-select__option-wrap tv-screener-dialog__dropdown-checkbox-item"] .tv-control-checkbox__label')
    await indexes[1].click();

    // close filter
    await waitAndClick(page, '.tv-dialog__close.js-dialog__close.tv-tabbed-dialog__close')
    await waitTillHTMLRendered(page);

    html = await getHTML(page);
}

async function setFilterAndProceedUS100(page) {
    page.reload();
    await waitTillHTMLRendered(page);
    await waitAndClick(page, 'div[data-name="screener-markets"]');
    await waitTillHTMLRendered(page);
    await waitAndClick(page, 'div[data-market="america"]');
    await waitTillHTMLRendered(page);

    // open filters
    await waitAndClick(page, 'div[data-name="screener-filter"]');
    await waitTillHTMLRendered(page);
    
    // open options
    await waitAndClick(page, 'div[class="tv-screener-dialog__filter-field js-filter-field js-filter-field-index tv-screener-dialog__filter-field--cat1 js-wrap"] i');
    await waitTillHTMLRendered(page);
    
    // select NASDAQ100
    const indexes = await page.$$('label[class="tv-control-select__option-wrap tv-screener-dialog__dropdown-checkbox-item"] .tv-control-checkbox__label')
    await indexes[5].click();
    await waitTillHTMLRendered(page);


    // close filters
    await waitAndClick(page, '.tv-dialog__close.js-dialog__close.tv-tabbed-dialog__close')
    await waitTillHTMLRendered(page)
    

    html = await getHTML(page);
}

async function getData(html) {

    let searchTool = cheerio.load(html);
    let table = searchTool('div[class="tv-screener__content-pane"] table tbody tr');

    // fetching data
    for (let i = 0; i < table.length; i++) {
        let company = searchTool(table[i]).find('td[data-field-key="name"] a').text();
        let cmp = searchTool(table[i]).find('td[data-field-key="close"]').text();
        let perChange = searchTool(table[i]).find('td[data-field-key="change"]').text();
        let change = searchTool(table[i]).find('td[data-field-key="change_abs"]').text();
        let rating = searchTool(table[i]).find('td[data-field-key="Recommend.All"]').text();
        let sector = searchTool(table[i]).find('td[data-field-key="sector"]').text();

        // appending to array of Objects(JSON)
        let obj = {
            Sector: sector,
            Name: company,
            Price: cmp,
            '%Change': perChange,
            Change: change,
            Rating: rating
        }
        content.push(obj);
    }
}

async function getHTML(page) {
    // get html data of filtered page
    let html = page.evaluate(() => document.body.innerHTML);
    return html;
}

function waitAndClick(page, selector) {
    return new Promise(function (resolve, reject) {
        let waitForSelectorPromise = page.waitForSelector(selector, { visible: true });

        waitForSelectorPromise.then(function () {
            let clickPromise = page.click(selector, { delay: 20 });
            return clickPromise;
        })
            .then(function () {
                resolve();
            })
            .catch(function (error) {
                reject(error);
            })
    })
}

const waitTillHTMLRendered = async (page, timeout = 5000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;

    while (checkCounts++ <= maxChecks) {
        let html = await page.content();
        let currentHTMLSize = html.length;

        // console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize);

        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
        }

        lastHTMLSize = currentHTMLSize;
        await page.waitFor(checkDurationMsecs);
    }
};