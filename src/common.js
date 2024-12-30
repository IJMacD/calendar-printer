import { Moon } from "./moon.js";
import { Tides } from "./tides.js";

const moon = new Moon();
const tides = new Tides();
const timeZone = "Asia/Hong_Kong";

const dateFormatter = new Intl.DateTimeFormat("fr-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone,
});
const dayFormatter = new Intl.DateTimeFormat("en-GB", {
  weekday: "long",
  timeZone,
});

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {Date} date
 * @param {number} [horizontalScope]
 */
export async function printMoonPhase(doc, date, horizontalScope = 0) {
  const moonPhase = await moon.getPhase(date);
  if (moonPhase) {
    // HKO does not know how the fuck julian day numbers work
    const fakeJulian = moonPhase.julian;
    const timeZone = 8 / 24;
    const realJulian = fakeJulian - timeZone;

    const dayFrac = (realJulian + 0.5 + timeZone) % 1;

    const { x, y } = doc;
    const r = 5;
    const r2 = r * 2;
    const cx = x + r + horizontalScope * dayFrac;
    const cy = y + r2;

    if (horizontalScope > 0) {
      doc.moveTo(x, y - 2);
      doc.lineTo(x, y + r2);

      doc.moveTo(x + horizontalScope / 4, y - 2);
      doc.lineTo(x + horizontalScope / 4, y + r2);

      doc.moveTo(x + horizontalScope / 2, y - 2);
      doc.lineTo(x + horizontalScope / 2, y + r2);

      doc.moveTo(x + 3 * horizontalScope / 4, y - 2);
      doc.lineTo(x + 3 * horizontalScope / 4, y + r2);

      doc.moveTo(x + horizontalScope, y - 2);
      doc.lineTo(x + horizontalScope, y + r2);

      doc.lineWidth(0.5);
      doc.dash(2, { space: 2 });
      doc.stroke("#CCC");
      doc.undash();
    }

    doc.stroke("#000");
    doc.fill("#FFF");
    doc.lineWidth(1);

    doc.circle(cx - r, cy - r, r).fill();
    doc.circle(cx - r, cy - r, r).stroke();

    doc.fill("#000");

    doc.save();

    switch (moonPhase.phase) {
      case 0:
        doc.circle(cx - r, cy - r, r).fill();
        break;
      case 1:
        doc.rect(cx - r2, y, r, r2).clip();
        doc.circle(cx - r, cy - r, r).fill();
        break;
      case 3:
        doc.rect(cx - r, y, r, r2).clip();
        doc.circle(cx - r, cy - r, r).fill();
        break;
    }

    // Release clip
    doc.restore();
  }
}

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {Date} date
 * @param {number} [width]
 */
export async function printDayBoxesWithTides(
  doc,
  date,
  width = 545.276,
  boxWidth = 125,
  boxHeight = 105
) {
  const now = +date;

  const originX = doc.x;
  const originY = doc.y;

  const columnCount = Math.floor(width / boxWidth);

  const barWidth = 33;
  const barHeight = 8;

  const maxHighTide = 2.5;

  doc.fontSize(10);

  for (let i = 0; i < 7; i++) {
    const date = new Date(now + i * 86400000);

    const row = Math.floor(i / columnCount);
    const col = i % columnCount;

    const dayOriginX = originX + col * boxWidth;

    doc.x = dayOriginX;
    doc.y = originY + row * boxHeight;

    doc.lineWidth(1);
    doc.stroke("#000");
    doc.rect(doc.x, doc.y, boxWidth, boxHeight);
    doc.stroke();

    doc.x += 3;
    doc.y += 5;

    // Date/Day
    doc.text(`${dateFormatter.format(date)} ${dayFormatter.format(date)}`);

    // Moon
    const { x, y } = doc;
    doc.x = dayOriginX + 5;
    await printMoonPhase(doc, date, boxWidth - 10);
    doc.x = x;
    doc.y = y;

    doc.moveDown();

    const tideTimes = await tides.getTides(date);

    for (const { time, height } of tideTimes) {
      const { x, y } = doc;

      doc.fill("#000");
      doc.text(`${height.toFixed(2)}m @ ${time}`);

      // Chart
      doc.stroke("#000");
      doc.rect(x + 70, y, barWidth, barHeight);
      doc.stroke();
      doc.rect(x + 70, y, barWidth * (height / maxHighTide), barHeight);
      doc.fill();
    }
  }
}

/**
 * @param {PDFKit.PDFDocument} doc
 */
export function printNoteLines(
  doc,
  width = 545.276,
  height = 735,
  spacing = 8.75
) {
  const { x: originX, y: originY } = doc;

  for (let i = 0; i <= height; i += spacing) {
    doc.moveTo(originX, i + originY);
    doc.lineTo(width, i + originY);
  }

  doc.lineWidth(0.5);
  doc.dash(2, { space: 2 });
  doc.stroke("#CCC");
  doc.undash();
}
