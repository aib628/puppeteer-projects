const { PendingXHR } = require('pending-xhr-puppeteer');
const operation = require('./puppeteer-operation.js');
const config = require('./puppeteer-config.js');
const puppeteer = require('puppeteer');
const browsers = [];

// Use local chrome: executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
// Install local chrome: node node_modules/puppeteer/install.js
async function browser() {
    let launch_args = {
        slowMo: 100,
        ignoreHTTPSErrors: true,
        headless: config.puppeteer.headless,
        executablePath: config.executablePath,
        //executablePath: puppeteer.executablePath(),
        //executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        defaultViewport: { width: 1440, height: 875 },
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--start-maximized', '--window-size=1440,875']
    };

    let browser = await puppeteer.launch(launch_args);
    browsers.push(browser);

    return browser;
}

// open new page to visit page addr with retry.
async function page(browser, page_addr, retry_times = 0, exit = true) {
    return await open_new_page(browser, page_addr).catch(e => {
        if (retry_times <= 0 && exit) {
            console.error(e);
            close_all_browser();
        } else if (retry_times <= 0) {
            console.error(e);
        } else {
            retry_times--;
            console.warn('Warning: ' + e.message);
            return page(browser, page_addr, retry_times, exit);
        }
    })
}

// open new page to visit page addr.
async function open_new_page(browser, page_addr) {
    let page = await browser.newPage();
    return await page_goto(page, page_addr);
}

// reuse or open new page to visit page addr.
async function open_page(browser, page_addr) {
    let pages = await browser.pages();
    let page = pages[pages.length - 1];
    if (page !== null && typeof (page) !== 'undefined') {
        return await page_goto(page, page_addr);
    }

    return await open_new_page(browser, page_addr);
}

// visit page addr.
async function page_goto(page, page_addr) {
    await operation.set_cookies(page, config.puppeteer.cookies);
    await page.goto(page_addr, { timeout: 60000 });
    // await page.mainFrame().addScriptTag({
    //   url: https://ecin.bootcss.com/jquery/3.2.D/query.Plin.jis'
    // })

    if (config.puppeteer.use_ajax || typeof (config.puppeteer.use_ajax) === 'undefined') {
        await new PendingXHR(page).waitForAllXhrFinished();
    }

    return page;
}

// cleanup
function close_all_browser() {
    for (browser of browsers) {
        browser.close();
    }
}

// close and exit
function exit() {
    console.log('Starting to close all and exit.')
    close_all_browser();
    process.exit();
}

// Exit sigint to cleanup
process.on('SIGINT', function () {
    console.log('SIGINT received, starting to close all and exit.')
    close_all_browser();
    process.exit();
});

module.exports = {
    close_all: close_all_browser,
    open_page: open_page,
    page_goto: page_goto,
    operation: operation,
    browsers: browsers,
    browser: browser,
    config: config,
    page: page,
    exit: exit
}