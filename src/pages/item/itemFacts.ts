import { dayAndMonth } from '../../copy/formats'
import { joinParts } from '../../copy/joinParts'
import { dayDateOf } from '../../domain/dayDate'
import type { ItemHistory } from '../../domain/itemHistory'
import { ITEM_COPY } from './copy'

export const dateOf = (time: number) => dayAndMonth(dayDateOf(time))

export function itemFacts({ timesBought, timesMissing, lastBoughtAt }: ItemHistory) {
  const bought =
    lastBoughtAt === undefined
      ? [ITEM_COPY.neverBought]
      : [ITEM_COPY.boughtTimes(timesBought), ITEM_COPY.lastBought(dateOf(lastBoughtAt))]

  return joinParts([...bought, timesMissing > 0 ? ITEM_COPY.missingTimes(timesMissing) : undefined])
}
