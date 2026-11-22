export function focusedTextField() {
  const focused = document.activeElement

  if (!(focused instanceof HTMLInputElement)) {
    throw new Error('no text field has focus')
  }

  return focused
}
