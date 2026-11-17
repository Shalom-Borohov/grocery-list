import { screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { createItem, setItemPhoto } from '../../src/data/itemsRepo'
import { addToList, toggleTaken } from '../../src/data/listRepo'
import { finishShopping, startTrip } from '../../src/data/tripsRepo'
import { resetDb } from '../helpers/db'
import { shrunkPhoto } from '../helpers/photo'
import { renderAt } from '../helpers/renderAt'

const NOW = 1_700_000_000_000

const PHOTO = shrunkPhoto(new Uint8Array([1]).buffer, new Uint8Array([2]).buffer)

describe('settings', () => {
  beforeEach(resetDb)

  it('says what the backup holds: items, trips and photos', async () => {
    const milk = await createItem('חלב', NOW)

    await createItem('ביצים', NOW)
    await setItemPhoto(milk, PHOTO)
    await startTrip(NOW)
    await toggleTaken(await addToList(milk, NOW), NOW)
    await finishShopping({ receipts: [PHOTO] }, NOW + 1)

    renderAt('/tabs/settings')

    expect(await screen.findByText('2 מצרכים · קנייה אחת · 2 תמונות')).toBeVisible()
    expect(screen.getByRole('heading', { level: 1, name: 'הגדרות' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'ייצוא גיבוי' })).toBeVisible()
    expect(screen.getByText(/^גרסה 0\.1\.0/)).toBeInTheDocument()
  })
})
