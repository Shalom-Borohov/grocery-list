import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { createItem, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { startTrip } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { swipeOption } from '../helpers/ionic'
import { amount, line, trip } from '../helpers/records'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

const rowBody = (name: string) => screen.getByRole('button', { name })

const rowNames = () => Array.from(document.querySelectorAll('.label-row-name'), (element) => element.textContent)

async function entryOf(itemId: string) {
  const found = (await allRecords()).entries.find((entry) => entry.itemId === itemId)

  if (!found) {
    throw new Error(`no entry for ${itemId}`)
  }

  return found
}

async function shopWith(names: string[]) {
  const itemIds: string[] = []

  for (const [index, name] of names.entries()) {
    const itemId = await createItem(name, NOW)

    await addToList(itemId, NOW + index)
    itemIds.push(itemId)
  }

  await startTrip(NOW)

  return itemIds
}

describe('the list in the shop', () => {
  beforeEach(resetDb)

  it('shows how many items are left as the big number, with what is in the cart and what was missing', async () => {
    const [milk, eggs] = await shopWith(['חלב', 'ביצים', 'קפה'])

    await toggleTaken((await entryOf(milk)).id, NOW)
    await toggleMissing((await entryOf(eggs)).id)

    renderAt('/tabs/list')

    expect(await screen.findByRole('heading', { name: 'נשארו 1' })).toBeInTheDocument()
    expect(screen.getByText('1 בעגלה · 1 לא היה')).toBeVisible()
    expect(screen.getByRole('button', { name: 'סיום' })).toBeVisible()
    expect(screen.getByRole('button', { name: 'הוספה' })).toBeVisible()
    expect(rowBody('ביצים')).toHaveAccessibleDescription('לא היה')
  })

  it('leaves out a zero part of the count line', async () => {
    const [milk] = await shopWith(['חלב', 'ביצים'])

    await toggleTaken((await entryOf(milk)).id, NOW)

    renderAt('/tabs/list')

    expect(await screen.findByText('1 בעגלה')).toBeVisible()
  })

  it('takes an item with one tap: it sinks, is struck and ticked, and the count drops; a second tap puts it back', async () => {
    await shopWith(['חלב', 'ביצים', 'קפה'])

    renderAt('/tabs/list')
    await screen.findByRole('heading', { name: 'נשארו 3' })

    fireEvent.click(rowBody('חלב'))

    await screen.findByRole('heading', { name: 'נשארו 2' })
    expect(rowNames()).toEqual(['ביצים', 'קפה', 'חלב'])
    expect(rowBody('חלב')).toHaveAttribute('aria-pressed', 'true')
    expect(rowBody('חלב').closest('.label-row')).toHaveClass('is-taken')
    expect(rowBody('חלב').querySelector('.tick-ring')).toHaveClass('is-ticked')
    expect(screen.getByText('1 בעגלה')).toBeVisible()

    fireEvent.click(rowBody('חלב'))

    await screen.findByRole('heading', { name: 'נשארו 3' })
    expect(rowNames()).toEqual(['חלב', 'ביצים', 'קפה'])
    expect(rowBody('חלב')).toHaveAttribute('aria-pressed', 'false')
  })

  it('changes the amount and marks the item missing from the sheet the amount column opens', async () => {
    const [milk] = await shopWith(['חלב', 'ביצים'])

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))
    fireEvent.click(await screen.findByRole('button', { name: 'יותר' }))

    await waitFor(async () => expect((await entryOf(milk)).amount).toEqual(amount(2)))

    fireEvent.click(screen.getByRole('button', { name: 'לא היה' }))

    await waitFor(async () => expect((await entryOf(milk)).state).toBe('missing'))
    expect(await screen.findByRole('button', { name: 'היה בכל זאת' })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'נשארו 1' })).toBeInTheDocument()
  })

  it('offers the last recorded price as a hint and saves only a typed price', async () => {
    const [milk] = await shopWith(['חלב'])

    await db.trips.add(trip({ id: 'last', finishedAt: NOW - 1, lines: [line({ itemId: milk, name: 'חלב', price: 6.9 })] }))
    await updateItem(milk, { note: 'רק 3%' })

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))

    const priceInput = await screen.findByRole('textbox', { name: 'מחיר' })

    expect(priceInput).toHaveValue('')
    expect(priceInput).toHaveAttribute('placeholder', '6.90')
    expect((await entryOf(milk)).price).toBeUndefined()

    fireEvent.change(priceInput, { target: { value: '7.5' } })

    await waitFor(async () => expect((await entryOf(milk)).price).toBe(7.5))
  })

  it('confirms last time\'s price with one tap', async () => {
    const [milk] = await shopWith(['חלב'])

    await db.trips.add(trip({ id: 'last', finishedAt: NOW - 1, lines: [line({ itemId: milk, name: 'חלב', price: 6.9 })] }))

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))
    fireEvent.click(await screen.findByRole('button', { name: 'כמו בפעם שעברה: ₪6.90' }))

    await waitFor(async () => expect((await entryOf(milk)).price).toBe(6.9))
    expect(screen.getByRole('textbox', { name: 'מחיר' })).toHaveValue('6.90')
    expect(screen.queryByRole('button', { name: 'כמו בפעם שעברה: ₪6.90' })).not.toBeInTheDocument()
  })

  it('marks a waiting item missing from its swipe option, and puts it back the same way', async () => {
    const [milk] = await shopWith(['חלב', 'ביצים'])

    renderAt('/tabs/list')
    await screen.findByRole('heading', { name: 'נשארו 2' })
    fireEvent.click(swipeOption('חלב', 'לא היה'))

    await waitFor(async () => expect((await entryOf(milk)).state).toBe('missing'))
    fireEvent.click(await waitFor(() => swipeOption('חלב', 'היה בכל זאת')))

    await waitFor(async () => expect((await entryOf(milk)).state).toBe('waiting'))
  })

  it('offers no swipe on a taken item', async () => {
    const [milk] = await shopWith(['חלב'])

    await toggleTaken((await entryOf(milk)).id, NOW)

    renderAt('/tabs/list')
    await screen.findByRole('heading', { name: 'נשארו 0' })

    expect(screen.getByText('חלב').closest('ion-item-sliding')?.querySelector('ion-item-option')).toBeNull()
  })

  it('says the list is empty and still offers finishing', async () => {
    await startTrip(NOW)

    renderAt('/tabs/list')

    expect(await screen.findByText(/אין מצרכים ברשימה/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'סיום' })).toBeVisible()
  })
})
