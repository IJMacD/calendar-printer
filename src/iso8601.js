
/**
 * @param {Date} date
 */
export function getWeekDate(date = new Date) {
    const { year, week, day } = getWeekDateParts(date);

    return `${year.toString().padStart(4, "0")}-W${week.toString().padStart(2, "0")}-${day}`;
}

/**
 * ISO Week Number
 * Algorithm from https://www.tondering.dk/claus/cal/week.php
 * @param {Date} date
 */
export function getWeekDateParts(date) {
    let n, g, s, d;

    // Special case for 0000-01-01
    if (date.getFullYear() === 0 && date.getMonth() === 0 && date.getDate() === 1) {
        return { year: 0, week: 52, day: date.getDay() };
    }

    if (date.getMonth() < 2) {
        const a = date.getFullYear() - 1;
        const b = Math.floor(a / 4) - Math.floor(a / 100) + Math.floor(a / 400);
        const c = Math.floor((a - 1) / 4) - Math.floor((a - 1) / 100) + Math.floor((a - 1) / 400);
        s = b - c;
        const e = 0;
        const f = date.getDate() - 1 + 31 * date.getMonth();
        g = (a + b) % 7;
        d = (f + g - e) % 7;
        n = f + 3 - d;
    }
    else {
        const a = date.getFullYear();
        const b = Math.floor(a / 4) - Math.floor(a / 100) + Math.floor(a / 400);
        const c = Math.floor((a - 1) / 4) - Math.floor((a - 1) / 100) + Math.floor((a - 1) / 400);
        s = b - c;
        const e = s + 1;
        const f = date.getDate() + Math.floor((153 * (date.getMonth() - 2) + 2) / 5) + 58 + s;
        g = (a + b) % 7;
        d = (f + g - e) % 7;
        n = f + 3 - d;
    }

    let year, week, day = d + 1;

    if (n < 0) {
        year = date.getFullYear() - 1;
        week = 53 - Math.floor((g - s) / 5);
    }
    else if (n > 364 + s) {
        year = date.getFullYear() + 1;
        week = 1;
    }
    else {
        year = date.getFullYear();
        week = Math.floor(n / 7) + 1;
    }

    return {
        year,
        week,
        day
    };
}

// /**
//  * ISO Week Day
//  * 1 = Mon, 7 = Sun
//  */
// int datetimeGetWeekDay(struct DateTime * dt) {
//     struct DateTime dt2 = * dt;
//     dt2.hour = 12;
//     int julian = datetimeGetJulian(& dt2);
//     return (julian % 7) + 1;
// }

// /**
//  * Respects hour field in DateTime struct
//  * i.e. if dt->hour == 0 then gives JD at midnight
//  * Algorithm from https://quasar.as.utexas.edu/BillInfo/JulianDatesG.html
//  */
// int datetimeGetJulian(struct DateTime * dt) {
//     int y = dt -> year;
//     int m = dt -> month;
//     int d = dt -> day;

//     if (m < 3) {
//         y--;
//         m += 12;
//     }

//     int a = y / 100;
//     int b = a / 4;
//     int c = 2 - a + b;
//     int e = 365.25 * (y + 4716);
//     int f = 30.6001 * (m + 1);

//     int h = dt -> hour;

//     int g = h < 12 ? 1 : 0;

//     return c + d + e + f - 1524 - g;
// }

// /**
//  * Algorithm from https://quasar.as.utexas.edu/BillInfo/JulianDatesG.html
//  */
// void datetimeFromJulian(struct DateTime * dt, int julian) {
//     int Z = julian + 1;
//     int W = (Z - 1867216.25) / 36524.25;
//     int X = W / 4;
//     int A = Z + 1 + W - X;
//     int B = A + 1524;
//     int C = (B - 122.1) / 365.25;
//     int D = 365.25 * C;
//     int E = (B - D) / 30.6001;
//     int F = 30.6001 * E;

//     dt -> day = B - D - F;
//     dt -> month = E - 1;
//     if (dt -> month > 12) {
//         dt -> month -= 12;
//     }
//     dt -> year = dt -> month <= 2 ? C - 4715 : C - 4716;
// }