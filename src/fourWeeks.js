import PDFDocument from "pdfkit";
import fs from "fs";
import { getWeekDate } from "./iso8601.js";
import { Holidays } from "./holidays.js";
import { getMonday, msInOneWeek } from "./util.js";
import { printDayBoxesWithTides, printNoteLines } from "./common.js";

const holidays = new Holidays();

/**
 * @param {string} outputName
 * @param {Date} [date]
 */
export async function printFourWeeks(outputName, date = new Date()) {
  const doc = new PDFDocument({
    size: "A4",
    margin: 10,
    layout: "landscape",
  });

  doc.pipe(fs.createWriteStream(outputName));

  doc.x += 40;

  const { x: startX, y: startY } = doc;

  for (let i = 0; i < 4; i++) {
    doc.x = startX;
    doc.y = startY + i * 143;

    const d = new Date(+date + i * msInOneWeek);

    await printHorizontalWeek(doc, d);
  }

  doc.end();
}

async function printHorizontalWeek(doc, date) {
  const startDate = getMonday(date);

  printWeekHeader(doc, startDate);

  doc.x += 12;

  const { x, y } = doc;

  const dayWidth = 109;

  await printDayBoxesWithTides(doc, startDate, 900, dayWidth, 143);

  doc.x = x + 1;
  doc.y = y + 74;

  printNoteLines(doc, 826, 60, 17);

  doc.y += 2;

  await printPublicHolidays(doc, startDate, dayWidth);
}

/**
 * @param {PDFDocument} doc
 * @param {Date} date
 */
async function printWeekHeader(doc, date) {
  doc.fill("#000");
  doc.fontSize(12);

  const { x, y } = doc;
  const angle = -90;
  doc.rotate(angle, { origin: [x, y] });
  doc.text(getWeekDate(date).substring(0, 8), x - 56, y);
  doc.rotate(angle * -1, { origin: [x, y] });
  doc.x = x;
  doc.y = y;
}

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {Date} date
 */
export async function printPublicHolidays(doc, date, dayWidth = 105) {
  const now = +date;

  const { x: originX, y: originY } = doc;

  for (let i = 0; i < 7; i++) {
    const date = new Date(now + i * 86_400_000);

    const holiday = await holidays.getHoliday(date);

    if (holiday) {
      doc.fontSize(6);
      doc.fillColor("#CCC");
      doc.text(holiday, originX + i * dayWidth + 2, originY + 1, {
        width: dayWidth,
      });
    }
  }
}
