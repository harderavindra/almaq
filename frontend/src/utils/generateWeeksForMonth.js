export function getWeeksForMonth(monthDate) {
  const year = monthDate.getFullYear();
  const month = monthDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);

  const weeks = [];
  let start = new Date(firstDay);

  // Align start to Monday
  start.setDate(start.getDate() - ((start.getDay() + 6) % 7));

  while (start <= lastDay) {
    const weekStart = new Date(start);
    const weekEnd = new Date(start);
    weekEnd.setDate(start.getDate() + 6);

    weeks.push({
      start: weekStart.toISOString().slice(0, 10),
      end: weekEnd.toISOString().slice(0, 10),
      label: `Week of ${weekStart.toISOString().slice(0, 10)}`
    });

    start.setDate(start.getDate() + 7);
  }

  return weeks;
}
