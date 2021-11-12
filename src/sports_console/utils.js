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
