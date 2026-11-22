import { fireEvent, screen, waitFor, within } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createItem, setItemPhoto } from '../../src/data/itemsRepo'
import { addToList } from '../../src/data/listRepo'
import { resetDb } from '../helpers/db'
import { expectElementsInOrder, sheetOf } from '../helpers/ionic'
import { fakeShrunkPhoto, SHRUNK_PHOTO_BYTES, stubObjectUrls } from '../helpers/photo'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

const FULL_PHOTO_URL = 'blob:full-photo'

const THUMBNAIL_URL = 'blob:thumbnail'

stubObjectUrls((blob) => (blob.size === SHRUNK_PHOTO_BYTES.length ? FULL_PHOTO_URL : THUMBNAIL_URL))

async function milkWithPhoto() {
  const milk = await createItem('חלב', NOW)

  await setItemPhoto(milk, fakeShrunkPhoto())

  return milk
}

const sheetAround = (element: HTMLElement) => within(sheetOf(element))

async function openRowSheet() {
  renderAt('/tabs/list')
  fireEvent.click(await screen.findByRole('button', { name: 'כמות ומחיר: חלב' }))

  return sheetAround(await screen.findByRole('button', { name: 'הסרה מהרשימה' }))
}

async function openEditSheet(itemId: string) {
  renderAt(`/tabs/items/item/${itemId}`)
  fireEvent.click(await screen.findByRole('button', { name: 'עריכה' }))

  return sheetAround(await screen.findByLabelText('שם'))
}

describe('the photo in a sheet', () => {
  beforeEach(resetDb)

  it('shows the full photo first in the row sheet, above the amount, with its buttons still under the note', async () => {
    await addToList(await milkWithPhoto(), NOW)

    const sheet = await openRowSheet()
    const photo = sheet.getByRole('button', { name: 'הצגת התמונה' })

    await waitFor(() => expect(photo.querySelector('img')).toHaveAttribute('src', FULL_PHOTO_URL))
    expectElementsInOrder([photo, sheet.getByText('כמות'), sheet.getByText('הוספת הערה'), sheet.getByText('מהגלריה')])
  })

  it('shows the full photo first in the item page\'s "עריכה", above the name', async () => {
    const sheet = await openEditSheet(await milkWithPhoto())
    const photo = sheet.getByRole('button', { name: 'הצגת התמונה' })

    await waitFor(() => expect(photo.querySelector('img')).toHaveAttribute('src', FULL_PHOTO_URL))
    expectElementsInOrder([photo, sheet.getByLabelText('שם'), sheet.getByText('מהגלריה')])
  })

  it('opens the photo full size when tapped in the sheet', async () => {
    await addToList(await milkWithPhoto(), NOW)

    const sheet = await openRowSheet()

    fireEvent.click(sheet.getByRole('button', { name: 'הצגת התמונה' }))

    expect(await screen.findByRole('img', { name: 'התמונה של חלב' })).toHaveAttribute('src', FULL_PHOTO_URL)
  })

  it('starts the row sheet with the amount when the item has no photo', async () => {
    await addToList(await createItem('חלב', NOW), NOW)

    const sheet = await openRowSheet()

    expect(sheet.queryByRole('button', { name: 'הצגת התמונה' })).not.toBeInTheDocument()
  })
})
