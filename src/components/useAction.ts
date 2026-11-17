import { COMMON_COPY } from '../copy/common'
import { useMessageToast } from './useMessageToast'

export function useAction() {
  const toast = useMessageToast()

  return <Result>(action: () => Promise<Result>, onDone?: (result: Result) => void) =>
    void action().then(onDone, () => toast(COMMON_COPY.actionFailed))
}
