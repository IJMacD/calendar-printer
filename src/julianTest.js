const start = 2460667;

const points = [];

for (let i = 0; i < 24; i++) {
  const julian = start + i / 24 - 0.5;

  const hkHour = (i + 8) % 24;
  const hkFrac = hkHour / 24;
  const timeZone = 8 / 24;
  const fakeJulian = julian + timeZone;

  points.push({ utcHour: i, hkHour, julian, hkFrac, fakeJulian });
}

console.table(points);
