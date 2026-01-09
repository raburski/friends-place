export type AvailabilityRange = {
  id: string;
  startDate: string;
  endDate: string;
};

export function isWithinRange(start: Date, end: Date, range: AvailabilityRange) {
  const rangeStart = new Date(range.startDate);
  const rangeEnd = new Date(range.endDate);
  return start >= rangeStart && end <= rangeEnd;
}

export function findMatchingRange(start: Date, end: Date, ranges: AvailabilityRange[]) {
  return ranges.find((range) => isWithinRange(start, end, range));
}
