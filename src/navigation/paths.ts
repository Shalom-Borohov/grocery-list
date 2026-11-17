const TABS_PATH = '/tabs'

export const LIST_PATH = `${TABS_PATH}/list`

export const TRIPS_PATH = `${TABS_PATH}/trips`

export const ITEMS_PATH = `${TABS_PATH}/items`

export const SETTINGS_PATH = `${TABS_PATH}/settings`

const SETS_PATH = `${ITEMS_PATH}/sets`

export const tripPath = (tripId: string) => `${TRIPS_PATH}/${tripId}`

export const setPath = (setId: string) => `${SETS_PATH}/${setId}`

export type ItemStack = 'list' | 'trips' | 'items'

const STACK_ROOTS: Record<ItemStack, string> = { list: LIST_PATH, trips: TRIPS_PATH, items: ITEMS_PATH }

const ITEM_SEGMENT = 'item'

export const itemPath = (stack: ItemStack, itemId: string) => `${STACK_ROOTS[stack]}/${ITEM_SEGMENT}/${itemId}`

const STACKS: ItemStack[] = ['trips', 'items']

export const itemStackOf = (pathname: string): ItemStack =>
  STACKS.find((stack) => pathname.startsWith(STACK_ROOTS[stack])) ?? 'list'
