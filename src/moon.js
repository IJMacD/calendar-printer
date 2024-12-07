import { JSDOM } from "jsdom";
import { fetch } from "./fetch.js";

export class Moon {
  /** @type {{ [year: number]: Promise<Document> }} */
  #dataPromises = {};

  /**
   * @param {number} year
   */
  #loadData(year) {
    if (!this.#dataPromises[year]) {
      const url = `https://www.hko.gov.hk/en/gts/astronomy/files/MoonPhases_${year}.xml`;

      this.#dataPromises[year] = fetch(url)
        .then((r) => r.text())
        .then((xml) => {
          return new JSDOM(xml, { contentType: "text/xml" }).window.document;
        });
    }

    return this.#dataPromises[year];
  }

  /**
   * @returns {Promise<{ phase: number, cycle: number, time: string, julian: number }|null>}
   */
  async getPhase(date = new Date()) {
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();

    const doc = await this.#loadData(date.getFullYear());

    const phases = doc.querySelectorAll("PHASE");

    for (const phase of phases) {
      // @ts-ignore
      const y = +phase.querySelector("Y")?.textContent;
      // @ts-ignore
      const m = +phase.querySelector("M")?.textContent;
      // @ts-ignore
      const d = +phase.querySelector("D")?.textContent;

      if (y === year && m === month && d === day) {
        return {
          // @ts-ignore
          phase: +phase.getAttribute("P"),
          // @ts-ignore
          cycle: +phase.parentElement?.getAttribute("C"),
          // @ts-ignore
          time: phase.querySelector("hm")?.textContent,
          // @ts-ignore
          julian: +phase.querySelector("JD")?.textContent,
        };
      }
    }

    return null;
  }
}
