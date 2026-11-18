import { COMMON_COPY } from '../../copy/common'

const ONCE = 1

const TWICE = 2

const timesText = (count: number) => {
  if (count === ONCE) {
    return 'פעם אחת'
  }

  return count === TWICE ? 'פעמיים' : `${count} פעמים`
}

export const ITEM_COPY = {
  notFound: 'המצרך לא נמצא',
  usualAmount: 'כמות רגילה',
  neverBought: 'עוד לא נקנה',
  boughtTimes: (count: number) => timesText(count),
  lastBought: (date: string) => `לאחרונה ${date}`,
  missingTimes: (count: number) => `${COMMON_COPY.missing} ${timesText(count)}`,
  verdict: 'פסק דין',
  showPhoto: 'הצגת התמונה',
  addPhoto: 'הוספת תמונה',
  photoOf: (name: string) => `התמונה של ${name}`,
  prices: 'מחירים',
  noPrices: 'עוד לא נרשם מחיר',
  newestPrice: 'המחיר האחרון',
  addedToList: 'נוסף לרשימה',
  deleteItem: 'מחיקת המצרך',
  deleteMessage: 'הוא יישאר בשמו בקניות שבהן נקנה.',
  name: 'שם',
} as const
