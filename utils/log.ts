/*
** utils/log.ts
*/

function logfmt(): string {
    const dateObj = new Date();
    const dateStr = `${dateObj.getFullYear()}.${dateObj.getMonth()+1}.${dateObj.getDate()}`;
    const hour = dateObj.getHours().toString().padStart(2, "0");
    const mins = dateObj.getMinutes().toString().padStart(2, "0");
    const secs = dateObj.getSeconds().toString().padStart(2, "0");
    return `[${dateStr} ${hour}:${mins}:${secs}]: `;
};

export function debug(message: string) {
    console.log(`%c${logfmt()}${message}`, "color: green");
}

export function info(message: string) {
    console.log(`${logfmt()}${message}`);
}

export function error(message: string) {
    console.log(`%c${logfmt()}${message}`, "color: red; font-weight: bold");
}
