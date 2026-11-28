import { fireEvent } from '@testing-library/react'

function last(selector: string) {
  const elements = document.querySelectorAll(selector)
  const element = elements.item(elements.length - 1)

  if (!element) {
    throw new Error(`no element ${selector}`)
  }

  return element
}

function buttonIn(overlay: string, button: string, text: string) {
  const match = Array.from(last(overlay).querySelectorAll(button)).find(
    (element) => element.textContent?.trim() === text,
  )

  if (!match) {
    throw new Error(`no ${overlay} button ${text}`)
  }

  return match
}

type OverlayEvent =
  | 'ionAlertDidPresent'
  | 'ionAlertDidDismiss'
  | 'ionModalDidPresent'
  | 'ionModalDidDismiss'
  | 'ionActionSheetDidPresent'

const overlayEvent = (name: OverlayEvent) =>
  new Promise((resolve) => {
    document.addEventListener(name, resolve, { once: true })
  })

export const actionSheetShown = () => overlayEvent('ionActionSheetDidPresent')

export const actionSheetButtons = () =>
  Array.from(last('ion-action-sheet').querySelectorAll('.action-sheet-button'), (button) =>
    button.textContent?.trim(),
  )

export const clickActionSheetButton = (text: string) =>
  fireEvent.click(buttonIn('ion-action-sheet', '.action-sheet-button', text))

export const alertShown = () => overlayEvent('ionAlertDidPresent')

export const alertDismissed = () => overlayEvent('ionAlertDidDismiss')

export const modalShown = () => overlayEvent('ionModalDidPresent')

export const modalDismissed = () => overlayEvent('ionModalDidDismiss')

export const shownSheetName = () =>
  document.querySelector('ion-modal.show-modal')?.shadowRoot?.querySelector('[role="dialog"]')?.getAttribute('aria-label')

export const alertHeader = () => last('ion-alert .alert-title').textContent

export const alertMessage = () => last('ion-alert .alert-message').textContent

export const clickAlertButton = (text: string) => fireEvent.click(buttonIn('ion-alert', '.alert-button', text))

export function alertInput() {
  const input = last('ion-alert input')

  if (!(input instanceof HTMLInputElement)) {
    throw new Error('no alert input')
  }

  return input
}

export const typeInAlert = (text: string) => fireEvent.input(alertInput(), { target: { value: text } })

export function answerAlert(text: string, button: string) {
  typeInAlert(text)
  clickAlertButton(button)
}

export const toastMessages = () => Array.from(document.querySelectorAll('ion-toast'), (toast) => toast.message)
