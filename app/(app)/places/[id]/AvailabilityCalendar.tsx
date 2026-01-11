import { useState, type ReactNode } from "react";

const WEEKDAYS = ["Pn", "Wt", "Śr", "Cz", "Pt", "So", "Nd"];

export type AvailabilityRange = { id: string; startDate: string; endDate: string };

export type BookingRange = {
  id: string;
  startDate: string;
  endDate: string;
  status: "requested" | "approved";
  isMine: boolean;
};

type AvailabilityCalendarProps = {
  availability?: AvailabilityRange[];
  bookings?: BookingRange[];
  selectedStart: Date | null;
  selectedEnd: Date | null;
  onSelectDay: (date: Date) => void;
  monthsToShow?: number;
  view?: "month" | "year";
  minDate?: Date;
  isDateDisabled?: (date: Date) => boolean;
  footer?: ReactNode;
};

const dayStart = (date: Date) => new Date(date.getFullYear(), date.getMonth(), date.getDate());

const isSameDay = (left: Date, right: Date) =>
  left.getFullYear() === right.getFullYear() &&
  left.getMonth() === right.getMonth() &&
  left.getDate() === right.getDate();

const isBeforeDay = (left: Date, right: Date) => dayStart(left).getTime() < dayStart(right).getTime();

const isAfterDay = (left: Date, right: Date) => dayStart(left).getTime() > dayStart(right).getTime();

const isBetweenInclusive = (day: Date, start: Date, end: Date) => {
  const value = dayStart(day).getTime();
  return value >= dayStart(start).getTime() && value <= dayStart(end).getTime();
};

const addMonths = (base: Date, offset: number) => new Date(base.getFullYear(), base.getMonth() + offset, 1);

const getDaysInMonth = (date: Date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

const getMonthLabel = (date: Date) =>
  date.toLocaleDateString("pl-PL", {
    month: "long",
    year: "numeric"
  });

const getMonthMatrix = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstOfMonth = new Date(year, month, 1);
  const startOffset = (firstOfMonth.getDay() + 6) % 7;
  const totalDays = getDaysInMonth(firstOfMonth);
  const slots: Array<Date | null> = [];

  for (let i = 0; i < startOffset; i += 1) {
    slots.push(null);
  }

  for (let day = 1; day <= totalDays; day += 1) {
    slots.push(new Date(year, month, day));
  }

  return slots;
};

const isDayAvailable = (day: Date, availability?: AvailabilityRange[]) => {
  if (!availability || availability.length === 0) return false;
  return availability.some((range) => {
    const start = new Date(range.startDate);
    const end = new Date(range.endDate);
    return isBetweenInclusive(day, start, end);
  });
};

const getAvailabilityEndForStart = (start: Date, availability?: AvailabilityRange[]) => {
  if (!availability) return null;
  const startValue = dayStart(start).getTime();
  const match = availability.find((range) => {
    const rangeStart = dayStart(new Date(range.startDate)).getTime();
    const rangeEnd = dayStart(new Date(range.endDate)).getTime();
    return startValue >= rangeStart && startValue < rangeEnd;
  });
  return match ? dayStart(new Date(match.endDate)) : null;
};

type BookingStatusKey = "approved-other" | "approved-mine" | "requested-other" | "requested-mine";

const getBookingStatus = (day: Date, bookings?: BookingRange[]) => {
  if (!bookings || bookings.length === 0) return null;
  const priorities: Record<BookingStatusKey, number> = {
    "approved-other": 4,
    "approved-mine": 3,
    "requested-other": 2,
    "requested-mine": 1
  };
  let bestKey: BookingStatusKey | null = null;
  let bestPriority = -1;

  bookings.forEach((booking) => {
    const start = new Date(booking.startDate);
    const end = new Date(booking.endDate);
    if (!isBetweenInclusive(day, start, end)) return;
    const key =
      booking.status === "approved"
        ? booking.isMine
          ? "approved-mine"
          : "approved-other"
        : booking.isMine
          ? "requested-mine"
          : "requested-other";
    const priority = priorities[key];
    if (priority > bestPriority) {
      bestPriority = priority;
      bestKey = key;
    }
  });

  return bestKey;
};

export function AvailabilityCalendar({
  availability,
  bookings,
  selectedStart,
  selectedEnd,
  onSelectDay,
  monthsToShow = 1,
  view = "month",
  minDate,
  isDateDisabled,
  footer
}: AvailabilityCalendarProps) {
  const today = dayStart(new Date());
  const minDay = minDate ? dayStart(minDate) : today;
  const [monthOffset, setMonthOffset] = useState(0);
  const [yearOffset, setYearOffset] = useState(0);
  const baseYear = new Date(today.getFullYear() + yearOffset, 0, 1);
  const months =
    view === "year"
      ? Array.from({ length: 12 }, (_, index) => addMonths(baseYear, index))
      : Array.from({ length: monthsToShow }, (_, index) => addMonths(today, monthOffset + index));

  return (
    <div className="availability-calendar">
      {view === "year" ? (
        <div className="availability-calendar__nav">
          <button
            type="button"
            className="availability-calendar__nav-button"
            onClick={() => setYearOffset((current) => current - 1)}
          >
            ←
          </button>
          <span className="availability-calendar__year-label">{today.getFullYear() + yearOffset}</span>
          <button
            type="button"
            className="availability-calendar__nav-button"
            onClick={() => setYearOffset((current) => current + 1)}
          >
            →
          </button>
        </div>
      ) : null}
      <div
        className={`availability-calendar__months ${
          view === "year" ? "availability-calendar__months--year" : ""
        }`}
      >
        {months.map((month) => (
          <div key={`${month.getFullYear()}-${month.getMonth()}`} className="availability-calendar__month">
            <div className="availability-calendar__header">
              {view === "month" ? (
                <button
                  type="button"
                  className="availability-calendar__nav-button"
                  onClick={() => setMonthOffset((current) => current - 1)}
                >
                  ←
                </button>
              ) : null}
              <span className="availability-calendar__month-label">{getMonthLabel(month)}</span>
              {view === "month" ? (
                <button
                  type="button"
                  className="availability-calendar__nav-button"
                  onClick={() => setMonthOffset((current) => current + 1)}
                >
                  →
                </button>
              ) : null}
            </div>
            <div className="availability-calendar__weekdays">
              {WEEKDAYS.map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="availability-calendar__grid">
              {getMonthMatrix(month).map((day, index) => {
                if (!day) {
                  return <span key={`empty-${index}`} className="availability-calendar__empty" />;
                }

                const available = isDayAvailable(day, availability);
                const disabled =
                  isBeforeDay(day, minDay) ||
                  (typeof isDateDisabled === "function" && isDateDisabled(day));
                const isStart = selectedStart ? isSameDay(day, selectedStart) : false;
                const isEnd = selectedEnd ? isSameDay(day, selectedEnd) : false;
                const inRange =
                  selectedStart && selectedEnd ? isBetweenInclusive(day, selectedStart, selectedEnd) : false;
                const isToday = isSameDay(day, today);
                const bookingStatus = getBookingStatus(day, bookings);
                const endLimit =
                  selectedStart && !selectedEnd ? getAvailabilityEndForStart(selectedStart, availability) : null;
                const isSelectableBoundary = endLimit ? isSameDay(day, endLimit) : false;

                const classNames = ["availability-calendar__day"];
                if ((available || isSelectableBoundary) && !bookingStatus)
                  classNames.push("availability-calendar__day--available");
                if (bookingStatus === "approved-mine") classNames.push("availability-calendar__day--booked-mine");
                if (bookingStatus === "approved-other") classNames.push("availability-calendar__day--booked-other");
                if (bookingStatus === "requested-mine") classNames.push("availability-calendar__day--pending-mine");
                if (bookingStatus === "requested-other") classNames.push("availability-calendar__day--pending-other");
                if (inRange) classNames.push("availability-calendar__day--range");
                if (isStart || isEnd) classNames.push("availability-calendar__day--selected");
                if (disabled) classNames.push("availability-calendar__day--disabled");
                if (isToday) classNames.push("availability-calendar__day--today");

                return (
                  <button
                    type="button"
                    key={day.toISOString()}
                    className={classNames.join(" ")}
                    onClick={() => {
                      if (disabled) return;
                      onSelectDay(day);
                    }}
                  >
                    {day.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>
      <div className="availability-calendar__legend">
        <span className="availability-calendar__legend-item">
          <span className="availability-calendar__swatch availability-calendar__swatch--available" />
          Dostępne dni
        </span>
        <span className="availability-calendar__legend-item">
          <span className="availability-calendar__swatch availability-calendar__swatch--pending-mine" />
          Twoje oczekujące
        </span>
        <span className="availability-calendar__legend-item">
          <span className="availability-calendar__swatch availability-calendar__swatch--pending-other" />
          Oczekujące innych
        </span>
        <span className="availability-calendar__legend-item">
          <span className="availability-calendar__swatch availability-calendar__swatch--booked-mine" />
          Zarezerwowane przez Ciebie
        </span>
        <span className="availability-calendar__legend-item">
          <span className="availability-calendar__swatch availability-calendar__swatch--booked-other" />
          Zarezerwowane
        </span>
        <span className="availability-calendar__legend-item">
          <span className="availability-calendar__swatch availability-calendar__swatch--range" />
          Wybrany zakres
        </span>
      </div>
      {footer ? <div className="availability-calendar__footer">{footer}</div> : null}
    </div>
  );
}
