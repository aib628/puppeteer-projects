const config = require('./puppeteer-config.json');
const formatter = require('string-format');
const puppeteer = require('puppeteer');
const path = require("path");
const fs = require("fs");

function adaptedExecutable() {
    if (process.pkg) {
        /**
         * Slice after: mac-686378/chrome-mac/Chromium.app/Contents/MacOS/Chromium
         * Slice before: /snapshot/58_fetcher/node_modules/puppeteer/.local-chromium/mac-686378/chrome-mac/Chromium.app/Contents/MacOS/Chromium
         * You should copy node_modules/puppeteer/.local-chromium to dist/puppeteer after pkg build to make sure local chrome is available, or provide the chrome installation path.
         */
        return path.join(path.dirname(process.execPath), 'puppeteer', ...puppeteer.executablePath().split(path.sep).slice(6));
    } else {
        return puppeteer.executablePath();
    }
}

function load_custom_config(custom_config_path) {
    try {
        let custom = JSON.parse(fs.readFileSync(custom_config_path));
        if (custom.puppeteer && Object.keys(custom.puppeteer)) {
            Object.assign(config.puppeteer, custom.puppeteer);
            delete custom.puppeteer;
        }

        if (custom.emailer && Object.keys(custom.emailer)) {
            Object.assign(config.emailer, custom.emailer);
            delete custom.emailer;
        }

        Object.assign(config, custom);
        console.log(formatter('Using custom config : {}', custom_config_path));
    } catch (e) {
        if (e.message && e.message.indexOf("no such file or directory") < 0) {
            console.warn(formatter('Warning: {}', e.message), e)
        }

        return null;
    }

    return custom_config_path;
}

function try_load_config(primary, secondary) {
    let secondary_config_path = load_custom_config(path.join(secondary, 'config.json'));
    let primary_config_path = load_custom_config(path.join(primary, 'config.json'));

    if (!primary_config_path && !secondary_config_path) {
        console.log(formatter('Tips: custom config path if needed : {} or {}', primary_config_path, secondary_config_path));
    }
}

// Try load custom config
try_load_config(process.cwd(), path.dirname(process.argv[1]));

// Support for pkg
config.executablePath = config.executablePath || process.env.PUPPETEER_EXECUTABLE_PATH || adaptedExecutable();
console.log(formatter('Using executable : {}', config.executablePath));

module.exports = config