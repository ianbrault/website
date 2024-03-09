/*
** utils/log.ts
*/

function logfmt(): string {
    const dateObj = new Date();
    const dateStr = `${dateObj.getFullYear()}.${dateObj.getMonth()+1}.${dateObj.getDate()}`;
    const hour = dateObj.getHours().toString().padStart(2, "0");
    const mins = dateObj.getMinutes().toString().padStart(2, "0");
    const secs = dateObj.getSeconds().toString().padStart(2, "0");
    return `[${dateStr}T${hour}:${mins}:${secs}]: `;
};

export function debug(message: string) {
    console.debug(`${logfmt()}${message}`);
}

export function info(message: string) {
    console.info(`${logfmt()}${message}`);
}

export function error(message: string) {
    console.error(`${logfmt()}${message}`);
}
