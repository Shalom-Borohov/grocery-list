import { COMMON_COPY } from '../../../copy/common'

export const PICKER_COPY = {
  title: COMMON_COPY.addToList,
  searchPlaceholder: 'חיפוש או מצרך חדש',
  usual: 'בדרך כלל',
  noItems: 'עוד אין מצרכים. כותבים שם בחיפוש, והוא נוסף לרשימה.',
  addedCount: (count: number) => `נוספו ${count}`,
  setButton: (name: string, count: number) => `${name}${COMMON_COPY.separator}${count}`,
  createItem: (name: string) => `הוספת ״${name}״ כמצרך חדש`,
} as const
