import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createItem, setItemPhoto } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import {
  alertDismissed,
  alertHeader,
  alertInput,
  alertShown,
  answerAlert,
  clickAlertButton,
  toastMessages,
} from '../helpers/overlays'
import { cameraPhoto, shrunkPhoto, stubObjectUrls } from '../helpers/photo'
import { renderAt } from '../helpers/renderAt'

vi.mock('../../src/photo/shrink', async () => {
  const { fakeShrunkPhoto } = await import('../helpers/photo')

  return { shrinkPhoto: async () => fakeShrunkPhoto() }
})

const NOW = 1_700_000_000_000

stubObjectUrls()

async function openRowSheet(name: string) {
  renderAt('/tabs/list')
  fireEvent.click(await screen.findByRole('button', { name: `כמות ומחיר: ${name}` }))
}

async function openNamePrompt(name: string) {
  const shown = alertShown()

  fireEvent.click(await screen.findByRole('button', { name: `עריכת שם: ${name}` }))
  await shown
}

async function answerNamePrompt(typed: string, button: string) {
  const dismissed = alertDismissed()

  answerAlert(typed, button)
  await dismissed
}

async function editName(name: string, typed: string, button: string) {
  await openNamePrompt(name)
  await answerNamePrompt(typed, button)
}

describe('the row sheet at home', () => {
  beforeEach(resetDb)

  it('renames the item everywhere from a tap on the sheet title, starting from its current name', async () => {
    const milk = await createItem('חלב', NOW)

    await addToList(milk, NOW)
    await openRowSheet('חלב')

    expect(screen.queryByRole('button', { name: 'עריכת שם' })).not.toBeInTheDocument()

    await openNamePrompt('חלב')
    expect(alertHeader()).toBe('עריכת שם')
    expect(alertInput().value).toBe('חלב')
    await answerNamePrompt('חלב 3%', 'שינוי השם')

    await waitFor(async () => expect((await allRecords()).items).toMatchObject([{ id: milk, name: 'חלב 3%' }]))
    expect(await screen.findByRole('button', { name: 'כמות ומחיר: חלב 3%' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'עריכת שם: חלב 3%' })).toHaveTextContent('חלב 3%')
  })

  it('says the name is taken and renames nothing when another item has it', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await createItem('חלב 3%', NOW)
    await openRowSheet('חלב')

    await editName('חלב', 'חלב 3%', 'שינוי השם')

    await waitFor(() => expect(toastMessages()).toContain('כבר יש מצרך בשם הזה'))
    expect((await allRecords()).items.map((found) => found.name).sort()).toEqual(['חלב', 'חלב 3%'])
  })

  it('puts a new item with the typed name on the row from "מצרך חדש", keeping the old item', async () => {
    const milk = await createItem('חלב', NOW)

    await addToList(milk, NOW)
    await openRowSheet('חלב')

    await editName('חלב', 'חלב 3%', 'מצרך חדש')

    expect(await screen.findByRole('button', { name: 'כמות ומחיר: חלב 3%' })).toBeInTheDocument()

    const { items, entries } = await allRecords()

    expect(items.map((found) => found.name).sort()).toEqual(['חלב', 'חלב 3%'])
    expect(entries[0].itemId).not.toBe(milk)
  })

  it('says the item is already on the list when "מצרך חדש" names a listed item', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await addToList(await createItem('ביצים', NOW), NOW + 1)
    await openRowSheet('חלב')

    await editName('חלב', 'ביצים', 'מצרך חדש')

    await waitFor(() => expect(toastMessages()).toContain('כבר ברשימה'))
    expect(screen.getByRole('button', { name: 'כמות ומחיר: חלב' })).toBeInTheDocument()
  })

  it('adds a photo to the item from the row sheet at once', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await openRowSheet('חלב')

    fireEvent.change(await screen.findByLabelText('מהגלריה'), { target: { files: [cameraPhoto()] } })

    expect(await screen.findByText('הסרת התמונה')).toBeVisible()
    expect((await allRecords()).items[0].photoId).toBeDefined()
  })

  it('removes the item photo from the row sheet after asking', async () => {
    const milk = await createItem('חלב', NOW)

    await setItemPhoto(milk, shrunkPhoto(new ArrayBuffer(4), new ArrayBuffer(2)))
    await addToList(milk, NOW)
    await openRowSheet('חלב')

    const shown = alertShown()

    fireEvent.click(await screen.findByText('הסרת התמונה'))
    await shown

    expect(alertHeader()).toBe('להסיר את התמונה?')
    clickAlertButton('מחיקה')

    await waitFor(() => expect(screen.queryByText('הסרת התמונה')).not.toBeInTheDocument())
    expect((await allRecords()).items[0].photoId).toBeUndefined()
  })
})

describe('the row sheet in the shop', () => {
  beforeEach(resetDb)

  it('puts a new item on a taken row, and the row stays taken', async () => {
    const entryId = await addToList(await createItem('חלב', NOW), NOW)

    await toggleTaken(entryId, NOW + 1)
    await openRowSheet('חלב')

    await editName('חלב', 'חלב 3%', 'מצרך חדש')

    expect(await screen.findByRole('button', { name: 'כמות ומחיר: חלב 3%' })).toBeInTheDocument()
    expect((await allRecords()).entries).toMatchObject([{ id: entryId, state: 'taken', takenAt: NOW + 1 }])
  })
})
