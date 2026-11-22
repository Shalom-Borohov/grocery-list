import { SUBMIT_ENTER_KEY_HINT } from '../../components/SearchField'

const HOLDER_CLASS = 'keyboard-holder'

const OUT_OF_TAB_ORDER = -1

let holder: HTMLInputElement | undefined

function createHolder() {
  const field = document.createElement('input')

  field.type = 'search'
  field.tabIndex = OUT_OF_TAB_ORDER
  field.className = HOLDER_CLASS
  field.setAttribute('enterkeyhint', SUBMIT_ENTER_KEY_HINT)
  field.setAttribute('aria-hidden', 'true')

  return field
}

function keepFocusUnlessMovedOn({ relatedTarget }: FocusEvent) {
  if (!relatedTarget) {
    holder?.focus({ preventScroll: true })
  }
}

function releaseHolder() {
  holder?.removeEventListener('blur', keepFocusUnlessMovedOn)
  holder?.remove()
  holder = undefined
}

export function holdKeyboard() {
  releaseHolder()
  holder = createHolder()
  holder.addEventListener('blur', keepFocusUnlessMovedOn)
  document.body.append(holder)
  holder.focus({ preventScroll: true })
}

export function handKeyboardTo(input: HTMLInputElement | null) {
  const typedWhileHolding = holder?.value

  input?.focus({ preventScroll: true })
  releaseHolder()

  return typedWhileHolding
}
