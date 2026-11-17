import { useIonAlert } from '@ionic/react'
import { COMMON_COPY } from '../copy/common'
import { isName } from '../domain/types'
import { useAction } from './useAction'

const NAME_INPUT = 'name'

type NamePrompt = {
  header: string
  placeholder: string
  confirmText: string
  currentName?: string
  save: (name: string) => Promise<unknown>
  onSaved?: () => void
}

const isNameInput = (values: unknown): values is { [NAME_INPUT]: string } =>
  typeof values === 'object' && values !== null && NAME_INPUT in values && typeof values[NAME_INPUT] === 'string'

export function useNamePrompt() {
  const [presentAlert] = useIonAlert()
  const run = useAction()

  return ({ header, placeholder, confirmText, currentName, save, onSaved }: NamePrompt) =>
    void presentAlert({
      header,
      inputs: [
        {
          name: NAME_INPUT,
          type: 'text',
          value: currentName,
          placeholder,
          attributes: { 'aria-label': placeholder, dir: 'auto' },
        },
      ],
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        {
          text: confirmText,
          handler: (values: unknown) => {
            if (isNameInput(values) && isName(values[NAME_INPUT])) {
              const name = values[NAME_INPUT].trim()

              run(() => save(name), onSaved)
            }
          },
        },
      ],
    })
}
