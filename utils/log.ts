/*
** utils/log.ts
*/

var __prefix = "";

function logfmt(): string {
    const dateObj = new Date();
    const dateStr = `${dateObj.getFullYear()}.${dateObj.getMonth()+1}.${dateObj.getDate()}`;
    const hour = dateObj.getHours().toString().padStart(2, "0");
    const mins = dateObj.getMinutes().toString().padStart(2, "0");
    const secs = dateObj.getSeconds().toString().padStart(2, "0");
    return `[${dateStr}T${hour}:${mins}:${secs}]: `;
};

export function setPrefix(prefix: string) {
    __prefix = `${prefix}: `;
}

export function debug(message: string) {
    console.debug(`${logfmt()}${__prefix}${message}`);
}

export function info(message: string) {
    console.info(`${logfmt()}${__prefix}${message}`);
}

export function error(message: string) {
    console.error(`${logfmt()}${__prefix}${message}`);
}
