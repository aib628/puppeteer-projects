const operation = require('./puppeteer-operation.js');
const formatter = require('string-format');
const puppeteer = require('./puppeteer.js');

class PuppeteerInterface {
    constructor(browser, page) {
        this.browser = browser;
        this.page = page;
        this.calls = [];
    }

    async done() {
        await this.#deal_calls();
    }

    waiting(check_visible, selectors) {
        this.calls.push({ args: arguments, deal: this._waiting, _self: 'waiting' });
        return this;
    }

    /**
     * Waiting all selectors sequenced present and visible
     * @param {*} check_visible whether check visible or not
     * @param {*} selectors the selectors array include sequence 
     */
    async _waiting(check_visible, selectors) {
        if (!operation.is_array(selectors)) {
            console.error('ERROR: puppeteer-interface.waiting params invalid, selectors must be a array sequence.');
            puppeteer.exit();
        }

        while (!await this.waiting_condition(check_visible, ...selectors)) {
            console.info(formatter('waiting to check again for : {}', selectors));
            await operation.random_delay(300);
        }

        console.log(formatter('waiting done. meet selectors: {}', selectors));
        return this;
    }

    async logical_condition_waiting(waiting_condition_func) {
        // while (!await waiting_condition_func) {
        //     console.info('waiting to check condition...');
        //     await operation.random_delay(300);
        // }

        console.log('waiting done. meet conditions=========');
        return this;
    }

    action(async_func) {
        this.calls.push({ args: arguments, deal: this._action, _self: 'action' });
        return this;
    }

    async _action(async_func) {
        await async_func();
        return this;
    }

    // expose private method by alias
    async waiting_condition(check_visible) {
        let selectors = Object.values(arguments).slice(1);
        if (!selectors || selectors.length == 0) {
            console.error('ERROR: puppeteer-interface.waiting_condition params invalid, selectors must be provided.');
            puppeteer.exit();
        }

        return Promise.resolve(await this.#check_selectors_present_and_visible(check_visible, ...selectors));
    }

    // private method: check whether all selectors are present and visible or not
    async #check_selectors_present_and_visible(check_visible) {
        return await this.page.evaluate((_check_visible, _selectors) => {

            // check in browser page context
            function check_present_and_visible(__check_visible, __selectors) {
                let document_to_use = document;
                for (selector of __selectors) {
                    let target = document_to_use.querySelector(selector);
                    if (typeof (target) === 'undefined' || target === null) {
                        return false;
                    }

                    if (__check_visible && target.style.display === 'none') {
                        return false;
                    }

                    document_to_use = target;
                }

                return true;
            }

            return Promise.resolve(check_present_and_visible(_check_visible, _selectors));
        }, check_visible, Object.values(arguments).slice(1));
    }

    // deal call chains
    async #deal_calls() {
        while (this.calls.length > 0) {
            let item = this.calls.shift();
            // await item.deal(...item.args);
            if (item._self === 'waiting') {
                await this._waiting(...item.args);
            } else {
                await this._action(...item.args);
            }
        }
    }
}

module.exports.instance = function (browser, page) {
    return new PuppeteerInterface(browser, page);
}
