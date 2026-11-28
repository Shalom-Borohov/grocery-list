import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createItem } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import type { Amount } from '../../src/domain/types'
import { resetDb } from '../helpers/db'
import { amount, packOf } from '../helpers/records'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

const KILOGRAM_ERROR = 'מספר גדול מ־0 עד 10,000, עד 3 ספרות אחרי הנקודה'

async function entryOf(itemId: string) {
  const found = (await allRecords()).entries.find((entry) => entry.itemId === itemId)

  if (!found) {
    throw new Error(`no entry for ${itemId}`)
  }

  return found
}

async function openRowSheet(name: string, startingAmount: Amount) {
  const itemId = await createItem(name, NOW)

  await addToList(itemId, NOW, startingAmount)
  renderAt('/tabs/list')
  fireEvent.click(await screen.findByRole('button', { name: new RegExp(`^כמות ומחיר: ${name}`) }))

  return itemId
}

const rowShows = (name: string, amountText: string) =>
  screen.findByRole('button', { name: new RegExp(`^כמות ומחיר: ${name}.*${amountText}`) })

async function fieldIn(groupName: string) {
  return within(await screen.findByRole('group', { name: groupName })).getByRole('textbox', { name: groupName })
}

describe('typing an amount', () => {
  beforeEach(resetDb)

  it('saves a typed amount in גרם', async () => {
    const cheese = await openRowSheet('גבינה', amount(100, 'gram'))

    fireEvent.change(await fieldIn('כמות'), { target: { value: '250' } })

    await waitFor(async () => expect((await entryOf(cheese)).amount).toEqual(amount(250, 'gram')))
  })

  it('steps from the typed number', async () => {
    const cheese = await openRowSheet('גבינה', amount(100, 'gram'))

    fireEvent.change(await fieldIn('כמות'), { target: { value: '250' } })
    await rowShows('גבינה', '250')
    fireEvent.click(screen.getByRole('button', { name: 'יותר' }))

    await waitFor(async () => expect((await entryOf(cheese)).amount).toEqual(amount(350, 'gram')))
    expect(await fieldIn('כמות')).toHaveValue('350')
  })

  it('takes a fraction in ק״ג typed with a comma, and shows it with a point once the field is left', async () => {
    const apples = await openRowSheet('תפוחים', amount(1, 'kilogram'))
    const field = await fieldIn('כמות')

    expect(field).toHaveAttribute('inputmode', 'decimal')
    fireEvent.focus(field)
    fireEvent.change(field, { target: { value: '1,2' } })
    await waitFor(async () => expect((await entryOf(apples)).amount).toEqual(amount(1.2, 'kilogram')))
    await rowShows('תפוחים', '1\\.2')
    fireEvent.blur(field)

    expect(field).toHaveValue('1.2')
  })

  it('says what fits when the number cannot be an amount, and keeps the last good amount', async () => {
    const eggs = await openRowSheet('ביצים', amount(6))
    const field = await fieldIn('כמות')

    expect(field).toHaveAttribute('inputmode', 'numeric')
    fireEvent.change(field, { target: { value: '1.5' } })

    expect(field).toHaveAttribute('aria-invalid', 'false')
    fireEvent.blur(field)
    expect(field).toHaveAttribute('aria-invalid', 'true')
    expect(field).toHaveAccessibleDescription('מספר שלם מ־1 עד 10,000')
    expect(field).toHaveValue('1.5')
    expect((await entryOf(eggs)).amount).toEqual(amount(6))

    fireEvent.change(field, { target: { value: '12' } })

    await waitFor(async () => expect((await entryOf(eggs)).amount).toEqual(amount(12)))
    expect(field).toHaveAttribute('aria-invalid', 'false')
    expect(screen.queryByText('מספר שלם מ־1 עד 10,000')).not.toBeInTheDocument()
  })

  it('says what fits in ק״ג, and drops the bad number when the unit changes', async () => {
    const apples = await openRowSheet('תפוחים', amount(1, 'kilogram'))

    const field = await fieldIn('כמות')

    fireEvent.change(field, { target: { value: '0' } })
    expect(screen.queryByText(KILOGRAM_ERROR)).not.toBeInTheDocument()
    fireEvent.change(field, { target: { value: '0.5' } })
    await waitFor(async () => expect((await entryOf(apples)).amount).toEqual(amount(0.5, 'kilogram')))
    fireEvent.change(field, { target: { value: '0' } })
    fireEvent.blur(field)

    expect(await screen.findByText(KILOGRAM_ERROR)).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'גרם' }))

    await waitFor(async () => expect((await entryOf(apples)).amount).toEqual(amount(100, 'gram')))
    expect(await fieldIn('כמות')).toHaveValue('100')
    expect(screen.queryByText(KILOGRAM_ERROR)).not.toBeInTheDocument()
  })

  it('goes back to the saved amount when the field is left blank', async () => {
    const eggs = await openRowSheet('ביצים', amount(6))
    const field = await fieldIn('כמות')

    fireEvent.change(field, { target: { value: '' } })

    expect(field).toHaveAttribute('aria-invalid', 'false')
    fireEvent.blur(field)
    expect(field).toHaveValue('6')
    expect((await entryOf(eggs)).amount).toEqual(amount(6))
  })

  it('speaks the number after a step, and not while it is being typed', async () => {
    await openRowSheet('ביצים', amount(6))
    const field = await fieldIn('כמות')
    const spoken = within(screen.getByRole('group', { name: 'כמות' })).getByRole('status')

    expect(spoken).toHaveTextContent('6')
    fireEvent.focus(field)
    fireEvent.change(field, { target: { value: '12' } })
    await rowShows('ביצים', '12')

    expect(spoken).toHaveTextContent('6')
    fireEvent.blur(field)
    await waitFor(() => expect(spoken).toHaveTextContent('12'))

    fireEvent.click(screen.getByRole('button', { name: 'יותר' }))

    await waitFor(() => expect(spoken).toHaveTextContent('13'))
  })

  it('types how many are in a pack, from 2 to 99', async () => {
    const soap = await openRowSheet('סבון מוצק', packOf(1, 2))
    const field = await fieldIn('כמה באריזה')

    fireEvent.change(field, { target: { value: '24' } })
    await waitFor(async () => expect((await entryOf(soap)).amount).toEqual(packOf(1, 24)))

    fireEvent.change(field, { target: { value: '100' } })
    fireEvent.blur(field)

    expect(field).toHaveAccessibleDescription('מספר שלם מ־2 עד 99')
    expect((await entryOf(soap)).amount).toEqual(packOf(1, 24))
  })
})
