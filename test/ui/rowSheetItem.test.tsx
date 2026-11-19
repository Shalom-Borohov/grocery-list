import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createItem, setItemPhoto } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { allRecords } from '../../src/data/recordsContext'
import { resetDb } from '../helpers/db'
import { alertDismissed, alertShown, answerAlert } from '../helpers/overlays'
import { fakeShrunkPhoto, PHOTO_URL, stubObjectUrls } from '../helpers/photo'
import { renderAt } from '../helpers/renderAt'
import { seedItem } from '../helpers/seed'

const NOW = 1_700_000_000_000

stubObjectUrls()

async function openRowSheetFromPhoto(name: string) {
  renderAt('/tabs/list')
  fireEvent.click(await screen.findByRole('button', { name: `תמונה: ${name}` }))
}

describe('the row sheet edits the item', () => {
  beforeEach(resetDb)

  it('sets the verdict for next time, shows it on the row, and a second tap clears it', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await openRowSheetFromPhoto('חלב')

    expect(await screen.findByRole('group', { name: 'לפעם הבאה' })).toBeVisible()

    fireEvent.click(screen.getByRole('button', { name: 'לא לקנות שוב' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'חלב' })).toHaveAccessibleDescription('לא לקנות שוב'))
    expect((await allRecords()).items[0].verdict).toBe('never')

    fireEvent.click(screen.getByRole('button', { name: 'לא לקנות שוב' }))

    await waitFor(() => expect(screen.getByRole('button', { name: 'לא לקנות שוב' })).toHaveAttribute('aria-pressed', 'false'))
    expect((await allRecords()).items[0].verdict).toBeUndefined()
  })

  it('writes the note as it is typed from "הוספת הערה", shows it on the row, and an emptied note is gone', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await openRowSheetFromPhoto('חלב')

    fireEvent.click(await screen.findByRole('button', { name: 'הוספת הערה' }))

    const note = screen.getByRole('textbox', { name: 'הערה' })

    expect(note).toHaveFocus()

    fireEvent.change(note, { target: { value: ' רק 3% ' } })

    await waitFor(() => expect(screen.getByRole('button', { name: 'חלב' })).toHaveAccessibleDescription('רק 3%'))
    expect((await allRecords()).items[0].note).toBe('רק 3%')

    fireEvent.change(note, { target: { value: '' } })

    await waitFor(async () => expect((await allRecords()).items[0].note).toBeUndefined())
  })

  it('keeps the note as last typed when it changes faster than the list refreshes', async () => {
    await addToList(await createItem('חלב', NOW), NOW)
    await openRowSheetFromPhoto('חלב')

    fireEvent.click(await screen.findByRole('button', { name: 'הוספת הערה' }))

    const note = screen.getByRole('textbox', { name: 'הערה' })

    fireEvent.change(note, { target: { value: 'ר' } })
    fireEvent.change(note, { target: { value: '' } })
    fireEvent.click(screen.getByRole('button', { name: 'לא לקנות שוב' }))

    await waitFor(async () => expect((await allRecords()).items[0].verdict).toBe('never'))
    expect((await allRecords()).items[0].note).toBeUndefined()
  })

  it('shows the new item\'s note after "מצרך חדש" puts another item on the row', async () => {
    await addToList(await seedItem('חלב', { note: 'רק 3%' }), NOW)
    await openRowSheetFromPhoto('חלב')
    expect(await screen.findByRole('textbox', { name: 'הערה' })).toHaveValue('רק 3%')

    const shown = alertShown()

    fireEvent.click(screen.getByRole('button', { name: 'עריכת שם' }))
    await shown

    const dismissed = alertDismissed()

    answerAlert('חלב 1%', 'מצרך חדש')
    await dismissed

    expect(await screen.findByRole('button', { name: 'הוספת הערה' })).toBeVisible()
    expect(screen.queryByRole('textbox', { name: 'הערה' })).not.toBeInTheDocument()
  })

  it('shows the item photo full size from the sheet', async () => {
    const milk = await createItem('חלב', NOW)

    await setItemPhoto(milk, fakeShrunkPhoto())
    await addToList(milk, NOW)
    await openRowSheetFromPhoto('חלב')

    fireEvent.click(await screen.findByRole('button', { name: 'הצגת התמונה' }))

    expect(await screen.findByRole('img', { name: 'התמונה של חלב' })).toHaveAttribute('src', PHOTO_URL)
  })

  it('shows the note in its field when the item has one', async () => {
    await addToList(await seedItem('חלב', { note: 'רק 3%' }), NOW)
    await openRowSheetFromPhoto('חלב')

    expect(await screen.findByRole('textbox', { name: 'הערה' })).toHaveValue('רק 3%')
    expect(screen.queryByRole('button', { name: 'הוספת הערה' })).not.toBeInTheDocument()
  })
})
