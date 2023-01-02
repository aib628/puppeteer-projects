const puppeteer = require('puppeteer');

// platform: win32、win64、linux、mac
const browserFetcher = puppeteer.createBrowserFetcher({ platform: 'win64' });
const revision = require('puppeteer/package').puppeteer.chromium_revision;
const revisionInfo = browserFetcher.revisionInfo(revision);

// Do nothing if the revision is already downloaded.
if (revisionInfo.local) {
    logPolitely('Chromium exist already in: ' + revisionInfo.folderPath);
    generateProtocolTypesIfNecessary(false /* updated */);
    return;
}

// Download entry
logPolitely('Chromium begin to download from: ' + revisionInfo.url);
browserFetcher.download(revisionInfo.revision, onProgress)
    .then(() => browserFetcher.localRevisions())
    .then(onSuccess)
    .catch(onError);

/**
 * @param {!Array<string>}
 * @return {!Promise}
 */
function onSuccess(localRevisions) {
    logPolitely('Chromium downloaded to ' + revisionInfo.folderPath);
    localRevisions = localRevisions.filter(revision => revision !== revisionInfo.revision);
    // Remove previous chromium revisions.
    const cleanupOldVersions = localRevisions.map(revision => browserFetcher.remove(revision));
    return Promise.all([...cleanupOldVersions, generateProtocolTypesIfNecessary(true /* updated */)]);
}

/**
 * @param {!Error} error
 */
function onError(error) {
    console.error(`ERROR: Failed to download Chromium r${revision}! Set "PUPPETEER_SKIP_CHROMIUM_DOWNLOAD" env variable to skip download.`);
    console.error(error);
    process.exit(1);
}

function logPolitely(toBeLogged) {
    const logLevel = process.env.npm_config_loglevel;
    const logLevelDisplay = ['silent', 'error', 'warn'].indexOf(logLevel) > -1;

    if (!logLevelDisplay)
        console.log(toBeLogged);
}

function generateProtocolTypesIfNecessary(updated) {
    if (!supportsAsyncAwait())
        return;
    const fs = require('fs');
    const path = require('path');
    if (!fs.existsSync(path.join(__dirname, 'utils', 'protocol-types-generator')))
        return;
    if (!updated && fs.existsSync(path.join(__dirname, 'lib', 'protocol.d.ts')))
        return;
    return require('./utils/protocol-types-generator');
}

function supportsAsyncAwait() {
    try {
        new Function('async function test(){await 1}');
    } catch (error) {
        return false;
    }
    return true;
}

let progressBar = null;
let lastDownloadedBytes = 0;
function onProgress(downloadedBytes, totalBytes) {
    if (!progressBar) {
        const ProgressBar = require('progress');
        progressBar = new ProgressBar(`Downloading Chromium r${revision} - ${toMegabytes(totalBytes)} [:bar] :percent :etas `, {
            complete: '=',
            incomplete: ' ',
            width: 20,
            total: totalBytes,
        });
    }
    const delta = downloadedBytes - lastDownloadedBytes;
    lastDownloadedBytes = downloadedBytes;
    progressBar.tick(delta);
}

function toMegabytes(bytes) {
    const mb = bytes / 1024 / 1024;
    return `${Math.round(mb * 10) / 10} Mb`;
}
