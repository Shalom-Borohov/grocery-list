import { useMessageToast } from '../../components/useMessageToast'
import { useNamePrompt } from '../../components/useNamePrompt'
import { COMMON_COPY } from '../../copy/common'
import { createSetFromEntries } from '../../data/setsRepo'
import type { SetEntry } from '../../domain/types'
import { TRIPS_COPY } from './copy'

export function useSaveAsSet() {
  const askName = useNamePrompt()
  const toast = useMessageToast()

  return (setEntries: SetEntry[]) =>
    askName({
      header: TRIPS_COPY.saveAsSet,
      placeholder: COMMON_COPY.setName,
      confirmText: COMMON_COPY.save,
      save: (name) => createSetFromEntries(name, setEntries, Date.now()),
      onSaved: () => void toast(TRIPS_COPY.setSaved),
    })
}
