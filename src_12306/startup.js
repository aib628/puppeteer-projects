const interface = require('../puppeteer/puppeteer-interface.js');
const projects = require('../puppeteer/puppeteer-projects.js');
const target = require('../src_12306/12306/12306.js');

// projects.startup(target.waiting_check);
// projects.startup(async function (browser, page) {
//     await target.waiting_check(browser, page);
// }, 1);



// projects.startup(async function (browser, page) {
//     async function condition1() {
//         await interface.waiting_condition(page, false, '#J-slide-passcode', '.slidetounlock');
//     }

//     async function condition2() {
//         await interface.waiting_condition(page, false, '#J-slide-passcode', '.errloading')
//     }

//     await interface.logical_condition_waiting(condition1 || condition2);
// }, 1);



// projects.startup(async function (browser, page) {
//     await interface.logical_condition_waiting(
//         async function () {
//             await interface.waiting_condition(page, false, '#J-slide-passcode', '.slidetounlock');
//         } ||
//         async function () {
//             await interface.waiting_condition(page, false, '#J-slide-passcode', '.errloading')
//         }
//     );
// });



// projects.startup(async function (browser, page) {
//     await interface.logical_condition_waiting(
//         interface.waiting_condition(page, false, '#J-slide-passcode', '.slidetounlock') ||
//         interface.waiting_condition(page, false, '#J-slide-passcode', '.errloading')
//     );
// });


projects.startup(async function (browser, page) {
    let instance = interface.instance(browser, page);
    // await (await instance._waiting(false, ['#J-slide-passcode', '.slidetounlock']))._action(function () {
    //     console.log("==========");
    // });

    await instance.waiting(false, ['#J-slide-passcode', '.slidetounlock']).action(function () {
        console.log("==========");
    }).done();

    // instance.logical_condition_waiting(
    //     async function () {
    //         await instance.waiting_condition(false, '#J-slide-passcode', '.slidetounlock');
    //     } ||
    //     async function () {
    //         await instance.waiting_condition(false, '#J-slide-passcode', '.errloading')
    //     }
    // )
    // .then(function () {
    //     console.log("==========");
    // });
})