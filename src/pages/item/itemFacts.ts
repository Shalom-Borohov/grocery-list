import { dayAndMonth, shortDate } from '../../copy/formats'
import { joinParts } from '../../copy/joinParts'
import { dayDateOf, dayYear } from '../../domain/dayDate'
import type { ItemHistory } from '../../domain/itemHistory'
import { ITEM_COPY } from './copy'

export function dateOf(time: number, today: string) {
  const dayDate = dayDateOf(time)

  return dayYear(dayDate) === dayYear(today) ? dayAndMonth(dayDate) : shortDate(time)
}

export function itemFacts({ timesBought, timesMissing, lastBoughtAt }: ItemHistory, today: string) {
  const bought =
    lastBoughtAt === undefined
      ? [ITEM_COPY.neverBought]
      : [ITEM_COPY.boughtTimes(timesBought), ITEM_COPY.lastBought(dateOf(lastBoughtAt, today))]

  return joinParts([...bought, timesMissing > 0 ? ITEM_COPY.missingTimes(timesMissing) : undefined])
}
