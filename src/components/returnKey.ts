const RETURN_KEY = 'Enter'

const COMPOSITION_KEY_CODE = 229

export const SUBMIT_ENTER_KEY_HINT = 'go'

export const isSubmittingReturn = (event: KeyboardEvent) =>
  event.key === RETURN_KEY && !event.isComposing && event.keyCode !== COMPOSITION_KEY_CODE
