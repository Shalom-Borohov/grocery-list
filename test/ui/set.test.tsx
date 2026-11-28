import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { allRecords } from '../../src/data/recordsContext'
import { addToList } from '../../src/data/listRepo'
import { updateSet } from '../../src/data/setsRepo'
import { resetDb } from '../helpers/db'
import {
  alertDismissed,
  alertHeader,
  alertInput,
  alertShown,
  answerAlert,
  clickAlertButton,
  modalDismissed,
  shownSheetName,
  toastMessages,
} from '../helpers/overlays'
import { amount, CREATED_AT, packOf } from '../helpers/records'
import { currentPath, renderAt } from '../helpers/renderAt'
import { seedItem, seedSet } from '../helpers/seed'

async function seedBasics() {
  const milkId = await seedItem('חלב', { usualAmount: amount(2, 'liter') })
  const eggsId = await seedItem('ביצים', { usualAmount: amount(12) })
  const setId = await seedSet('בסיס', [milkId, eggsId], CREATED_AT)

  return { milkId, eggsId, setId }
}

const setRows = async () => {
  const list = await screen.findByRole('list', { name: 'בסיס' })

  return within(list).getAllByRole('listitem')
}

async function renameTo(name: string) {
  const asked = alertShown()

  fireEvent.click(await screen.findByRole('button', { name: 'עריכת שם' }))
  await asked

  expect(alertInput().value).toBe('בסיס')

  const dismissed = alertDismissed()

  answerAlert(name, 'שמירה')
  await dismissed
}

describe('set page', () => {
  beforeEach(resetDb)

  it('shows the set name and its items with their amounts', async () => {
    const { setId } = await seedBasics()

    renderAt(`/tabs/items/sets/${setId}`)

    expect(await screen.findByRole('heading', { name: 'בסיס' })).toBeVisible()
    expect((await setRows()).map((row) => row.textContent)).toEqual(['12ביצים', '2ליטרחלב'])
  })

  it('reads a pack in the set as packs of a size, not as a multiplication', async () => {
    const soapId = await seedItem('סבון מוצק', { usualAmount: packOf(2, 4) })
    const setId = await seedSet('ניקיון', [soapId], CREATED_AT)

    renderAt(`/tabs/items/sets/${setId}`)

    const [soapRow] = await within(await screen.findByRole('list', { name: 'ניקיון' })).findAllByRole('listitem')

    expect(within(soapRow).getByText('2 אריזות של 4')).toHaveClass('visually-hidden')
    expect(within(soapRow).getByText('אריזה ×4')).toHaveAttribute('aria-hidden', 'true')
  })

  it('renames the set, and keeps the name when the new one is blank', async () => {
    const { setId } = await seedBasics()

    renderAt(`/tabs/items/sets/${setId}`)
    await renameTo('   ')
    await renameTo('שבועי')

    expect(await screen.findByRole('heading', { name: 'שבועי' })).toBeVisible()
    expect((await allRecords()).sets.map(({ name }) => name)).toEqual(['שבועי'])
  })

  it('changes an item amount in the set from its row', async () => {
    const { milkId, setId } = await seedBasics()

    renderAt(`/tabs/items/sets/${setId}`)
    fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))

    const amountField = await screen.findByRole('group', { name: 'כמות' })

    await waitFor(() => expect(shownSheetName()).toBe('חלב'))
    fireEvent.click(within(amountField).getByRole('button', { name: 'יותר' }))

    await waitFor(async () =>
      expect((await allRecords()).sets[0].entries).toContainEqual({ itemId: milkId, amount: amount(3, 'liter') }),
    )
  })

  it('types an item amount in the set', async () => {
    const { milkId, setId } = await seedBasics()

    renderAt(`/tabs/items/sets/${setId}`)
    fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))
    fireEvent.change(within(await screen.findByRole('group', { name: 'כמות' })).getByRole('textbox', { name: 'כמות' }), {
      target: { value: '1.5' },
    })

    await waitFor(async () =>
      expect((await allRecords()).sets[0].entries).toContainEqual({ itemId: milkId, amount: amount(1.5, 'liter') }),
    )
  })

  it('removes an item from the set from its row', async () => {
    const { eggsId, setId } = await seedBasics()

    renderAt(`/tabs/items/sets/${setId}`)
    fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))

    const closed = modalDismissed()

    fireEvent.click(await screen.findByRole('button', { name: 'הסרה מהערכה' }))
    await closed

    await waitFor(async () => expect((await setRows()).map((row) => row.textContent)).toEqual(['12ביצים']))
    expect((await allRecords()).sets[0].entries.map(({ itemId }) => itemId)).toEqual([eggsId])
  })

  it('adds and takes items off the set from the item sheet, with search', async () => {
    const { milkId, setId } = await seedBasics()
    const coffeeId = await seedItem('קפה', { usualAmount: amount(2) })

    await seedItem('קמח')

    renderAt(`/tabs/items/sets/${setId}`)
    fireEvent.click(await screen.findByRole('button', { name: 'הוספת מצרכים' }))

    const picker = await screen.findByRole('list', { name: 'מצרכים לערכה' })

    await waitFor(() => expect(shownSheetName()).toBe('הוספת מצרכים'))
    expect(within(picker).getByRole('button', { name: 'חלב' })).toHaveAttribute('aria-pressed', 'true')
    expect(within(picker).getByRole('button', { name: 'קפה' })).toHaveAttribute('aria-pressed', 'false')

    fireEvent.input(screen.getByRole('searchbox', { name: 'חיפוש' }), { target: { value: 'ק' } })

    await waitFor(() =>
      expect(within(picker).getAllByRole('listitem').map((row) => row.textContent)).toEqual(['קמח', 'קפה']),
    )

    fireEvent.click(within(picker).getByRole('button', { name: 'קפה' }))

    await waitFor(() => expect(within(picker).getByRole('button', { name: 'קפה' })).toHaveAttribute('aria-pressed', 'true'))

    fireEvent.input(screen.getByRole('searchbox', { name: 'חיפוש' }), { target: { value: '' } })
    fireEvent.click(within(picker).getByRole('button', { name: 'ביצים' }))

    await waitFor(async () =>
      expect((await allRecords()).sets[0].entries).toEqual([
        { itemId: milkId, amount: amount(2, 'liter') },
        { itemId: coffeeId, amount: amount(2) },
      ]),
    )
  })

  it('pours the items that are not on the list yet into it', async () => {
    const { milkId, eggsId, setId } = await seedBasics()
    const coffeeId = await seedItem('קפה')

    await updateSet(setId, {
      entries: [
        { itemId: milkId, amount: amount(3, 'liter') },
        { itemId: eggsId, amount: amount(12) },
        { itemId: coffeeId, amount: amount(1) },
      ],
    })
    await addToList(eggsId, CREATED_AT, amount(6))

    renderAt(`/tabs/items/sets/${setId}`)
    fireEvent.click(await screen.findByRole('button', { name: 'הוספה לרשימה' }))

    await waitFor(() => expect(toastMessages()).toEqual(['נוספו 2 לרשימה']))

    const listed = (await allRecords()).entries.map(({ itemId, amount: listedAmount }) => ({ itemId, listedAmount }))

    expect(listed).toEqual(
      expect.arrayContaining([
        { itemId: milkId, listedAmount: amount(3, 'liter') },
        { itemId: eggsId, listedAmount: amount(6) },
        { itemId: coffeeId, listedAmount: amount(1) },
      ]),
    )
    expect(listed).toHaveLength(3)
  })

  it('says when everything in the set is already on the list', async () => {
    const { milkId, eggsId, setId } = await seedBasics()

    await addToList(milkId, CREATED_AT)
    await addToList(eggsId, CREATED_AT)

    renderAt(`/tabs/items/sets/${setId}`)
    fireEvent.click(await screen.findByRole('button', { name: 'הוספה לרשימה' }))

    await waitFor(() => expect(toastMessages()).toEqual(['הכול כבר ברשימה']))
  })

  it('deletes the set after asking, keeps its items and goes back to מצרכים', async () => {
    const { setId } = await seedBasics()

    renderAt(`/tabs/items/sets/${setId}`)

    const asked = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'מחיקת הערכה' }))
    await asked

    expect(alertHeader()).toBe('למחוק את בסיס?')

    clickAlertButton('מחיקה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/items'))

    const { sets, items } = await allRecords()

    expect(sets).toEqual([])
    expect(items).toHaveLength(2)
  })

  it('says when the set does not exist', async () => {
    renderAt('/tabs/items/sets/missing')

    expect(await screen.findByText('הערכה לא נמצאה')).toBeVisible()
  })
})
