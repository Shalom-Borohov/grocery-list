import { COMMON_COPY } from '../copy/common'
import { pourSet } from '../data/setsRepo'
import { useAction } from './useAction'
import { useMessageToast } from './useMessageToast'

export function usePourSet(onPoured?: (itemIds: string[]) => void) {
  const run = useAction()
  const toast = useMessageToast()

  function poured(itemIds: string[]) {
    onPoured?.(itemIds)
    void toast(itemIds.length > 0 ? COMMON_COPY.pouredCount(itemIds.length) : COMMON_COPY.allListed)
  }

  return (setId: string) => run(() => pourSet(setId, Date.now()), poured)
}
