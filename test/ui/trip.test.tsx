import { fireEvent, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { db } from '../../src/data/db'
import { addTripReceipt } from '../../src/data/tripsRepo'
import type { Trip } from '../../src/domain/types'
import { freezeDate } from '../helpers/clock'
import { resetDb } from '../helpers/db'
import { alertHeader, alertShown, answerAlert, clickAlertButton, modalDismissed, toastMessages } from '../helpers/overlays'
import { cameraPhoto, PHOTO_URL, SHRUNK_PHOTO_BYTES, shrunkPhoto, stubObjectUrls } from '../helpers/photo'
import { amount, item, line, trip } from '../helpers/records'
import { currentPath, renderAt } from '../helpers/renderAt'

vi.mock('../../src/photo/shrink', async () => {
  const { fakeShrunkPhoto } = await import('../helpers/photo')

  return { shrinkPhoto: async () => fakeShrunkPhoto() }
})

const RECEIPT = shrunkPhoto(new Uint8Array([7]).buffer, new Uint8Array([8]).buffer)

const NOVEMBER = 10

const TODAY = new Date(2026, NOVEMBER, 17, 9).getTime()

const STARTED = new Date(2026, NOVEMBER, 12, 18, 30).getTime()

const FINISHED = new Date(2026, NOVEMBER, 12, 19, 5).getTime()

const TRIP_ID = 'nov-12'

async function seedTrip(fields: Partial<Trip> = {}) {
  await db.items.bulkAdd([item({ id: 'milk', name: 'חלב' }), item({ id: 'bread', name: 'לחם' })])
  await db.trips.add(
    trip({
      id: TRIP_ID,
      startedAt: STARTED,
      finishedAt: FINISHED,
      lines: [
        line({ itemId: 'bread', name: 'לחם', state: 'missing' }),
        line({ itemId: 'milk', name: 'חלב', amount: amount(2), price: 6.9 }),
        line({ itemId: 'cheese', name: 'גבינה', amount: amount(0.5, 'kilogram') }),
      ],
      ...fields,
    }),
  )
}

const lineRows = () => Array.from(document.querySelectorAll('.trip-lines .label-row'), (row) => row.textContent)

describe('a trip', () => {
  beforeEach(resetDb)
  freezeDate(TODAY)

  it('shows its day, its time span and its lines, taken first and then missing', async () => {
    await seedTrip()

    renderAt(`/tabs/trips/${TRIP_ID}`)

    const heading = await screen.findByRole('heading', { level: 1, name: 'יום ה׳ 12.11.26' })

    expect(heading).toBeInTheDocument()
    expect(screen.getByText('18:30–19:05')).toBeInTheDocument()
    expect(lineRows()).toEqual(['2חלב₪6.90', '0.5ק״גגבינה', 'לחםלא היה'])
    expect(screen.getByText('לא היה')).toHaveClass('warning-word')
  })

  it('names the start day when the first tick was on an earlier day', async () => {
    await seedTrip({ startedAt: new Date(2026, NOVEMBER, 8, 21, 5).getTime() })

    renderAt(`/tabs/trips/${TRIP_ID}`)

    expect(await screen.findByText('יום א׳ 8.11.26 21:05–19:05')).toBeInTheDocument()
  })

  it('shows one time when the trip started and finished in the same minute', async () => {
    await seedTrip({ startedAt: FINISHED, finishedAt: FINISHED + 30_000 })

    renderAt(`/tabs/trips/${TRIP_ID}`)

    expect(await screen.findByText('19:05')).toBeInTheDocument()
  })

  it('saves the total and the note as they are typed, without leaving the field', async () => {
    await seedTrip({ total: 400, note: 'קופה 3' })

    renderAt(`/tabs/trips/${TRIP_ID}`)

    const total = await screen.findByRole('textbox', { name: 'סכום' })

    expect(total).toHaveValue('400')

    fireEvent.change(total, { target: { value: '412.30' } })

    await waitFor(async () => expect((await db.trips.get(TRIP_ID))?.total).toBe(412.3))

    const note = screen.getByLabelText('הערה')

    expect(note).toHaveValue('קופה 3')

    fireEvent.change(note, { target: { value: 'היה עמוס' } })

    await waitFor(async () => expect((await db.trips.get(TRIP_ID))?.note).toBe('היה עמוס'))
  })

  it('keeps an empty note to one "הוספת הערה" row until it is tapped', async () => {
    await seedTrip()

    renderAt(`/tabs/trips/${TRIP_ID}`)

    fireEvent.click(await screen.findByRole('button', { name: 'הוספת הערה' }))
    fireEvent.change(screen.getByRole('textbox', { name: 'הערה' }), { target: { value: 'קופה מהירה' } })

    await waitFor(async () => expect((await db.trips.get(TRIP_ID))?.note).toBe('קופה מהירה'))
  })

  it('clears the total when the field is emptied', async () => {
    await seedTrip({ total: 400 })

    renderAt(`/tabs/trips/${TRIP_ID}`)
    fireEvent.change(await screen.findByRole('textbox', { name: 'סכום' }), { target: { value: '' } })

    await waitFor(async () => expect((await db.trips.get(TRIP_ID))?.total).toBeUndefined())
  })

  describe('a line', () => {
    it('records the price paid on a taken line', async () => {
      await seedTrip()

      renderAt(`/tabs/trips/${TRIP_ID}`)
      fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))

      const price = await screen.findByRole('textbox', { name: 'מחיר' })

      expect(price).toHaveValue('6.90')

      fireEvent.change(price, { target: { value: '7.50' } })

      await waitFor(async () => expect((await db.trips.get(TRIP_ID))?.lines[1].price).toBe(7.5))
    })

    it('sets the item verdict from a line, and clears it with a second tap', async () => {
      await seedTrip()

      renderAt(`/tabs/trips/${TRIP_ID}`)
      fireEvent.click(await screen.findByRole('button', { name: 'לחם' }))

      const neverAgain = await screen.findByRole('button', { name: 'לא לקנות שוב' })

      expect(screen.queryByRole('textbox', { name: 'מחיר' })).not.toBeInTheDocument()

      fireEvent.click(neverAgain)

      await waitFor(async () => expect((await db.items.get('bread'))?.verdict).toBe('never'))
      await waitFor(() => expect(neverAgain).toHaveAttribute('aria-pressed', 'true'))

      fireEvent.click(neverAgain)

      await waitFor(async () => expect((await db.items.get('bread'))?.verdict).toBeUndefined())
    })

    it('links to the item page when the item still exists', async () => {
      await seedTrip()

      renderAt(`/tabs/trips/${TRIP_ID}`)
      fireEvent.click(await screen.findByRole('button', { name: 'חלב' }))
      fireEvent.click(await screen.findByRole('button', { name: 'לדף המצרך' }))

      await waitFor(() => expect(currentPath()).toBe('/tabs/trips/item/milk'))
    })

    it('offers only the price for an item that was deleted', async () => {
      await seedTrip()

      renderAt(`/tabs/trips/${TRIP_ID}`)
      fireEvent.click(await screen.findByRole('button', { name: 'גבינה' }))

      expect(await screen.findByRole('textbox', { name: 'מחיר' })).toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'לא לקנות שוב' })).not.toBeInTheDocument()
      expect(screen.queryByRole('button', { name: 'לדף המצרך' })).not.toBeInTheDocument()
    })
  })

  describe('receipts', () => {
    stubObjectUrls()

    it('adds a receipt photo, shrunk, next to the ones it has', async () => {
      await seedTrip()
      await addTripReceipt(TRIP_ID, RECEIPT)

      renderAt(`/tabs/trips/${TRIP_ID}`)

      expect(await screen.findByRole('button', { name: 'קבלה 1' })).toBeInTheDocument()

      fireEvent.change(screen.getByLabelText('צילום קבלה'), { target: { files: [cameraPhoto()] } })

      expect(await screen.findByRole('button', { name: 'קבלה 2' })).toBeInTheDocument()

      expect((await db.trips.get(TRIP_ID))?.receiptPhotoIds).toHaveLength(2)
      expect(await db.photos.toArray()).toContainEqual(
        expect.objectContaining({ bytes: new Uint8Array(SHRUNK_PHOTO_BYTES).buffer }),
      )
      expect(screen.getByLabelText('מהגלריה')).not.toHaveAttribute('capture')
    })

    it('opens a receipt full size from its thumbnail', async () => {
      await seedTrip()
      await addTripReceipt(TRIP_ID, RECEIPT)

      renderAt(`/tabs/trips/${TRIP_ID}`)
      fireEvent.click(await screen.findByRole('button', { name: 'קבלה 1' }))

      expect(await screen.findByRole('img', { name: 'קבלה 1' })).toHaveAttribute('src', PHOTO_URL)

      const dismissed = modalDismissed()

      fireEvent.click(screen.getByText('סגירה'))
      await dismissed
    })

    it('removes a receipt after asking', async () => {
      await seedTrip()
      await addTripReceipt(TRIP_ID, RECEIPT)

      renderAt(`/tabs/trips/${TRIP_ID}`)

      const shown = alertShown()

      fireEvent.click(await screen.findByRole('button', { name: 'מחיקת קבלה 1' }))
      await shown

      expect(alertHeader()).toBe('למחוק את הקבלה?')

      clickAlertButton('מחיקה')

      await waitFor(() => expect(screen.queryByRole('button', { name: 'קבלה 1' })).not.toBeInTheDocument())
      expect((await db.trips.get(TRIP_ID))?.receiptPhotoIds).toEqual([])
      expect(await db.photos.count()).toBe(0)
    })
  })

  it('saves the taken items that still exist as a set, with the amounts bought on the trip', async () => {
    await seedTrip()

    renderAt(`/tabs/trips/${TRIP_ID}`)

    const shown = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'שמירה כערכה' }))
    await shown

    answerAlert(' שישי ', 'שמירה')

    await waitFor(async () => expect(await db.sets.toArray()).toHaveLength(1))

    const [saved] = await db.sets.toArray()

    expect(saved).toMatchObject({ name: 'שישי', entries: [{ itemId: 'milk', amount: amount(2) }], createdAt: TODAY })
    await waitFor(() => expect(toastMessages()).toContain('הערכה נשמרה'))
  })

  it('deletes the trip after asking, and goes back to קניות', async () => {
    await seedTrip()
    await addTripReceipt(TRIP_ID, RECEIPT)

    renderAt(`/tabs/trips/${TRIP_ID}`)

    const shown = alertShown()

    fireEvent.click(await screen.findByRole('button', { name: 'מחיקת הקנייה' }))
    await shown

    expect(alertHeader()).toBe('למחוק את הקנייה?')

    clickAlertButton('מחיקה')

    await waitFor(() => expect(currentPath()).toBe('/tabs/trips'))
    expect(await db.trips.count()).toBe(0)
    expect(await db.photos.count()).toBe(0)
  })

  it('says when the trip does not exist', async () => {
    renderAt('/tabs/trips/gone')

    expect(await screen.findByText('הקנייה לא נמצאה')).toBeInTheDocument()
  })
})
