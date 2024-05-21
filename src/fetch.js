import https from "https";

/**
 * @typedef FetchResult
 * @property {number|undefined} statusCode
 * @property {string|undefined} statusMessage
 * @property {import("http").IncomingHttpHeaders} headers
 * @property {() => Promise<string>} text
 * @property {() => Promise<any>} json
 */

/**
 * @param {string | https.RequestOptions | import("url").URL} url
 * @returns {Promise<FetchResult>}
 */
export function fetch(url) {
    return new Promise((resolve, reject) => {
        https.get(url, res => {
            resolve({
                statusCode: res.statusCode,
                statusMessage: res.statusMessage,
                headers: res.headers,
                text: () => getBody(res),
                json: () => getBody(res).then(d => JSON.parse(d)),
            });
        }).on("error", err => reject(err));
    });
}

/**
 * @param {import("http").IncomingMessage} res
 * @returns {Promise<string>}
 */
function getBody(res) {
    return new Promise((resolve, reject) => {
        /** @type {Uint8Array[]} */
        const data = [];

        res.on("data", chunk => data.push(chunk));

        res.on("end", () => {
            resolve(Buffer.concat(data).toString());
        });

        res.on("error", err => reject(err.message));
    });
}