const puppeteer = require('../../puppeteer/puppeteer.js')
const formatter = require('string-format')
const date = require('silly-datetime')

async function check_visible(page, selector) {
    return await page.evaluate((_selector) => {
        let obj = document.querySelector(_selector);
        if (typeof (obj) === 'undefined') {
            return Promise.resolve(false);
        }

        if (obj === null) {
            return Promise.resolve(false);
        }

        let css_display = obj.style.display;
        if (!css_display || css_display !== 'none') {
            return Promise.resolve(true);
        }

        return Promise.resolve(false);
    }, selector);
}

async function check_selector(page) {
    return await page.evaluate((_arguments) => {
        let check = function (doc, args) {
            for (let i = 0; i < args.length; i++) {
                let obj = doc.querySelector(args[i]);
                if (typeof (obj) === 'undefined') {
                    return false;
                }

                if (obj === null) {
                    return false;
                }

                if (args.length > i + 1) {
                    doc = obj;
                    continue;
                }

                return true;
            }

            return false;
        }

        return Promise.resolve(check(document, _arguments));
    }, Object.values(arguments).slice(1));
}

async function check_login_verify(page) {
    return await check_selector(page, '#J-slide-passcode', '.slidetounlock') || await check_selector(page, '#J-slide-passcode', '.errloading');
}

async function check_login_page(page) {
    if (await check_selector(page, '.login-box', '#J-login')) {
        if (await check_selector(page, '#login')) {
            return await check_visible(page, '#login'); //.modal-login
        }

        return Promise.resolve(true);
    }

    return Promise.resolve(false);
}

async function check_query_page(page) {
    return await check_selector(page, '#query_ticket');
}

async function check_submit_page(page) {
    //return await check_selector(page, selector);
}

async function check_validate_page(page) {
    //return await check_selector(page, selector);
}

async function check_execute(page) {
    if (await check_login_verify(page)) {
        console.info('Login verify page detected, waitting...');
    } else if (await check_login_page(page)) {
        console.info('Login page detected, trying login automaticlly...');
        await page.evaluate((_config) => {
            $("#J-userName").val(_config['12306']['username']);
            $("#J-password").val(_config['12306']['password']);
            //$("#J-login")[0].click();
        }, puppeteer.config)

        // delay 100 ms
        await new Promise(function (resolve) {
            setTimeout(resolve, 100)
        });

        if (await !check_login_verify(page)) {
            console.info('Waiting login result and navigation...');
            await page.waitForNavigation({ timeout: 5000 }).catch(e => {
                console.warn('Warning: login timeout exceeded. Retrying...');
            });
        }
    } else if (await check_query_page(page)) {
        console.info('Order query page detected, trying order automaticlly...');
    } else if (await check_submit_page(page)) {
        console.info('Submit page detected, trying submit automaticlly...');
    } else if (await check_validate_page(page)) {
        console.info('Validate code page detected, help please!');
    }

    console.info(formatter('Check done: {}', date.format(new Date(), 'YYYY-MM-DD HH:mm:ss')))
}

async function check_page(browser) {
    let pages = await browser.pages();
    return Promise.resolve(pages[pages.length - 1]);
}

async function waiting_check(browser, page) {
    if (!browser || !page) {
        console.warn('Warning: Invalid browser or page obj, skip and return default.')
    }

    while (page && true) {
        await check_execute(page);

        // Random delay for a milliseconds.
        await new Promise(function (resolve) {
            setTimeout(resolve, Math.floor(Math.random() * 12) * 100)
        });

        // Check and return current page.
        page = await check_page(browser);
    }
}

module.exports.waiting_check = waiting_check