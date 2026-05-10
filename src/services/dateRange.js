const millisecondsPerDay = 24 * 60 * 60 * 1000;

function parseDateOnly(value) {
  if (!value) {
    return null;
  }

  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day));
}

export function calculateTripDuration(startDate, endDate) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end || end < start) {
    return 1;
  }

  return Math.floor((end - start) / millisecondsPerDay) + 1;
}

export function getMinEndDate(startDate) {
  return startDate || undefined;
}

export function formatTripDates(startDate, endDate) {
  const start = parseDateOnly(startDate);
  const end = parseDateOnly(endDate);

  if (!start || !end) {
    return 'Dates not selected';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    timeZone: 'UTC'
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
}
