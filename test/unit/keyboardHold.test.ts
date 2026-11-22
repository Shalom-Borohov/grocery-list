import { afterEach, describe, expect, it } from 'vitest'
import { handKeyboardTo, holdKeyboard } from '../../src/pages/list/keyboardHold'

function focusedField() {
  const focused = document.activeElement

  if (!(focused instanceof HTMLInputElement)) {
    throw new Error('no text field has focus')
  }

  return focused
}

describe('holding the keyboard while the picker opens', () => {
  afterEach(() => {
    handKeyboardTo(null)
    document.body.replaceChildren()
  })

  it('focuses a field hidden from VoiceOver during the tap itself', () => {
    holdKeyboard()

    const holder = focusedField()

    expect(holder).toHaveAttribute('aria-hidden', 'true')
    expect(holder).toHaveAttribute('tabindex', '-1')
    expect(holder).toHaveAttribute('enterkeyhint', 'go')
    expect(holder.type).toBe('search')
  })

  it('takes focus back when something blurs it without focusing anything else', () => {
    holdKeyboard()

    const holder = focusedField()

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
    focusedField().value = 'חל'

    expect(handKeyboardTo(searchField)).toBe('חל')
  })

  it('lets the keyboard go when the picker has no search field to hand it to', () => {
    holdKeyboard()
    handKeyboardTo(null)

    expect(document.body).toHaveFocus()
    expect(document.body.children).toHaveLength(0)
  })
})
