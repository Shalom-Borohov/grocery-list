import { COMMON_COPY } from '../../copy/common'
import { joinParts } from '../../copy/joinParts'

export const LIST_COPY = {
  title: COMMON_COPY.list,
  rowDetails: (name: string) => `כמות ומחיר: ${name}`,
  rowPhoto: (name: string) => `${COMMON_COPY.photo}: ${name}`,
  rowTick: (name: string) => `נלקח: ${name}`,
  empty: 'הרשימה ריקה. מה שנגמר בבית מוסיפים בכפתור +.',
  left: 'נשארו',
  leftHeading: (count: number) => `נשארו ${count}`,
  inCart: (count: number) => `${count} בעגלה`,
  missingCount: (count: number) => `${count} ${COMMON_COPY.missing}`,
  remove: 'הסרה',
  missingToggle: (isMissing: boolean) => (isMissing ? 'היה בכל זאת' : COMMON_COPY.missing),
  removeFromList: 'הסרה מהרשימה',
  editName: 'עריכת שם',
  rename: 'שינוי השם',
  finishTitle: 'סיום הקנייה',
  finishCounts: (taken: number, missing: number) =>
    joinParts([taken > 0 ? `נלקחו ${taken}` : undefined, missing > 0 ? `${COMMON_COPY.missing} ${missing}` : undefined]),
  removeReceipt: (number: number) => `הסרת קבלה ${number}`,
  tripSaved: 'הקנייה נשמרה',
} as const
