export const msPerDay = 86_400_000;
export const msInOneWeek = msPerDay * 7;

export function getMonday(refDate = new Date()) {
  return new Date(
    Math.floor((+refDate - (refDate.getDay() - 1) * msPerDay) / msPerDay) *
      msPerDay
  );
}
