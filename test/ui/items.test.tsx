import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { setItemPhoto } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import {
  actionSheetButtons,
  actionSheetShown,
  alertDismissed,
  alertHeader,
  alertInput,
  alertShown,
  answerAlert,
  clickActionSheetButton,
} from '../helpers/overlays'
import { PHOTO_URL, shrunkPhoto, stubObjectUrls } from '../helpers/photo'
import { currentPath, renderAt } from '../helpers/renderAt'
import { amount, CREATED_AT } from '../helpers/records'
import { seedItem, seedSet } from '../helpers/seed'

const shownRows = async () => {
  const list = await screen.findByRole('list', { name: 'כל המצרכים' })

  return within(list).getAllByRole('listitem')
}

async function chooseFromAdd(choice: string) {
  const sheetShown = actionSheetShown()

  fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))
  await sheetShown

  const nameAsked = alertShown()

  clickActionSheetButton(choice)
  await nameAsked
}

async function nameIt(name: string) {
  const dismissed = alertDismissed()

  answerAlert(name, 'הוספה')
  await dismissed
}

describe('items tab', () => {
  beforeEach(resetDb)
  stubObjectUrls()

  it('lists every item alphabetically with its usual amount and its note or verdict', async () => {
    await seedItem('מלפפונים', { usualAmount: amount(1, 'kilogram'), note: 'בפעם שעברה קילו לא הספיק' })
    await seedItem('ביצים', { usualAmount: amount(12) })
    await seedItem('קוטג׳', { verdict: 'again' })
    await seedItem('חטיף', { verdict: 'never' })

    renderAt('/tabs/items')

    const rows = await shownRows()

    expect(rows.map((row) => row.querySelector('.label-row-name')?.textContent)).toEqual([
      'ביצים',
      'חטיף',
      'מלפפונים',
      'קוטג׳',
    ])
    expect(rows[0]).toHaveTextContent('12')
    expect(within(rows[1]).getByRole('button', { name: 'חטיף' })).toHaveAccessibleDescription('לא לקנות שוב')
    expect(rows[2]).toHaveTextContent('1ק״ג')
    expect(rows[2]).toHaveTextContent('בפעם שעברה קילו לא הספיק')
    expect(rows[3]).toHaveTextContent('לקנות שוב')
  })

  it('shows an item photo on its row', async () => {
    const itemId = await seedItem('עגבניות שרי')

    await setItemPhoto(itemId, shrunkPhoto(new Uint8Array([1]).buffer, new Uint8Array([2]).buffer))

    renderAt('/tabs/items')

    const [row] = await shownRows()

    await waitFor(() => expect(row.querySelector('img')).toHaveAttribute('src', PHOTO_URL))
    expect(row.querySelector('img')).toHaveAttribute('alt', '')
  })

  it('filters the items by part of the name', async () => {
    await seedItem('חלב 3%')
    await seedItem('חלב שקדים')
    await seedItem('ביצים')

    renderAt('/tabs/items')
    await shownRows()
    fireEvent.input(screen.getByRole('searchbox', { name: 'חיפוש' }), { target: { value: 'חלב' } })

    await waitFor(async () => expect((await shownRows()).map((row) => row.textContent)).toEqual(['חלב 3%', 'חלב שקדים']))
  })

  it('opens an item page from its row', async () => {
    const itemId = await seedItem('ביצים')

    renderAt('/tabs/items')
    fireEvent.click(await screen.findByRole('button', { name: 'ביצים' }))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/items/item/${itemId}`))
  })

  it('shows each saved set as a card with its item count that opens the set', async () => {
    const milkId = await seedItem('חלב')
    const eggsId = await seedItem('ביצים')
    const setId = await seedSet('בסיס', [milkId, eggsId], CREATED_AT)

    await seedSet('שישי', [milkId], CREATED_AT + 1)

    renderAt('/tabs/items')

    const sets = await screen.findByRole('list', { name: 'ערכות' })

    expect(within(sets).getAllByRole('listitem').map((card) => card.textContent)).toEqual([
      'בסיס2 מצרכים',
      'שישימצרך אחד',
    ])

    fireEvent.click(within(sets).getByRole('link', { name: /בסיס/ }))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/items/sets/${setId}`))
  })

  it('hides the sets when there are none', async () => {
    await seedItem('חלב')

    renderAt('/tabs/items')
    await shownRows()

    expect(screen.queryByRole('list', { name: 'ערכות' })).not.toBeInTheDocument()
  })

  it('creates a new item through + and opens its page', async () => {
    renderAt('/tabs/items')
    await chooseFromAdd('מצרך חדש')

    expect(alertHeader()).toBe('מצרך חדש')
    expect(alertInput()).toHaveAttribute('placeholder', 'שם המצרך')

    await nameIt('  חומוס ')
    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/items\/item\//))

    const { items } = await allRecords()

    expect(items.map(({ name }) => name)).toEqual(['חומוס'])
    expect(currentPath()).toBe(`/tabs/items/item/${items[0].id}`)
  })

  it('creates an empty set and opens its page', async () => {
    renderAt('/tabs/items')
    await chooseFromAdd('ערכה ריקה')

    expect(alertInput()).toHaveAttribute('placeholder', 'שם הערכה')

    await nameIt('שישי')
    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/items\/sets\//))

    const { sets } = await allRecords()

    expect(sets.map(({ name, entries }) => ({ name, entries }))).toEqual([{ name: 'שישי', entries: [] }])
    expect(currentPath()).toBe(`/tabs/items/sets/${sets[0].id}`)
  })

  it('creates a set from the items on the list with their amounts there', async () => {
    const milkId = await seedItem('חלב', { usualAmount: amount(1, 'liter') })
    const eggsId = await seedItem('ביצים')

    await seedItem('קפה')
    await addToList(milkId, CREATED_AT, amount(2, 'liter'))
    await addToList(eggsId, CREATED_AT)

    renderAt('/tabs/items')
    await chooseFromAdd('ערכה מהרשימה')
    await nameIt('בסיס')
    await waitFor(() => expect(currentPath()).toMatch(/^\/tabs\/items\/sets\//))

    const { sets } = await allRecords()

    expect(sets[0].name).toBe('בסיס')
    expect(sets[0].entries).toEqual(
      expect.arrayContaining([
        { itemId: milkId, amount: amount(2, 'liter') },
        { itemId: eggsId, amount: amount(1) },
      ]),
    )
    expect(sets[0].entries).toHaveLength(2)
  })

  it('offers a set from the list only when the list has items', async () => {
    renderAt('/tabs/items')

    const sheetShown = actionSheetShown()

    fireEvent.click(await screen.findByRole('button', { name: 'הוספה' }))
    await sheetShown

    expect(actionSheetButtons()).toEqual(['מצרך חדש', 'ערכה ריקה', 'ביטול'])
  })

  it('creates nothing for a blank name', async () => {
    renderAt('/tabs/items')
    await chooseFromAdd('מצרך חדש')
    await nameIt('   ')

    expect((await allRecords()).items).toEqual([])
    expect(currentPath()).toBe('/tabs/items')
  })

  it('says items appear once they are added to the list when there are none', async () => {
    renderAt('/tabs/items')

    expect(await screen.findByText('מצרכים יופיעו כאן אחרי שיתווספו לרשימה.')).toBeVisible()
    expect(screen.queryByRole('list', { name: 'כל המצרכים' })).not.toBeInTheDocument()
  })
})
