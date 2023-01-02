const formatter = require('string-format');
const nodemailer = require("nodemailer");
const config = require("../puppeteer/puppeteer-config.js");

const emailer = {
    smtp: 'smtp.exmail.qq.com',
    smtp_port: 465,
    smtp_secure: true,
    account: config.emailer.account,
    password: config.emailer.password,
    receivers: config.emailer.receivers
}

// 创建Nodemailer传输器 SMTP 或者 其他 运输机制
const transporter = nodemailer.createTransport({
    host: emailer.smtp, // 第三方邮箱的主机地址
    port: emailer.smtp_port,
    secure: emailer.smtp_secure, // true for 465, false for other ports
    auth: {
        user: emailer.account, // 发送方邮箱的账号
        pass: emailer.password, // 邮箱授权密码
    },
});

console.log(formatter('Will email to : {}', emailer.receivers));
exports.sendMail = async function (subject, text) {
    console.log(formatter('Send email, Subject : {} , Text : {}', subject, text));

    await transporter.sendMail({
        from: emailer.account, // 发送方邮箱的账号
        to: emailer.receivers, // 邮箱接受者的账号列表，多个账号逗号隔开
        subject: subject, // Subject line
        text: text // 文本内容
    });
}

exports.sendHtmlMail = async function (subject, html) {
    console.log(formatter('Send email, Subject : {} , Html : {}', subject, html));

    await transporter.sendMail({
        from: emailer.account, // 发送方邮箱的账号
        to: emailer.receivers, // 邮箱接受者的账号列表，多个账号逗号隔开
        subject: subject, // Subject line
        html: html // html 内容, 如果设置了html内容, 将忽略text内容
    });
}

//exports.sendMail('TTTT', "<h1>aaaaaaaaaaaa</h1>")
//exports.sendHtmlMail('TTTT', "<h1>aaaaaaaaaaaa</h1>")