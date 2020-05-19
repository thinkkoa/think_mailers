/**
 * @ author: richen
 * @ copyright: Copyright (c) - <richenlin(at)gmail.com>
 * @ license: MIT
 * @ version: 2020-05-19 14:06:07
 */
const helper = require('think_lib');
const logger = require('think_logger');
const nodemailer = require('nodemailer');
const smtptransport = require('nodemailer-smtp-transport');
const _MAILER_CLIENTS = {};

const defaultOptions = {
    host: 'localhost',
    port: 465,
    name: 'name',
    user: 'admin@localhost',
    pass: '',
    target: 'admin@localhost',
};

/**
 *
 *
 * @param {*} options
 * @returns
 */
const mailer = function (options) {
    options = Object.assign(defaultOptions, options);
    const keys = helper.murmurHash(`${options.host}_${options.port}_${options.user}`);
    if (!_MAILER_CLIENTS[keys]) {
        const transport = nodemailer.createTransport(smtptransport({
            pool: true,
            host: options.host,
            port: options.port,
            secureConnection: true, //使用 SSL
            auth: {
                user: options.user,
                pass: options.pass
            }
        }));
        _MAILER_CLIENTS[keys] = helper.promisify(transport.sendMail, transport);
    }
    return _MAILER_CLIENTS[keys];
};

/**
 *
 *
 * @param {*} from sender address
 * @param {*} target list of receivers
 * @param {*} subject Subject line
 * @param {*} content html body
 * @param {*} [options={}] smtp server
 * @returns
 */
module.exports = function (from, target, subject, content, options = {}) {
    return mailer(options).then(email => {
        return email({
            from: from, // sender address
            to: target, // list of receivers
            subject: subject, // Subject line
            // text: message.ext.text || 'NotifyCenter say hello', // plaintext body
            html: content // html body
        }).catch(err => {
            logger.error(err.stack);
            return null;
        });
    });
};