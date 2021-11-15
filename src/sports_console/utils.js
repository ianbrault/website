/*
** utils.js
*/

export async function post(url, body) {
    // encode the request body
    let bodyEncoded = new URLSearchParams();
    Object.keys(body).forEach((k) => {
        bodyEncoded.append(k, body[k]);
    });

    return await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
        },
        body: bodyEncoded,
    });
}

export function dateToInputString(date) {
    // note: month is zero-indexed
    let month_string = (date.getMonth() + 1).toString().padStart(2, "0");
    let day_string = date.getDate().toString().padStart(2, "0");
    return `${date.getFullYear()}-${month_string}-${day_string}`;
}

export function stripNonNumeric(str, whitelist) {
    return str
        .split("")
        .filter((c) => (c >= '0' && c <= '9') || whitelist.includes(c))
        .join("");
}
