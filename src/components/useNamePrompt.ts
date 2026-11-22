import { useIonAlert } from '@ionic/react'
import { useRef } from 'react'
import { COMMON_COPY } from '../copy/common'
import { isName } from '../domain/types'
import { holdKeyboard } from './keyboardHold'
import { NAME_PROMPT_CONFIRM_CLASS, putNameKeyboardAway, readyNameField } from './namePromptKeyboard'
import { SUBMIT_ENTER_KEY_HINT } from './returnKey'
import { useAction } from './useAction'

const NAME_INPUT = 'name'

type SaveName = (name: string) => Promise<unknown>

type NamePrompt = {
  header: string
  placeholder: string
  confirmText: string
  currentName?: string
  save: SaveName
  alternative?: { text: string; save: SaveName }
  onSaved?: () => void
}

const isNameInput = (values: unknown): values is { [NAME_INPUT]: string } =>
  typeof values === 'object' && values !== null && NAME_INPUT in values && typeof values[NAME_INPUT] === 'string'

export function useNamePrompt() {
  const [presentAlert] = useIonAlert()
  const run = useAction()
  const isPromptOpen = useRef(false)

  const saveButton = (text: string, save: SaveName, onSaved?: () => void) => ({
    text,
    handler: (values: unknown) => {
      if (isNameInput(values) && isName(values[NAME_INPUT])) {
        const name = values[NAME_INPUT].trim()

        run(() => save(name), onSaved)
      }
    },
  })

  return ({ header, placeholder, confirmText, currentName, save, alternative, onSaved }: NamePrompt) => {
    if (isPromptOpen.current) {
      return
    }

    isPromptOpen.current = true
    holdKeyboard()
    void presentAlert({
      header,
      inputs: [
        {
          name: NAME_INPUT,
          type: 'text',
          value: currentName,
          placeholder,
          attributes: { 'aria-label': placeholder, dir: 'auto', enterkeyhint: SUBMIT_ENTER_KEY_HINT },
        },
      ],
      buttons: [
        { text: COMMON_COPY.cancel, role: 'cancel' },
        { ...saveButton(confirmText, save, onSaved), cssClass: NAME_PROMPT_CONFIRM_CLASS },
        ...(alternative ? [saveButton(alternative.text, alternative.save, onSaved)] : []),
      ],
      onDidPresent: ({ target }) => readyNameField(target),
      onWillDismiss: ({ target }) => putNameKeyboardAway(target),
      onDidDismiss: () => {
        isPromptOpen.current = false
      },
    })
  }
}
