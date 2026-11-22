import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { handKeyboardTo, holdKeyboard } from '../../src/components/keyboardHold'
import { focusedTextField } from '../helpers/keyboard'

describe('holding the keyboard while the picker opens', () => {
  afterEach(() => {
    handKeyboardTo(null)
    document.body.replaceChildren()
  })

  it('focuses a field hidden from VoiceOver during the tap itself', () => {
    holdKeyboard()

    const holder = focusedTextField()

    expect(holder).toHaveAttribute('aria-hidden', 'true')
    expect(holder).toHaveAttribute('tabindex', '-1')
    expect(holder).toHaveAttribute('enterkeyhint', 'go')
    expect(holder.type).toBe('search')
  })

  it('takes focus back when something blurs it without focusing anything else', () => {
    holdKeyboard()

    const holder = focusedTextField()

    holder.blur()

    expect(holder).toHaveFocus()
  })

  it('hands focus to the search field and leaves no hidden field behind', () => {
    const searchField = document.createElement('input')

    document.body.append(searchField)
    holdKeyboard()
    handKeyboardTo(searchField)

    expect(searchField).toHaveFocus()
    expect(document.body.children).toHaveLength(1)
  })

  it('keeps a single hidden field when + is tapped again before the picker is up', () => {
    const searchField = document.createElement('input')

    document.body.append(searchField)
    holdKeyboard()
    holdKeyboard()
    handKeyboardTo(searchField)

    expect(searchField).toHaveFocus()
    expect(document.body.children).toHaveLength(1)
  })

  it('hands over what was typed while the picker slid in', () => {
    const searchField = document.createElement('input')

    document.body.append(searchField)
    holdKeyboard()
    focusedTextField().value = 'חל'

    expect(handKeyboardTo(searchField)).toBe('חל')
  })

  it('lets the keyboard go when the picker has no search field to hand it to', () => {
    holdKeyboard()
    handKeyboardTo(null)

    expect(document.body).toHaveFocus()
    expect(document.body.children).toHaveLength(0)
  })
})

describe('holding the keyboard while an open sheet traps focus', () => {
  const sheetButton = document.createElement('button')

  function trapFocusInSheet({ target }: FocusEvent) {
    if (target !== sheetButton) {
      sheetButton.focus()
    }
  }

  beforeEach(() => {
    document.body.append(sheetButton)
    document.addEventListener('focus', trapFocusInSheet, true)
  })

  afterEach(() => {
    document.removeEventListener('focus', trapFocusInSheet, true)
    handKeyboardTo(null)
    document.body.replaceChildren()
  })

  it('keeps the hidden field focused through the tap and an overlay blurring it', () => {
    holdKeyboard()

    const holder = focusedTextField()

    holder.blur()

    expect(holder).toHaveFocus()
  })

  it('leaves the trap to other fields once the keyboard is handed over', () => {
    const outsideField = document.createElement('input')

    document.body.append(outsideField)
    holdKeyboard()
    handKeyboardTo(null)
    outsideField.focus()

    expect(sheetButton).toHaveFocus()
  })
})
