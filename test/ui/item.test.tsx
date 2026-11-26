import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createItem, setItemPhoto } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken, updateEntry } from '../../src/data/listRepo'
import { finishShopping } from '../../src/data/tripsRepo'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { amount, CREATED_AT, packOf } from '../helpers/records'
import { ionElement } from '../helpers/ionic'
import {
  alertDismissed,
  alertHeader,
  alertMessage,
  alertShown,
  clickAlertButton,
  modalDismissed,
  toastMessages,
} from '../helpers/overlays'
import { cameraPhoto, PHOTO_URL, shrunkPhoto, stubObjectUrls } from '../helpers/photo'
import { currentPath, renderAt } from '../helpers/renderAt'
import { seedItem } from '../helpers/seed'

vi.mock('../../src/photo/shrink', async () => {
  const { fakeShrunkPhoto } = await import('../helpers/photo')

  return { shrinkPhoto: async () => fakeShrunkPhoto() }
})

const OCTOBER_15 = new Date(2026, 9, 15, 18).getTime()

const OCTOBER_29 = new Date(2026, 9, 29, 18).getTime()

const NOVEMBER_12 = new Date(2026, 10, 12, 18).getTime()

const LAST_YEAR_NOVEMBER_20 = new Date(2025, 10, 20, 18).getTime()

const TODAY = new Date(2026, 10, 17, 9).getTime()

type Outcome = { price?: number; isMissing?: boolean }

async function shop(itemId: string, finishedAt: number, { price, isMissing }: Outcome = {}) {
  const entryId = await addToList(itemId, finishedAt)

  if (price !== undefined) {
    await updateEntry(entryId, { price })
  }

  await (isMissing ? toggleMissing(entryId) : toggleTaken(entryId, finishedAt))
  await finishShopping({ receipts: [] }, finishedAt)
}

const addTomatoes = () => seedItem('עגבניות שרי', { usualAmount: amount(2, 'kilogram') })

async function openEditSheet() {
  fireEvent.click(await screen.findByRole('button', { name: 'עריכה' }))
  await screen.findByLabelText('שם')
}

async function saveEditSheet() {
  const dismissed = modalDismissed()

  fireEvent.click(screen.getByText('שמירה'))
  await dismissed
}

async function itemCard() {
  const card = (await screen.findByRole('heading', { level: 1, name: 'עגבניות שרי' })).closest('section')

  if (!card) {
    throw new Error('no item card')
  }

  return card
}

describe('item page', () => {
  beforeEach(resetDb)
  stubObjectUrls()
  freezeDate(TODAY)

  it('shows the name, the usual amount and how often it was bought and missing', async () => {
    const itemId = await addTomatoes()

    await shop(itemId, OCTOBER_15)
    await shop(itemId, OCTOBER_29, { isMissing: true })
    await shop(itemId, NOVEMBER_12)

    renderAt(`/tabs/items/item/${itemId}`)

    const card = await itemCard()

    expect(within(card).getByText('2')).toBeVisible()
    expect(within(card).getByText('ק״ג')).toBeVisible()
    expect(within(card).getByText('פעמיים · לאחרונה 12.11 · לא היה פעם אחת')).toBeVisible()
  })

  it('reads a usual pack as packs of a size, not as a multiplication', async () => {
    const itemId = await seedItem('עגבניות שרי', { usualAmount: packOf(2, 4) })

    renderAt(`/tabs/items/item/${itemId}`)

    const card = await itemCard()

    expect(within(card).getByText('2 אריזות של 4')).toHaveClass('visually-hidden')
    expect(within(card).getByText('אריזה ×4')).toHaveAttribute('aria-hidden', 'true')
  })

  it('says an item was never bought', async () => {
    const itemId = await createItem('חומוס', CREATED_AT)

    renderAt(`/tabs/items/item/${itemId}`)

    expect(await screen.findByText('עוד לא נקנה')).toBeVisible()
  })

  it('sets the verdict with the two-part switch and clears it with a second tap', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    const buyAgain = await screen.findByRole('button', { name: 'לקנות שוב' })
    const neverAgain = screen.getByRole('button', { name: 'לא לקנות שוב' })

    expect(buyAgain).toHaveAttribute('aria-pressed', 'false')
    expect(neverAgain).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(buyAgain)
    await waitFor(() => expect(buyAgain).toHaveAttribute('aria-pressed', 'true'))

    fireEvent.click(neverAgain)
    await waitFor(() => expect(neverAgain).toHaveAttribute('aria-pressed', 'true'))
    expect(buyAgain).toHaveAttribute('aria-pressed', 'false')

    fireEvent.click(neverAgain)
    await waitFor(() => expect(neverAgain).toHaveAttribute('aria-pressed', 'false'))
    expect(buyAgain).toHaveAttribute('aria-pressed', 'false')
  })

  it('lists recorded prices newest first, each bar against the highest, with the newest marked', async () => {
    const itemId = await addTomatoes()

    await shop(itemId, OCTOBER_15, { price: 7.9 })
    await shop(itemId, OCTOBER_29, { price: 9.9 })
    await shop(itemId, NOVEMBER_12, { price: 8.9 })

    renderAt(`/tabs/items/item/${itemId}`)

    const rows = within(await screen.findByRole('list', { name: 'מחירים' })).getAllByRole('listitem')

    expect(rows.map((row) => row.textContent)).toEqual(['12.11המחיר האחרון₪8.90', '29.10₪9.90', '15.10₪7.90'])
    expect(rows[1].querySelector('.price-bar')).toHaveStyle({ width: '100%' })
    expect(rows[0].querySelector('.price-bar')).toHaveStyle({ width: '90%' })
  })

  it('adds the year to a date from an earlier year, row by row', async () => {
    const itemId = await addTomatoes()

    await shop(itemId, LAST_YEAR_NOVEMBER_20, { price: 7.9 })

    renderAt(`/tabs/items/item/${itemId}`)

    expect(within(await itemCard()).getByText('פעם אחת · לאחרונה 20.11.25')).toBeVisible()

    await shop(itemId, NOVEMBER_12, { price: 8.9 })

    expect(await within(await itemCard()).findByText('פעמיים · לאחרונה 12.11')).toBeVisible()

    const rows = within(screen.getByRole('list', { name: 'מחירים' })).getAllByRole('listitem')

    expect(rows.map((row) => row.textContent)).toEqual(['12.11המחיר האחרון₪8.90', '20.11.25₪7.90'])
  })

  it('says when no price was recorded yet', async () => {
    const itemId = await addTomatoes()

    await shop(itemId, OCTOBER_15)

    renderAt(`/tabs/items/item/${itemId}`)

    expect(await screen.findByText('עוד לא נרשם מחיר')).toBeVisible()
  })

  it('adds the item to the list once, then says it is already there', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    fireEvent.click(await screen.findByRole('button', { name: 'הוספה לרשימה' }))

    await waitFor(() => expect(toastMessages()).toContain('נוסף לרשימה'))
    expect((await screen.findByText('כבר ברשימה')).closest('[role="status"]')).not.toBeNull()
    expect(screen.queryByRole('button', { name: 'הוספה לרשימה' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'כבר ברשימה' })).not.toBeInTheDocument()
  })

  it('edits the name, the usual amount and the note in the edit sheet', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    expect(await screen.findByText('הוספת הערה')).toBeVisible()

    await openEditSheet()
    fireEvent.change(screen.getByLabelText('שם'), { target: { value: '  עגבניות שרי מתוקות ' } })
    fireEvent.click(screen.getByRole('button', { name: 'יותר' }))
    fireEvent.change(screen.getByLabelText('הערה'), { target: { value: 'רק מהאריזה הסגורה' } })
    await saveEditSheet()

    expect(await screen.findByRole('heading', { level: 1, name: 'עגבניות שרי מתוקות' })).toBeVisible()
    expect(screen.getByText('2.5')).toBeVisible()
    expect(screen.getByText('רק מהאריזה הסגורה')).toBeVisible()
  })

  it('opens the edit sheet from the note, and keeps the old name when the name is cleared', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    fireEvent.click(await screen.findByText('הוספת הערה'))
    await screen.findByLabelText('שם')
    fireEvent.change(screen.getByLabelText('שם'), { target: { value: '   ' } })
    fireEvent.change(screen.getByLabelText('הערה'), { target: { value: 'לבדוק תאריך' } })
    await saveEditSheet()

    expect(await screen.findByText('לבדוק תאריך')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'עגבניות שרי' })).toBeVisible()
  })

  it('keeps the sheet open when the new name belongs to another item', async () => {
    const itemId = await addTomatoes()

    await createItem('מלפפונים', CREATED_AT)

    renderAt(`/tabs/items/item/${itemId}`)

    await openEditSheet()
    fireEvent.change(screen.getByLabelText('שם'), { target: { value: 'מלפפונים' } })
    fireEvent.click(screen.getByText('שמירה'))

    expect(await screen.findByText('כבר יש מצרך בשם הזה')).toBeVisible()
    expect(screen.getByLabelText('שם')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'עגבניות שרי' })).toBeVisible()
  })

  it('adds a photo from the edit sheet at once and shows it full size from the card', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    await openEditSheet()
    fireEvent.change(screen.getByLabelText('מהגלריה'), { target: { files: [cameraPhoto()] } })
    expect(await screen.findByText('הסרת התמונה')).toBeVisible()

    const dismissed = modalDismissed()

    fireEvent.click(screen.getByText('ביטול'))
    await dismissed

    fireEvent.click(await screen.findByRole('button', { name: 'הצגת התמונה' }))

    expect(await screen.findByRole('img', { name: 'התמונה של עגבניות שרי' })).toHaveAttribute('src', PHOTO_URL)
  })

  it('adds a photo from the card when there is none, and the add tile gives way to the photo', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    fireEvent.change(await screen.findByLabelText('הוספת תמונה'), { target: { files: [cameraPhoto()] } })

    expect(await screen.findByRole('button', { name: 'הצגת התמונה' })).toBeVisible()
    expect(screen.queryByLabelText('הוספת תמונה')).not.toBeInTheDocument()
  })

  it('removes the photo from the edit sheet after asking', async () => {
    const itemId = await addTomatoes()

    await setItemPhoto(itemId, shrunkPhoto(new ArrayBuffer(4), new ArrayBuffer(2)))

    renderAt(`/tabs/items/item/${itemId}`)

    expect(await screen.findByRole('button', { name: 'הצגת התמונה' })).toBeVisible()

    await openEditSheet()

    const shown = alertShown()

    fireEvent.click(screen.getByText('הסרת התמונה'))
    await shown

    expect(alertHeader()).toBe('להסיר את התמונה?')
    clickAlertButton('מחיקה')

    await waitFor(() => expect(screen.queryByText('הסרת התמונה')).not.toBeInTheDocument())
    expect(screen.queryByRole('button', { name: 'הצגת התמונה' })).not.toBeInTheDocument()
  })

  it('deletes the item after asking, then goes back to the stack root', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/trips/item/${itemId}`)

    const shown = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'מחיקת המצרך' }))
    await shown

    expect(alertHeader()).toBe('למחוק את עגבניות שרי?')
    expect(alertMessage()).toBe('הוא יישאר בשמו בקניות שבהן נקנה.')

    clickAlertButton('מחיקה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/trips'))
  })

  it('keeps the item when the deletion is cancelled', async () => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/items/item/${itemId}`)

    const shown = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'מחיקת המצרך' }))
    await shown

    const dismissed = alertDismissed()

    clickAlertButton('ביטול')
    await dismissed

    expect(currentPath()).toBe(`/tabs/items/item/${itemId}`)
    expect(screen.getByRole('heading', { level: 1, name: 'עגבניות שרי' })).toBeVisible()
  })

  it.each([
    ['list', 'רשימה'],
    ['trips', 'קניות'],
    ['items', 'מצרכים'],
  ])('goes back to the %s tab it was opened from', async (stack, backText) => {
    const itemId = await addTomatoes()

    renderAt(`/tabs/${stack}/item/${itemId}`)

    const backButton = await ionElement('ion-back-button')

    expect(backButton).toHaveAttribute('default-href', `/tabs/${stack}`)
    expect(backButton).toHaveAttribute('text', backText)
    expect(await screen.findByRole('heading', { level: 1, name: 'עגבניות שרי' })).toBeVisible()
  })

  it('says so when the item does not exist', async () => {
    renderAt('/tabs/items/item/missing')

    expect(await screen.findByText('המצרך לא נמצא')).toBeVisible()
  })
})
