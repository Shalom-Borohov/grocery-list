import { screen, waitFor } from '@testing-library/react'
import { expect } from 'vitest'

const VISIBLE_PAGE = '.ion-page:not(.ion-page-hidden)'

export function ionElement(selector: string) {
  return waitFor(() => {
    const element = document.querySelector(`${VISIBLE_PAGE} ${selector}`)

    if (!element) {
      throw new Error(`no element ${selector}`)
    }

    return element
  })
}

export function pageOf(element: HTMLElement) {
  const page = element.closest<HTMLElement>('.page-body')

  if (!page) {
    throw new Error('no page body')
  }

  return page
}

export function selectedTab() {
  return document.querySelector('ion-tab-button.tab-selected')?.getAttribute('tab')
}

export function swipeOption(name: string, text: string) {
  const sliding = screen.getByText(name).closest('ion-item-sliding')

  if (!sliding) {
    throw new Error(`no swipe row for ${name}`)
  }

  const option = Array.from(sliding.querySelectorAll('ion-item-option')).find(
    (element) => element.textContent?.trim() === text,
  )

  if (!option) {
    throw new Error(`no swipe option ${text} on ${name}`)
  }

  return option
}

export async function expectInOrder(texts: string[]) {
  const elements = await Promise.all(texts.map((text) => screen.findByText(text)))

  elements.slice(1).forEach((element, index) => {
    expect(elements[index].compareDocumentPosition(element) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
}
