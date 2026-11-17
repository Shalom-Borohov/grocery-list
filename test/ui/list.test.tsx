import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createItem, updateItem } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import { swipeOption } from '../helpers/ionic'
import { modalDismissed } from '../helpers/overlays'
import { amount } from '../helpers/records'
import { currentPath, renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

describe('the list at home', () => {
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

  it('starts shopping from the yellow button, which turns the list into the shop view', async () => {
    await addToList(await createItem('חלב', NOW), NOW)

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'התחלת קנייה' }))

    expect(await screen.findByRole('heading', { name: 'נשארו 1' })).toBeInTheDocument()
    expect((await allRecords()).activeTrip).toBeDefined()
    expect(screen.queryByRole('button', { name: 'התחלת קנייה' })).not.toBeInTheDocument()
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

  it('opens the row sheet from the row, and removes the entry from there', async () => {
    await addToList(await createItem('חלב', NOW), NOW)

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))

    expect(await screen.findByRole('button', { name: 'הסרה מהרשימה' })).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'לא היה' })).not.toBeInTheDocument()

    const dismissed = modalDismissed()

    fireEvent.click(screen.getByRole('button', { name: 'הסרה מהרשימה' }))
    await dismissed

    expect((await allRecords()).entries).toEqual([])
    expect(await screen.findByText(/הרשימה ריקה/)).toBeVisible()
  })

  it('goes from the row sheet to the item page in the list stack', async () => {
    const milk = await createItem('חלב', NOW)

    await addToList(milk, NOW)

    renderAt('/tabs/list')
    fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))
    fireEvent.click(await screen.findByRole('button', { name: 'לדף המצרך' }))

    await waitFor(() => expect(currentPath()).toBe(`/tabs/list/item/${milk}`))
  })

  it('says the list is empty and offers adding but not shopping', async () => {
    renderAt('/tabs/list')

    expect(await screen.findByText(/הרשימה ריקה/)).toBeVisible()
    expect(screen.getByRole('button', { name: 'הוספה' })).toBeVisible()
    expect(screen.queryByRole('button', { name: 'התחלת קנייה' })).not.toBeInTheDocument()
  })
})
