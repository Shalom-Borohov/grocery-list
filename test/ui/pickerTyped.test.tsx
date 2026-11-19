import { act, fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { createItem } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import { modalDismissed, toastMessages } from '../helpers/overlays'
import { listedItemNames, renderPicker, search } from '../helpers/picker'
import { CREATED_AT } from '../helpers/records'

const typeInPicker = async (text: string) =>
  search(await screen.findByRole('searchbox', { name: 'חיפוש או מצרך חדש' }), text)

function pickerModal() {
  const modal = document.querySelector('ion-modal')

  if (!modal) {
    throw new Error('no picker modal')
  }

  return modal
}

describe('add picker, what is typed', () => {
  beforeEach(resetDb)
  it('adds a new name and closes on סיום', async () => {
    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('גבינה ')
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
    expect(await listedItemNames()).toEqual(['גבינה'])
  })
  it('creates the typed name on סיום even when other items partly match', async () => {
    await createItem('חלב', CREATED_AT)

    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('חל')
    await screen.findByRole('button', { name: 'חלב' })
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
    expect(await listedItemNames()).toEqual(['חל'])
  })
  it('does not create the search text on סיום once a result for it was tapped', async () => {
    await createItem('חלב', CREATED_AT)

    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('חל')
    fireEvent.click(await screen.findByRole('button', { name: 'חלב', pressed: false }))
    await screen.findByRole('button', { name: 'חלב', pressed: true })
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
    expect(await listedItemNames()).toEqual(['חלב'])
    expect((await allRecords()).items).toHaveLength(1)
  })
  it('creates the same text again once the search was cleared and retyped', async () => {
    await createItem('חלב 3%', CREATED_AT)

    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('חלב')
    fireEvent.click(await screen.findByRole('button', { name: 'חלב 3%', pressed: false }))
    await screen.findByRole('button', { name: 'חלב 3%', pressed: true })
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })
    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
    await typeInPicker('חלב')
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
    expect((await listedItemNames()).toSorted()).toEqual(['חלב', 'חלב 3%'])
  })
  it('adds the item whose exact name is typed, without a second item of that name', async () => {
    await createItem('חלב', CREATED_AT)

    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('חלב')
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
    expect(await listedItemNames()).toEqual(['חלב'])
    expect((await allRecords()).items).toHaveLength(1)
  })
  it('leaves an item already on the list as it is and closes on סיום', async () => {
    const milkId = await createItem('חלב', CREATED_AT)

    await toggleTaken(await addToList(milkId, CREATED_AT), CREATED_AT)

    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('חלב')
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())

    const { entries } = await allRecords()

    expect(entries).toHaveLength(1)
    expect(entries[0].state).toBe('taken')
  })
  it('only closes on סיום when the search is blank', async () => {
    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('  ')
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(onDismiss).toHaveBeenCalled())
    expect((await allRecords()).items).toEqual([])
  })
  it('adds a new name on return, clears the search and stays open', async () => {
    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('גבינה')
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })

    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
    expect(await listedItemNames()).toEqual(['גבינה'])
    expect(await screen.findByText('נוספו 1')).toBeInTheDocument()
    expect(onDismiss).not.toHaveBeenCalled()
  })
  it('does not count an item already on the list when its name is typed and return pressed', async () => {
    await addToList(await createItem('חלב', CREATED_AT), CREATED_AT)

    renderPicker()
    await typeInPicker('חלב')
    await screen.findByRole('button', { name: 'חלב', pressed: true })
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })

    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
    expect(screen.queryByText(/נוספו/)).not.toBeInTheDocument()
  })
  it('ignores return while the keyboard is still composing', async () => {
    renderPicker()
    await typeInPicker('גבינה')
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter', isComposing: true })

    expect(screen.getByRole('searchbox')).toHaveValue('גבינה')

    await typeInPicker('חלב')
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })

    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
    expect(await listedItemNames()).toEqual(['חלב'])
  })
  it('ignores the return that ends a composition in Safari', async () => {
    renderPicker()
    await typeInPicker('גבינה')
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter', keyCode: 229 })
    await act(async () => {})

    expect(screen.getByRole('searchbox')).toHaveValue('גבינה')
    expect((await allRecords()).items).toEqual([])
  })
  it('keeps what is typed after return while the add is saving', async () => {
    renderPicker()
    await typeInPicker('גבינה')
    fireEvent.keyDown(screen.getByRole('searchbox'), { key: 'Enter' })
    await typeInPicker('ח')

    expect(await screen.findByText('נוספו 1')).toBeInTheDocument()
    expect(screen.getByRole('searchbox')).toHaveValue('ח')
    expect(await listedItemNames()).toEqual(['גבינה'])
  })
  it('keeps the picker open with its text when saving fails', async () => {
    vi.spyOn(db.items, 'add').mockRejectedValueOnce(new Error('disk full'))

    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('גבינה')
    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    await waitFor(() => expect(toastMessages()).toContain('הפעולה לא הצליחה'))
    expect(onDismiss).not.toHaveBeenCalled()
    expect(screen.getByRole('searchbox')).toHaveValue('גבינה')
    expect(await listedItemNames()).toEqual([])
  })
  it('closes without adding when the sheet is dragged down', async () => {
    const onDismiss = vi.fn()

    renderPicker(onDismiss)
    await typeInPicker('גבינה')

    const dismissed = modalDismissed()

    await act(() => pickerModal().dismiss())
    await dismissed

    expect(onDismiss).toHaveBeenCalled()
    expect((await allRecords()).items).toEqual([])
  })
})
