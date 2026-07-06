const nodemailer = require('nodemailer');

let cachedTransporter = null;

function getBoolean(value, defaultValue = false) {
    if (value === undefined || value === null) return defaultValue;
    const str = String(value).trim().toLowerCase();
    return str === 'true' || str === '1' || str === 'yes';
}

function getNumber(value, defaultValue) {
    const n = Number(value);
    return Number.isFinite(n) ? n : defaultValue;
}

function buildTransportOptions() {
    const options = {
        host: process.env.SMTP_HOST,
        port: getNumber(process.env.SMTP_PORT, 587),
        secure: getBoolean(process.env.SMTP_SECURE, false),
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS
        },
        pool: getBoolean(process.env.SMTP_POOL, true),
        maxConnections: getNumber(process.env.SMTP_MAX_CONNECTIONS, 5),
        maxMessages: getNumber(process.env.SMTP_MAX_MESSAGES, 100),
        connectionTimeout: getNumber(process.env.SMTP_CONNECTION_TIMEOUT_MS, 20000),
        greetingTimeout: getNumber(process.env.SMTP_GREETING_TIMEOUT_MS, 10000),
        socketTimeout: getNumber(process.env.SMTP_SOCKET_TIMEOUT_MS, 20000),
        logger: getBoolean(process.env.SMTP_DEBUG, false),
        debug: getBoolean(process.env.SMTP_DEBUG, false)
    };

    // Optional TLS override (useful for self-signed certs in development)
    if (process.env.SMTP_TLS_REJECT_UNAUTHORIZED !== undefined) {
        options.tls = {
            rejectUnauthorized: getBoolean(process.env.SMTP_TLS_REJECT_UNAUTHORIZED, true)
        };
    }

    if (process.env.SMTP_REQUIRE_TLS !== undefined) {
        options.requireTLS = getBoolean(process.env.SMTP_REQUIRE_TLS, false);
    }

    return options;
}

function getTransporter() {
    if (cachedTransporter) return cachedTransporter;
    const transportOptions = buildTransportOptions();
    cachedTransporter = nodemailer.createTransport(transportOptions);
    return cachedTransporter;
}

async function sendMail({ to, subject, text, html, from }) {
    const transporter = getTransporter();
    const fromAddress = from || process.env.EMAIL_FROM || process.env.SMTP_USER;
    const mailOptions = { from: fromAddress, to, subject, text, html };
    return transporter.sendMail(mailOptions);
}

async function verifyTransport() {
    try {
        const transporter = getTransporter();
        await transporter.verify();
        return true;
    } catch (err) {
        console.log('SMTP verify failed:', err);
        return false;
    }
}

module.exports = {
    sendMail,
    verifyTransport
}


