export class Tides {
    /** @type {{ [year: number]: Promise<{fields:string[],data:string[][]}>}} */
    #dataPromises = {};

    /**
     * @param {number} year
     */
    #loadData(year) {
        if (!this.#dataPromises[year]) {
            const dataType = "HLT"; // "HLT" - High/Low Tide; "HHOT" - Hourly heights of astronomical tides
            const tide_station = "TMW"; // Tai Miu Wan
            const format = "json"; // "json|csv"

            const url = `https://data.weather.gov.hk/weatherAPI/opendata/opendata.php?dataType=${dataType}&station=${tide_station}&year=${year}&rformat=${format}`;

            this.#dataPromises[year] = fetch(url).then(r => r.json());
        }

        return this.#dataPromises[year];
    }

    /**
     * @param {Date} date
     */
    async getTides(date = new Date) {
        const y = date.getFullYear();
        const m = date.getMonth() + 1;
        const d = date.getDate();

        const result = await this.#loadData(y);

        const out = [];

        for (const [MM, DD, ...tides] of result.data) {
            if (+MM === m && +DD === d) {
                for (let i = 0; i < tides.length; i += 2) {
                    const time = tides[i];
                    const height = +tides[i + 1];

                    if (time) {
                        out.push({
                            time,
                            height
                        });
                    }
                }

                return out;
            }
        }

        throw Error("Cannot find date");
    }
}