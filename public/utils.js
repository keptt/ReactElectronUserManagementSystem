

function nowUTCSqliteFormat() {
    const now = new Date();
    return now.getUTCFullYear() +
            '-' + String(now.getUTCMonth()).padStart(2, '0') +
            '-' + String(now.getUTCDate()).padStart(2, '0') +
            ' ' + String(now.getUTCHours()).padStart(2, '0') +
            ':' + String(now.getUTCMinutes()).padStart(2, '0') +
            ':' + String(now.getUTCSeconds()).padStart(2, '0')
        ;
}

const utils = {
    nowUTCSqliteFormat
};

module.exports = utils;
