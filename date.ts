import { range } from './object';
import { pluralize } from './string';
import { ExcludeFalsy } from './common';
import persisted from './io/persisted';
import { getDomainColor } from './colors';
import { CALENDAR_TITLES } from './privateConfig';
import { compose, filter, map, toArray } from './arrayTransducers';

// ts-unused-exports:disable-next-line
export const ONE_MILLISECOND = 1;
// ts-unused-exports:disable-next-line
export const ONE_SECOND = ONE_MILLISECOND * 1000;
// ts-unused-exports:disable-next-line
export const ONE_MINUTE = ONE_SECOND * 60;
// ts-unused-exports:disable-next-line
export const ONE_HOUR = ONE_MINUTE * 60;

//
// HELPERS
//

/** Round date down to 00:00, useful for grouping by date. Optionally set h/m/s/ms */
export const stripTime = (
  dateObj = new Date(),
  { hours = 0, minutes = 0, seconds = 0, ms = 0 } = {}
) => {
  const newDate = new Date(dateObj);
  newDate.setHours(hours, minutes, seconds, ms);
  return newDate;
};

export const msBetween = (laterDate: Date, earlierDate: Date) =>
  laterDate.getTime() - earlierDate.getTime();

export const latestDate = (d1: Date, d2: Date) =>
  new Date(Math.max(d1.getTime(), d2.getTime()));

const getTimeUnitBetween =
  (unitInMs: number) => (laterDate: Date, earlierDate: Date) =>
    Math.floor(msBetween(laterDate, earlierDate) / unitInMs);

// ts-unused-exports:disable-next-line
export const secondsBetween = getTimeUnitBetween(ONE_SECOND);
export const minutesBetween = getTimeUnitBetween(ONE_MINUTE);
export const daysBetween = getTimeUnitBetween(24 * ONE_HOUR);

/**
 * Calculates number of full months from the provided date.
 * For example, Charlie was born on 2020-07-19, today is 2021-03-10.
 * Full months since her birth would be 7, and will be 8 on 2021-03-19.
 */
// ts-unused-exports:disable-next-line
export const countFullMonthsFromDate = (d: Date) => {
  const now = new Date();
  const yearMonths = (now.getFullYear() - d.getFullYear()) * 12;
  const includeCurrMonth = now.getDate() >= d.getDate();
  return (
    yearMonths - d.getMonth() + now.getMonth() - (includeCurrMonth ? 0 : 1)
  );
};

export const hoursToMs = (hours: number) => hours * ONE_HOUR;

/** Check if day, month, and year are the same for 2 dates. Can not use === on date objects */
export const isSameDay = (d1: Date, d2: Date) =>
  d1.getFullYear() === d2.getFullYear() &&
  d1.getMonth() === d2.getMonth() &&
  d1.getDate() === d2.getDate();

type DateFormat =
  | 'YYYYMMDD'
  | 'HHMM'
  | 'HHMMSS'
  | 'HHMMSSMMM'
  // E.g. Sun, Jan 26
  | 'DDDMMMDD'
  // Jan 27
  | 'MMMDD'
  // 06/27
  | 'MMDDNum'
  // 12/3/86
  | 'MMDDYY'
  // 12/03/86
  | 'MMDDYYWithPadding'
  | 'shortMMDDYY'
  | 'dayOfWeekNameFull'
  | 'dayOfWeekNameShort';
export const formatDate = (date: Date, format: DateFormat) => {
  const HHMM = [
    String(date.getHours()).padStart(2, '0'),
    String(date.getMinutes()).padStart(2, '0'),
  ].join(':');
  switch (format) {
    case 'YYYYMMDD':
      return [
        date.toLocaleDateString(undefined, { year: 'numeric' }),
        date.toLocaleDateString(undefined, { month: '2-digit' }),
        date.toLocaleDateString(undefined, { day: '2-digit' }),
      ].join('-');

    case 'HHMM':
      return HHMM;

    case 'HHMMSS':
      return [HHMM, String(date.getSeconds()).padStart(2, '0')].join(':');

    case 'HHMMSSMMM':
      return [
        HHMM,
        String(date.getSeconds()).padStart(2, '0'),
        String(date.getMilliseconds()).padStart(3, '0'),
      ].join(':');

    case 'DDDMMMDD':
      return date.toLocaleDateString(undefined, {
        weekday: 'short',
        month: 'short',
        day: '2-digit',
      });

    case 'MMMDD':
      return date.toLocaleDateString(undefined, {
        month: 'short',
        day: '2-digit',
      });

    case 'MMDDNum':
      return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
      });

    case 'MMDDYY':
      return `${date.getMonth() + 1}/${date.getDate()}/${String(
        date.getFullYear()
      ).slice(2)}`;

    case 'MMDDYYWithPadding':
      return date.toLocaleDateString(undefined, {
        month: '2-digit',
        day: '2-digit',
        year: '2-digit',
      });

    case 'shortMMDDYY':
      return date.toLocaleDateString(undefined, {
        year: '2-digit',
        month: 'numeric',
        day: 'numeric',
      });

    case 'dayOfWeekNameFull':
      return date.toLocaleString('en-us', { weekday: 'long' });

    case 'dayOfWeekNameShort':
      return date.toLocaleString('en-us', { weekday: 'short' });
  }
};

/** Only valid for year >= 2000 */
export const isIsoDateStr = (str: string) => /^20[12]\d-\d{2}-\d{2}$/.test(str);

export const addToDate = (
  date: Date,
  { months = 0, days = 0, hours = 0, minutes = 0, seconds = 0, ms = 0 } = {}
) => {
  const dateClone = new Date(date);
  dateClone.setMonth(date.getMonth() + months);
  dateClone.setDate(date.getDate() + days);
  dateClone.setHours(
    date.getHours() + hours,
    date.getMinutes() + minutes,
    date.getSeconds() + seconds,
    date.getMilliseconds() + ms
  );
  return dateClone;
};

export const isWeekend = (date = new Date()) =>
  ['Sat', 'Sun'].includes(formatDate(date, 'dayOfWeekNameShort'));

export const getSubsequentDayOfWeek = (
  shortDayName: string,
  startDate = new Date()
): Date => {
  if (formatDate(startDate, 'dayOfWeekNameShort') === shortDayName)
    return stripTime(startDate);
  return getSubsequentDayOfWeek(
    shortDayName,
    addToDate(startDate, { days: 1 })
  );
};

/** Input startDate & num days in range, get back an array of dates in YYYYMMDD format */
// ts-unused-exports:disable-next-line
export const getIsoDateRange = (startDate: Date, numDays: number) =>
  range(0, numDays).map(daysToAdd =>
    formatDate(addToDate(startDate, { days: daysToAdd }), 'YYYYMMDD')
  );

export const msToHours = (ms: number) => ms / 1000 / 60 / 60;

// ts-unused-exports:disable-next-line
export const msToDays = (ms: number) => msToHours(ms) / 24;

/** Return legible string, e.g. "10 seconds", "5 minutes", "1 hour 4 minutes", etc. */
export const readableMs = (
  ms: number,
  { includeSeconds = true, useAbbrev = false } = {}
) => {
  const numSeconds = ms / 1000;
  const numMinutes = numSeconds / 60;
  const numHours = numMinutes / 60;
  const h = Math.floor(numHours);
  const m = Math.floor(numMinutes % 60);
  const s = Math.floor(numSeconds % 60);

  if (numSeconds >= 1) {
    const hLabel = useAbbrev ? 'h' : pluralize('hour', h);
    const mLabel = useAbbrev ? 'm' : pluralize('minute', m);
    const sLabel = useAbbrev ? 's' : pluralize('second', s);
    const numLabelSeparator = useAbbrev ? '' : ' ';
    return [
      numHours >= 1 && `${h}${numLabelSeparator}${hLabel}`,
      numMinutes >= 1 && `${m}${numLabelSeparator}${mLabel}`,
      includeSeconds && `${s}${numLabelSeparator}${sLabel}`,
    ]
      .filter(Boolean)
      .join(', ');
  }
  return includeSeconds ? '0 seconds' : '';
};

const getReadableDaysLabel = (dayGap: number, abbreviate: boolean) => {
  switch (dayGap) {
    case 0:
      return abbreviate ? 'Tod.' : 'Today';
    case 1:
      return abbreviate ? 'Tom.' : 'Tomorrow';
    case -1:
      return abbreviate ? 'Yest.' : 'Yesterday';
    default:
      return null;
  }
};

export const getReadableDaysFromNowLabel = (date: Date, abbreviate = false) => {
  const daysFromNow = daysBetween(stripTime(date), stripTime());
  return getReadableDaysLabel(daysFromNow, abbreviate);
};

export const readableDaysBetween = (
  laterDate: Date,
  earlierDate: Date,
  abbreviate = false
) => {
  const days = daysBetween(earlierDate, laterDate);
  return getReadableDaysLabel(days, abbreviate) || `${days}d`;
};

export const getIsoTimestamp = (date = new Date()) => date.toISOString();

//
// CALENDAR FUNCTIONS
//

const getCalDomain = (cal: Calendar): Domain | null => {
  switch (cal.title) {
    case CALENDAR_TITLES.PERSONAL:
      return 'personal';
    case CALENDAR_TITLES.WORK:
      return 'work';
    default:
      return null;
  }
};

export const getPrimaryCalColor = (cal: Calendar): Color => {
  const domain = getCalDomain(cal);
  if (!domain) throw new Error('No cal color');
  return getDomainColor(domain);
};

export const getEventDomain = (event: CalendarEvent): Domain => {
  const { title: calTitle } = event.calendar;
  if (!Object.values(CALENDAR_TITLES).includes(calTitle))
    throw new Error('Events in non-domain calendars have no domain!');
  return calTitle === CALENDAR_TITLES.PERSONAL ? 'personal' : 'work';
};

export const getAllEventCals = async () =>
  Promise.all(
    toArray(
      Object.values(CALENDAR_TITLES),
      compose(filter(ExcludeFalsy), map(Calendar.forEventsByTitle))
    )
  );

export const calBlacklistTitles = persisted<string[]>({
  filename: 'calBlacklistTitles',
  defaultData: [],
});

export const initEventBlacklistCache = () => calBlacklistTitles.getData();

export const excludeBlacklistedEvents = () =>
  filter(
    (event: CalendarEvent) =>
      !calBlacklistTitles.has({ item: event.title, useCache: true })
  );

/** Get all events within x days in the past or future from now */
export const getEventsInXDayRadius = async (x: number) => {
  const NOW = new Date();
  const allCals = await getAllEventCals();
  const startDate = addToDate(NOW, { days: -1 * x });
  const endDate = addToDate(NOW, { days: x });
  return await CalendarEvent.between(startDate, endDate, allCals);
};

export const getEventsBetweenNowAndXDays = async (x: number) => {
  const NOW = new Date();
  const allCals = await getAllEventCals();
  const inXDays = addToDate(NOW, { days: x });
  const startDate = x <= 0 ? inXDays : NOW;
  const endDate = x <= 0 ? NOW : inXDays;
  await initEventBlacklistCache();
  return toArray(
    await CalendarEvent.between(startDate, endDate, allCals),
    excludeBlacklistedEvents()
  );
};

export const getTodayEvents = async () => {
  const allCals = await getAllEventCals();
  return await CalendarEvent.today(allCals);
};

// ts-unused-exports:disable-next-line
export const getEventsOnDate = async (date: Date) => {
  const allCals = await getAllEventCals();
  const start = stripTime(date);
  const dayAfterDateStart = addToDate(start, { days: 1 });
  const end = addToDate(dayAfterDateStart, { seconds: -1 });
  return await CalendarEvent.between(start, end, allCals);
};

export type EventWithStatus = {
  event: CalendarEvent;
  isCompleted: boolean;
  isOngoing: boolean;
  isFuture: boolean;
};
export const enhanceCalEventsWithStatus = () => {
  const NOW = new Date();
  return map(
    (event: CalendarEvent): EventWithStatus => ({
      event,
      isCompleted: event.endDate < NOW,
      isOngoing: event.startDate <= NOW && event.endDate >= NOW,
      isFuture: event.startDate > NOW,
    })
  );
};
