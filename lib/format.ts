export const LOCALE = "de-DE";

export const eur = (n: number) =>
  n.toLocaleString(LOCALE, { maximumFractionDigits: 0 }) + " €";

export const pct = (part: number, total: number) =>
  total <= 0 ? "0%" : Math.min(100, Math.round((part / total) * 100)) + "%";

export const initials = (name: string) =>
  name
    .replace(/^(Familie|Praxis Dr\.|Schreinerei|Malerbetrieb)\s/, "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const WD_LONG = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag"];
const WD_SHORT = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const MONTHS = [
  "Januar", "Februar", "März", "April", "Mai", "Juni",
  "Juli", "August", "September", "Oktober", "November", "Dezember",
];

export const formatLongDate = (iso: string) => {
  const dt = new Date(iso);
  return `${WD_LONG[dt.getDay()]}, ${dt.getDate()}. ${MONTHS[dt.getMonth()]}`;
};

export const formatMonthYear = (iso: string) => {
  const dt = new Date(iso);
  return `${MONTHS[dt.getMonth()]} ${dt.getFullYear()}`;
};

export const formatTime = (iso: string) => {
  const dt = new Date(iso);
  return `${String(dt.getHours()).padStart(2, "0")}:${String(dt.getMinutes()).padStart(2, "0")}`;
};

export const weekdayShort = (iso: string) => WD_SHORT[new Date(iso).getDay()];
export const weekdayLong = (iso: string) => WD_LONG[new Date(iso).getDay()];

export const dateKey = (isoDateTime: string) => isoDateTime.slice(0, 10);

export const addDays = (iso: string, n: number) => {
  const dt = new Date(iso);
  dt.setDate(dt.getDate() + n);
  return dt.toISOString().slice(0, 10);
};

export const isoCalendarWeek = (iso: string) => {
  const d = new Date(iso);
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const week1 = new Date(d.getFullYear(), 0, 4);
  return 1 + Math.round(((d.getTime() - week1.getTime()) / 86400000 - 3 + ((week1.getDay() + 6) % 7)) / 7);
};

// Montag der ISO-Woche zu einem Datum
export const startOfISOWeek = (iso: string) => {
  const d = new Date(iso);
  const day = (d.getDay() + 6) % 7; // Mo=0..So=6
  d.setDate(d.getDate() - day);
  return d.toISOString().slice(0, 10);
};

export const relativeFromNow = (isoDateTime: string, nowIso: string) => {
  const then = new Date(isoDateTime).getTime();
  const now = new Date(nowIso).getTime();
  const diffDays = Math.round((now - then) / 86400000);
  if (diffDays <= 0) return "heute";
  if (diffDays === 1) return "gestern";
  if (diffDays < 7) return `vor ${diffDays} Tagen`;
  if (diffDays < 14) return "vor 1 Woche";
  const weeks = Math.round(diffDays / 7);
  if (weeks < 5) return `vor ${weeks} Wochen`;
  const months = Math.round(diffDays / 30);
  return `vor ${months} Monaten`;
};
