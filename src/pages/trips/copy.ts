import { COMMON_COPY } from '../../copy/common'
import { clockTime, shortDate, weekdayName } from '../../copy/formats'
import { joinParts } from '../../copy/joinParts'
import type { Period } from '../../domain/spending'

const TIME_SPAN_DASH = '–'

const PERIOD_LABELS: Record<Period, string> = { month: 'חודש', year: 'שנה' }

export const TRIPS_COPY = {
  title: COMMON_COPY.trips,
  period: 'תקופה',
  periodLabel: (period: Period) => PERIOD_LABELS[period],
  summary: (tripCount: number, average: number | undefined) =>
    joinParts([COMMON_COPY.tripCount(tripCount), average === undefined ? undefined : `ממוצע ${COMMON_COPY.shekels(average)}`]),
  withoutTotal: (count: number) => `${COMMON_COPY.tripCount(count)} בלי סכום`,
  noTotal: 'בלי סכום',
  receipt: 'קבלה',
  missingCount: (count: number) => `${COMMON_COPY.missing} ${count}`,
  empty: 'קניות שהסתיימו יופיעו כאן.',
  tripDate: (time: number) => `${weekdayName(time)} ${shortDate(time)}`,
  timeSpan: (startedAt: number, finishedAt: number) => `${clockTime(startedAt)}${TIME_SPAN_DASH}${clockTime(finishedAt)}`,
  notFound: 'הקנייה לא נמצאה',
  receipts: 'קבלות',
  deleteReceipt: (position: number) => `מחיקת קבלה ${position}`,
  deleteReceiptQuestion: COMMON_COPY.deleteQuestion('הקבלה'),
  deleteReceiptWarning: 'הצילום יימחק מהטלפון.',
  verdict: 'לפעם הבאה',
  saveAsSet: 'שמירה כערכה',
  setSaved: 'הערכה נשמרה',
  deleteTrip: 'מחיקת הקנייה',
  deleteTripQuestion: COMMON_COPY.deleteQuestion('הקנייה'),
  deleteTripWarning: 'הקנייה והקבלות שלה יימחקו. המצרכים עצמם נשארים.',
  lines: 'מצרכים',
} as const
