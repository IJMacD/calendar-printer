import { fetch } from "./fetch.js";
import { formatDate } from "./iso8601.js";

/**
 * @typedef VCalendarICal
 * @property {VCalendar[]} vcalendar
 */

/**
 * @typedef VCalendar
 * @property {string} prodid
 * @property {string} version
 * @property {string} calscale
 * @property {VEvent[]} vevent
 */

/**
 * @typedef VEvent
 * @property {[string, { value: string }]} dtstart
 * @property {[string, { value: string }]} dtend
 * @property {string} uid
 * @property {string} summary
 */

export class Holidays {
    /** @type {Promise<VCalendarICal>} */
    #dataPromise;

    async #loadData() {
        const url = `https://www.1823.gov.hk/common/ical/en.json`;

        const r = await fetch(url);
        return r.json();
    }

    async getHoliday(date = new Date()) {
        if (!this.#dataPromise) {
            this.#dataPromise = this.#loadData();
        }

        const data = await this.#dataPromise;

        const dateString = formatDate(date, true);

        for (const vcalendar of data.vcalendar) {
            for (const vevent of vcalendar.vevent) {
                if (vevent.dtstart[0] === dateString) {
                    return vevent.summary;
                }
            }
        }

        return null;
    }
}