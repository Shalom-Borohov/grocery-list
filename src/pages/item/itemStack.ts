import { useLocation } from 'react-router-dom'
import { COMMON_COPY } from '../../copy/common'
import { type ItemStack, ITEMS_PATH, itemStackOf, LIST_PATH, TRIPS_PATH } from '../../navigation/paths'

type StackPlace = { root: string; name: string }

const STACK_PLACES: Record<ItemStack, StackPlace> = {
  list: { root: LIST_PATH, name: COMMON_COPY.list },
  trips: { root: TRIPS_PATH, name: COMMON_COPY.trips },
  items: { root: ITEMS_PATH, name: COMMON_COPY.items },
}

export function useItemStack() {
  return STACK_PLACES[itemStackOf(useLocation().pathname)]
}
