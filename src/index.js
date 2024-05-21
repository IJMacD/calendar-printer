import PDFDocument from "pdfkit";
import fs from "fs";
import { Tides } from "./tides.js";
import { getWeekDate } from "./iso8601.js";
import { Moon } from "./moon.js";
import { Holidays } from "./holidays.js";

if (process.argv.length < 3) {
    console.log(`Usage: node ${process.argv[1]} <output.pdf>`);
    process.exit(1);
}

const doc = new PDFDocument({
    size: "A4",
    margin: 25,
});

doc.pipe(fs.createWriteStream(process.argv[2]));

const tides = new Tides();
const moon = new Moon();
const holidays = new Holidays();

const dateFormatter = new Intl.DateTimeFormat("fr-CA", { year: "numeric", month: "2-digit", day: "2-digit", timeZone: "+08:00" });
const dayFormatter = new Intl.DateTimeFormat("en-GB", { weekday: "long", timeZone: "+08:00" });

const date = getMonday();

printHeader(doc, date);

const { x: startX, y: startY } = doc;

await printTideInfo(doc, date, 140);

doc.x = 25 + 125 + 2;
doc.y = startY;
printNoteLines(doc);

await printPublicHolidays(doc, date, 545 - doc.x);

doc.end();

/**
 * @param {PDFDocument} doc
 * @param {Date} date
 */
async function printHeader(doc, date) {
    doc.fontSize(18);
    doc.text(getWeekDate(date).substring(0, 8));
}

/**
 * @param {PDFDocument} doc
 * @param {Date} date
 * @param {number} [width]
 */
async function printTideInfo(doc, date, width = 545.276) {
    const now = +date;

    const originX = doc.x;
    const originY = doc.y;

    const tideBoxWidth = 125;
    const tideBoxHeight = 105;

    const columnCount = Math.floor(width / tideBoxWidth);

    const barWidth = 35;
    const barHeight = 8;

    const maxHighTide = 2.5;

    doc.fontSize(10);

    for (let i = 0; i < 7; i++) {
        const date = new Date(now + i * 86400000);

        const row = Math.floor(i / columnCount);
        const col = i % columnCount;

        doc.x = originX + col * tideBoxWidth;
        doc.y = originY + row * tideBoxHeight;

        doc.rect(doc.x, doc.y, tideBoxWidth, tideBoxHeight);
        doc.stroke();

        doc.x += 10;
        doc.y += 10;

        // Date/Day
        doc.text(dateFormatter.format(date));
        doc.text(dayFormatter.format(date));

        // Moon
        const { x, y } = doc;
        doc.x += 95;
        doc.y -= 14;
        await printMoonPhase(doc, date);
        doc.x = x;
        doc.y = y;

        doc.moveDown();

        const tideTimes = await tides.getTides(date);

        for (const { time, height } of tideTimes) {
            const { x, y } = doc;

            doc.text(`${height.toFixed(2)}m @ ${time}`);

            // Chart
            doc.rect(x + 70, y, barWidth, barHeight);
            doc.stroke();
            doc.rect(x + 70, y, barWidth * (height / maxHighTide), barHeight);
            doc.fill();
        }
    }
}

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {Date} date
 */
async function printMoonPhase(doc, date) {
    const moonPhase = await moon.getPhase(date);
    if (moonPhase) {
        const { x, y } = doc;
        const r = 5;
        const r2 = r * 2;
        const cx = x + r;
        const cy = y + r;

        doc.save();

        doc.circle(cx, cy, r).stroke();

        switch (moonPhase.phase) {
            case 0:
                doc.fill();
                break;
            case 1:
                doc.rect(cx, y, r, r2).clip();
                doc.circle(cx, cy, r).fill();
            case 3:
                doc.rect(x, y, r, r2).clip();
                doc.circle(cx, cy, r).fill();
        }

        doc.restore();
    }
}

/**
 * @param {PDFKit.PDFDocument} doc
 */
function printNoteLines(doc, width = 545.276, height = 735, spacing = 8.75) {
    const { x: originX, y: originY } = doc;

    for (let i = 0; i <= height; i += spacing) {
        doc.moveTo(originX, i + originY);
        doc.lineTo(width, i + originY);
    }

    doc.lineWidth(0.5);
    doc.dash(2, { space: 2 });
    doc.stroke("#CCC");
}

/**
 * @param {PDFKit.PDFDocument} doc
 * @param {Date} date
 */
async function printPublicHolidays(doc, date, width = 545, dayHeight = 105) {
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

function getMonday(refDate = new Date) {
    const msPerDay = 86_400_000;
    return new Date(Math.floor((+refDate - (refDate.getDay() - 1) * msPerDay) / msPerDay) * msPerDay);
}