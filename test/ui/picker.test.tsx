import { act, fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createItem, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken, updateEntry } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { finishShopping } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { modalDismissed, shownSheetName, toastMessages } from '../helpers/overlays'
import { listedItemNames, pickerTree, renderPicker, search } from '../helpers/picker'
import { amount, CREATED_AT } from '../helpers/records'
import { finishTripTaking, seedSet } from '../helpers/seed'

const DAY_MS = 86_400_000

const shopFor = (itemIds: string[], tripNumber: number) => finishTripTaking(itemIds, CREATED_AT + tripNumber * DAY_MS)

const rowNames = (sectionElement: HTMLElement) =>
  within(sectionElement)
    .getAllByRole('button', { pressed: false })
    .map((row) => row.querySelector('.label-row-name')?.textContent)

const section = (heading: string) => {
  const sectionElement = screen.getByRole('heading', { name: heading }).closest('section')

  if (!sectionElement) {
    throw new Error(`no section ${heading}`)
  }

  return sectionElement
}

describe('add picker', () => {
  beforeEach(resetDb)

  it('lists every item, most often bought first', async () => {
    const milkId = await createItem('חלב', CREATED_AT)
    const eggsId = await createItem('ביצים', CREATED_AT)

    await createItem('אורז', CREATED_AT)
    await shopFor([milkId, eggsId], 1)
    await shopFor([eggsId], 2)

    renderPicker()

    await screen.findByRole('heading', { name: 'כל המצרכים' })

    expect(rowNames(section('כל המצרכים'))).toEqual(['ביצים', 'חלב', 'אורז'])
    await waitFor(() => expect(shownSheetName()).toBe('הוספה לרשימה'))
  })

  it('offers "בדרך כלל" from three trips on, without what is already listed', async () => {
    const milkId = await createItem('חלב', CREATED_AT)
    const eggsId = await createItem('ביצים', CREATED_AT)
    const breadId = await createItem('לחם', CREATED_AT)

    await shopFor([milkId, eggsId, breadId], 1)
    await shopFor([milkId, eggsId, breadId], 2)

    const { unmount } = renderPicker()

    await screen.findByRole('heading', { name: 'כל המצרכים' })
    expect(screen.queryByRole('heading', { name: 'בדרך כלל' })).not.toBeInTheDocument()
    unmount()

    await shopFor([milkId, eggsId], 3)
    await addToList(eggsId, CREATED_AT)

    renderPicker()

    await screen.findByRole('heading', { name: 'בדרך כלל' })
    expect(rowNames(section('בדרך כלל'))).toEqual(['חלב', 'לחם'])

    fireEvent.click(within(section('בדרך כלל')).getByRole('button', { name: 'חלב' }))

    expect(await within(section('בדרך כלל')).findByRole('button', { name: 'חלב', pressed: true })).toBeInTheDocument()
  })

  it('filters by the search and offers to create a name that does not exist', async () => {
    await createItem('חלב', CREATED_AT)
    await createItem('חלב סויה', CREATED_AT)
    await createItem('ביצים', CREATED_AT)

    renderPicker()

    search(await screen.findByRole('searchbox', { name: 'חיפוש או מצרך חדש' }), 'חלב')

    await waitFor(() => expect(screen.queryByRole('button', { name: 'ביצים' })).not.toBeInTheDocument())
    expect(screen.getByRole('button', { name: 'חלב סויה' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'הוספת ״חלב״ כמצרך חדש' })).not.toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'כל המצרכים' })).not.toBeInTheDocument()

    search(screen.getByRole('searchbox'), 'גבינה ')

    const createRow = await screen.findByRole('button', { name: 'הוספת ״גבינה״ כמצרך חדש' })

    fireEvent.click(createRow)

    await waitFor(() => expect(screen.getByRole('searchbox')).toHaveValue(''))
    expect(await screen.findByRole('button', { name: 'גבינה', pressed: true })).toBeInTheDocument()
    expect(await listedItemNames()).toEqual(['גבינה'])
  })

  it('pours a saved set and says how many it added', async () => {
    const milkId = await createItem('חלב', CREATED_AT)
    const eggsId = await createItem('ביצים', CREATED_AT)
    const breadId = await createItem('לחם', CREATED_AT)

    await seedSet('בסיס', [milkId, eggsId, breadId], CREATED_AT)
    await addToList(eggsId, CREATED_AT)

    renderPicker()

    await screen.findByRole('heading', { name: 'ערכות' })
    fireEvent.click(within(section('ערכות')).getByRole('button', { name: 'בסיס · 3' }))

    await waitFor(() => expect(toastMessages()).toEqual(['נוספו 2 לרשימה']))
    expect(await screen.findByText('נוספו 2')).toBeInTheDocument()
    expect((await listedItemNames()).toSorted()).toEqual(['ביצים', 'חלב', 'לחם'].toSorted())
  })

  it('shows the saved sets in the order they were made, oldest first', async () => {
    const milkId = await createItem('חלב', CREATED_AT)

    await seedSet('שישי', [milkId], CREATED_AT + 2)
    await seedSet('בסיס', [milkId], CREATED_AT + 1)
    await seedSet('חג', [milkId], CREATED_AT + 3)

    renderPicker()

    await screen.findByRole('heading', { name: 'ערכות' })

    expect(within(section('ערכות')).getAllByRole('button').map((button) => button.textContent)).toEqual([
      'בסיס · 1',
      'שישי · 1',
      'חג · 1',
    ])
  })

  it('says so when everything in the set is already listed', async () => {
    const milkId = await createItem('חלב', CREATED_AT)

    await seedSet('שישי', [milkId], CREATED_AT)
    await addToList(milkId, CREATED_AT)

    renderPicker()

    fireEvent.click(await screen.findByRole('button', { name: 'שישי · 1' }))

    await waitFor(() => expect(toastMessages()).toEqual(['הכול כבר ברשימה']))
    expect(screen.queryByText(/נוספו/)).not.toBeInTheDocument()
  })

  it('disables the button of a set with no items', async () => {
    await createItem('חלב', CREATED_AT)
    await seedSet('ריקה', [], CREATED_AT)

    renderPicker()

    const emptySetButton = await screen.findByRole('button', { name: 'ריקה · 0' })

    expect(emptySetButton).toBeDisabled()

    fireEvent.click(emptySetButton)
    await act(async () => {})

    expect(toastMessages()).toEqual([])
  })

  it('shows the verdict and the usual amount on a row, and still adds a "לא לקנות שוב" item', async () => {
    const yogurtId = await createItem('יוגורט', CREATED_AT)

    await updateItem(yogurtId, { verdict: 'never', usualAmount: amount(4) })

    renderPicker()

    const yogurtRow = await screen.findByRole('button', { name: 'יוגורט', pressed: false })

    expect(within(yogurtRow).getByText('לא לקנות שוב')).toHaveClass('warning-word')
    expect(yogurtRow).toHaveAccessibleDescription('לא לקנות שוב')
    expect(yogurtRow.closest('.label-row')?.querySelector('.amount-numeral')).toHaveTextContent('4')

    fireEvent.click(yogurtRow)

    expect(await screen.findByRole('button', { name: 'יוגורט', pressed: true })).toBeInTheDocument()
    expect(await listedItemNames()).toEqual(['יוגורט'])
  })

  it('invites to type a name when there are no items yet', async () => {
    renderPicker()

    expect(await screen.findByText('עוד אין מצרכים. כותבים שם בחיפוש, והוא נוסף לרשימה.')).toBeInTheDocument()
    expect(screen.queryByRole('heading', { name: 'כל המצרכים' })).not.toBeInTheDocument()
  })

  it('adds an item with one tap and takes it back off with a second', async () => {
    await createItem('חלב', CREATED_AT)

    renderPicker()

    fireEvent.click(await screen.findByRole('button', { name: 'חלב', pressed: false }))

    await screen.findByRole('button', { name: 'חלב', pressed: true })
    expect(await listedItemNames()).toEqual(['חלב'])

    fireEvent.click(screen.getByRole('button', { name: 'חלב', pressed: true }))

    await screen.findByRole('button', { name: 'חלב', pressed: false })
    expect(await listedItemNames()).toEqual([])
  })

  it('counts what was added since the sheet opened', async () => {
    const riceId = await createItem('אורז', CREATED_AT)

    await createItem('חלב', CREATED_AT)
    await createItem('ביצים', CREATED_AT)
    await addToList(riceId, CREATED_AT)

    const onDismiss = vi.fn()
    const { rerender } = renderPicker(onDismiss)

    await screen.findByRole('button', { name: 'חלב' })
    expect(screen.queryByText(/נוספו/)).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'חלב' }))
    fireEvent.click(await screen.findByRole('button', { name: 'ביצים', pressed: false }))

    expect(await screen.findByText('נוספו 2')).toBeInTheDocument()

    fireEvent.click(await screen.findByRole('button', { name: 'ביצים', pressed: true }))

    expect(await screen.findByText('נוספו 1')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'סיום' }))

    expect(onDismiss).toHaveBeenCalled()

    const dismissed = modalDismissed()

    rerender(pickerTree(false, onDismiss))
    await dismissed
    rerender(pickerTree(true, onDismiss))

    await screen.findByRole('button', { name: 'חלב' })
    expect(screen.queryByText(/נוספו/)).not.toBeInTheDocument()
  })

  it('puts a row taken off and added back in the same opening back exactly as it was, without counting it', async () => {
    const milkId = await createItem('חלב', CREATED_AT)
    const entryId = await addToList(milkId, CREATED_AT)

    await toggleMissing(entryId)
    await finishShopping({ receipts: [] }, CREATED_AT + 1)
    await updateEntry(entryId, { amount: amount(3), price: 7.5 })

    const [tunedRow] = (await allRecords()).entries

    renderPicker()

    fireEvent.click(await screen.findByRole('button', { name: 'חלב', pressed: true }))

    const takenOffRow = await screen.findByRole('button', { name: 'חלב', pressed: false })

    expect(takenOffRow.closest('.label-row')?.querySelector('.amount-numeral')).toHaveTextContent('3')
    expect(takenOffRow).toHaveAccessibleDescription('לא היה בפעם שעברה')

    fireEvent.click(takenOffRow)
    await screen.findByRole('button', { name: 'חלב', pressed: true })

    expect((await allRecords()).entries).toEqual([tunedRow])
    expect(screen.queryByText(/נוספו/)).not.toBeInTheDocument()
  })

  it('makes a new row for an item taken off in an earlier opening', async () => {
    const milkId = await createItem('חלב', CREATED_AT)
    const entryId = await addToList(milkId, CREATED_AT)

    await updateEntry(entryId, { amount: amount(3), price: 7.5 })

    const onDismiss = vi.fn()
    const { rerender } = renderPicker(onDismiss)

    fireEvent.click(await screen.findByRole('button', { name: 'חלב', pressed: true }))
    await screen.findByRole('button', { name: 'חלב', pressed: false })

    const dismissed = modalDismissed()

    rerender(pickerTree(false, onDismiss))
    await dismissed
    rerender(pickerTree(true, onDismiss))

    fireEvent.click(await screen.findByRole('button', { name: 'חלב', pressed: false }))
    await screen.findByRole('button', { name: 'חלב', pressed: true })

    const [newRow] = (await allRecords()).entries

    expect(newRow.id).not.toBe(entryId)
    expect(newRow.amount).toEqual(amount(1))
    expect(newRow.price).toBeUndefined()
  })

  it('leaves an item already taken in the shop on the list', async () => {
    const milkId = await createItem('חלב', CREATED_AT)

    await toggleTaken(await addToList(milkId, CREATED_AT), CREATED_AT)

    renderPicker()

    fireEvent.click(await screen.findByRole('button', { name: 'חלב', pressed: true }))
    await act(async () => {})

    expect(screen.getByRole('button', { name: 'חלב', pressed: true })).toBeInTheDocument()
    expect(await listedItemNames()).toEqual(['חלב'])
  })
})
