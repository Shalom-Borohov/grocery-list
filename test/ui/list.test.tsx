import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createItem, setItemPhoto, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import { expectElementsInOrder, sheetOf, swipeOption } from '../helpers/ionic'
import { modalDismissed } from '../helpers/overlays'
import { fakeShrunkPhoto, PHOTO_URL, stubObjectUrls } from '../helpers/photo'
import { amount, packOf } from '../helpers/records'
import { currentPath, renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

stubObjectUrls()

const openSheetTitle = () => document.querySelector('ion-modal.show-modal ion-title')

async function openMilkSheetBesideEggs() {
  await addToList(await createItem('חלב', NOW), NOW)
  await addToList(await createItem('ביצים', NOW), NOW + 1)

  renderAt('/tabs/list')
  fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))

  return screen.findByRole('button', { name: 'הסרה מהרשימה' })
}

describe('the list', () => {
  beforeEach(resetDb)

  it('shows each entry as a label with its amount, name and note, and counts them', async () => {
    const milk = await createItem('חלב', NOW)

    await updateItem(milk, { note: 'רק 3%' })
    await addToList(milk, NOW, amount(2, 'liter'))
    await addToList(await createItem('ביצים', NOW), NOW + 1)

    renderAt('/tabs/list')

    expect(await screen.findByText('חלב')).toBeVisible()
    expect(screen.getByText('רק 3%')).toBeVisible()
    expect(screen.getByText('ליטר')).toBeVisible()
    expect(screen.getByText('2')).toBeVisible()
    expect(screen.getByText('ביצים')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'רשימה' })).toBeInTheDocument()
    expect(screen.getByText('2 מצרכים')).toBeVisible()
  })

  it('shows a pack as the number of packs, with how many are in each under it', async () => {
    await addToList(await createItem('סבון מוצק', NOW), NOW, packOf(1, 4))
    await addToList(await createItem('טישו', NOW), NOW + 1, packOf(3, 10))

    renderAt('/tabs/list')

    const soap = await screen.findByRole('button', { name: 'כמות ומחיר: סבון מוצק · 1 אריזה של 4' })

    expect(soap).toHaveTextContent(/^1אריזה ×4$/)
    expect(screen.getByRole('button', { name: 'כמות ומחיר: טישו · 3 אריזות של 10' })).toHaveTextContent(/^3אריזה ×10$/)
  })

  it('shows a quiet "1" in the amount column of a plain amount, so the way into the sheet is never blank', async () => {
    await addToList(await createItem('ביצים', NOW), NOW)

    renderAt('/tabs/list')

    const column = await screen.findByRole('button', { name: 'כמות ומחיר: ביצים' })

    expect(column).toHaveTextContent(/^1$/)
    expect(column.querySelector('.amount-numeral')).toHaveClass('is-quiet')
  })

  it('ticks an entry with one tap on its ring, with no start step, and shows the shop header only while anything is ticked', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await addToList(await createItem('ביצים', NOW), NOW + 1)

    renderAt('/tabs/list')

    const milkRing = await screen.findByRole('button', { name: 'נלקח: חלב' })

    expect(milkRing).toHaveAttribute('aria-pressed', 'false')
    expect(milkRing.querySelector('.tick-ring')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'התחלת קנייה' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'סיום' })).not.toBeInTheDocument()

    fireEvent.click(milkRing)

    expect(await screen.findByRole('heading', { name: 'נשארו 1' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'נלקח: חלב' })).toHaveAttribute('aria-pressed', 'true')
    expect(screen.getByRole('button', { name: 'סיום' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'נלקח: חלב' }))

    expect(await screen.findByRole('heading', { level: 1, name: 'רשימה' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'נלקח: חלב' })).toHaveAttribute('aria-pressed', 'false')
    expect(screen.queryByRole('button', { name: 'סיום' })).not.toBeInTheDocument()
  })

  it('removes an entry from its swipe option', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await addToList(await createItem('ביצים', NOW), NOW + 1)

    renderAt('/tabs/list')
    await screen.findByText('חלב')
    fireEvent.click(swipeOption('חלב', 'הסרה'))

    await waitFor(() => expect(screen.queryByText('חלב')).not.toBeInTheDocument())
    expect(screen.getByText('ביצים')).toBeVisible()
  })

  it('swipes a waiting entry to "לא היה" or "הסרה", and a missing one to "היה בכל זאת" or "הסרה", with "הסרה" outermost', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await toggleMissing(await addToList(await createItem('ביצים', NOW), NOW + 1))

    renderAt('/tabs/list')
    await screen.findByText('חלב')

    expectElementsInOrder([swipeOption('חלב', 'לא היה'), swipeOption('חלב', 'הסרה')])
    expectElementsInOrder([swipeOption('ביצים', 'היה בכל זאת'), swipeOption('ביצים', 'הסרה')])
    expect(swipeOption('חלב', 'לא היה').getAttribute('color')).not.toBe(swipeOption('חלב', 'הסרה').getAttribute('color'))
    expect(() => swipeOption('ביצים', 'לא היה')).toThrow()
  })

  it('opens the row sheet from the amount column, with "לא היה", and removes the entry from there', async () => {
    await addToList(await createItem('חלב', NOW), NOW)

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))

    expect(await screen.findByRole('button', { name: 'הסרה מהרשימה' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'לא היה' })).toBeInTheDocument()

    const dismissed = modalDismissed()

    fireEvent.click(screen.getByRole('button', { name: 'הסרה מהרשימה' }))
    await dismissed

    expect((await allRecords()).entries).toEqual([])
    expect(await screen.findByText(/הרשימה ריקה/)).toBeVisible()
  })

  it('ends every row with a photo square that opens the row sheet without taking the item', async () => {
    const milk = await createItem('חלב', NOW)

    await setItemPhoto(milk, fakeShrunkPhoto())
    await addToList(milk, NOW)
    await toggleTaken(await addToList(await createItem('ביצים', NOW), NOW + 1), NOW + 2)

    renderAt('/tabs/list')

    const milkSquare = await screen.findByRole('button', { name: 'תמונה: חלב' })

    await waitFor(() => expect(milkSquare.querySelector('img')).toHaveAttribute('src', PHOTO_URL))
    expect(screen.getByRole('button', { name: 'תמונה: ביצים' }).querySelector('svg')).toBeInTheDocument()

    fireEvent.click(milkSquare)

    expect(await screen.findByRole('button', { name: 'הסרה מהרשימה' })).toBeInTheDocument()
    expect((await allRecords()).entries.find((entry) => entry.itemId === milk)?.state).toBe('waiting')
  })

  it.each([
    ['waiting', async (_entryId: string) => undefined],
    ['taken', (entryId: string) => toggleTaken(entryId, NOW + 1)],
    ['missing', (entryId: string) => toggleMissing(entryId)],
  ])('opens the row sheet from a tap on a %s row, and leaves its state as it was', async (state, markRow) => {
    await markRow(await addToList(await createItem('חלב', NOW), NOW))

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))

    expect(await screen.findByRole('button', { name: 'הסרה מהרשימה' })).toBeInTheDocument()
    expect((await allRecords()).entries[0]?.state).toBe(state)
  })

  it.each(['חלב', 'ביצים'])(
    'opens %s when its row is tapped while the sheet is still sliding down after a swipe',
    async (tapped) => {
      const sheet = sheetOf(await openMilkSheetBesideEggs())
      const dismissed = modalDismissed()

      sheet.dispatchEvent(new CustomEvent('ionDragEnd', { detail: { isDismissing: true } }))
      fireEvent.click(screen.getByRole('button', { name: tapped }))
      await sheet.dismiss(undefined, 'gesture')
      await dismissed

      await waitFor(() => expect(openSheetTitle()).toHaveTextContent(tapped))
    },
  )

  it.each(['חלב', 'ביצים'])('opens %s when its row is tapped while the sheet is closing after "סגירה"', async (tapped) => {
    await openMilkSheetBesideEggs()

    const dismissed = modalDismissed()

    fireEvent.click(screen.getByRole('button', { name: 'סגירה' }))
    fireEvent.click(screen.getByRole('button', { name: tapped }))
    await dismissed

    await waitFor(() => expect(openSheetTitle()).toHaveTextContent(tapped))
  })

  it('goes from the row sheet to the item page in the list stack', async () => {
    const milk = await createItem('חלב', NOW)

    await addToList(milk, NOW)

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))
    fireEvent.click(await screen.findByRole('button', { name: 'לדף המצרך' }))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/list/item/${milk}`))
  })

  it('says the list is empty and offers adding, with no "סיום"', async () => {
    renderAt('/tabs/list')

    expect(await screen.findByText(/הרשימה ריקה/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'הוספה' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'סיום' })).not.toBeInTheDocument()
  })
})
