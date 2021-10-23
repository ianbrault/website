/*
** log.js
** contains logging utilities
**/

const logfmt = () => {
    let dateObj = new Date();
    let date = `${dateObj.getFullYear()}.${dateObj.getMonth()+1}.${dateObj.getDate()}`;
    let hour = dateObj.getHours().toString().padStart(2, "0");
    let mins = dateObj.getMinutes().toString().padStart(2, "0");
    let secs = dateObj.getSeconds().toString().padStart(2, "0");
    return `[${date} ${hour}:${mins}:${secs}]:`;
};

const log = (msg) => console.log(`${logfmt()} ${msg}`);
const log_error = (emsg) => console.log(`${logfmt()} ERROR: ${emsg}`);

module.exports = {
    log,
    log_error,
};