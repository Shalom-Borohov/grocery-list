import { handKeyboardTo } from './keyboardHold'
import { isSubmittingReturn } from './returnKey'

export const NAME_PROMPT_CONFIRM_CLASS = 'name-prompt-confirm'

const nameFieldIn = (prompt: EventTarget | null) =>
  prompt instanceof HTMLElement ? prompt.querySelector('input') : null

function addTypedWhileOpening(field: HTMLInputElement, typed: string | undefined) {
  if (!typed) {
    return
  }

  field.value += typed
  field.dispatchEvent(new Event('input', { bubbles: true }))
}

function keepFocusFromPromptFrame(field: HTMLInputElement) {
  field.addEventListener('blur', ({ relatedTarget }) => {
    if (relatedTarget instanceof Node && relatedTarget.contains(field)) {
      field.focus({ preventScroll: true })
    }
  })
}

function confirmOnReturn(field: HTMLInputElement, confirmButton: HTMLElement) {
  field.addEventListener('keydown', (event) => {
    if (isSubmittingReturn(event)) {
      confirmButton.click()
    }
  })
}

export function putNameKeyboardAway(prompt: EventTarget | null) {
  nameFieldIn(prompt)?.blur()
}

export function readyNameField(prompt: EventTarget | null) {
  const field = nameFieldIn(prompt)
  const typedWhileOpening = handKeyboardTo(field)

  if (!field) {
    return
  }

  addTypedWhileOpening(field, typedWhileOpening)
  keepFocusFromPromptFrame(field)

  const confirmButton = field.closest('ion-alert')?.querySelector(`.${NAME_PROMPT_CONFIRM_CLASS}`)

  if (confirmButton instanceof HTMLElement) {
    confirmOnReturn(field, confirmButton)
  }
}
