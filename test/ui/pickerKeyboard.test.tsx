import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { createItem } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { handKeyboardTo } from '../../src/components/keyboardHold'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import { focusedTextField } from '../helpers/keyboard'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

afterEach(() => handKeyboardTo(null))

const pickerSearch = () => screen.findByRole('searchbox', { name: 'חיפוש או מצרך חדש' })

async function takeOneOnTheList() {
  const itemId = await createItem('חלב', NOW)

  await addToList(itemId, NOW)

  const [entry] = (await allRecords()).entries

  await toggleTaken(entry.id, NOW)
}

describe('+ opens the picker ready to type', () => {
  beforeEach(resetDb)

  it('focuses a text field during the tap and then the picker’s search, leaving no hidden field', async () => {
    renderAt('/tabs/list')

    fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))

    expect(document.activeElement).toBeInstanceOf(HTMLInputElement)
    await waitFor(async () => expect(await pickerSearch()).toHaveFocus())
    expect(document.querySelector('.keyboard-holder')).not.toBeInTheDocument()
  })

  it('does the same from the + beside סיום', async () => {
    await takeOneOnTheList()

    renderAt('/tabs/list')
    await screen.findByRole('button', { name: 'סיום' })
    fireEvent.click(screen.getByRole('button', { name: 'הוספה' }))

    await waitFor(async () => expect(await pickerSearch()).toHaveFocus())
  })

  it('keeps letters typed while the picker slides in', async () => {
    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))

    focusedTextField().value = 'חל'

    await waitFor(async () => expect(await pickerSearch()).toHaveValue('חל'))
    expect(await pickerSearch()).toHaveFocus()
  })

  it('puts the keyboard away as the picker starts to close', async () => {
    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))

    const searchbox = await pickerSearch()

    await waitFor(() => expect(searchbox).toHaveFocus())

    const picker = document.querySelector('ion-modal.add-picker')

    if (!picker) {
      throw new Error('no picker')
    }

    const searchFocusedWhenClosed = new Promise<boolean>((resolve) => {
      picker.addEventListener('didDismiss', () => resolve(document.activeElement === searchbox), { once: true })
    })

    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    expect(await searchFocusedWhenClosed).toBe(false)
  })
})

describe('scrolling the picker’s list', () => {
  beforeEach(resetDb)

  async function openPickerAndType(text: string) {
    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))

    const searchbox = await pickerSearch()

    await waitFor(() => expect(searchbox).toHaveFocus())
    fireEvent.change(searchbox, { target: { value: text } })

    return searchbox
  }

  function pickerContent() {
    const content = document.querySelector('ion-modal ion-content')

    if (!content) {
      throw new Error('no picker content')
    }

    return content
  }

  const scrollStarts = () => pickerContent().dispatchEvent(new CustomEvent('ionScrollStart'))

  it('puts the keyboard away when a finger starts the scroll, keeping what is typed', async () => {
    const searchbox = await openPickerAndType('חל')

    fireEvent.touchStart(pickerContent())
    scrollStarts()

    expect(searchbox).not.toHaveFocus()
    expect(searchbox).toHaveValue('חל')
  })

  it('keeps the keyboard up when the list scrolls with no finger on it', async () => {
    const searchbox = await openPickerAndType('חל')

    fireEvent.touchStart(pickerContent())
    fireEvent.touchEnd(pickerContent())
    scrollStarts()

    expect(searchbox).toHaveFocus()
  })

  it('knows the finger lifted even when the row it touched went away first', async () => {
    const searchbox = await openPickerAndType('חל')
    const createRow = await screen.findByRole('button', { name: 'הוספת ״חל״ כמצרך חדש' })

    fireEvent.touchStart(createRow)
    fireEvent.keyDown(searchbox, { key: 'Enter' })
    await waitFor(() => expect(createRow).not.toBeInTheDocument())
    fireEvent.touchEnd(createRow)
    scrollStarts()

    expect(searchbox).toHaveFocus()
  })
})
