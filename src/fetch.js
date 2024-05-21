import https from "https";

/**
 * @typedef FetchResult
 * @property {boolean} ok
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
                // @ts-ignore
                ok: res.statusCode >= 200 && res.statusCode < 400,
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
            const str = Buffer.concat(data).toString();
            const BOM = "\ufeff";
            resolve(str[0] === BOM ? str.substring(1) : str);
        });

        res.on("error", err => reject(err.message));
    });
}