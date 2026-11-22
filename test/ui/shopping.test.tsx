import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { db } from '../../src/data/db'
import { createItem, updateItem } from '../../src/data/itemsRepo'
import { addToList, toggleMissing, toggleTaken, updateEntry } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import { swipeOption } from '../helpers/ionic'
import { amount, line, trip } from '../helpers/records'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

const rowBody = (name: string) => screen.getByRole('button', { name })

const ring = (name: string) => screen.getByRole('button', { name: `נלקח: ${name}` })

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

  return itemIds
}

describe('shopping from the list', () => {
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

  it('takes an item with one tap on its ring: it sinks, is struck and ticked, and the count drops; a second tap puts it back', async () => {
    await shopWith(['חלב', 'ביצים', 'קפה'])

    renderAt('/tabs/list')
    await screen.findByText('חלב')

    fireEvent.click(ring('חלב'))

    await screen.findByRole('heading', { name: 'נשארו 2' })
    expect(rowNames()).toEqual(['ביצים', 'קפה', 'חלב'])
    expect(ring('חלב')).toHaveAttribute('aria-pressed', 'true')
    expect(ring('חלב').closest('.label-row')).toHaveClass('is-taken')
    expect(ring('חלב').querySelector('.tick-ring')).toHaveClass('is-ticked')
    expect(screen.getByText('1 בעגלה')).toBeVisible()

    fireEvent.click(ring('חלב'))

    await waitFor(() => expect(ring('חלב')).toHaveAttribute('aria-pressed', 'false'))
    expect(rowNames()).toEqual(['חלב', 'ביצים', 'קפה'])
  })

  it('takes an item the shop did not have with one tap on its ring, and a second tap leaves it waiting', async () => {
    const [milk] = await shopWith(['חלב', 'ביצים'])

    await toggleMissing((await entryOf(milk)).id)

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'נלקח: חלב' }))

    await waitFor(() => expect(ring('חלב')).toHaveAttribute('aria-pressed', 'true'))
    expect((await entryOf(milk)).state).toBe('taken')

    fireEvent.click(ring('חלב'))

    await waitFor(() => expect(ring('חלב')).toHaveAttribute('aria-pressed', 'false'))
    expect((await entryOf(milk)).state).toBe('waiting')
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

  it('shows the price typed on a row under its name, before its verdict, but not on a row the shop did not have', async () => {
    const [milk, eggs, bread] = await shopWith(['חלב', 'ביצים', 'לחם', 'קפה'])

    await updateItem(milk, { verdict: 'again' })
    await updateEntry((await entryOf(milk)).id, { price: 9.9 })
    await updateEntry((await entryOf(eggs)).id, { price: 15 })
    await toggleTaken((await entryOf(eggs)).id, NOW)
    await updateEntry((await entryOf(bread)).id, { price: 7 })
    await toggleMissing((await entryOf(bread)).id)

    renderAt('/tabs/list')

    expect(await screen.findByRole('button', { name: 'חלב' })).toHaveAccessibleDescription('₪9.90 · לקנות שוב')
    expect(rowBody('ביצים')).toHaveAccessibleDescription('₪15')
    expect(rowBody('לחם')).toHaveAccessibleDescription('לא היה')
    expect(rowBody('קפה')).toHaveAccessibleDescription('')
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
    await screen.findByText('חלב')
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
})
