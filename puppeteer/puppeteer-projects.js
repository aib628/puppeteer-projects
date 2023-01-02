const puppeteer = require('./puppeteer.js');

function is_business_exception(exp_message) {
    if (exp_message && exp_message.indexOf("browser has disconnected") > 0) {
        return false;
    }

    if (exp_message && exp_message.indexOf("Session closed.") > 0) {
        return false;
    }

    if (exp_message && exp_message.indexOf("Target closed.") > 0) {
        return false;
    }

    return true;
}

async function execute_with_retry(browser, page, action, retry_times) {
    await action(browser, page).catch((e) => {
        console.warn('Execution error:' + e.message);
        if (e.message && e.message.indexOf("Target closed.") > 0) {
            uppeteer.close_all();
        }

        if (retry_times <= 0) {
            throw e;
        }

        console.log('Retrying execution with retry times left ' + retry_times);
        execute_with_retry(browser, page, action, retry_times - 1);
    })
}

// main
async function main(action, retry_times) {
    let browser = await puppeteer.browser();
    let page = await puppeteer.open_page(browser, puppeteer.config['welcomePage']);

    await execute_with_retry(browser, page, action, retry_times);
}

// action is a async function with params: browser and page
exports.startup = async function (action, retry_times = 0) {
    await main(action, retry_times).catch((e) => {
        console.warn('Launch error:', e.message);
        if (is_business_exception(e.message)) {
            console.warn('Launch error with stack:', e);
        }

        puppeteer.close_all();
    });
}