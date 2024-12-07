import PDFDocument from "pdfkit";
import fs from "fs";
import { getWeekDate } from "./iso8601.js";
import { Holidays } from "./holidays.js";
import { getMonday } from "./util.js";
import { printDayBoxesWithTides, printNoteLines } from "./common.js";

const holidays = new Holidays();

/**
 * @param {string} outputName
 * @param {Date} [date]
 */
export async function printWeekly(outputName, date) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 25,
  });

  doc.pipe(fs.createWriteStream(outputName));

  const startDate = getMonday(date);

  printHeader(doc, startDate);

  const { x: startX, y: startY } = doc;

  await printDayBoxesWithTides(doc, startDate, 140);

  doc.x = 25 + 125 + 2;
  doc.y = startY;
  printNoteLines(doc);

  await printPublicHolidays(doc, startDate, 545 - doc.x);

  doc.end();
}

/**
 * @param {PDFDocument} doc
 * @param {Date} date
 */
async function printHeader(doc, date) {
  doc.fontSize(18);
  doc.text(getWeekDate(date).substring(0, 8));
}

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {Date} date
 */
export async function printPublicHolidays(
  doc,
  date,
  width = 545,
  dayHeight = 105
) {
  const now = +date;

  const { x: originX, y: originY } = doc;

  for (let i = 0; i < 7; i++) {
    const date = new Date(now + i * 86400000);

    const holiday = await holidays.getHoliday(date);

    if (holiday) {
      doc.fillColor("#CCC");
      doc.text(holiday, originX, originY + i * dayHeight + 1, {
        width,
        align: "right",
      });
    }
  }
}
