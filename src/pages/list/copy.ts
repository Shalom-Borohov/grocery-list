import { COMMON_COPY } from '../../copy/common'
import { joinParts } from '../../copy/joinParts'

export const LIST_COPY = {
  title: COMMON_COPY.list,
  rowDetails: (name: string) => `כמות ומחיר: ${name}`,
  startShopping: 'התחלת קנייה',
  emptyHome: 'הרשימה ריקה. מה שנגמר בבית מוסיפים בכפתור +.',
  emptyShop: 'אין מצרכים ברשימה. אפשר להוסיף בכפתור + או לסיים את הקנייה.',
  left: 'נשארו',
  leftHeading: (count: number) => `נשארו ${count}`,
  inCart: (count: number) => `${count} בעגלה`,
  missingCount: (count: number) => `${count} ${COMMON_COPY.missing}`,
  remove: 'הסרה',
  wasThere: 'היה בכל זאת',
  removeFromList: 'הסרה מהרשימה',
  finishTitle: 'סיום הקנייה',
  finishCounts: (taken: number, missing: number) =>
    joinParts([taken > 0 ? `נלקחו ${taken}` : undefined, missing > 0 ? `${COMMON_COPY.missing} ${missing}` : undefined]),
  removeReceipt: (number: number) => `הסרת קבלה ${number}`,
  tripSaved: 'הקנייה נשמרה',
  nothingToFile: 'לא נלקח אף מצרך ולא סומן "לא היה", אז לא תישמר קנייה. הרשימה תישאר כמו שהיא.',
  leaveShopping: 'יציאה ממצב קנייה',
} as const
